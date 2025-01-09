import boto3
import json
from decimal import Decimal
import os

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Fetch table names from environment variables
USERDATA_TABLE = os.environ['USERDATA_TABLE']
RECORDS_TABLE = os.environ['RECORDS_TABLE']

def round_to_nearest_half(value):
    if value is None:
        return None
    return round(value * 2) / 2

def main(event, context):
    # Access the DynamoDB tables dynamically
    userdata_table = dynamodb.Table(USERDATA_TABLE)
    records_table = dynamodb.Table(RECORDS_TABLE)

    try:
        # Process each record from the event
        for record in event['Records']:
            if record['eventName'] == "INSERT" and "NewImage" in record['dynamodb'] and "listeningAnswer" in record['dynamodb']['NewImage']:
                try:
                    primarykey = record['dynamodb']['Keys']['PK']['S']
                    returnedrecord_response = userdata_table.query(
                        KeyConditionExpression=boto3.dynamodb.conditions.Key('PK').eq(primarykey)
                    )
                    if not returnedrecord_response['Items']:
                        print(f"No item found for PK {primarykey}")
                        continue

                    returnedrecord = returnedrecord_response['Items'][0]
                    sortkey = returnedrecord.get('SK')

                    response = userdata_table.get_item(Key={'PK': primarykey, 'SK': sortkey})
                    if 'Item' not in response:
                        print(f"User with PK {primarykey} and SK {sortkey} not found in UserData table.")
                        continue

                    reading_bandscore = float(record['dynamodb']['NewImage']['readingAnswer']['M']['feedback']['M']['BandScore']['N'])
                    listening_bandscore = float(record['dynamodb']['NewImage']['listeningAnswer']['M']['feedback']['M']['BandScore']['N'])

                    # Process speaking scores
                    speaking = record['dynamodb']['NewImage']['speakingAnswer']['M']['feedback']['L']
                    if isinstance(speaking, list) and len(speaking) >= 3:
                        try:
                            score1 = float(speaking[0]["M"]["score"]["N"])
                            score2 = float(speaking[1]["M"]["score"]["N"])
                            score3 = float(speaking[2]["M"]["score"]["N"])
                            finalspeaking_bandscore = (score1 + score2 + score3) / 3
                        except (KeyError, ValueError, TypeError) as e:
                            print(f"Error processing speaking scores: {e}")
                            finalspeaking_bandscore = 0
                    else:
                        print(f"Unexpected speaking data structure: {speaking}")
                        finalspeaking_bandscore = 0

                    # Process writing scores
                    feedback_list = record['dynamodb']['NewImage']["writingAnswer"]["M"]["feedback"]["L"]
                    if isinstance(feedback_list, list) and len(feedback_list) >= 2:
                        try:
                            writing_score1 = float(feedback_list[0]["M"]["score"]["N"])
                            writing_score2 = float(feedback_list[1]["M"]["score"]["N"])
                            finalwriting_bandscore = (writing_score1 + writing_score2) / 2
                        except (KeyError, ValueError, TypeError) as e:
                            print(f"Error processing writing scores: {e}")
                            finalwriting_bandscore = 0
                    else:
                        print(f"Unexpected writing data structure: {feedback_list}")
                        finalwriting_bandscore = 0

                    # Update reading score
                    current_reading_score = float(response['Item'].get('readingbandscore', 0))
                    new_reading_score = (current_reading_score + reading_bandscore) / 2 if current_reading_score != 0 else reading_bandscore
                    rounded_reading_score = round_to_nearest_half(new_reading_score)

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET readingbandscore = :val',
                        ExpressionAttributeValues={':val': Decimal(str(rounded_reading_score))}
                    )

                    # Update listening score
                    current_listening_score = float(response['Item'].get('Listeningbandscore', 0))
                    new_listening_score = (current_listening_score + listening_bandscore) / 2 if current_listening_score != 0 else listening_bandscore
                    rounded_listening_score = round_to_nearest_half(new_listening_score)

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET Listeningbandscore = :val',
                        ExpressionAttributeValues={':val': Decimal(str(rounded_listening_score))}
                    )

                    # Update writing score
                    current_writing_score = float(response['Item'].get('writingbandscore', 0))
                    new_writing_score = (current_writing_score + finalwriting_bandscore) / 2 if current_writing_score != 0 else finalwriting_bandscore
                    rounded_writing_score = round_to_nearest_half(new_writing_score)

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET writingbandscore = :val',
                        ExpressionAttributeValues={':val': Decimal(str(rounded_writing_score))}
                    )

                    # Update speaking score
                    current_speaking_score = float(response['Item'].get('speakingbandscore', 0))
                    new_speaking_score = (current_speaking_score + finalspeaking_bandscore) / 2 if current_speaking_score != 0 else finalspeaking_bandscore
                    rounded_speaking_score = round_to_nearest_half(new_speaking_score)

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET speakingbandscore = :val',
                        ExpressionAttributeValues={':val': Decimal(str(rounded_speaking_score))}
                    )

                    # Update overall average score
                    overallaverage = (rounded_reading_score + rounded_listening_score + rounded_writing_score + rounded_speaking_score) / 4
                    rounded_overallaverage = round_to_nearest_half(overallaverage)

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET overallavg = :val',
                        ExpressionAttributeValues={':val': Decimal(str(rounded_overallaverage))}
                    )

                    # Increment the number of exams solved
                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='ADD numberOfExamsSolved :increment',
                        ExpressionAttributeValues={':increment': Decimal(1)}
                    )

                except Exception as e:
                    print(f"Error processing record for PK {primarykey} and SK {sortkey}: {e}")

        # Calculate aggregates for all students
        try:
            response = userdata_table.scan()
            items = response.get('Items', [])

            student_count = len(items)
            valid_record_count = 0

            total_reading_score = Decimal(0)
            total_listening_score = Decimal(0)
            total_overall_avg = Decimal(0)
            total_speaking_score = Decimal(0)
            total_writing_score = Decimal(0)

            for item in items:
                reading_score = Decimal(str(item.get('readingbandscore', 0)))
                listening_score = Decimal(str(item.get('Listeningbandscore', 0)))
                overall_avg = Decimal(str(item.get('overallavg', 0)))
                speaking_score = Decimal(str(item.get('speakingbandscore', 0)))
                writing_score = Decimal(str(item.get('writingbandscore', 0)))

                if reading_score == 0 and listening_score == 0 and overall_avg == 0 and speaking_score == 0 and writing_score == 0:
                    continue

                valid_record_count += 1
                total_reading_score += reading_score
                total_listening_score += listening_score
                total_overall_avg += overall_avg
                total_speaking_score += speaking_score
                total_writing_score += writing_score

            avg_reading_score = round_to_nearest_half(total_reading_score / valid_record_count if valid_record_count > 0 else Decimal(0))
            avg_listening_score = round_to_nearest_half(total_listening_score / valid_record_count if valid_record_count > 0 else Decimal(0))
            Avg_overall_avg = round_to_nearest_half(total_overall_avg / valid_record_count if valid_record_count > 0 else Decimal(0))
            avg_speaking_score = round_to_nearest_half(total_speaking_score / valid_record_count if valid_record_count > 0 else Decimal(0))
            avg_writing_score = round_to_nearest_half(total_writing_score / valid_record_count if valid_record_count > 0 else Decimal(0))

            records_table.update_item(
                Key={'PK': 'AGGREGATES', 'SK': 'TOTALS'},
                UpdateExpression='SET avg_reading_score = :r, avg_listening_score = :l, Avg_overall_avg = :o, avg_speaking_score = :s, avg_writing_score = :w, student_count = :c',
                ExpressionAttributeValues={
                    ':r': avg_reading_score,
                    ':l': avg_listening_score,
                    ':o': Avg_overall_avg,
                    ':s': avg_speaking_score,
                    ':w': avg_writing_score,
                    ':c': Decimal(student_count)
                }
            )

        except Exception as e:
            print(f"Error calculating or saving aggregates: {e}")

        # Calculate aggregates by school
        try:
            school_data = {}
            for item in items:
                school = item.get('SK', 'Unknown School')
                if school not in school_data:
                    school_data[school] = {
                        'total_reading_score': Decimal(0),
                        'total_listening_score': Decimal(0),
                        'total_overall_avg': Decimal(0),
                        'total_speaking_score': Decimal(0),
                        'total_writing_score': Decimal(0),
                        'valid_record_count': 0,
                        'student_count': 0
                    }

                school_data[school]['student_count'] += 1

                reading_score = Decimal(str(item.get('readingbandscore', 0)))
                listening_score = Decimal(str(item.get('Listeningbandscore', 0)))
                overall_avg = Decimal(str(item.get('overallavg', 0)))
                speaking_score = Decimal(str(item.get('speakingbandscore', 0)))
                writing_score = Decimal(str(item.get('writingbandscore', 0)))

                if reading_score == 0 and listening_score == 0 and overall_avg == 0 and speaking_score == 0 and writing_score == 0:
                    continue

                school_data[school]['valid_record_count'] += 1
                school_data[school]['total_reading_score'] += reading_score
                school_data[school]['total_listening_score'] += listening_score
                school_data[school]['total_overall_avg'] += overall_avg
                school_data[school]['total_speaking_score'] += speaking_score
                school_data[school]['total_writing_score'] += writing_score

            for school, data in school_data.items():
                if data['valid_record_count'] > 0:
                    avg_reading_score = round_to_nearest_half(data['total_reading_score'] / data['valid_record_count'])
                    avg_listening_score = round_to_nearest_half(data['total_listening_score'] / data['valid_record_count'])
                    avg_overall_avg = round_to_nearest_half(data['total_overall_avg'] / data['valid_record_count'])
                    avg_speaking_score = round_to_nearest_half(data['total_speaking_score'] / data['valid_record_count'])
                    avg_writing_score = round_to_nearest_half(data['total_writing_score'] / data['valid_record_count'])

                    records_table.update_item(
                        Key={'PK': 'AGGREGATES', 'SK': school},
                        UpdateExpression='SET avg_reading_score = :r, avg_listening_score = :l, Avg_overall_avg = :o, avg_speaking_score = :s, avg_writing_score = :w, student_count = :c',
                        ExpressionAttributeValues={
                            ':r': avg_reading_score,
                            ':l': avg_listening_score,
                            ':o': Avg_overall_avg,
                            ':s': avg_speaking_score,
                            ':w': avg_writing_score,
                            ':c': Decimal(data['student_count'])
                        }
                    )

        except Exception as e:
            print(f"Error processing school aggregates: {e}")

    except Exception as e:
        print(f"Error processing records: {e}")
 
    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete with updated aggregates for all and by school!')
    }

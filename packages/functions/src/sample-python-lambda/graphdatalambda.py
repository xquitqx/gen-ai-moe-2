import boto3
import json
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Table names
USERDATA_TABLE = 'prod-codecatalyst-sst-app-UserData'
RECORDS_TABLE = 'prod-codecatalyst-sst-app-Records'

def main(event, context):
    # Access the DynamoDB tables
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

                    current_reading_score = float(response['Item'].get('readingbandscore', 0))
                    new_reading_score = (current_reading_score + reading_bandscore) / 2 if current_reading_score != 0 else reading_bandscore

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET readingbandscore = :val',
                        ExpressionAttributeValues={':val': Decimal(str(new_reading_score))}
                    )

                    current_listening_score = float(response['Item'].get('Listeningbandscore', 0))
                    new_listening_score = (current_listening_score + listening_bandscore) / 2 if current_listening_score != 0 else listening_bandscore

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET Listeningbandscore = :val',
                        ExpressionAttributeValues={':val': Decimal(str(new_listening_score))}
                    )

                    overallaverage = (new_reading_score + new_listening_score) / 2

                    userdata_table.update_item(
                        Key={'PK': primarykey, 'SK': sortkey},
                        UpdateExpression='SET overallavg = :val',
                        ExpressionAttributeValues={':val': Decimal(str(overallaverage))}
                    )

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

            avg_reading_score = total_reading_score / valid_record_count if valid_record_count > 0 else Decimal(0)
            avg_listening_score = total_listening_score / valid_record_count if valid_record_count > 0 else Decimal(0)
            Avg_overall_avg = total_overall_avg / valid_record_count if valid_record_count > 0 else Decimal(0)
            avg_speaking_score = total_speaking_score / valid_record_count if valid_record_count > 0 else Decimal(0)
            avg_writing_score = total_writing_score / valid_record_count if valid_record_count > 0 else Decimal(0)

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

                if reading_score > 0 or listening_score > 0 or overall_avg > 0 or speaking_score > 0 or writing_score > 0:
                    school_data[school]['valid_record_count'] += 1
                    school_data[school]['total_reading_score'] += reading_score
                    school_data[school]['total_listening_score'] += listening_score
                    school_data[school]['total_overall_avg'] += overall_avg
                    school_data[school]['total_speaking_score'] += speaking_score
                    school_data[school]['total_writing_score'] += writing_score

            for school, data in school_data.items():
                valid_count = data['valid_record_count']
                avg_reading_score = data['total_reading_score'] / valid_count if valid_count > 0 else Decimal(0)
                avg_listening_score = data['total_listening_score'] / valid_count if valid_count > 0 else Decimal(0)
                Avg_overall_avg = data['total_overall_avg'] / valid_count if valid_count > 0 else Decimal(0)
                avg_speaking_score = data['total_speaking_score'] / valid_count if valid_count > 0 else Decimal(0)
                avg_writing_score = data['total_writing_score'] / valid_count if valid_count > 0 else Decimal(0)

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
            print(f"Error processing school-level aggregates: {e}")

    except Exception as e:
        print(f"Error processing records: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete with updated aggregates for all and by school!')
    }

import Sliding from '../sections/sliding';
import { toJSON } from '../utilities';
import { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import '../components/AdminStyle/home.css';
import '../components/AdminStyle/studentperformance.css';

function StudentPerformance() {
  // Individual states for each field
  const [username, setUsername] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [overallAvg, setOverallAvg] = useState<number>(0);
  const [numberOfExamsSolved, setNumberOfExamsSolved] = useState<number>(0);
  const [listeningBandScore, setListeningBandScore] = useState<number>(0);
  const [readingBandScore, setReadingBandScore] = useState<number>(0);
  const [speakingBandScore, setSpeakingBandScore] = useState<number>(0);
  const [writingBandScore, setWritingBandScore] = useState<number>(0);

  // Add states for CEFRLevel and StreakCounter
  const [CEFRLevel, setCEFRLevel] = useState<string>('');
  const [streakCounter, setStreakCounter] = useState<string>('');
  const [topByOverallAvg, setTopByOverallAvg] = useState<any[]>([]); // State for top students by overall average
  const [topByExamsSolved, setTopByExamsSolved] = useState<any[]>([]); // State for top students by exams solved
  const [topByHighestStreak, setTopByHighestStreak] = useState<any[]>([]); // State for top students by highest streak

  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [error, setError] = useState<string | null>(null); // State for error handling

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/homeuser',
          }),
        );
        console.log(response); // Log response for debugging

        // Update individual states with the fetched data
        setUsername(response.username || '');
        setSchool(response.school || '');
        setOverallAvg(response.overallAvg || 0);
        setNumberOfExamsSolved(response.numberOfExamsSolved || 0);
        setListeningBandScore(response.listeningBandScore || 0);
        setReadingBandScore(response.readingBandScore || 0);
        setSpeakingBandScore(response.speakingBandScore || 0);
        setWritingBandScore(response.writingBandScore || 0);

        // Add CEFRLevel and StreakCounter from the Lambda response
        setCEFRLevel(response.CEFRLevel || 'Unknown Level');
        setStreakCounter(response.StreakCounter || 0);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Failed to fetch student data.');
      } finally {
        setLoading(false); // Set loading to false after the data is fetched
      }
    };

    fetchStudentData();
  }, []);
  useEffect(() => {
    const fetchTopStudents = async () => {
      if (!school) return; // Prevent fetching without a valid school
      try {
        setLoading(true);
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: `/schooltopachievers?school=${encodeURIComponent(school)}`,
          }),
        );
        console.log('Top students data:', response); // Log API response
        setTopByOverallAvg(response.topByOverallAvg || []);
        setTopByExamsSolved(response.topByExamsSolved || []);
        setTopByHighestStreak(response.topByHighestStreak || []);
      } catch (error) {
        console.error('Error fetching top students:', error);
        setError('Failed to fetch top students data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopStudents();
  }, [school]); // Re-run when `school` changes

  // Render loading state, error, or the main content
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {/* Sliding component for the sliding section */}
      <section className="w-full h-1/2 pb-10">
        <Sliding />
      </section>

      <div>
        <h1 className="table-header1">Your Performance, Keep going!</h1>
        <table className="styled-table records-table">
          <thead>
            <tr>
              <th>Your performance</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Username</th>
              <td>{username}</td>
            </tr>
            <tr>
              <th>School</th>
              <td>{school}</td>
            </tr>
            <tr>
              <th>Overall Average</th>
              <td>{overallAvg}</td>
            </tr>
            <tr>
              <th>Number of Exams Solved</th>
              <td>{numberOfExamsSolved}</td>
            </tr>
            <tr>
              <th>Average in listening band score</th>
              <td>{listeningBandScore}</td>
            </tr>
            <tr>
              <th>Average in reading band score</th>
              <td>{readingBandScore}</td>
            </tr>
            <tr>
              <th>Average in speaking band score</th>
              <td>{speakingBandScore}</td>
            </tr>
            <tr>
              <th>Average in Writing band score</th>
              <td>{writingBandScore}</td>
            </tr>
            {/* Add new rows for CEFRLevel and StreakCounter */}
            <tr>
              <th>Current CEFR Level</th>
              <td>
                <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col items-center gap-10 p-8  ">
                  <img
                    src={`assets/Levels/${CEFRLevel}.png`}
                    alt={`${CEFRLevel} CEFR Level`}
                    className="w-1/2 h-auto"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>Streak </th>
              <td>
                {streakCounter}
                <span style={{ fontSize: '2em' }}>🔥</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page Title */}
      <h1 className="page-title">
        Top Achievers in Your {school}! : Excel in Your Practice Journey and be
        one of the top 3!🏆  </h1>
      {/* Top Students by Overall Average */}
      <div className="top-students-section">
        <h3 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
          Top 3 Students by Overall Average
          <span>📊 </span>{' '}
        </h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul className="top-students-list">
            {topByOverallAvg.map((student, index) => (
              <li key={index} className="top-student-item">
                <strong>{student.username}</strong> from {student.school} -{' '}
                <span className="student-score">
                  {' '}
                  Score: {student.overallAvg}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Top Students by Exams Solved */}
      <div className="top-students-section">
        <h3 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
          Top 3 Students by Exams Solved
          <span className="ml-4 inline-flex items-center text-blue-500">
            📄
          </span>
        </h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul className="top-students-list">
            {topByExamsSolved.map((student, index) => (
              <li key={index} className="top-student-item">
                <strong>{student.username}</strong> from {student.school} -{' '}
                <span className="student-exams-solved">
                  {student.numberOfExamsSolved} exams solved
                </span>{' '}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Top Students by Highest Streak */}
      <div className="top-students-section">
        <h3 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
          Top 3 Students by Highest Streak{' '}
          <span className="ml-4 inline-flex items-center text-yellow-500">
            🔥{' '}
          </span>
        </h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul className="top-students-list">
            {topByHighestStreak.map((student, index) => (
              <li key={index} className="top-student-item">
                <strong>{student.username}</strong> from {student.school} -{' '}
                <span className="student-streak">
                  {student.streakCounter} days streak
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default StudentPerformance;

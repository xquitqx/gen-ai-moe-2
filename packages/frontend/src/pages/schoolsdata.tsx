import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import '../components/AdminStyle/AdminHome.css';
import '../components/AdminStyle/schools.css';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import ChartComponent from '../components/AdminStyle/ChartComponent'; // Correct import for ChartComponent
import { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function Schooldatafetch() {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [avgOverallAvg, setAvgOverallAvg] = useState<number | null>(null);
  const [avgReadingScore, setAvgReadingScore] = useState<number | null>(null);
  const [avgListeningScore, setAvgListeningScore] = useState<number | null>(
    null,
  );
  const [avgSpeakingScore, setAvgSpeakingScore] = useState<number | null>(null);
  const [avgWritingScore, setAvgWritingScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]); // State to hold the records

  // Extract school name from the URL
  const queryParams = new URLSearchParams(window.location.search);
  const schoolName = queryParams.get('school');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Pass the school name as part of the API path
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: `/schooldatafetch?school=${encodeURIComponent(
              schoolName || '',
            )}`,
          }),
        );

        // Set state with the response data
        setStudentCount(response.student_count);
        setAvgOverallAvg(response.avg_overall_avg);
        setAvgReadingScore(response.avg_reading_score);
        setAvgListeningScore(response.avg_listening_score);
        setAvgSpeakingScore(response.avg_speaking_score);
        setAvgWritingScore(response.avg_writing_score);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolName]);
  // Fetch the records data
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);

        // Fetch records data from the new API endpoint
        const response = await toJSON(
          get({
            apiName: 'myAPI', // Ensure this is the correct API name for your backend
            path: `/schoolsstudenttable?school=${encodeURIComponent(
              schoolName || '',
            )}`, // Adjusted API path
          }),
        );

        // Set the records state with the response data
        setRecords(response.records || []);
      } catch (error) {
        console.error('Error fetching records data:', error);
        setError('Failed to fetch records data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (schoolName) {
      fetchRecords();
    }
  }, [schoolName]);

  // Define chart data for the chart
  const chartData: ChartData<'bar'> = {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
    datasets: [
      {
        label: 'Average IELTS sections score',
        data: [
          avgReadingScore,
          avgWritingScore,
          avgListeningScore,
          avgSpeakingScore,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options (optional)
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <AdminHeader />
      <Navbar />
      <main className="admin-home">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Active Users</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{studentCount}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Average</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{avgOverallAvg}</p>
            )}
          </div>
        </div>

        <div className="graph-section" style={{ width: '100%' }}>
          <div className="graph">
            <h3>Performance Overview</h3>
            <ChartComponent data={chartData} options={chartOptions} />
          </div>

          {/* Place the table header here */}
          <div className="table-header">All Records for {schoolName}</div>

          <div className="records-table" style={{ marginTop: '20px' }}>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Number of Exams Solved</th>
                    <th>Listening Band Score</th>
                    <th>Reading Band Score</th>
                    <th>Speaking Band Score</th>
                    <th>Writing Band Score</th>
                    <th>Overall Average</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index}>
                      <td>{record.username || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {record.numberOfExamsSolved || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.listeningBandScore || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.readingBandScore || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.speakingBandScore || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.writingBandScore || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.overallAvg || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
export default Schooldatafetch;

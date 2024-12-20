import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import '../components/AdminStyle/AdminHome.css';
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

function AdminHome() {
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

  const [schools, setSchools] = useState<string[]>([]); // State for schools

  const [schoolScores, setSchoolScores] = useState<
    { schoolName: string; avg_overall_avg: number }[]
  >([]); // New state to hold school scores for the second graph

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/getAggregates',
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
  }, []);

  // Fetch list of schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/listofschools',
          }),
        );

        // Assuming response.schools contains the list of school names
        if (response.schools) {
          setSchools(response.schools);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        setError('Failed to fetch the list of schools.');
      }
    };

    fetchSchools();
  }, []);

  // Fetch school scores for the second graph
  useEffect(() => {
    const fetchSchoolScores = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/secondgraph',
          }),
        );

        // Assuming the response is an array of school names with their avg_overall_avg
        if (response && Array.isArray(response)) {
          setSchoolScores(response);
        }
      } catch (error) {
        console.error('Error fetching school scores:', error);
        setError('Failed to fetch school scores.');
      }
    };

    fetchSchoolScores();
  }, []);

  // Handle school change
  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchool = event.target.value;
    window.location.href = `/schooldatagraph?school=${encodeURIComponent(
      selectedSchool,
    )}`;
  };

  // Define chart data for the first chart (IELTS scores)
  const chartData: ChartData<'bar'> = {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
    datasets: [
      {
        label: 'Average IELTS Sections Score',
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

  // Define chart data for the second chart (school scores)
  const secondChartData: ChartData<'bar'> = {
    labels: schoolScores.map(item => item.schoolName), // School names as labels
    datasets: [
      {
        label: 'Average School Score',
        data: schoolScores.map(item => item.avg_overall_avg), // School scores
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light blue color
        borderColor: 'rgba(75, 192, 192, 1)', // Darker blue for the border
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
            <h3>Current students across Bahrain</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{studentCount}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Overall Average of Students Across Bahrain</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{avgOverallAvg}</p>
            )}
          </div>
        </div>
        <div>
          <h1 className='page-title'>Student Performance Across Bahrain</h1>
        </div>

        <div className="graphs-container">
          <div className="graph-left">
            <h3>Performance Overview for Each IELTS Section</h3>
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
          <div className="graph-right">
            <h3>Average School-by-School Performance</h3>
            <ChartComponent data={secondChartData} options={chartOptions} />
          </div>
        </div>

        <div className="school-selector">
          <h3>
            Select a School to View Detailed Dashboard for Each Institution
          </h3>
          {error ? (
            <p>{error}</p>
          ) : (
            <select onChange={handleSchoolChange}>
              <option value="" disabled selected>
                Select a school
              </option>
              {schools.map((school, index) => (
                <option key={index} value={school}>
                  {school}
                </option>
              ))}
            </select>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminHome;

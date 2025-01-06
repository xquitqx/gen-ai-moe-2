import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import '../components/AdminStyle/AdminHome.css';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import ChartComponent from '../components/AdminStyle/ChartComponent'; // Correct import for ChartComponent
import { ChartData, ChartOptions } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { PointElement } from 'chart.js';
import ChartjsPluginTrendline from 'chartjs-plugin-trendline';
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
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartjsPluginTrendline,
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
  const [readingVsListening, setReadingVsListening] = useState<
    { x: number; y: number }[]
  >([]);
  const [readingVsWriting, setReadingVsWriting] = useState<
    { x: number; y: number }[]
  >([]);
  const [readingVsSpeaking, setReadingVsSpeaking] = useState<
    { x: number; y: number }[]
  >([]);
  const [listeningVsWriting, setListeningVsWriting] = useState<
    { x: number; y: number }[]
  >([]);
  const [listeningVsSpeaking, setListeningVsSpeaking] = useState<
    { x: number; y: number }[]
  >([]);
  const [writingVsSpeaking, setWritingVsSpeaking] = useState<
    { x: number; y: number }[]
  >([]);
  const [scatterData, setScatterData] = useState<{ x: number; y: number }[]>(
    [],
  );

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
  useEffect(() => {
    const fetchCorrelationData = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/correlation',
          }),
        );
        console.log('API response:', response); // Logs the API response to the console

        // Assuming response.graphData contains the data for the 7 graphs
        if (response && response.graphData) {
          setScatterData(response.graphData.avg); // Example: Set the first graph data
          // Set the other graphs data
          setReadingVsListening(response.graphData.readingVsListening);
          setReadingVsWriting(response.graphData.readingVsWriting);
          setReadingVsSpeaking(response.graphData.readingVsSpeaking);
          setListeningVsWriting(response.graphData.listeningVsWriting);
          setListeningVsSpeaking(response.graphData.listeningVsSpeaking);
          setWritingVsSpeaking(response.graphData.writingVsSpeaking);
        }
      } catch (error) {
        console.error('Error fetching correlation data:', error);
        setError('Failed to fetch correlation data.');
      }
    };

    fetchCorrelationData();
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
  const avgChartData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Exams Solved vs. Average Score',
        data: scatterData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
  };

  const readingVsListeningData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Reading Score vs Listening Score',
        data: readingVsListening,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
  };
  const readingVsWritingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Reading vs. Writing Score',
        data: readingVsWriting,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
  };

  const readingVsSpeakingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Reading Score vs speaking Score',
        data: readingVsSpeaking,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
  };
  const listeningVsWritingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'listening Score vs writing Score',
        data: listeningVsWriting,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
  };
  const listeningVsSpeakingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'listening Score vs speaking Score',
        data: listeningVsSpeaking,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
  };
  const writingVsSpeakingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Writing Score vs speaking Score',
        data: writingVsSpeaking,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,

        trendlineLinear: {
          style: 'solid', // Line style
          lineWidth: 2, // Line width
          strokeStyle: 'rgba(255, 99, 132, 1)', // Trendline color
        },
      } as any, // Cast the dataset to `any`
    ],
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
          <h1 className="page-title">Student Performance Across Bahrain</h1>
        </div>

        <div className="graphs-container">
          <div className="graph-left">
            <h3>Performance Overview for Each IELTS Section</h3>
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
          <div className="graph-right">
            <h3>Average School-by-School Performance</h3>
            <ChartComponent data={secondChartData} />
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Exams Solved vs. Average Score</h3>
            {scatterData.length > 0 ? (
              <Scatter data={avgChartData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading scatter plot data...</p>
            )}
          </div>

          <div className="scatter-plot">
            <h3>Correlation: Reading vs Listening</h3>
            {readingVsListening.length > 0 ? (
              <Scatter data={readingVsListeningData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Reading vs Writing</h3>
            {readingVsWriting.length > 0 ? (
              <Scatter data={readingVsWritingData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
          <div className="scatter-plot">
            <h3>Correlation: Reading vs Speaking</h3>
            {readingVsSpeaking.length > 0 ? (
              <Scatter data={readingVsSpeakingData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Listening vs Writing</h3>
            {listeningVsWriting.length > 0 ? (
              <Scatter data={listeningVsWritingData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>

          <div className="scatter-plot">
            <h3>Correlation: Listening vs Speaking</h3>
            {listeningVsSpeaking.length > 0 ? (
              <Scatter data={listeningVsSpeakingData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Writing vs Speaking</h3>
            {writingVsSpeaking.length > 0 ? (
              <Scatter data={writingVsSpeakingData} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
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

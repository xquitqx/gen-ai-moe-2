import '../components/AdminStyle/VerticalSteps.css';
import { Nav } from '../components/Nav';

const VerticalSteps = () => {
  // Navigation links for the Nav component
  const navLinks = [
    { text: 'Home', to: '/' },
    { text: 'How to use', to: '/howtouse' },
    { text: 'About', to: '/about' },
  ];

  return (
    <div className="steps-page">
      {/* Navigation Bar */}
      <Nav showLogo={true} entries={navLinks} />

      {/* Page Content */}
      <h1 className="page-title">Your Learning Journey</h1>
      <div className="flowchart-container">
        {/* Step 1 */}
        <div className="step">
          <div className="step-content">
            <h2>Step 1</h2>
            <p>
              <strong>Create an Account</strong>
              <br />
              Begin your learning journey by creating a personalized account.
              Sign up to unlock all features and start progressing.
            </p>
          </div>
          <div className="arrow"></div>
        </div>

        {/* Step 2 */}
        <div className="step">
          <div className="step-content">
            <h2>Step 2</h2>
            <p>
              <strong>Take a Placement Exam</strong>
              <br />
              Take a quick placement exam to evaluate your current proficiency
              level based on the European framework. <br />
              <span style={{ fontWeight: 'bold' }}>Note:</span> You will receive
              a daily question to reinforce your learning, and your daily streak
              will be tracked to keep you motivated 🔥.
            </p>
          </div>
          <div className="arrow"></div>
        </div>

        {/* Step 3 */}
        <div className="step">
          <div className="step-content">
            <h2>Step 3</h2>
            <p>
              <strong>Practice Exams & Boost Skills</strong>
              <br />
              Engage in targeted practice exams designed to improve your skills.
              Monitor your progress and celebrate your achievements as you
              advance.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Note */}
      <div className="leaderboard-note">
        <p>
          Improve your skills and climb the <strong>leaderboard</strong>!
          Compete for:
        </p>
        <ul className="leaderboard-list">
          <li>
            🏆 <strong>Top 3 in averages</strong>
          </li>
          <li>
            🔥 <strong> Top 3 in longest Streak</strong>
          </li>
          <li>
            ✅ <strong>Top 3 in most Exams Solved</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VerticalSteps;

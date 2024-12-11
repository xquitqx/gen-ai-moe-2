import React from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const sections = [
  { name: 'Writing', route: '/uploadWriting' },
  { name: 'Speaking', route: '/uploadSpeaking' },
  { name: 'Reading', route: '/uploadReading' },
  { name: 'Listening', route: '/uploadListening' },
];

const AdminUploadExams: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (route: string): void => {
    navigate(route);
  };

  return (
    <div>
      <AdminHeader />
      <Navbar />
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#4c929f',
          textAlign: 'center',
        }}
      >
        Upload Exams by Section
      </h3>

      <div style={containerStyle}>
        {sections.map(section => (
          <div
            key={section.name}
            style={boxStyle}
            onMouseEnter={e =>
              (e.currentTarget.style.backgroundColor = '#3b747e')
            } // Change color on hover
            onMouseLeave={e =>
              (e.currentTarget.style.backgroundColor = '#4c929f')
            } // Reset color on leave
            onClick={() => handleClick(section.route)}
          >
            {section.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// Style for the container holding the boxes
const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // Two columns of equal width
  gap: '30px', // Space between boxes
  justifyContent: 'center',
  alignItems: 'center',
  margin: '50px auto',
  maxWidth: '500px',
  paddingTop: '30px',
};

// Style for each box
const boxStyle: React.CSSProperties = {
  backgroundColor: '#4c929f',
  color: 'white',
  padding: '20px',
  width: '200px',
  height: '150px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '22px',
  fontWeight: 'bold',
  textAlign: 'center',
  transition: 'background-color 0.3s ease',
};

export default AdminUploadExams;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadListening from './UploadListening';
import UploadWriting from './UploadWriting';
import UploadReading from './UploadReading';
import UploadSpeaking from './UploadSpeaking';
import { Nav } from '../components/Nav'; // Correct import for Nav
import '../components/AdminStyle/FullExamUpload.css';

const FullExamUpload = () => {
  const [currentStep, setCurrentStep] = useState(1); // Track current step
  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentStep(prevStep => (prevStep < 4 ? prevStep + 1 : prevStep));
  };

  // Handler to go to the previous step
  const handlePrevious = () => {
    setCurrentStep(prevStep => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  // Handler for the Done button to redirect to admin-home
  const handleDone = () => {
    navigate('/admin-home');
  };

  // Render content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <UploadListening hideLayout={true} />;
      case 2:
        return <UploadWriting hideLayout={true} />;
      case 3:
        return <UploadReading hideLayout={true} />;
      case 4:
        return <UploadSpeaking hideLayout={true} />;
      default:
        return <UploadListening hideLayout={true} />;
    }
  };

  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  return (
    <div className="full-exam-upload-page">
      {/* Replace Header and Navbar with Nav */}
      <Nav entries={navLinks} /> {/* Use Nav component here */}
      <div className="wizard-container">
        <div className="wizard-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            Step 1: Listening
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            Step 2: Writing
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            Step 3: Reading
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            Step 4: Speaking
          </div>
        </div>

        <div className="wizard-content">{renderStepContent()}</div>

        <div className="wizard-navigation">
          {currentStep > 1 && (
            <button
              className="wizard-btn previous-btn"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          {currentStep < 4 && (
            <button className="wizard-btn next-btn" onClick={handleNext}>
              Next
            </button>
          )}
          {currentStep === 4 && (
            <button className="wizard-btn done-btn" onClick={handleDone}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullExamUpload;

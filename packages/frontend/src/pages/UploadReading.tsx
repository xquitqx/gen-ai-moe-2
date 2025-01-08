import { Nav } from '../components/Nav'; // Correct import for Nav
import Dropzone from '../components/Dropzone';
import '../components/AdminStyle/Upload.css';

interface UploadReadingProps {
  hideLayout?: boolean; // Adding the hideLayout prop
}

const UploadReading = ({ hideLayout }: UploadReadingProps) => {
  // Define the navigation links just like in UploadWriting
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  return (
    <div className="upload-page">
      {/* Use Nav component here, conditionally render it based on hideLayout */}
      {!hideLayout && <Nav entries={navLinks} />}{' '}
      {/* Conditionally render Nav */}
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Reading Files</h1>
          <p className="page-description">
            Please upload your question files here. Accepted files are of type
            .pdf.
          </p>

          {/* Dropzone for Reading Files */}
          <Dropzone
            className="dropzone-container"
            acceptedFileTypes={{
              'application/pdf': [], // .pdf files
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadReading;

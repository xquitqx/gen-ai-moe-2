import Header from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import Dropzone from '../components/Dropzone';
import '../components/AdminStyle/Upload.css';

const UploadWriting = () => {
  return (
    <div className="upload-page">
      <Header />
      <Navbar />

      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Writing Files</h1>
          <p className="page-description">
            Please upload your question files here. Accepted files are of type
            as .docx or .pdf
          </p>
          <Dropzone className="dropzone-container" />
        </div>
      </div>
    </div>
  );
};

export default UploadWriting;

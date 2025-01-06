import Header from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import DropzoneListeningQfiles from '../components/DropzoneListeningQfiles';
import '../components/AdminStyle/Upload.css';
import { useState } from 'react';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import DropzoneImageFiles from '../components/DropzoneImagefiles';

const UploadWriting = ({ hideLayout = false }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Callback to collect the image file from DropzoneImage
  const handleImageFile = (file: File | null) => setImageFile(file);

  // Callback to collect the question file from Dropzone
  const handleQuestionFile = (file: File | null) => setQuestionFile(file);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      // Prepare the form data for image file
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: '/adminUploadImage',
            options: { body: imageFormData },
          }),
        );
      }

      // Prepare the form data for question file
      if (questionFile) {
        const questionFormData = new FormData();
        questionFormData.append('file', questionFile);
        const section = 'Writing'

        await toJSON(
          post({
            apiName: 'myAPI',
            path: `/adminUpload?section=${encodeURIComponent(section)}`,
            options: { body: questionFormData },
          }),
        );
      }

      setUploadStatus('Upload successfully!');
    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="upload-page">
      {!hideLayout && <Header />}
      {!hideLayout && <Navbar />}
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Writing Files</h1>
          <p className="page-description">
            Upload your image files and question files.
          </p>

          {/* Dropzone for Image Files */}
          <h2 className="subtitle">Image Files</h2>
          <DropzoneImageFiles
            className="dropzone-container"
            onFileSelected={handleImageFile} // Pass callback
          />

          {/* Dropzone for Question Files */}
          <h2 className="subtitle">Question Files</h2>
          <DropzoneListeningQfiles
            className="dropzone-container"
            acceptedFileTypes={{
              'application/pdf': [], // .pdf files
            }}
            onFileSelected={handleQuestionFile} // Pass callback
          />

          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>

          {uploadStatus && (
            <p
              className={`upload-status ${
                uploadStatus.startsWith('Upload successful')
                  ? 'success'
                  : 'error'
              }`}
            >
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadWriting;

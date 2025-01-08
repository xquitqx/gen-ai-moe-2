import React, { useState } from 'react';
import { Nav } from '../components/Nav'; // Correct import for Nav
import DropzoneAudio from '../components/DropzoneAudio';
import DropzoneListeningQfiles from '../components/DropzoneListeningQfiles';
import '../components/AdminStyle/Upload.css';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';

interface UploadSpeakingProps {
  hideLayout?: boolean; // Adding the hideLayout prop
}

const UploadSpeaking = ({ hideLayout }: UploadSpeakingProps) => {
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Callback to collect the audio file from DropzoneAudio
  const handleAudioFile = (file: File | null) => setAudioFile(file);

  // Callback to collect the question file from Dropzone
  const handleQuestionFile = (file: File | null) => setQuestionFile(file);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      // Prepare the form data for audio file
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: '/adminUploadAudio',
            options: { body: audioFormData },
          }),
        );
      }

      // Prepare the form data for question file
      if (questionFile) {
        const questionFormData = new FormData();
        questionFormData.append('file', questionFile);
        const section = 'Speaking';

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
      {/* Conditionally render Nav component based on hideLayout */}
      {!hideLayout && <Nav entries={navLinks} />}{' '}
      {/* Conditionally render Nav */}
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Speaking Files</h1>
          <p className="page-description">
            Upload your audio files and question files.
          </p>

          {/* Dropzone for Audio Files */}
          <h2 className="subtitle">Audio Files</h2>
          <DropzoneAudio
            className="dropzone-container"
            onFileSelected={handleAudioFile} // Pass callback
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
                uploadStatus.startsWith('Upload successfully')
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

export default UploadSpeaking;

// import { useCallback, useEffect, useState } from 'react';
import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import '../components/AdminStyle/Dropzone.css';

interface FileWithPreview extends File {
  preview: string;
}

const Dropzone = ({ className }: { className?: string }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  //console.log(window.location.pathname.replace('/upload', ''));
  //console.log("helloooo?");
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles?.length) {
        setFiles(previousFiles => [
          ...previousFiles,
          ...acceptedFiles.map(file => {
            const fileWithPreview = Object.assign(file, {
              preview: URL.createObjectURL(file),
            }) as FileWithPreview;
            return fileWithPreview;
          }),
        ]);
      }
      if (rejectedFiles?.length) {
        setRejected(previousFiles => [...previousFiles, ...rejectedFiles]);
      }
    },
    [],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        [],
    },
    maxSize: Infinity,
    onDrop,
  });

  // useEffect(() => {
  //   return () => {
  //     files.forEach(file => URL.revokeObjectURL(file.preview));
  //   };
  // }, [files]);

  const removeAll = () => {
    setFiles([]);
    setRejected([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);
  
    const section = window.location.pathname.replace('/upload', '');
  
    const filesData = await Promise.all(
      files.map(async file => {
        const fileContent = await file.text(); // Convert file to text or base64
        return {
          name: file.name,
          content: fileContent,
        };
      })
    );
  
    const payload = {
      section,
      files: filesData,
    };
    console.log("Payload being sent:", payload);
  
    try {
      const response = await toJSON(
        post({
          apiName: 'myAPI',
          path: '/adminUpload',
          options: {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        })
      );
      setUploadStatus(response.message);
    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
    }
  };
  

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div
          {...getRootProps({
            className: `dropzone ${className}`,
          })}
        >
          <input {...getInputProps()} />
          <div className="upload-icon-container">
            <ArrowUpTrayIcon className="upload-icon" />
            <p className="upload-text">
              Drag & drop files here, or click to select files
            </p>
          </div>
        </div>
        <section className="mt-10">
          <div className="flex justify-between items-center">
            <h2 className="title">Your Uploads</h2>
            <button
              type="button"
              onClick={removeAll}
              className="remove-all-btn"
            >
              Remove all files
            </button>
          </div>

          <ul className="file-list">
            {files.map(file => (
              <li key={file.name} className="file-preview">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="file-image"
                  onLoad={() => URL.revokeObjectURL(file.preview)}
                />
                <p className="file-name">{file.name}</p>
              </li>
            ))}
          </ul>
          {rejected.length > 0 && (
            <div className="rejected-message">
              <p className="error-message-text">
                Some files were rejected because they are not of the accepted
                formats (PDF, DOC, DOCX). Please upload only supported files.
              </p>
            </div>
          )}
          {files.length > 0 && (
            <button type="submit" className="submit-btn">
              Submit
            </button>
          )}
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
        </section>
      </form>
    </div>
  );
};

export default Dropzone;

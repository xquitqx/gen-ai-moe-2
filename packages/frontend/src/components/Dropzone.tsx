import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import '../components/AdminStyle/Dropzone.css';

interface FileWithPreview extends File {
  preview: string;
}

interface DropzoneProps {
  className?: string;
  acceptedFileTypes?: { [key: string]: string[] }; // Specify accepted file types
}

const Dropzone = ({ className, acceptedFileTypes }: DropzoneProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (files.length > 0) {
        setUploadStatus('You can upload only one file at a time.');
        return;
      }

      if (acceptedFiles?.length) {
        const file = acceptedFiles[0];
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        }) as FileWithPreview;
        setFiles([fileWithPreview]);
        setUploadStatus(null);
      }

      if (rejectedFiles?.length) {
        setRejected(rejectedFiles);
      }
    },
    [files],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: acceptedFileTypes,
    maxSize: Infinity,
    onDrop,
  });

  const removeAll = () => {
    setFiles([]);
    setRejected([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    const formData = new FormData();

    files.forEach(file => {
      formData.append(`file-${file.name}`, file);
    });

    try {
      const response = await toJSON(
        post({
          apiName: 'myAPI',
          path: '/adminUpload',
          options: {
            body: formData,
          },
        }),
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
              Remove file
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
                formats. Please upload only supported files.
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

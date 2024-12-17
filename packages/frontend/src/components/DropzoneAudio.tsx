import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import '../components/AdminStyle/Dropzone.css';

interface FileWithPreview extends File {
  preview: string;
}

interface DropzoneAudioProps {
  className?: string;
  onFileSelected?: (file: File | null) => void;
}

const DropzoneAudio = ({ className, onFileSelected }: DropzoneAudioProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles?.length) {
        const file = acceptedFiles[0];
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        }) as FileWithPreview;
        setFiles([fileWithPreview]);
        onFileSelected?.(file); // Notify the parent component
      }

      if (rejectedFiles?.length) {
        setRejected(rejectedFiles);
      }
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.aac', '.m4a'] },
    maxSize: Infinity,
    onDrop,
  });

  const removeAll = () => {
    setFiles([]);
    setRejected([]);

    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  return (
    <div className="upload-section">
      {' '}
      {/* Use upload-section class here */}
      <div
        {...getRootProps({
          className: `dropzone ${className}`, // Add dropzone styles
        })}
      >
        <input {...getInputProps()} />
        <div className="upload-icon-container">
          <ArrowUpTrayIcon className="upload-icon" />
          <p className="upload-text">
            Drag & drop audio files here, or click to select files
          </p>
        </div>
      </div>
      <section className="mt-10">
        <div className="flex justify-between items-center">
          <h2 className="title">Your Uploads</h2>
          <button type="button" onClick={removeAll} className="remove-all-btn">
            Remove file
          </button>
        </div>
        <ul className="file-list">
          {files.map(file => (
            <li key={file.name} className="file-preview">
              <audio
                controls
                className="file-audio"
                src={file.preview}
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
              formats. Please upload only supported audio files.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DropzoneAudio;

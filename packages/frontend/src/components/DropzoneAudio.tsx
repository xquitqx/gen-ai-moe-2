import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
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
        const newFiles = acceptedFiles.map(file => {
          const fileWithPreview = Object.assign(file, {
            preview: URL.createObjectURL(file),
          }) as FileWithPreview;
          return fileWithPreview;
        });

        // Update state with only the first 7 files
        setFiles(prevFiles => {
          const allFiles = [...prevFiles, ...newFiles];
          return allFiles.slice(0, 7); // Keep only the first 7 files
        });

        // Notify the parent with the first file in the batch
        onFileSelected?.(newFiles[0]);
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
    maxFiles: 7, // Limit to 7 files
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
      <div
        {...getRootProps({
          className: `dropzone ${className}`, // Add dropzone styles
        })}
      >
        <input {...getInputProps()} />
        <div className="upload-icon-container">
          <p className="upload-text">
            Drag & drop audio files here, or click to select files
          </p>
        </div>
      </div>
      <section className="mt-10">
        <div className="flex justify-between items-center">
          <h2 className="title">Your Uploads</h2>
          <button type="button" onClick={removeAll} className="remove-all-btn">
            Remove all
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

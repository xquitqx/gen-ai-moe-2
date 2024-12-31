import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import '../components/AdminStyle/Dropzone.css';

interface FileWithPreview extends File {
  preview: string;
}

interface DropzoneProps {
  className?: string;
  onFileSelected?: (file: File | null) => void;
  accept?: { [key: string]: string[] }; // Add accept to the props
}

const DropzoneImageFiles = ({
  className = '',
  onFileSelected,
  accept = { 'image/jpeg': [], 'image/png': [], 'image/gif': [] }, // Default accept values
}: DropzoneProps) => {
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
        onFileSelected?.(file);
      }

      if (rejectedFiles?.length) {
        setRejected(rejectedFiles);
      }
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept, // Pass the accept prop to useDropzone
    onDrop,
  });

  const removeAll = () => {
    setFiles([]);
    setRejected([]);
    onFileSelected?.(null);
  };

  return (
    <div className="upload-section">
      <div
        {...getRootProps({
          className: `dropzone ${className}`,
        })}
      >
        <input {...getInputProps()} />
        <div className="upload-icon-container">
          <ArrowUpTrayIcon className="upload-icon" />
          <p className="upload-text">
            Drag & drop image files here, or click to select files
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
              Some files were rejected because they are not images. Please
              upload only image files.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DropzoneImageFiles;

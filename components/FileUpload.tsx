
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileUpload, handleDragEvents]);

  const dragOverClasses = isDragging ? 'border-indigo-400 bg-gray-700/50' : 'border-gray-600';

  return (
    <div className="flex flex-col items-center justify-center">
      <label
        htmlFor="file-upload"
        className={`w-full h-64 flex flex-col items-center justify-center border-2 border-dashed ${dragOverClasses} rounded-xl cursor-pointer transition-all duration-300 ease-in-out`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-200">
                Drag & drop your file here
            </p>
            <p className="text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-500 mt-4">Supports audio and video files</p>
        </div>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept="audio/*,video/*"
        />
      </label>
    </div>
  );
};

export default FileUpload;

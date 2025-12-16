import React, 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDragEvents = React.useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileUpload, handleDragEvents]);

  const dragOverClasses = isDragging 
    ? 'border-indigo-500 bg-indigo-500/10' 
    : 'border-white/20 hover:border-indigo-500/50';

  return (
    <div className="flex flex-col items-center justify-center w-full text-center">
      <label
        htmlFor="file-upload"
        className={`relative w-full h-64 flex flex-col items-center justify-center border-2 border-dashed ${dragOverClasses} rounded-xl cursor-pointer transition-all duration-300 ease-in-out group`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        <div className="relative z-10 flex flex-col items-center">
            <UploadIcon className={`h-14 w-14 text-gray-500 mb-4 transition-all duration-300 ${isDragging ? 'scale-110 text-indigo-400 animate-pulse' : 'group-hover:scale-105 group-hover:text-gray-400'}`} />
            <p className="text-lg font-semibold text-gray-200">
                {isDragging ? "Solte para iniciar a mágica!" : "Arraste e solte um arquivo"}
            </p>
            <p className="text-gray-500 mt-1">ou</p>
            <div
                className="mt-4 px-6 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all transform hover:scale-105"
             >
                Selecionar Arquivo
            </div>
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
      <p className="text-xs text-gray-500 mt-4">Suporta a maioria dos formatos de áudio e vídeo</p>
    </div>
  );
};

export default FileUpload;
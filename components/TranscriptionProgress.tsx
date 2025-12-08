
import React from 'react';
import { FileAudioIcon } from './icons/FileAudioIcon';

interface TranscriptionProgressProps {
  fileName: string;
  progressMessage: string;
}

const TranscriptionProgress: React.FC<TranscriptionProgressProps> = ({ fileName, progressMessage }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center animate-spin-slow">
                 <FileAudioIcon className="w-8 h-8 text-indigo-400" />
            </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Processing...</h2>
      <p className="text-gray-400 max-w-xs truncate mb-4">{fileName}</p>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
        <div className="bg-indigo-600 h-2.5 rounded-full w-full animate-progress"></div>
      </div>
      <p className="text-indigo-300 font-medium">{progressMessage}</p>

      <style>{`
        @keyframes progress-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress-animation 2s ease-in-out infinite;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TranscriptionProgress;

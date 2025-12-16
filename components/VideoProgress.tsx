import React from 'react';
import { MovieIcon } from './icons/MovieIcon';

interface VideoProgressProps {
  fileName: string;
  progressMessage: string;
}

const VideoProgress: React.FC<VideoProgressProps> = ({ fileName, progressMessage }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center animate-pulse-slow">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center">
                 <MovieIcon className="w-8 h-8 text-purple-400" />
            </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Gerando Vídeo...</h2>
      <p className="text-gray-400 max-w-xs truncate mb-6">{fileName}</p>
      
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
      </div>
      
      <p className="text-purple-300 font-medium h-6">{progressMessage}</p>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s linear infinite;
        }

        @keyframes pulse-dot-animation {
          0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
          40% { transform: scale(1.5); opacity: 1; }
        }
        .animate-pulse-dot {
          animation: pulse-dot-animation 1.4s infinite ease-in-out both;
        }
      `}</style>
    </div>
  );
};

export default VideoProgress;
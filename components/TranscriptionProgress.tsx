import React from 'react';

interface TranscriptionProgressProps {
  fileName: string;
  progressMessage: string;
}

const TranscriptionProgress: React.FC<TranscriptionProgressProps> = ({ fileName, progressMessage }) => {
  return (
    <div className="flex flex-col items-center text-center w-full">
      <h2 className="text-2xl font-bold text-white mb-2">Transcrevendo...</h2>
      <p className="text-gray-400 max-w-xs truncate mb-10">{fileName}</p>
      
      <div className="relative w-28 h-28 flex items-center justify-center mb-8">
        <svg className="absolute w-full h-full transform-gpu animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '2s' }}>
          {/* Background circle */}
          <circle
            className="text-indigo-500/20"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]"
            strokeWidth="8"
            strokeDasharray="264" // approx 2 * pi * 42
            strokeDashoffset="198" // Show a quarter circle initially
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{ animation: 'spinner-arc 1.5s ease-in-out infinite' }}
          />
        </svg>
      </div>
      
      <p className="text-indigo-300 font-medium h-6">{progressMessage}</p>

      <style>{`
        @keyframes spinner-arc {
          0% {
            stroke-dashoffset: 260;
          }
          50% {
            stroke-dashoffset: 60;
          }
          100% {
            stroke-dashoffset: 260;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TranscriptionProgress;
import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface VideoResultProps {
  videoUrl: string;
  onReset: () => void;
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, onReset }) => {

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-gerado-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col w-full items-center">
      <h2 className="text-2xl font-bold text-center mb-4">Animação Concluída!</h2>
      <div className="w-full max-w-md bg-black rounded-lg overflow-hidden border border-white/10 mb-6">
        <video src={videoUrl} controls autoPlay loop className="w-full" />
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all transform hover:scale-105"
        >
          Criar Outro
        </button>
        <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 flex items-center gap-2"
        >
            <DownloadIcon className="w-5 h-5" />
            Baixar
        </button>
      </div>
    </div>
  );
};

export default VideoResult;
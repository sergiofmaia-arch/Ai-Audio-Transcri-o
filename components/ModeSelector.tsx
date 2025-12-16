import React from 'react';
import { FileAudioIcon } from './icons/FileAudioIcon';
import { MovieIcon } from './icons/MovieIcon';

interface ModeSelectorProps {
  onSelectTranscription: () => void;
  onSelectVideo: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectTranscription, onSelectVideo }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center mb-6">Escolha uma funcionalidade</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transcription Option */}
        <button
          onClick={onSelectTranscription}
          className="p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left flex flex-col items-center text-center"
        >
          <FileAudioIcon className="w-12 h-12 text-indigo-400 mb-4" />
          <h3 className="text-lg font-semibold text-white">Transcrever Áudio/Vídeo</h3>
          <p className="text-gray-400 mt-2 text-sm">
            Converta a fala de qualquer arquivo de áudio ou vídeo em texto preciso.
          </p>
        </button>

        {/* Video Generation Option */}
        <button
          onClick={onSelectVideo}
          className="p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left flex flex-col items-center text-center"
        >
          <MovieIcon className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-white">Animar Imagem</h3>
          <p className="text-gray-400 mt-2 text-sm">
            Dê vida a uma foto estática gerando um vídeo curto com um prompt de texto.
          </p>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
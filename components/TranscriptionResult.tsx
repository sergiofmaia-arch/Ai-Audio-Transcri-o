import React, { useState, useRef, useEffect } from 'react';
import * as docx from 'docx';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface TranscriptionResultProps {
  transcript: string;
  fileName: string;
  onReset: () => void;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ transcript, fileName, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [srtLineDuration, setSrtLineDuration] = useState(5);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const baseFileName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleExport = async (format: 'txt' | 'docx' | 'srt') => {
    setIsExportMenuOpen(false);
    setExportError(null);

    try {
      if (format === 'txt') {
          const blob = new Blob([transcript], { type: 'text/plain' });
          triggerDownload(blob, `${baseFileName}.txt`);
      }

      if (format === 'docx') {
          const doc = new docx.Document({
              sections: [{
                  children: [
                      new docx.Paragraph({ text: transcript }),
                  ],
              }],
          });
          const blob = await docx.Packer.toBlob(doc);
          triggerDownload(blob, `${baseFileName}.docx`);
      }

      if (format === 'srt') {
          const lines = transcript.split('. ').filter(line => line.length > 0);
          let srtContent = '';
          let startTime = 0;
          lines.forEach((line, index) => {
              const formatTime = (seconds: number) => {
                  const date = new Date(0);
                  date.setSeconds(seconds);
                  return date.toISOString().substr(11, 12).replace('.', ',');
              }
              const endTime = startTime + srtLineDuration;
              srtContent += `${index + 1}\n`;
              srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
              srtContent += `${line.trim()}.\n\n`;
              startTime = endTime;
          });
          const blob = new Blob([srtContent], { type: 'text/plain' });
          triggerDownload(blob, `${baseFileName}.srt`);
      }
    } catch (err) {
        console.error(`Export failed for format: ${format}`, err);
        const errorMessage = err instanceof Error ? err.message : 'Um erro inesperado ocorreu.';
        setExportError(`Falha ao exportar como ${format.toUpperCase()}. Detalhes: ${errorMessage}`);
        setTimeout(() => setExportError(null), 7000); // Ocultar erro após 7 segundos
    }
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-bold text-center mb-4">Transcrição Concluída</h2>
      <div className="relative w-full mb-6">
        <textarea
          readOnly
          value={transcript}
          className="w-full h-64 p-4 bg-black/30 border border-white/20 rounded-lg text-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          placeholder="O texto da transcrição aparecerá aqui..."
        />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Copiar para a área de transferência"
        >
          {copied ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all transform hover:scale-105 shadow-md"
        >
          Transcrever Outro Arquivo
        </button>

        <div className="relative" ref={exportMenuRef}>
            <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
                <DownloadIcon className="w-5 h-5" />
                Exportar
            </button>
            {isExportMenuOpen && (
                <div className="absolute bottom-full mb-2 w-full min-w-max bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in-up p-2">
                    <div className="px-2 py-2">
                      <label htmlFor="srt-duration" className="block text-xs font-medium text-gray-300 mb-1">Duração da Linha SRT (s)</label>
                      <input 
                        type="number"
                        id="srt-duration"
                        value={srtLineDuration}
                        onChange={(e) => setSrtLineDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-black/40 text-white rounded-md border-white/20 text-sm p-1 focus:ring-indigo-500 focus:border-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <ul className="text-sm text-white">
                        <li><button onClick={() => handleExport('txt')} className="w-full text-left block px-2 py-2 rounded-md hover:bg-indigo-500/50 transition-colors">como .txt</button></li>
                        <li><button onClick={() => handleExport('docx')} className="w-full text-left block px-2 py-2 rounded-md hover:bg-indigo-500/50 transition-colors">como .docx</button></li>
                        <li><button onClick={() => handleExport('srt')} className="w-full text-left block px-2 py-2 rounded-md hover:bg-indigo-500/50 transition-colors">como .srt</button></li>
                    </ul>
                </div>
            )}
        </div>
      </div>
      {exportError && (
        <p className="w-full text-center text-red-400 text-sm mt-4 animate-fade-in">
          {exportError}
        </p>
      )}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
        .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #4b5563;
            border-radius: 20px;
            border: 3px solid transparent;
        }
      `}</style>
    </div>
  );
};

export default TranscriptionResult;
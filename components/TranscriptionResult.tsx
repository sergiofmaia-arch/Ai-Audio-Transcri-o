
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
            const endTime = startTime + 5; // 5 seconds per subtitle line
            srtContent += `${index + 1}\n`;
            srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
            srtContent += `${line.trim()}.\n\n`;
            startTime = endTime;
        });
        const blob = new Blob([srtContent], { type: 'text/plain' });
        triggerDownload(blob, `${baseFileName}.srt`);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4">Transcription Complete</h2>
      <div className="relative w-full mb-6">
        <textarea
          readOnly
          value={transcript}
          className="w-full h-64 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          placeholder="Transcription text will appear here..."
        />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-all transform hover:scale-105"
        >
          Transcribe Another File
        </button>

        <div className="relative" ref={exportMenuRef}>
            <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-2"
            >
                <DownloadIcon className="w-5 h-5" />
                Export
            </button>
            {isExportMenuOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg overflow-hidden z-10">
                    <ul className="text-sm text-white">
                        <li><a href="#" onClick={(e) => {e.preventDefault(); handleExport('txt')}} className="block px-4 py-2 hover:bg-indigo-500">as .txt</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); handleExport('docx')}} className="block px-4 py-2 hover:bg-indigo-500">as .docx</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); handleExport('srt')}} className="block px-4 py-2 hover:bg-indigo-500">as .srt</a></li>
                    </ul>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;
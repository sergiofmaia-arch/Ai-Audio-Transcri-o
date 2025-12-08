
import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import FileUpload from './components/FileUpload';
import TranscriptionProgress from './components/TranscriptionProgress';
import TranscriptionResult from './components/TranscriptionResult';
import { transcribeAudio } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleFileUpload = useCallback(async (file: File) => {
    setFileName(file.name);
    setAppState(AppState.PROCESSING);
    setError(null);
    setTranscript('');

    try {
      setProgressMessage('Uploading and preparing file...');
      const result = await transcribeAudio(file, (message) => {
        setProgressMessage(message);
      });
      setTranscript(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Transcription failed:', errorMessage);
      setError(`Transcription failed. ${errorMessage}. Please try again.`);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setTranscript('');
    setError(null);
    setFileName('');
    setProgressMessage('');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <FileUpload onFileUpload={handleFileUpload} />;
      case AppState.PROCESSING:
        return <TranscriptionProgress fileName={fileName} progressMessage={progressMessage} />;
      case AppState.SUCCESS:
        return <TranscriptionResult transcript={transcript} onReset={handleReset} fileName={fileName} />;
      case AppState.ERROR:
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">An Error Occurred</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
          AI Audio <span className="text-indigo-400">Transcriber</span>
        </h1>
        <p className="text-lg text-gray-400">
          Upload any audio or video. Get a perfect transcript in seconds.
        </p>
      </header>
      <main className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl shadow-indigo-900/20 p-8">
        {renderContent()}
      </main>
      <footer className="text-center mt-10 text-gray-500 text-sm">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
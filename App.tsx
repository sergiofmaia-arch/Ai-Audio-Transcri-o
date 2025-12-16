import React, { useState, useCallback } from 'react';
import { FlowState } from './types';
import FileUpload from './components/FileUpload';
import TranscriptionProgress from './components/TranscriptionProgress';
import TranscriptionResult from './components/TranscriptionResult';
import { transcribeAudio } from './services/geminiService';
import AdSenseAd from './components/AdSenseAd';

const App: React.FC = () => {
  const [flowState, setFlowState] = useState<FlowState>(FlowState.IDLE);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState<string>('');
  
  const handleError = (err: unknown, context: string) => {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      console.error(`Falha na operação (${context}):`, errorMessage);
      setError(`${errorMessage}. Por favor, tente novamente.`);
      setFlowState(FlowState.ERROR);
  }

  const handleReset = useCallback(() => {
    setFlowState(FlowState.IDLE);
    setTranscript('');
    setError(null);
    setFileName('');
    setProgressMessage('');
  }, []);

  const handleTranscriptionUpload = useCallback(async (file: File) => {
    setFileName(file.name);
    setFlowState(FlowState.PROCESSING);
    setError(null);
    try {
      const result = await transcribeAudio(file, setProgressMessage);
      setTranscript(result);
      setFlowState(FlowState.SUCCESS);
    } catch (err) {
      handleError(err, 'transcription');
    }
  }, []);

  const renderContent = () => {
    if (flowState === FlowState.ERROR) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-bold text-red-400 mb-4">Ocorreu um Erro</h2>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
                <button
                onClick={handleReset}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                Tentar Novamente
                </button>
            </div>
        );
    }

    switch (flowState) {
      case FlowState.IDLE:
        return <FileUpload onFileUpload={handleTranscriptionUpload} />;
      case FlowState.PROCESSING:
        return <TranscriptionProgress fileName={fileName} progressMessage={progressMessage} />;
      case FlowState.SUCCESS:
        return <TranscriptionResult transcript={transcript} onReset={handleReset} fileName={fileName} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500/50">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-indigo-400">
            Transcreva Audio AI
          </h1>
          <p className="text-lg text-gray-400">
            Converta qualquer arquivo de áudio ou vídeo em texto com o poder da IA.
          p>
        </header>
        <main className="w-full relative bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-1 min-h-[400px] flex items-center justify-center animate-fade-in">
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-50 blur-lg" aria-hidden="true"></div>
          <div className="relative w-full h-full border border-white/10 rounded-xl bg-black/20 p-8 flex items-center justify-center">
            {renderContent()}
          </div>
        </main>
        <AdSenseAd />
        <footer className="text-center mt-8 text-gray-500 text-sm animate-fade-in">
          <p>Desenvolvido com Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
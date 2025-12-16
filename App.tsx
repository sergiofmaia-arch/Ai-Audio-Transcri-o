import React, { useState, useCallback, useEffect } from 'react';
import { AppMode, Feature, FlowState } from './types';
import FileUpload from './components/FileUpload';
import TranscriptionProgress from './components/TranscriptionProgress';
import TranscriptionResult from './components/TranscriptionResult';
import { transcribeAudio, generateVideoFromImage } from './services/geminiService';
import AdSenseAd from './components/AdSenseAd';
import ModeSelector from './components/ModeSelector';
import VideoForm from './components/VideoForm';
import VideoProgress from './components/VideoProgress';
import VideoResult from './components/VideoResult';
import ApiKeyPrompt from './components/ApiKeyPrompt';

// HACK: Define aistudio on window if it doesn't exist for local dev
if (process.env.NODE_ENV === 'development' && typeof window.aistudio === 'undefined') {
  // @ts-ignore
  window.aistudio = {
    hasSelectedApiKey: () => Promise.resolve(true), // Assume key exists in dev
    openSelectKey: () => Promise.resolve(),
  };
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHOOSING);
  const [flowState, setFlowState] = useState<FlowState>(FlowState.IDLE);
  
  const [transcript, setTranscript] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState<string>('');

  const [hasApiKey, setHasApiKey] = useState(false);
  const [featureToUnlock, setFeatureToUnlock] = useState<Feature | null>(null);

  const handleSelectFeature = useCallback(async (feature: Feature) => {
    try {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
        if (keyStatus) {
            if (feature === Feature.TRANSCRIPTION) setMode(AppMode.TRANSCRIPTION);
            if (feature === Feature.VIDEO) setMode(AppMode.VIDEO);
        } else {
            setFeatureToUnlock(feature);
            setMode(AppMode.NEEDS_KEY);
        }
    } catch (e) {
        console.error("Erro ao verificar a chave de API:", e);
        // Fallback for environments where aistudio might not exist
        setError("Não foi possível verificar a chave de API. Por favor, certifique-se de que você está em um ambiente compatível.");
        setFlowState(FlowState.ERROR);
        setMode(AppMode.TRANSCRIPTION); // or some error mode
    }
  }, []);

  const handleKeySelected = () => {
    setHasApiKey(true);
    if (featureToUnlock === Feature.TRANSCRIPTION) setMode(AppMode.TRANSCRIPTION);
    if (featureToUnlock === Feature.VIDEO) setMode(AppMode.VIDEO);
    setFeatureToUnlock(null);
  };
  
  const handleError = (err: unknown, context: string) => {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      console.error(`Falha na operação (${context}):`, errorMessage);
      setError(`${errorMessage}. Por favor, tente novamente.`);
      setFlowState(FlowState.ERROR);
  }

  const handleReset = useCallback(() => {
    setMode(AppMode.CHOOSING);
    setFlowState(FlowState.IDLE);
    setTranscript('');
    setVideoUrl('');
    setError(null);
    setFileName('');
    setProgressMessage('');
  }, []);

  // Transcription Handlers
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

  // Video Handlers
  const handleVideoSubmit = useCallback(async (imageFile: File, prompt: string, aspectRatio: '16:9' | '9:16') => {
    setFileName(imageFile.name);
    setFlowState(FlowState.PROCESSING);
    setError(null);
    try {
      const resultUrl = await generateVideoFromImage(imageFile, prompt, aspectRatio, setProgressMessage);
      setVideoUrl(resultUrl);
      setFlowState(FlowState.SUCCESS);
    } catch (err) {
      handleError(err, 'video');
    }
  }, []);

  const renderContent = () => {
    switch (mode) {
      case AppMode.CHOOSING:
        return (
          <ModeSelector
            onSelectTranscription={() => handleSelectFeature(Feature.TRANSCRIPTION)}
            onSelectVideo={() => handleSelectFeature(Feature.VIDEO)}
          />
        );

      case AppMode.NEEDS_KEY:
        return <ApiKeyPrompt onKeySelected={handleKeySelected} />;

      case AppMode.TRANSCRIPTION:
        switch (flowState) {
          case FlowState.IDLE:
            return <FileUpload onFileUpload={handleTranscriptionUpload} />;
          case FlowState.PROCESSING:
            return <TranscriptionProgress fileName={fileName} progressMessage={progressMessage} />;
          case FlowState.SUCCESS:
            return <TranscriptionResult transcript={transcript} onReset={handleReset} fileName={fileName} />;
          case FlowState.ERROR:
            // Error content is rendered below
            break;
        }
        break;

      case AppMode.VIDEO:
        switch (flowState) {
          case FlowState.IDLE:
            return <VideoForm onSubmit={handleVideoSubmit} />;
          case FlowState.PROCESSING:
            return <VideoProgress fileName={fileName} progressMessage={progressMessage} />;
          case FlowState.SUCCESS:
            return <VideoResult videoUrl={videoUrl} onReset={handleReset} />;
          case FlowState.ERROR:
             // Error content is rendered below
            break;
        }
        break;
    }
    
    // Common Error Display for all flows
    if (flowState === FlowState.ERROR) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-bold text-red-400 mb-4">Ocorreu um Erro</h2>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
                <button
                onClick={handleReset}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                Começar de Novo
                </button>
            </div>
        );
    }

    return null;
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500/50">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-indigo-400">
            Transcreva Audio AI
          </h1>
          <p className="text-lg text-gray-400">
            Transcreva áudio, anime imagens e muito mais com o poder da IA.
          </p>
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

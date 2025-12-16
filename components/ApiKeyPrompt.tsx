import React from 'react';

interface ApiKeyPromptProps {
  onKeySelected: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onKeySelected }) => {
  
  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    onKeySelected();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-3">Chave de API Necessária</h2>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Para usar esta funcionalidade, é necessário usar uma chave de API de um projeto do Google Cloud com faturamento ativado. Por favor, selecione uma chave para continuar.
      </p>
      <button
        onClick={handleSelectKey}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105"
      >
        Selecionar Chave de API
      </button>
      <p className="mt-4 text-xs text-gray-500">
        Precisa de ajuda? <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">Saiba mais sobre faturamento</a>.
      </p>
    </div>
  );
};

export default ApiKeyPrompt;

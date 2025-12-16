import { GoogleGenAI } from "@google/genai";

export const fileToGenerativePart = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Falha ao ler o arquivo como string base64."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const transcribeAudio = async (
  file: File, 
  updateProgress: (message: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  updateProgress("Preparando o arquivo");
  const audioPart = await fileToGenerativePart(file);

  updateProgress("Enviando para a IA");
  const model = 'gemini-2.5-flash';
  const prompt = "Transcreva o seguinte conteúdo de áudio com precisão. Forneça apenas o texto transcrito.";
  
  try {
    const responsePromise = ai.models.generateContent({
        model: model,
        contents: { parts: [
            { text: prompt },
            { inlineData: audioPart }
        ]},
    });
    
    updateProgress("Transcrição em andamento");
    const response = await responsePromise;

    updateProgress("Finalizando");

    if (response.text) {
        return response.text.trim();
    } else {
        throw new Error("A API retornou uma resposta vazia. O áudio pode estar silencioso ou em um formato não suportado.");
    }
  } catch(e) {
      if (e instanceof Error) {
          console.error("Gemini API Error:", e);
          throw new Error(`O modelo de IA não pôde processar a solicitação. Detalhes: ${e.message}`);
      }
      throw new Error("Ocorreu um erro inesperado ao chamar a API Gemini.");
  }
};
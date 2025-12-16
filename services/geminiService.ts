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

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject("Não foi possível ler o arquivo");
            }
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const transcribeAudio = async (
  file: File, 
  updateProgress: (message: string) => void
): Promise<string> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("A chave de API não está disponível. Por favor, selecione uma chave para usar esta funcionalidade.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

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


export const generateVideoFromImage = async (
    imageFile: File,
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    updateProgress: (message: string) => void
): Promise<string> => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("A chave de API não está disponível. Por favor, selecione uma chave para usar esta funcionalidade.");
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        updateProgress("Preparando imagem...");
        const imageBase64 = await fileToBase64(imageFile);

        updateProgress("Iniciando geração...");
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: imageBase64,
                mimeType: imageFile.type,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        updateProgress("Processando vídeo (pode levar alguns minutos)...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        updateProgress("Finalizando...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("A API de vídeo não retornou um link para download.");
        }
        
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Falha ao buscar o vídeo: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (e) {
        if (e instanceof Error) {
            console.error("Gemini API Error (Video):", e.message);
            if (e.message.includes("Requested entity was not found")) {
                 throw new Error("A chave de API selecionada parece ser inválida. Por favor, selecione uma chave de um projeto pago e tente novamente.");
            }
            throw new Error(`O modelo de IA não pôde processar a solicitação. Detalhes: ${e.message}`);
        }
        throw new Error("Ocorreu um erro inesperado ao chamar a API de geração de vídeo.");
    }
}

import { GoogleGenAI } from "@google/genai";

const fileToGenerativePart = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
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
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set. Please configure it to use the transcription service.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  if (!file) {
    throw new Error("No file provided for transcription.");
  }

  updateProgress("Converting file...");
  const audioPart = await fileToGenerativePart(file);

  updateProgress("Connecting to AI model...");
  const model = 'gemini-2.5-flash';
  
  const prompt = "Transcribe the following audio content accurately. Provide only the transcribed text.";

  updateProgress("AI is now transcribing...");
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [
            { text: prompt },
            { inlineData: audioPart }
        ]}],
    });
    
    updateProgress("Finalizing transcript...");

    if (response.text) {
        return response.text.trim();
    } else {
        throw new Error("The API returned an empty response. The audio might be silent or in an unsupported format.");
    }
  } catch(e) {
      if (e instanceof Error) {
          console.error("Gemini API Error:", e);
          throw new Error(`The AI model could not process the request. Details: ${e.message}`);
      }
      throw new Error("An unexpected error occurred while calling the Gemini API.");
  }
};
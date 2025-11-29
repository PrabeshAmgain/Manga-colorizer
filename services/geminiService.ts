import { GoogleGenAI } from "@google/genai";
import { GroundingSource } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the Data URL prefix (e.g., "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Step 1: Search for color information using Google Search Grounding
 */
export const searchMangaColors = async (mangaName: string, characterFocus?: string): Promise<{ description: string; sources: GroundingSource[] }> => {
  const ai = getClient();
  
  const query = `What are the official colors for the characters in the manga "${mangaName}"? ${characterFocus ? `Focus on ${characterFocus}.` : ''} List hair color, eye color, skin tone, and outfit colors.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No specific color data found. Using AI prediction.";
    
    // Extract sources if available
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = rawChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return { description: text, sources };
  } catch (error) {
    console.error("Search failed:", error);
    return { 
      description: "Could not retrieve online data. Using internal model knowledge for coloring.", 
      sources: [] 
    };
  }
};

/**
 * Step 2: Color the image using Gemini 2.5 Flash Image (Nano Banana)
 * using the context found in Step 1.
 */
export const colorizeMangaPage = async (
  imageBase64: string, 
  mimeType: string, 
  colorDescription: string
): Promise<string> => {
  const ai = getClient();

  const prompt = `
    You are a professional manga colorist. 
    Task: Color this black and white manga page.
    
    Reference Color Information (from web search):
    ${colorDescription}
    
    Instructions:
    1. Apply the reference colors accurately to the characters described.
    2. For background elements or characters not mentioned, use artistic judgement to match the manga's genre/mood.
    3. Maintain the shading and line art style of the original image.
    4. Return a high-quality colored image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // "Nano Banana"
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate to find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image generated in response.");
  } catch (error) {
    console.error("Colorization failed:", error);
    throw error;
  }
};

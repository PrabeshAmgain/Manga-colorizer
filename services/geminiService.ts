import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingSource } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 1000,
  backoffFactor: number = 2
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      console.warn(`Attempt ${attempt} failed: ${error.message || error}`);
      
      if (attempt >= retries) {
        throw error;
      }

      await wait(delay);
      delay *= backoffFactor;
    }
  }
  throw new Error("Retry loop failed unexpectedly");
}

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

// Helper to get image dimensions from base64 string
const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = `data:image/png;base64,${base64}`;
  });
};

// Helper to find the closest supported aspect ratio for Gemini
const getBestAspectRatio = (width: number, height: number): string => {
  const ratio = width / height;
  const supportedRatios = {
    "1:1": 1,
    "3:4": 3/4,
    "4:3": 4/3,
    "9:16": 9/16,
    "16:9": 16/9
  };
  
  let closest = "1:1";
  let minDiff = Infinity;

  for (const [key, value] of Object.entries(supportedRatios)) {
    const diff = Math.abs(ratio - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = key;
    }
  }
  return closest;
};

/**
 * Step 1: Search for color information using Google Search Grounding
 */
export const searchMangaColors = async (mangaName: string, characterFocus?: string): Promise<{ description: string; sources: GroundingSource[] }> => {
  const ai = getClient();
  
  const query = `What are the official colors for the characters in the manga "${mangaName}"? ${characterFocus ? `Focus on ${characterFocus}.` : ''} List hair color, eye color, skin tone, and outfit colors.`;

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "Use standard vibrant anime coloring style.";
    
    // Extract sources if available
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = rawChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return { description: text, sources };
  } catch (error) {
    console.error("Search failed after retries:", error);
    return { 
      description: "Use a standard, high-quality, vibrant anime color palette suitable for this manga genre. Use natural skin tones and distinct hair colors.", 
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

  // 1. Calculate best aspect ratio to prevent squashing/cropping/hallucination
  const { width, height } = await getImageDimensions(imageBase64);
  const aspectRatio = getBestAspectRatio(width, height);

  const prompt = `
    You are an expert manga colorist.
    
    TASK: Transform this Black and White manga page into a FULLY COLORED version.
    
    STRICT RULES:
    1. **APPLY VIBRANT COLORS**: The output MUST be in color. Do not output a grayscale image. Use the reference colors provided.
    2. **PRESERVE STRUCTURE**: Keep the original line art, text bubbles, and layout exactly as they are. Do not redraw characters or change poses.
    3. **FILL TECHNIQUE**: Apply color to all white and grey areas. Keep black ink lines black.
    4. **LIGHTING**: Add dramatic anime-style lighting and shading to enhance the scene.

    Reference Colors:
    ${colorDescription}
    
    If specific colors are not clear, use a standard vivid anime color palette appropriate for the genre.
  `;

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
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
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    }));

    // Iterate to find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image generated in response.");
  } catch (error) {
    console.error("Colorization failed after retries:", error);
    throw error;
  }
};
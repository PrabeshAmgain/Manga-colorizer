import express from 'express';
import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.PORT || 5173;

app.use(express.json({ limit: '10mb' }));

interface GroundingSource {
  title: string;
  uri: string;
}

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }
  if (apiKey === 'FREE_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const searchMangaColors = async (mangaName: string, characterFocus?: string): Promise<{ description: string; sources: GroundingSource[] }> => {
  const ai = getClient();
  if (!ai) {
    return {
      description: "This is a mock response. The real API is not being called.",
      sources: [{ title: "Mock Source", uri: "https://example.com" }]
    };
  }

  const query = `What are the official colors for the characters in the manga "${mangaName}"? ${characterFocus ? `Focus on ${characterFocus}.` : ''} List hair color, eye color, skin tone, and outfit colors.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: query }] }],
      tools: [{ googleSearch: {} }],
    });

    const text = response.text || "No specific color data found. Using AI prediction.";
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

const colorizeMangaPage = async (imageBase64: string, mimeType: string, colorDescription: string): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return imageBase64;
  }

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
      model: 'gemini-1.5-flash',
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
    });

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

app.post('/api/search', async (req, res) => {
  try {
    const { mangaName, characterFocus } = req.body;
    if (!mangaName) {
      return res.status(400).json({ error: 'mangaName is required' });
    }
    const result = await searchMangaColors(mangaName, characterFocus);
    res.json(result);
  } catch (error: any) {
    console.error('Search endpoint error:', error);
    res.status(500).json({ error: 'Failed to search for manga colors', details: error.message });
  }
});

app.post('/api/colorize', async (req, res) => {
  try {
    const { imageBase64, mimeType, colorDescription } = req.body;
    if (!imageBase64 || !mimeType || !colorDescription) {
      return res.status(400).json({ error: 'imageBase64, mimeType, and colorDescription are required' });
    }
    const coloredImage = await colorizeMangaPage(imageBase64, mimeType, colorDescription);
    res.json({ coloredImage });
  } catch (error: any) {
    console.error('Colorize endpoint error:', error);
    res.status(500).json({ error: 'Failed to colorize image', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

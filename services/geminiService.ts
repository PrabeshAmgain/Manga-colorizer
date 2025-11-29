import { GroundingSource } from '../types';

// Helper to convert File to Base64 remains on the client-side
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Step 1: Call the backend to search for color information
 */
export const searchMangaColors = async (mangaName: string, characterFocus?: string): Promise<{ description: string; sources: GroundingSource[] }> => {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mangaName, characterFocus }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search manga colors');
  }

  return response.json();
};

/**
 * Step 2: Call the backend to color the image
 */
export const colorizeMangaPage = async (imageBase64: string, mimeType: string, colorDescription: string): Promise<string> => {
  const response = await fetch('/api/colorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64, mimeType, colorDescription }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to colorize manga page');
  }

  const result = await response.json();
  return result.coloredImage;
};

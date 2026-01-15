
export interface ProcessingState {
  status: 'idle' | 'searching' | 'coloring' | 'complete' | 'error';
  message: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ColoringResult {
  originalImage: string; // Base64
  coloredImage: string; // Base64
  colorPaletteDescription: string;
  sources: GroundingSource[];
}

export type ColoringMode = 'search' | 'preset';

export interface MangaRequest {
  mangaName: string;
  characterFocus: string; 
  file: File | null;
  mode: ColoringMode;
  presetId?: string;
}

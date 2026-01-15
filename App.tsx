
import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { UploadForm } from './components/UploadForm';
import { ResultView } from './components/ResultView';
import { MangaRequest, ProcessingState, ColoringResult, GroundingSource } from './types';
import { fileToBase64, searchMangaColors, colorizeMangaPage } from './services/geminiService';
import { COLOR_PRESETS } from './constants/presets';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({ status: 'idle', message: '' });
  const [result, setResult] = useState<ColoringResult | null>(null);

  const handleProcess = async (data: MangaRequest) => {
    if (!data.file) return;

    try {
      setResult(null);
      let colorDescription = "";
      let sources: GroundingSource[] = [];

      if (data.mode === 'search') {
        setState({ status: 'searching', message: `Searching web for "${data.mangaName}" official colors...` });
        const searchResult = await searchMangaColors(data.mangaName, data.characterFocus);
        colorDescription = searchResult.description;
        sources = searchResult.sources;
      } else {
        const preset = COLOR_PRESETS.find(p => p.id === data.presetId) || COLOR_PRESETS[0];
        colorDescription = preset.description;
        setState({ status: 'coloring', message: `Applying "${preset.label}" style preset...` });
      }
      
      if (data.mode === 'search') {
        setState({ status: 'coloring', message: 'Analyzing image and applying colors with Gemini...' });
      }

      // 2. Prepare Image
      const base64Image = await fileToBase64(data.file);
      
      // 3. Generate Colored Image
      const coloredImageBase64 = await colorizeMangaPage(
        base64Image,
        data.file.type,
        colorDescription
      );

      setResult({
        originalImage: base64Image,
        coloredImage: coloredImageBase64,
        colorPaletteDescription: colorDescription,
        sources: sources
      });

      setState({ status: 'complete', message: 'Done!' });

    } catch (error: any) {
      console.error(error);
      setState({ 
        status: 'error', 
        message: error.message || 'An error occurred during processing. Please try again.' 
      });
    }
  };

  const handleReset = () => {
    setState({ status: 'idle', message: '' });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-manga-accent selection:text-white">
      <Hero />

      <main className="container mx-auto px-4 py-8 pb-20">
        
        {state.status === 'idle' && (
          <div className="animate-fade-in-up">
             <UploadForm isLoading={false} onSubmit={handleProcess} />
          </div>
        )}

        {(state.status === 'searching' || state.status === 'coloring') && (
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-t-4 border-manga-accent rounded-full animate-spin"></div>
               <div className="absolute inset-2 border-b-4 border-blue-500 rounded-full animate-spin-reverse"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 animate-pulse">
              {state.status === 'searching' ? 'Grounding Search...' : 'Gemini Artist Painting...'}
            </h3>
            <p className="text-gray-400">{state.message}</p>
          </div>
        )}

        {state.status === 'error' && (
           <div className="max-w-xl mx-auto bg-red-900/20 border border-red-500 rounded-xl p-8 text-center">
             <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-red-500 mb-2">Processing Error</h3>
             <p className="text-gray-300 mb-6">{state.message}</p>
             <button 
                onClick={handleReset}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
             >
               Try Again
             </button>
           </div>
        )}

        {state.status === 'complete' && result && (
          <ResultView result={result} onReset={handleReset} />
        )}

      </main>

      <footer className="border-t border-gray-800 py-10 mt-auto bg-gray-950">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p className="mb-2">© {new Date().getFullYear()} MangaColorizer AI. Experimental Creative Platform.</p>
          <p>Powered by Google Gemini 2.5 Flash Image & AI Search Grounding.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

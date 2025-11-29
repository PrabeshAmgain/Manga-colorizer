import React from 'react';
import { ColoringResult } from '../types';

interface ResultViewProps {
  result: ColoringResult;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Result</h2>
          <button 
            onClick={onReset}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
          >
            Start New
          </button>
        </div>

        {/* Comparison View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-400 uppercase tracking-wider text-sm">Original</h3>
            <div className="relative rounded-xl overflow-hidden bg-white/5 border border-gray-600 aspect-[2/3]">
              <img 
                src={`data:image/png;base64,${result.originalImage}`} 
                alt="Original" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-manga-accent uppercase tracking-wider text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
              Gemini Colored
            </h3>
            <div className="relative rounded-xl overflow-hidden bg-white/5 border border-manga-accent aspect-[2/3] shadow-[0_0_15px_rgba(255,71,87,0.3)]">
              <img 
                src={`data:image/png;base64,${result.coloredImage}`} 
                alt="Colored" 
                className="w-full h-full object-contain" 
              />
            </div>
             <a 
              href={`data:image/png;base64,${result.coloredImage}`} 
              download="manga-colored-gemini.png"
              className="block w-full py-2 bg-gray-700 hover:bg-gray-600 text-center rounded-lg text-white font-medium transition-colors mt-4"
            >
              Download Colored Image
            </a>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">AI Reasoning & Sources</h3>
          
          <div className="mb-4">
             <h4 className="text-sm font-medium text-gray-400 mb-1">Color Palette Reasoning:</h4>
             <p className="text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
               {result.colorPaletteDescription}
             </p>
          </div>

          {result.sources.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Sources Found:</h4>
              <ul className="space-y-1">
                {result.sources.map((source, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-blue-400 truncate">
                     <span className="text-gray-500">•</span>
                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-300">
                       {source.title || source.uri}
                     </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

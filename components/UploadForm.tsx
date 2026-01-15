
import React, { useState } from 'react';
import { MangaRequest, ColoringMode } from '../types';
import { COLOR_PRESETS } from '../constants/presets';

interface UploadFormProps {
  isLoading: boolean;
  onSubmit: (data: MangaRequest) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ isLoading, onSubmit }) => {
  const [mangaName, setMangaName] = useState('');
  const [characterFocus, setCharacterFocus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<ColoringMode>('search');
  const [selectedPreset, setSelectedPreset] = useState(COLOR_PRESETS[0].id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && (mode === 'preset' || mangaName)) {
      onSubmit({ 
        mangaName: mangaName || "Unknown Series", 
        characterFocus, 
        file, 
        mode, 
        presetId: mode === 'preset' ? selectedPreset : undefined 
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Strategy Selection */}
        <div className="flex p-1 bg-gray-900 rounded-xl border border-gray-700">
          <button
            type="button"
            onClick={() => setMode('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'search' ? 'bg-manga-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            AI Web Search
          </button>
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'preset' ? 'bg-manga-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            Manual Preset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Context Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Manga Series {mode === 'search' ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  required={mode === 'search'}
                  value={mangaName}
                  onChange={(e) => setMangaName(e.target.value)}
                  placeholder="e.g., Chainsaw Man"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-manga-accent focus:border-transparent transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Character Focus (Optional)
                </label>
                <input
                  type="text"
                  value={characterFocus}
                  onChange={(e) => setCharacterFocus(e.target.value)}
                  placeholder="e.g., Denji in hybrid form"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-manga-accent focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Strategy Content */}
            {mode === 'search' ? (
              <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-xl">
                <p className="text-xs text-blue-300 leading-relaxed">
                  <span className="font-bold text-blue-400">Web Grounding Enabled:</span> Gemini will search the internet for the official color scheme of "{mangaName || 'the series'}" before painting your page.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPreset === preset.id 
                        ? 'border-manga-accent bg-manga-accent/10' 
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      {preset.colors.map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-sm font-medium block text-white">{preset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Upload Manga Page
            </label>
            <div className={`relative h-full min-h-[250px] lg:min-h-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${file ? 'border-manga-accent bg-gray-900' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`}>
              {preview ? (
                <div className="relative w-full h-full group p-4">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-lg" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-white text-sm font-medium">Drop new file to change</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <svg className="mx-auto h-12 w-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm text-gray-400">Click or drag & drop B&W page</p>
                  <p className="text-xs text-gray-600 mt-2">PNG, JPG or WEBP</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !file || (mode === 'search' && !mangaName)}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all flex items-center justify-center gap-3
            ${isLoading || !file || (mode === 'search' && !mangaName)
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-manga-accent to-red-600 text-white hover:scale-[1.01] hover:shadow-red-500/20 active:scale-95'
            }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              AI Artist is Working...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              {mode === 'search' ? 'Search & Colorize' : 'Apply Preset Style'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

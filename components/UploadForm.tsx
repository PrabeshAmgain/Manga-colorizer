import React, { useState } from 'react';
import { MangaRequest } from '../types';

interface UploadFormProps {
  isLoading: boolean;
  onSubmit: (data: MangaRequest) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ isLoading, onSubmit }) => {
  const [mangaName, setMangaName] = useState('');
  const [characterFocus, setCharacterFocus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mangaName && file) {
      onSubmit({ mangaName, characterFocus, file });
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="mangaName" className="block text-sm font-medium text-gray-300 mb-1">
                Manga Name (Series) *
              </label>
              <input
                id="mangaName"
                type="text"
                required
                value={mangaName}
                onChange={(e) => setMangaName(e.target.value)}
                placeholder="e.g., One Piece, Naruto"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-manga-accent focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div>
              <label htmlFor="characterFocus" className="block text-sm font-medium text-gray-300 mb-1">
                Specific Character (Optional)
              </label>
              <input
                id="characterFocus"
                type="text"
                value={characterFocus}
                onChange={(e) => setCharacterFocus(e.target.value)}
                placeholder="e.g., Luffy in Wano outfit"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-manga-accent focus:border-transparent transition-all outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Helps search grounding find the exact color scheme.
              </p>
            </div>
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-300 mb-1">
                Upload Page
              </label>
            <div className={`relative h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors ${file ? 'border-manga-accent bg-gray-900' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`}>
              
              {preview ? (
                <div className="relative w-full h-full group">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-contain rounded-lg p-2 opacity-80" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white text-sm font-medium">Click to change</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                   <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-400">Click to upload image</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !file || !mangaName}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg shadow-lg transform transition-all 
            ${isLoading || !file || !mangaName
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-manga-accent to-red-600 text-white hover:scale-[1.02] hover:shadow-red-500/25 active:scale-95'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Colorize Manga Page"
          )}
        </button>
      </form>
    </div>
  );
};

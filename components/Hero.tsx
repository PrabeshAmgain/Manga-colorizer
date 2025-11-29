import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-manga-dark pb-10 pt-16">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="w-96 h-96 bg-manga-accent rounded-full blur-3xl absolute -top-20 -left-20"></div>
        <div className="w-96 h-96 bg-blue-600 rounded-full blur-3xl absolute bottom-0 right-0"></div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-manga-accent to-orange-500">
            MangaColorizer
          </span> AI
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
          Upload a raw manga page. We search the web for the official character color palettes 
          and use <span className="text-manga-accent font-semibold">Gemini 2.5 Flash Image</span> to paint it instantly.
        </p>
      </div>
    </div>
  );
};

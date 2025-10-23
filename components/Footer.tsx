import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 mt-12 py-6 border-t dark:border-slate-700 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-secondary dark:text-slate-400">
        <div className="mb-2">
          <a href="#" className="mx-2 hover:text-primary dark:hover:text-white">About</a> |
          <a href="#" className="mx-2 hover:text-primary dark:hover:text-white">Privacy Policy</a> |
          <a href="#" className="mx-2 hover:text-primary dark:hover:text-white">Contact</a>
        </div>
        <p className="text-sm">
          Built with 💻 by a world-class senior frontend React engineer using Google AI Studio (Gemini).
        </p>
        <p className="text-xl font-bold mt-2 text-primary dark:text-gray-200">
          Made by Avishek
        </p>
         <div className="mt-4">
            <h3 className="font-semibold text-primary dark:text-white">How It Works</h3>
            <p className="text-sm mt-1 max-w-2xl mx-auto">
                Our AI rewrites your input into a professional, ATS-optimized format used by recruiters worldwide. Just fill in your details and let our technology do the rest.
            </p>
        </div>
      </div>
    </footer>
  );
};
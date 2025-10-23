import React from 'react';
import { Sun, Moon, History } from 'lucide-react';

interface HeaderProps {
    toggleTheme: () => void;
    theme: string;
    onToggleSavedResumes: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleTheme, theme, onToggleSavedResumes }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 transition-colors duration-300 flex-shrink-0 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-start to-accent-end animate-gradient-x">
            AI Resume Builder
            </h1>
            <p className="mt-1 text-md text-secondary dark:text-slate-400">
            Your Conversational Career Assistant
            </p>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={onToggleSavedResumes}
              className="p-2 rounded-full text-primary dark:text-gray-200 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-all transform hover:scale-110 active:scale-95"
              aria-label="View saved resumes"
            >
              <History size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-primary dark:text-gray-200 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-all transform hover:scale-110 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
        </div>
      </div>
    </header>
  );
};
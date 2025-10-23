import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';

interface SaveResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
}

export const SaveResumeModal: React.FC<SaveResumeModalProps> = ({ isOpen, onClose, onSave, defaultName }) => {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      // Focus the input when the modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      style={{ animationDuration: '0.3s' }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-primary dark:text-gray-100">Save Resume</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-transform transform hover:scale-110 active:scale-95">
            <X size={24} />
          </button>
        </header>
        <main className="p-6">
          <label htmlFor="resumeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resume Name
          </label>
          <input
            ref={inputRef}
            id="resumeName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full p-2 border rounded-md bg-transparent dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-accent-start focus:border-accent-start dark:placeholder-gray-400 transition-colors"
          />
        </main>
        <footer className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-secondary dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            <Save size={16} /> Save
          </button>
        </footer>
      </div>
    </div>
  );
};
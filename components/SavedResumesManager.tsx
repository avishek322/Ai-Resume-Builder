import React from 'react';
import type { SavedResume } from '../types';
import { X, Trash2, FileText } from 'lucide-react';

interface SavedResumesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: SavedResume[];
  onLoad: (resume: SavedResume) => void;
  onDelete: (id: string) => void;
}

export const SavedResumesManager: React.FC<SavedResumesManagerProps> = ({ isOpen, onClose, resumes, onLoad, onDelete }) => {
  if (!isOpen) return null;

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      onDelete(id);
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
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-primary dark:text-gray-100">Saved Resumes</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-transform transform hover:scale-110 active:scale-95">
            <X size={24} />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 dark:text-slate-600" />
              <h3 className="mt-4 text-lg font-semibold">No Saved Resumes</h3>
              <p className="text-secondary dark:text-slate-400 mt-1">
                Generate a resume and click "Save" to find it here later.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {resumes.map(resume => (
                <li
                  key={resume.id}
                  className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between gap-4 transition-transform transform hover:scale-[1.02]"
                >
                  <div>
                    <p className="font-semibold text-primary dark:text-gray-200">{resume.name}</p>
                    <p className="text-xs text-secondary dark:text-slate-400">
                      Saved on {new Date(resume.savedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLoad(resume)}
                      className="px-3 py-1 text-sm font-medium text-white bg-accent-start rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id, resume.name)}
                      className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-all transform hover:scale-105 active:scale-95"
                      aria-label={`Delete ${resume.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};
import React from 'react';
import type { TemplateId } from '../types';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

const templates: { id: TemplateId; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'A timeless, single-column layout.' },
  { id: 'modern', name: 'Modern', description: 'A sleek two-column design.' },
  { id: 'creative', name: 'Creative', description: 'A stylish and unique format.' },
];

const TemplatePreview: React.FC<{id: TemplateId}> = ({id}) => {
    switch(id) {
        case 'modern':
            return (
                <div className="w-full h-full bg-white dark:bg-slate-700 rounded flex gap-1 p-1">
                    <div className="w-1/3 h-full bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                    <div className="w-2/3 h-full flex flex-col gap-1">
                        <div className="w-3/4 h-2 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                        <div className="w-full h-4 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                        <div className="w-full h-4 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                    </div>
                </div>
            );
        case 'creative':
            return (
                <div className="w-full h-full bg-white dark:bg-slate-700 rounded p-1 flex flex-col items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-slate-500"></div>
                    <div className="w-1/2 h-2 bg-gray-300 dark:bg-slate-500 rounded-sm"></div>
                    <div className="w-3/4 h-2 bg-gray-200 dark:bg-slate-500 rounded-sm mt-1"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                </div>
            )
        case 'classic':
        default:
             return (
                <div className="w-full h-full bg-white dark:bg-slate-700 rounded p-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                         <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-500"></div>
                         <div className="flex-grow h-4 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                    <div className="w-3/4 h-2 bg-gray-200 dark:bg-slate-500 rounded-sm"></div>
                </div>
            );
    }
}


export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-300">
      <h2 className="text-2xl font-bold text-primary dark:text-gray-100 mb-4 text-center">Choose Your Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-accent-start ring-2 ring-accent-start/50 bg-blue-50 dark:bg-slate-900'
                : 'border-gray-200 dark:border-slate-700 hover:border-accent-start hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className="h-24 bg-gray-100 dark:bg-slate-600 rounded-md mb-3">
               <TemplatePreview id={template.id} />
            </div>
            <h3 className="font-bold text-lg text-primary dark:text-gray-200">{template.name}</h3>
            <p className="text-sm text-secondary dark:text-slate-400">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
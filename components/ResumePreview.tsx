import React from 'react';
import type { ResumeData, TemplateId } from '../types';
import { LivePreview } from './LivePreview';

interface ResumePreviewProps {
  htmlContent: string | null;
  isLoading: boolean;
  resumeData: ResumeData;
  templateId: TemplateId;
}

const LoadingSkeleton: React.FC = () => (
  <div className="p-8 space-y-6">
    <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 animate-shimmer"></div>
        <div className="flex-1 space-y-2">
            <div className="w-3/4 h-8 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
            <div className="w-1/2 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
        </div>
    </div>
    <div className="space-y-2">
        <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
        <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
        <div className="w-3/4 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
    </div>
     <div className="space-y-4 pt-4">
        <div className="w-1/4 h-6 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
        <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
        <div className="w-5/6 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
         <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded animate-shimmer"></div>
    </div>
  </div>
);

const Placeholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl">
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-slate-600">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
    <h3 className="mt-4 text-xl font-semibold text-primary dark:text-gray-200">Resume Preview</h3>
    <p className="mt-1 text-secondary dark:text-slate-400">Your resume will be built here as you chat with our AI assistant.</p>
  </div>
);

export const ResumePreview: React.FC<ResumePreviewProps> = ({ htmlContent, isLoading, resumeData, templateId }) => {
    const isDataEmpty = !resumeData.fullName && !resumeData.summary && 
    !resumeData.profilePicture &&
    resumeData.education.every(e => !e.school && !e.degree) &&
    resumeData.experience.every(e => !e.company && !e.title) &&
    resumeData.skills.length === 0 &&
    resumeData.certifications.every(c => !c);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[70vh] transition-colors duration-300">
      {isLoading ? (
        <LoadingSkeleton />
      ) : htmlContent ? (
        <div
            key={htmlContent} 
            id="resume-preview-content" 
            className="p-2 sm:p-4 md:p-8 resume-container animate-fade-in"
        >
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      ) : isDataEmpty ? (
         <Placeholder />
      ) : (
        <div id="resume-preview-content">
            <LivePreview data={resumeData} templateId={templateId} />
        </div>
      )}
    </div>
  );
};
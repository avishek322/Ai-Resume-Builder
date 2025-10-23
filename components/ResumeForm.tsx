import React from 'react';
import type { ResumeData } from '../types';
import { PlusCircle, Trash2, Loader, Zap } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { TagInput } from './TagInput';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onGenerate: () => void;
  onClear: () => void;
  isLoading: boolean;
}

const inputStyles = "w-full p-2 border rounded-md bg-transparent dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-accent-start focus:border-accent-start dark:placeholder-gray-400 transition-colors";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-6 transition-colors duration-300">
    <h2 className="text-2xl font-bold text-primary dark:text-gray-100 mb-4 border-b dark:border-slate-600 pb-2">{title}</h2>
    {children}
  </div>
);

export const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, onGenerate, onClear, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDynamicChange = <T,>(section: keyof ResumeData, index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => {
      const list = [...(prev[section] as T[])] as any[];
      list[index][name] = value;
      return { ...prev, [section]: list };
    });
  };

  const handleCertificationChange = (index: number, value: string) => {
    setResumeData(prev => {
        const newCertifications = [...prev.certifications];
        newCertifications[index] = value;
        return { ...prev, certifications: newCertifications };
    });
  };

  const handleAddItem = <T,>(section: keyof ResumeData, newItem: T) => {
    setResumeData(prev => ({ ...prev, [section]: [...(prev[section] as T[]), newItem] }));
  };

  const handleRemoveItem = (section: keyof ResumeData, index: number) => {
    setResumeData(prev => ({ ...prev, [section]: (prev[section] as any[]).filter((_, i) => i !== index) }));
  };
  
  const handleExperiencePointChange = (expIndex: number, pointIndex: number, value: string) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].points[pointIndex] = value;
      return { ...prev, experience: newExperience };
    });
  };

  const addExperiencePoint = (expIndex: number) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].points.push('');
      return { ...prev, experience: newExperience };
    });
  };

  const removeExperiencePoint = (expIndex: number, pointIndex: number) => {
     setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].points = newExperience[expIndex].points.filter((_, i) => i !== pointIndex);
      return { ...prev, experience: newExperience };
    });
  };

  return (
    <div className="space-y-8">
      <Section title="Personal Information">
         <ImageUpload
            onImageUpload={(base64) => setResumeData(prev => ({...prev, profilePicture: base64}))}
            profilePicture={resumeData.profilePicture}
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="fullName" placeholder="Full Name" value={resumeData.fullName} onChange={handleChange} className={inputStyles} required />
            <input type="email" name="email" placeholder="Email Address" value={resumeData.email} onChange={handleChange} className={inputStyles} required />
            <input type="tel" name="phoneNumber" placeholder="Phone Number" value={resumeData.phoneNumber} onChange={handleChange} className={inputStyles} />
            <input type="text" name="location" placeholder="Location (e.g., San Francisco, CA)" value={resumeData.location} onChange={handleChange} className={inputStyles} />
            <input type="url" name="linkedin" placeholder="LinkedIn Profile URL" value={resumeData.linkedin} onChange={handleChange} className={inputStyles} />
            <input type="url" name="github" placeholder="GitHub Profile URL" value={resumeData.github} onChange={handleChange} className={inputStyles} />
        </div>
        <textarea name="summary" placeholder="Career Summary / Objective" value={resumeData.summary} onChange={handleChange} className={`${inputStyles} mt-4`} rows={4} required></textarea>
      </Section>

      <Section title="Education">
        {resumeData.education.map((edu, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border dark:border-slate-700 rounded-lg relative">
            <input type="text" name="school" placeholder="School Name" value={edu.school} onChange={e => handleDynamicChange('education', index, e)} className={inputStyles} />
            <input type="text" name="degree" placeholder="Degree (e.g., B.S. in Computer Science)" value={edu.degree} onChange={e => handleDynamicChange('education', index, e)} className={inputStyles} />
            <input type="text" name="startYear" placeholder="Start Year" value={edu.startYear} onChange={e => handleDynamicChange('education', index, e)} className={inputStyles} />
            <input type="text" name="endYear" placeholder="End Year" value={edu.endYear} onChange={e => handleDynamicChange('education', index, e)} className={inputStyles} />
            <button onClick={() => handleRemoveItem('education', index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><Trash2 size={16}/></button>
          </div>
        ))}
        <button onClick={() => handleAddItem('education', { school: '', degree: '', startYear: '', endYear: '' })} className="flex items-center gap-2 text-accent-start dark:text-blue-400 font-semibold"><PlusCircle size={16}/> Add Education</button>
      </Section>

      <Section title="Experience">
        {resumeData.experience.map((exp, index) => (
          <div key={index} className="mb-4 p-4 border dark:border-slate-700 rounded-lg relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="title" placeholder="Job Title" value={exp.title} onChange={e => handleDynamicChange('experience', index, e)} className={inputStyles} />
              <input type="text" name="company" placeholder="Company" value={exp.company} onChange={e => handleDynamicChange('experience', index, e)} className={inputStyles} />
              <input type="text" name="startYear" placeholder="Start Year" value={exp.startYear} onChange={e => handleDynamicChange('experience', index, e)} className={inputStyles} />
              <input type="text" name="endYear" placeholder="End Year" value={exp.endYear} onChange={e => handleDynamicChange('experience', index, e)} className={inputStyles} />
            </div>
            <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">Key Achievements / Responsibilities:</h4>
                {exp.points.map((point, pIndex) => (
                    <div key={pIndex} className="flex items-center gap-2 mb-2">
                        <textarea value={point} onChange={e => handleExperiencePointChange(index, pIndex, e.target.value)} placeholder={`Bullet point ${pIndex + 1}`} className={inputStyles} rows={2}></textarea>
                        <button onClick={() => removeExperiencePoint(index, pIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                ))}
                <button onClick={() => addExperiencePoint(index)} className="flex items-center gap-2 text-sm text-accent-start dark:text-blue-400 font-semibold mt-2"><PlusCircle size={14}/> Add Bullet Point</button>
            </div>
            <button onClick={() => handleRemoveItem('experience', index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><Trash2 size={16}/></button>
          </div>
        ))}
        <button onClick={() => handleAddItem('experience', { company: '', title: '', startYear: '', endYear: '', points: [''] })} className="flex items-center gap-2 text-accent-start dark:text-blue-400 font-semibold"><PlusCircle size={16}/> Add Experience</button>
      </Section>

      <Section title="Skills & Certifications">
        <div>
          <h3 className="font-semibold mb-2 dark:text-gray-300">Skills</h3>
          <TagInput tags={resumeData.skills} setTags={tags => setResumeData(prev => ({...prev, skills: tags}))} />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2 dark:text-gray-300">Certifications (Optional)</h3>
          {resumeData.certifications.map((cert, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input type="text" value={cert} onChange={e => handleCertificationChange(index, e.target.value)} placeholder="Certification Name" className={inputStyles} />
              <button onClick={() => handleRemoveItem('certifications', index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
            </div>
          ))}
          <button onClick={() => handleAddItem('certifications', '')} className="flex items-center gap-2 text-accent-start dark:text-blue-400 font-semibold"><PlusCircle size={16}/> Add Certification</button>
        </div>
      </Section>
      
      <div className="flex items-center justify-between gap-4 sticky bottom-0 bg-background/80 dark:bg-slate-900/80 backdrop-blur-sm py-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-lg shadow-lg bg-gradient-to-r from-accent-start to-accent-end hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
          {isLoading ? 'Generating...' : 'Generate Resume with AI'}
        </button>
        <button onClick={onClear} className="px-6 py-3 text-secondary dark:text-gray-300 font-bold rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
          Clear Form
        </button>
      </div>

    </div>
  );
};
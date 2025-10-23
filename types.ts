
export interface Education {
    school: string;
    degree: string;
    startYear: string;
    endYear: string;
}

export interface Experience {
    company: string;
    title: string;
    startYear: string;
    endYear: string;
    points: string[];
}

export interface ResumeData {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  profilePicture: string | null;
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications: string[];
}

export type TemplateId = 'classic' | 'modern' | 'creative' | 'custom';

export interface SavedResume {
  id: string;
  name: string;
  savedAt: string;
  resumeData: ResumeData;
  templateId: TemplateId;
  htmlContent: string;
  customTemplateImage: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

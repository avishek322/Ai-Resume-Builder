import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ResumePreview } from './components/ResumePreview';
import { SavedResumesManager } from './components/SavedResumesManager';
import { ResumeChatbot } from './components/ResumeChatbot';
import { SaveResumeModal } from './components/SaveResumeModal';
import type { ResumeData, TemplateId, SavedResume, ChatMessage } from './types';
import { generateResumeHTML, refineResumeHTML } from './services/geminiService';
import { Download, Save, Share2, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI, Chat } from "@google/genai";

const initialResumeData: ResumeData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  location: '',
  linkedin: '',
  github: '',
  summary: '',
  profilePicture: null,
  education: [],
  experience: [],
  skills: [],
  certifications: [],
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chatSystemInstruction = `You are an expert resume building AI assistant. Your goal is to conversationally collect information from the user to build a professional resume.
1.  **Be friendly, conversational, and proactive.** Start by greeting the user and asking how you can help.
2.  **Guide the user.** Ask for information piece by piece (e.g., full name, then contact info, etc.). For experience and education, ask for them one at a time. After getting a piece of information, confirm you've received it.
3.  **Your response MUST BE a single, valid JSON object** and nothing else. No markdown, no commentary outside the JSON.
4.  **Use Markdown in your 'response' text** for better readability (e.g., bolding, bullet points).
5.  **Image Handling**: If the user provides an image, you MUST determine its purpose. If it's a photo of a person, it's a profile picture. If it's a document, screenshot, or layout, it's a resume template. Add the field \`"imagePurpose": "PROFILE" | "TEMPLATE"\` to your JSON response whenever an image is provided.
6.  **The JSON schema is:** \`{ "response": string, "updatedFields": object, "action": "COLLECT" | "GENERATE" | "REFINE", "templateId"?: "classic" | "modern" | "creative", "imagePurpose"?: "PROFILE" | "TEMPLATE" }\`
    *   \`response\`: Your friendly, conversational reply to the user.
    *   \`updatedFields\`: An object containing ONLY the new or changed fields. When updating an array field (like 'experience'), you must return the ENTIRE updated array.
    *   \`action\`:
        *   \`"COLLECT"\`: Use this while gathering information.
        *   \`"GENERATE"\`: Use this when you have enough for a first draft.
        *   \`"REFINE"\`: After the first generation, use this for any subsequent change requests.
    *   \`templateId\`: Include this when the user explicitly asks to change to a built-in template.
    *   \`imagePurpose\`: Must be included if the user's message included an image.
7.  **Template Logic**: If the user uploads a template image, acknowledge it (e.g., "Great template! I can work with that.") and then start collecting their information.
8.  **Example 1:** User says "My name is John Doe". You respond: \`{"response": "Great to meet you, John! What's your email address?", "updatedFields": {"fullName": "John Doe"}, "action": "COLLECT"}\`
9.  **Example 2:** User uploads a photo of themself. You respond: \`{"response": "Thanks for the photo! I've added it as your profile picture. Now, what's your full name?", "updatedFields": {}, "action": "COLLECT", "imagePurpose": "PROFILE"}\`
10. **Example 3:** User uploads an image of a resume. You respond: \`{"response": "That's a sharp-looking template! I'll use it as a guide. Let's start with your contact information. What's your email?", "updatedFields": {}, "action": "COLLECT", "imagePurpose": "TEMPLATE"}\``;


function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [templateId, setTemplateId] = useState<TemplateId>('classic');
  const [customTemplateImage, setCustomTemplateImage] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm your AI resume assistant. You can describe the resume you want, or upload an image of a template you like, and I'll help you build it.\n\nHow can I help you get started?" }
  ]);
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    try {
      const storedResumes = localStorage.getItem('savedResumes');
      if (storedResumes) {
        setSavedResumes(JSON.parse(storedResumes));
      }
    } catch (error) {
      console.error("Failed to load saved resumes from localStorage", error);
    }
  }, []);

  // Handle loading shared resumes from URL hash
  useEffect(() => {
    const processHash = async () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                const jsonString = atob(decodeURIComponent(hash));
                const decodedData = JSON.parse(jsonString);
                if (decodedData.resumeData && decodedData.templateId) {
                    setResumeData(decodedData.resumeData);
                    setTemplateId(decodedData.templateId);
                    setCustomTemplateImage(decodedData.customTemplateImage || null);
                    setChatMessages([{ role: 'assistant', content: "Loaded a shared resume. You can start editing!" }]);
                    // FIX: Pass the customTemplateImage to generateResumeHTML
                    const { html_resume } = await generateResumeHTML(decodedData.resumeData, decodedData.templateId, decodedData.customTemplateImage || null);
                    setHtmlContent(html_resume);
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            } catch (e) {
                console.error("Failed to parse shared link", e);
                window.location.hash = ''; // Clear bad hash
            }
        }
        setIsInitialLoading(false);
    };
    processHash();
  }, []);

  useEffect(() => {
    chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: chatSystemInstruction },
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleSaveResume = () => {
    if (!htmlContent) {
      alert("Please generate a resume before saving.");
      return;
    }
    setIsSaveModalOpen(true);
  };

  const confirmSaveResume = (name: string) => {
    if (!htmlContent) return; // Guard clause

    const newSave: SavedResume = {
      id: new Date().toISOString(),
      name,
      savedAt: new Date().toISOString(),
      resumeData,
      templateId,
      htmlContent,
      customTemplateImage,
    };
    const updatedResumes = [...savedResumes, newSave];
    setSavedResumes(updatedResumes);
    localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));
    
    setIsSaveModalOpen(false);
    setSaveButtonText('Saved!');
    setTimeout(() => {
        setSaveButtonText('Save');
    }, 2000);
  };

  const handleLoadResume = (resume: SavedResume) => {
    setResumeData(resume.resumeData);
    setTemplateId(resume.templateId);
    setHtmlContent(resume.htmlContent);
    setCustomTemplateImage(resume.customTemplateImage || null);
    setChatMessages([
        { role: 'assistant', content: `I've loaded your resume "${resume.name}". Let me know what changes you'd like to make.` }
    ]);
    setShowSavedResumes(false);
  };

  const handleDeleteResume = (id: string) => {
    const updatedResumes = savedResumes.filter(r => r.id !== id);
    setSavedResumes(updatedResumes);
    localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));
  };
  
  const handleSendMessage = async (message: string, imageBase64: string | null = null) => {
    if (!chatRef.current) return;

    const userMessage = imageBase64 ? `${message} [USER UPLOADED AN IMAGE]` : message;

    setChatMessages(prev => [...prev, { role: 'user', content: message, image: imageBase64 ? imageBase64 : undefined }]);
    setIsChatLoading(true);

    let updatedData = { ...resumeData };

    try {
        const userMessageForAI = `
        Here is the current state of the resume data we've collected so far. An empty string "" or empty array [] means the data hasn't been provided yet.
        \`\`\`json
        ${JSON.stringify(updatedData, null, 2)}
        \`\`\`
        
        Based on this data and my latest message below, please respond with a single JSON object according to your instructions.
        
        My message: "${userMessage}"
        `;
        
        const result = await chatRef.current.sendMessage({ message: userMessageForAI });
        let aiResponseText = result.text;
        
        aiResponseText = aiResponseText.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
        
        let aiResponseJson;
        try {
            aiResponseJson = JSON.parse(aiResponseText);
        } catch (e) {
            console.error("Failed to parse AI JSON response:", aiResponseText);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an issue. Please try rephrasing your message." }]);
            setIsChatLoading(false);
            return;
        }

        const { response, updatedFields, action, templateId: newTemplateId, imagePurpose } = aiResponseJson;
        
        if (response) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }

        if (imageBase64 && imagePurpose) {
            if (imagePurpose === 'PROFILE') {
                updatedData.profilePicture = imageBase64;
            } else if (imagePurpose === 'TEMPLATE') {
                setCustomTemplateImage(imageBase64);
                setTemplateId('custom');
            }
        }
        
        if (updatedFields && Object.keys(updatedFields).length > 0) {
            updatedData = { ...updatedData, ...updatedFields };
        }
        
        setResumeData(updatedData);
        
        const finalTemplateId = newTemplateId || templateId;
        if (newTemplateId) {
            setTemplateId(newTemplateId);
            if (newTemplateId !== 'custom') {
                 setCustomTemplateImage(null);
            }
        }

        if (action === 'GENERATE') {
            // FIX: Pass the customTemplateImage to generateResumeHTML
            const { html_resume } = await generateResumeHTML(updatedData, finalTemplateId, customTemplateImage);
            setHtmlContent(html_resume);
        } else if (action === 'REFINE') {
            // FIX: Pass the customTemplateImage to generateResumeHTML
            const currentHtml = htmlContent || (await generateResumeHTML(updatedData, finalTemplateId, customTemplateImage)).html_resume;
            // FIX: Pass the customTemplateImage to refineResumeHTML
            const { refined_html } = await refineResumeHTML(currentHtml, message, customTemplateImage);
            setHtmlContent(refined_html);
        }

    } catch (error) {
        console.error("Error communicating with AI:", error);
        setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I seem to be having a little trouble connecting. Please check your connection and try again in a moment." }]);
    } finally {
        setIsChatLoading(false);
    }
  };
  
  const handleDownloadPdf = async () => {
    const element = document.getElementById('resume-preview-content');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${resumeData.fullName || 'resume'}.pdf`);
  };

  const handleCopyText = () => {
    if (!htmlContent) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.innerText || tempDiv.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Text'), 2000);
    }, () => {
        alert('Failed to copy text.');
    });
  };

  const handleShareLink = () => {
    if (!resumeData.fullName) {
        alert("Please add some information to your resume before sharing.");
        return;
    }
    const dataToShare = { resumeData, templateId, customTemplateImage };
    const jsonString = JSON.stringify(dataToShare);
    // URL-safe base64 encoding
    const base64String = btoa(jsonString);
    const shareUrl = `${window.location.origin}${window.location.pathname}#${base64String}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Shareable link copied to clipboard!");
    });
  };

  return (
    <div className="bg-background dark:bg-slate-900 text-primary dark:text-gray-200 min-h-screen font-sans transition-colors duration-300 flex flex-col">
      <Header toggleTheme={toggleTheme} theme={theme} onToggleSavedResumes={() => setShowSavedResumes(true)} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <ResumeChatbot
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isChatLoading={isChatLoading}
            />
        </div>

        <div className="sticky top-24 self-start animate-fade-in" style={{ animationDelay: '200ms' }}>
             <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-3 rounded-xl shadow-lg mb-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button onClick={handleSaveResume} disabled={!htmlContent || saveButtonText !== 'Save'} className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded-lg transition-transform transform hover:scale-105 active:scale-95 ${saveButtonText === 'Saved!' ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100`}>
                        {saveButtonText === 'Saved!' ? <Check size={16} /> : <Save size={16} />} {saveButtonText}
                    </button>
                    <button onClick={handleDownloadPdf} disabled={!htmlContent} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-accent-start rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 active:scale-95 disabled:hover:scale-100">
                        <Download size={16} /> PDF
                    </button>
                    <button onClick={handleCopyText} disabled={!htmlContent} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-primary dark:text-gray-200 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-gray-400 disabled:dark:bg-slate-600/50 disabled:cursor-not-allowed transition-transform transform hover:scale-105 active:scale-95 disabled:hover:scale-100">
                        <Copy size={16} /> {copyButtonText}
                    </button>
                    <button onClick={handleShareLink} disabled={!htmlContent} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-primary dark:text-gray-200 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-gray-400 disabled:dark:bg-slate-600/50 disabled:cursor-not-allowed transition-transform transform hover:scale-105 active:scale-95 disabled:hover:scale-100">
                        <Share2 size={16} /> Share
                    </button>
                </div>
            </div>
            <ResumePreview 
            htmlContent={htmlContent}
            isLoading={(isChatLoading && !htmlContent) || isInitialLoading}
            resumeData={resumeData}
            templateId={templateId}
            />
        </div>

      </main>
      <Footer />
      <SavedResumesManager 
        isOpen={showSavedResumes}
        onClose={() => setShowSavedResumes(false)}
        resumes={savedResumes}
        onLoad={handleLoadResume}
        onDelete={handleDeleteResume}
      />
      <SaveResumeModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={confirmSaveResume}
        defaultName={`Resume - ${resumeData.fullName || 'Untitled'}`}
      />
    </div>
  );
}

export default App;
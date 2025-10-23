
import { GoogleGenAI } from "@google/genai";
import type { ResumeData, TemplateId } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (data: ResumeData, templateId: TemplateId) => `
    Based on the following JSON data, generate a professional, ATS-friendly resume. 
    The output must be a single, well-formatted HTML string using the '${templateId}' theme.
    - For 'classic', use a clean, single-column layout.
    - For 'modern', use a two-column layout with contact info/skills on the side.
    - For 'creative', use more distinct visual styling with accent colors.
    - Use semantic class names like 'resume-heading', 'resume-secondary-text', 'resume-section', 'section-title' etc.
    - The HTML should be self-contained within a single root div with a class that starts with 'template-' (e.g., <div class="template-classic">...</div>).
    - Do not include <html>, <head>, or <body> tags. Only the content for the resume preview.
    - Use TailwindCSS utility classes for styling, but also use the provided semantic class names for key elements so they can be targeted by themes.
    - Ensure contact information is clearly visible at the top.
    - If a profile picture is provided, include an <img> tag with src pointing to the base64 data.
    - Rewrite experience bullet points to be more impactful using the STAR (Situation, Task, Action, Result) method. Make them sound professional and achievement-oriented.
    - For skills, display them as tags or a clean list.
    Data: ${JSON.stringify(data, null, 2)}
`;


export const generateResumeHTML = async (data: ResumeData, templateId: TemplateId, customTemplateImage: string | null = null): Promise<{ html_resume: string }> => {
  console.log("Generating HTML with data:", data, "and template:", templateId);
 
  try {
    let generatedHtml: string;
    
    if (templateId === 'custom' && customTemplateImage) {
        const imageMimeType = customTemplateImage.match(/data:(image\/\w+);base64,/)?.[1] || 'image/png';
        const imageBase64 = customTemplateImage.split(',')[1];
        
        const prompt = `Based on the following JSON data, and visually mimicking the attached resume template image, generate a professional, ATS-friendly resume.
        - The output MUST be a single, well-formatted HTML string.
        - The HTML should be self-contained within a single root div.
        - Use TailwindCSS utility classes for all styling to match the image as closely as possible (layout, fonts, colors, spacing).
        - Do not include <html>, <head>, or <body> tags.
        - If a profile picture is provided in the JSON, include it.
        - Make the experience bullet points sound professional and achievement-oriented.
        Data: ${JSON.stringify(data, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
                ]
            }
        });
        generatedHtml = response.text;
    } else {
        const prompt = generatePrompt(data, templateId);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        generatedHtml = response.text;
    }
    
    generatedHtml = generatedHtml.replace(/^```html\n/, '').replace(/\n```$/, '').trim();
    return { html_resume: generatedHtml };

  } catch (error) {
    console.error("Error calling Gemini API for generation:", error);
    throw new Error("Failed to generate resume from AI.");
  }
};

export const refineResumeHTML = async (currentHtml: string, userRequest: string, customTemplateImage: string | null = null): Promise<{ refined_html: string }> => {
  console.log("Refining HTML with request:", userRequest);

  try {
      let prompt: string | { parts: ({ text: string; } | { inlineData: { mimeType: string; data: string; }; })[]; };
      let model = 'gemini-2.5-flash';
      
      if (customTemplateImage) {
          model = 'gemini-2.5-flash-image';
          const imageMimeType = customTemplateImage.match(/data:(image\/\w+);base64,/)?.[1] || 'image/png';
          const imageBase64 = customTemplateImage.split(',')[1];
          const textPrompt = `You are an expert web developer. A user wants to modify their resume's HTML. Your task is to return the complete, modified HTML code.
          **CONTEXT & INSTRUCTIONS:**
          1.  Analyze the user's request, the provided HTML, and the original template image.
          2.  Modify the HTML to fulfill the request while maintaining the visual style of the template image.
          3.  Return the **entire, full, and complete HTML code**.
          4.  **CRITICAL:** Your response must ONLY be the raw HTML. Do NOT include explanations or markdown.
          ---
          **CURRENT RESUME HTML:** \`\`\`html\n${currentHtml}\n\`\`\`
          **USER REQUEST:** "${userRequest}"
          **MODIFIED HTML OUTPUT:**`;
          
          prompt = {
              parts: [
                  { text: textPrompt },
                  { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
              ]
          };
      } else {
          prompt = `You are an expert web developer. A user wants to modify their resume's HTML. Your task is to return the complete, modified HTML code.
          **CONTEXT & INSTRUCTIONS:**
          1.  Analyze the user's request and the provided HTML.
          2.  Modify the HTML to fulfill the request.
          3.  Return the **entire, full, and complete HTML code**.
          4.  **CRITICAL:** Your response must ONLY be the raw HTML. Do NOT include explanations or markdown.
          ---
          **CURRENT RESUME HTML:** \`\`\`html\n${currentHtml}\n\`\`\`
          **USER REQUEST:** "${userRequest}"
          **MODIFIED HTML OUTPUT:**`;
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      const refinedHtml = response.text.replace(/^```html\n/, '').replace(/\n```$/, '').trim();
      return { refined_html: refinedHtml };

  } catch (error)    {
    console.error("Error calling Gemini API for refinement:", error);
    throw new Error("Failed to refine resume from AI.");
  }
};

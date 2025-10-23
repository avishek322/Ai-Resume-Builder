import React from 'react';
import type { ResumeData, TemplateId } from '../types';

interface LivePreviewProps {
  data: ResumeData;
  templateId: TemplateId;
}

const hasContent = (arr: any[], key?: string) => arr.some(item => key ? item[key]?.trim() : item?.trim());

const Section: React.FC<{title: string, className?: string, children: React.ReactNode}> = ({title, className, children}) => (
    <section className={`resume-section ${className}`}>
        <h3 className="section-title resume-heading">{title}</h3>
        {children}
    </section>
);

export const LivePreview: React.FC<LivePreviewProps> = ({ data, templateId }) => {
  const {
    fullName, email, phoneNumber, location, linkedin, github, summary,
    profilePicture, education, experience, skills, certifications
  } = data;
  
  const contactInfo = (
    <>
        <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-1 text-sm resume-secondary-text mt-2">
            {email && <span>{email}</span>}
            {phoneNumber && <span>| {phoneNumber}</span>}
            {location && <span>| {location}</span>}
        </div>
        <div className="flex justify-start items-center gap-4 text-sm mt-1">
            {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
        </div>
    </>
  );

  const summarySection = summary && <div className="fade-in-section"><Section title="Summary"><p className="text-sm whitespace-pre-wrap">{summary}</p></Section></div>;
  
  const experienceSection = hasContent(experience, 'title') && (
    <div className="fade-in-section">
    <Section title="Experience">
      {experience.map((exp, index) => (
        (exp.title || exp.company) && (
          <div key={index} className="mb-5">
            <div className="flex justify-between items-baseline flex-wrap">
              <div>
                <h4 className="text-md font-bold">{exp.title}</h4>
                <p className="text-sm font-semibold resume-secondary-text">{exp.company}</p>
              </div>
              {(exp.startYear || exp.endYear) && <p className="text-sm resume-secondary-text shrink-0">{exp.startYear} - {exp.endYear}</p>}
            </div>
            {hasContent(exp.points) && (
              <ul className="list-disc mt-2 text-sm space-y-1">
                {exp.points.map((point, pIndex) => point && <li key={pIndex}>{point}</li>)}
              </ul>
            )}
          </div>
        )
      ))}
    </Section>
    </div>
  );

  const educationSection = hasContent(education, 'school') && (
    <div className="fade-in-section">
    <Section title="Education">
      {education.map((edu, index) => (
        (edu.school || edu.degree) && (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline flex-wrap">
              <h4 className="text-md font-bold">{edu.school}</h4>
              {(edu.startYear || edu.endYear) && <p className="text-sm resume-secondary-text shrink-0">{edu.startYear} - {edu.endYear}</p>}
            </div>
            <p className="text-sm italic">{edu.degree}</p>
          </div>
        )
      ))}
    </Section>
    </div>
  );
  
  const skillsSection = skills.length > 0 && (
    <div className="fade-in-section">
    <Section title="Skills">
      <div>
        {skills.map(skill => (
          <span key={skill} className="inline-block resume-tag-bg resume-tag-text rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">{skill}</span>
        ))}
      </div>
    </Section>
    </div>
  );

  const certificationsSection = hasContent(certifications) && (
    <div className="fade-in-section">
    <Section title="Certifications">
      <ul className="list-disc text-sm space-y-1">
        {certifications.map((cert, index) => cert && <li key={index}>{cert}</li>)}
      </ul>
    </Section>
    </div>
  );


  const renderContent = () => {
    switch (templateId) {
        case 'modern':
            return (
                 <div className="template-modern">
                    <div className="modern-sidebar">
                        <header className="resume-header text-center mb-8 flex items-center gap-6">
                            {profilePicture && <img src={profilePicture} alt="Profile" className="w-28 h-28 rounded-full object-cover mx-auto" />}
                            <div className="text-left w-full">
                                {fullName && <h1 className="text-4xl font-bold resume-heading">{fullName}</h1>}
                                {contactInfo}
                            </div>
                        </header>
                         {skillsSection}
                         {certificationsSection}
                    </div>
                    <div className="modern-main">
                        {summarySection}
                        {experienceSection}
                        {educationSection}
                    </div>
                </div>
            );
        case 'creative':
            return (
                <div className="template-creative">
                    <header className="resume-header text-center mb-8">
                        {profilePicture && <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 resume-border" />}
                        {fullName && <h1 className="text-5xl font-bold resume-heading">{fullName}</h1>}
                        {contactInfo}
                    </header>
                    {summarySection}
                    {experienceSection}
                    {educationSection}
                    {skillsSection}
                    {certificationsSection}
                </div>
            );
        case 'classic':
        default:
            return (
                 <div className="template-classic">
                    <header className="resume-header text-center flex items-center gap-6">
                        {profilePicture && <img src={profilePicture} alt="Profile" className="w-28 h-28 rounded-full object-cover mx-auto md:mx-0 shrink-0" />}
                        <div className="text-left flex-grow">
                            {fullName && <h1 className="text-4xl font-bold resume-heading">{fullName}</h1>}
                            {contactInfo}
                        </div>
                    </header>
                    {summarySection}
                    {experienceSection}
                    {educationSection}
                    {skillsSection}
                    {certificationsSection}
                </div>
            )
    }
  }


  return (
    <div className="p-2 sm:p-4 md:p-8 resume-container">
      {renderContent()}
    </div>
  );
};
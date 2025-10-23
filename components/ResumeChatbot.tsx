import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';

interface ResumeChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, imageBase64?: string | null) => void;
  isChatLoading: boolean;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center text-white font-bold text-sm shrink-0">
          AI
        </div>
      )}
      <div
        className={`max-w-md rounded-2xl px-4 py-3 break-words ${
          isUser
            ? 'bg-accent-start text-white rounded-br-none'
            : 'bg-white dark:bg-slate-700 text-primary dark:text-gray-200 rounded-bl-none'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
        {message.image && (
          <img src={message.image} alt="uploaded content" className="mt-2 rounded-lg max-w-full h-auto" />
        )}
      </div>
    </div>
  );
};

export const ResumeChatbot: React.FC<ResumeChatbotProps> = ({ messages, onSendMessage, isChatLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  const handleSendMessage = () => {
    if ((inputMessage.trim() || attachedImage) && !isChatLoading) {
      onSendMessage(inputMessage, attachedImage);
      setInputMessage('');
      setAttachedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm flex flex-col h-full rounded-2xl shadow-xl overflow-hidden max-h-[80vh]">
      <div className="p-4 border-b dark:border-slate-700">
        <h2 className="text-xl font-bold text-primary dark:text-gray-100 text-center">Resume Assistant</h2>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        {isChatLoading && (
           <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center text-white font-bold text-sm shrink-0">AI</div>
              <div className="max-w-md rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 rounded-bl-none">
                  <div className="flex items-center gap-2 text-secondary dark:text-slate-400">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Thinking...</span>
                  </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
        {attachedImage && (
            <div className="relative w-24 h-24 mb-2">
                <img src={attachedImage} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                <button
                    onClick={removeAttachedImage}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/75"
                >
                    <X size={16}/>
                </button>
            </div>
        )}
        <div className="flex items-start gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 shrink-0"
            aria-label="Attach image"
          >
            <Paperclip size={20} />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
          </button>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me to build your resume..."
            rows={1}
            className="flex-1 p-2 border rounded-md bg-transparent dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-accent-start focus:border-accent-start resize-none max-h-32"
          />
          <button
            onClick={handleSendMessage}
            disabled={isChatLoading || (!inputMessage.trim() && !attachedImage)}
            className="p-3 rounded-full text-white bg-accent-start hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

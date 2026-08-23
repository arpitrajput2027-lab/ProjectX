import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ChevronLeft, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ResumeAIChatProps {
  profileData: any;
  onApplyChanges: (updatedProfile: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ResumeAIChat({ profileData, onApplyChanges, isOpen, onToggle }: ResumeAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I can help you edit your resume. Tell me what you want to add, change, or improve, and I will update your resume directly.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/resumes/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_data: profileData,
          user_prompt: userMessage.content
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I have updated your resume!'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.updated_profile) {
        onApplyChanges(data.updated_profile);
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // The component is now always open when rendered, the button is moved to ResumeEditor

  return (
    <div className="w-[410px] bg-white border-l border-rule h-full flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20 flex-shrink-0 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-rule flex justify-between items-center bg-cream-2 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent-lt rounded-md text-accent">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-ink font-medium">AI Editor Chat</h3>
        </div>
        <button 
          onClick={onToggle}
          className="p-1.5 text-muted hover:text-ink hover:bg-cream-3 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-2/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-cream-3 text-ink-2' : 'bg-ink text-cream'
              }`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-ink text-cream rounded-tr-sm' 
                  : 'bg-white border border-rule shadow-sm rounded-tl-sm text-ink-2'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-ink text-cream flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-white border border-rule shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-2 text-muted">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Editing resume...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-rule">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type instructions to edit resume..."
            className="w-full bg-cream-2 border border-rule rounded-xl pl-4 pr-12 py-3 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none resize-none h-[60px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-colors ${
              input.trim() && !isLoading
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-cream-3 text-muted cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted text-center mt-2 uppercase tracking-wide">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

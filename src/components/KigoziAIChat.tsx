import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Volume2, HelpCircle } from 'lucide-react';
import { soundFx, speakAloud } from '../services/soundEffects';

interface KigoziAIChatProps {
  onClose: () => void;
  gradeLevel: string;
}

interface Message {
  id: string;
  sender: 'user' | 'kigozi';
  text: string;
  timestamp: string;
}

export const KigoziAIChat: React.FC<KigoziAIChatProps> = ({ onClose, gradeLevel }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'kigozi',
      text: `Oli otya, scholar! I am Kigozi, your Ugandan primary study buddy. Ask me any question from Mathematics, Science, SST, or English for ${gradeLevel}. I can explain using relatable examples like Rolex sharing, Matatu routes, or the Nile River!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'How do I calculate profit in Ugandan Shillings (UGX)?',
    'Why is Lake Victoria called Nalubaale?',
    'What is the difference between a pathogen and a vector in malaria?',
    'When should I use "despite" instead of "although"?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    soundFx.playClick();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tutor-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          subject: 'General Primary Curriculum',
          gradeLevel: gradeLevel,
          concept: 'Primary School Concepts',
        }),
      });

      const data = await res.json();
      const botResponse = data.text || 'Webale nyo! Remember to break tricky problems into simpler steps!';

      setMessages((prev) => [
        ...prev,
        {
          id: `k-${Date.now()}`,
          sender: 'kigozi',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      soundFx.playCorrect();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `k-${Date.now()}`,
          sender: 'kigozi',
          text: 'Great inquiry! When solving primary school questions, always identify the given values, relate them to real life (like buying goods at the shop), and check your steps carefully.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl h-[600px] max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-black text-lg">Kigozi AI Tutor</h3>
                <span className="bg-white/25 text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                  NCDC
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium">
                Patient Socratic Primary Study Companion
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-2xs">
                    K
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/50">
                    <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakAloud(msg.text)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Kigozi is thinking of a hint for you...</span>
            </div>
          )}
        </div>

        {/* Sample Starter Chips */}
        {messages.length <= 2 && (
          <div className="p-3 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {samplePrompts.map((sp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sp)}
                className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold whitespace-nowrap cursor-pointer shrink-0"
              >
                {sp}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Ask Kigozi any ${gradeLevel} NCDC topic...`}
            className="flex-1 bg-slate-100 text-slate-900 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="btn-3d-amber p-2.5 rounded-xl text-white cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

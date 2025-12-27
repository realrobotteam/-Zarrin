
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'سلام! من دستیار هوشمند زرین هستم. چطور می‌توانم در تحلیل بازار یا کار با سامانه به شما کمک کنم؟' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize chat session lazily
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = createChatSession();
      }

      const response = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'متاسفم، مشکلی در دریافت پاسخ پیش آمد.' }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'در حال حاضر ارتباط با سرور هوشمند برقرار نیست. لطفا دقایقی دیگر تلاش کنید.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Bot className="text-slate-900" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-500">دستیار هوشمند زرین</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-slate-400">آنلاین و آماده تحلیل</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-amber-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <Loader2 className="text-amber-500 animate-spin" size={16} />
                  <span className="text-[10px] text-slate-400 font-medium">در حال تحلیل...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="سوال خود را بپرسید..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-4 pl-12 text-xs text-slate-200 outline-none focus:border-amber-500 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute left-2 top-2 p-2 rounded-lg transition-all ${
                  !input.trim() || isLoading ? 'text-slate-600' : 'text-amber-500 hover:bg-amber-500/10'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[8px] text-center text-slate-600 mt-2">
              پاسخ‌ها توسط هوش مصنوعی تولید می‌شوند و صرفاً جنبه مشورتی دارند.
            </p>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-4 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-110 active:scale-95 group relative"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
            مشاوره هوشمند بازار
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatBot;

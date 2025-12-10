'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AIChatWidget({ isOpen, onClose }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: 'Hello! I am your CRM Assistant. How can I help you close more deals today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    
    // Tambah pesan user ke UI
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Tambah balasan AI ke UI
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: data.reply }]);

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px] shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
      <Card className="flex flex-col h-[500px] border-0 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden backdrop-blur-xl">
        
        {/* Header with Gradient */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <div className="absolute inset-0 bg-yellow-300 blur-lg opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-xs text-indigo-100">Always here to help</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-all duration-200 relative z-10 hover:rotate-90 transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`p-3 rounded-lg text-sm max-w-[80%] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'
              }`}>
                {/* Render new lines */}
                {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white p-3 rounded-lg border border-gray-200 rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 focus-visible:ring-gray-900"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="bg-gray-900 hover:bg-gray-800 shrink-0" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

      </Card>
    </div>
  );
}
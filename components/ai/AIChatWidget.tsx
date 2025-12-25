'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Lead, TeamMember } from '@/lib/types';

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
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY; 

export default function AIChatWidget({ isOpen, onClose }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: 'Hello! I am your CRM Assistant. Ask me anything about your leads or team.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. AMBIL DATA CRM (Konteks)
  // Pastikan URL API ini benar sesuai backend kamu
  const { data: leadsData } = useSWR<any>(`${API_URL}/leads`, fetcher);
  const { data: teamData } = useSWR<any>(`${API_URL}/team`, fetcher);

  // Auto scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 2. FUNGSI CERDAS: UNWRAP DATA (Buka Bungkus Data)
  const getArrayFromData = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // Cek jika data terbungkus di properti 'data', 'leads', atau 'team'
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.leads && Array.isArray(data.leads)) return data.leads;
    if (data.team && Array.isArray(data.team)) return data.team;
    return [];
  };

  // 3. GENERATE CONTEXT STRING
  const generateContextString = () => {
    // Normalisasi data dulu biar jadi Array murni
    const leads = getArrayFromData(leadsData);
    const team = getArrayFromData(teamData);

    // Debugging: Cek di Console Browser (F12) untuk memastikan data masuk
    console.log("DEBUG AI - Leads Array:", leads); 
    console.log("DEBUG AI - Team Array:", team);

    if (leads.length === 0 && team.length === 0) {
      return "Data CRM saat ini masih kosong atau gagal dimuat. Beritahu user bahwa kamu belum bisa melihat data.";
    }

    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum: number, l: any) => sum + (Number(l.value) || 0), 0);
    const highPriority = leads.filter((l: any) => l.priority === 'HIGH').length;
    
    // Rangkuman 5 Leads Terbaru
    const recentLeads = leads.slice(0, 5).map((l: any) => 
      `- ${l.title || 'No Title'} (Company: ${l.company || '-'}), Status: ${l.status}, Value: ${l.currency || 'IDR'} ${Number(l.value).toLocaleString()}`
    ).join('\n');

    // Rangkuman Tim
    const teamList = team.map((t: any) => `- ${t.name} (${t.role})`).join('\n');

    return `
      [DATA CRM REAL-TIME]
      Gunakan data berikut sebagai fakta mutlak untuk menjawab pertanyaan user.
      
      STATISTIK UTAMA:
      - Total Jumlah Leads: ${totalLeads}
      - Total Nilai Potensi (Deal Value): ${totalValue.toLocaleString()}
      - Jumlah Leads High Priority: ${highPriority}
      
      DAFTAR LEADS TERBARU:
      ${recentLeads}
      
      DAFTAR ANGGOTA TIM:
      ${teamList}
    `;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    // Cek API Key sebelum kirim
    if (!GROQ_API_KEY) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: input }]);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: "Error: API Key Groq belum dikonfigurasi di .env (NEXT_PUBLIC_GROQ_API_KEY)." }]);
      setInput('');
      return;
    }

    const userMessage = input;
    setInput('');
    
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // 4. SIAPKAN PROMPT RAHASIA
      const contextData = generateContextString();
      
      const systemPrompt = `
        Kamu adalah asisten CRM (Customer Relationship Management) yang cerdas dan membantu.
        Kamu memiliki akses ke data CRM perusahaan seperti Leads dan Team Member.
        
        INSTRUKSI PENTING:
        1. Jawab pertanyaan user BERDASARKAN DATA yang diberikan di bawah ini.
        2. Jika user bertanya "Ada berapa leads?", hitung dari data yang diberikan.
        3. Jika data kosong, katakan jujur bahwa belum ada data leads.
        4. Gunakan Bahasa Indonesia yang sopan dan profesional.

        ${contextData}
      `;

      // 5. KIRIM KE GROQ
      const payload = {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt }, // <--- Konteks masuk di sini
          ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.3, // Lebih rendah biar lebih faktual (kurang halu)
        max_tokens: 500,
      };

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Ambil detail error dari body response (bukan cuma statusText)
        const errorBody = await res.text();
        let errorMessage = res.statusText;
        try {
           const jsonError = JSON.parse(errorBody);
           // Coba ambil pesan error spesifik dari format Groq
           errorMessage = jsonError.error?.message || jsonError.message || res.statusText;
        } catch {
           errorMessage = errorBody || `HTTP ${res.status}`;
        }
        throw new Error(`API Error (${res.status}): ${errorMessage}`);
      }

      const data = await res.json();
      const aiReply = data.choices?.[0]?.message?.content || "Maaf, saya tidak mengerti.";

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiReply }]);

    } catch (error) {
      console.error("AI Error:", error);
      const displayError = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal.";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: `Maaf, terjadi kesalahan: ${displayError}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px] shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
      <Card className="flex flex-col h-[500px] border-0 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden backdrop-blur-xl">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <div className="absolute inset-0 bg-yellow-300 blur-lg opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
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
              placeholder="Ask about leads..."
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
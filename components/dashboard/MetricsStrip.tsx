"use client";

import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
// Pastikan path ini benar. Jika Lead ada di types/index.ts, sesuaikan importnya.
import { Lead } from '@/lib/types'; 

// --- 1. UPDATE INTERFACE: TERIMA BAHAN MENTAH (LEADS) ---
interface MetricsStripProps {
  leads: Lead[] | undefined; 
}

export default function MetricsStrip({ leads = [] }: MetricsStripProps) { 
  
  // --- 2. STATE USER (SAMA SEPERTI ACTIVITYLIST) ---
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    const rawData = localStorage.getItem("user"); // Pastikan key LocalStorage benar ("user")
    if (rawData) {
      try {
        setCurrentUser(JSON.parse(rawData));
      } catch (e) {
        console.error("Gagal parse user", e);
      }
    }
  }, []);

  // --- 3. LOGIKA FILTER (SATPAM) & HITUNG (KOKI) ---
  const stats = useMemo(() => {
    
    // TAMENG 1: Cek User
    if (!currentUser) {
        return { total: 0, won: 0, lost: 0, rate: 0 };
    }

    // TAMENG 2: Pastikan leads adalah ARRAY
    if (!leads || !Array.isArray(leads)) {
        return { total: 0, won: 0, lost: 0, rate: 0 };
    }

    // FILTER: Hanya ambil leads milik user ini (jika Sales)
    const myLeads = leads.filter((lead) => {
        // Admin -> Ambil Semua
        if (currentUser.role === "ADMIN") return true;

        // Sales -> Cek Assigned Users
        if (currentUser.role === "SALES") {
             const assignedUsers = (lead as any).assignedUsers || [];
             return assignedUsers.some((u: any) => String(u.id) === String(currentUser.id));
        }
        return false;
    });

    // HITUNG STATISTIK
    const total = myLeads.length;
    const won = myLeads.filter(l => l.status === "WON").length;
    const lost = myLeads.filter(l => l.status === "LOST").length;
    
    // Hitung Win Rate (Cegah pembagian dengan nol)
    const rate = total > 0 ? Math.round((won / total) * 100) : 0;

    return { total, won, lost, rate };

  }, [leads, currentUser]);

  // --- 4. DATA UNTUK TAMPILAN (MAPPING HASIL HITUNGAN KE UI) ---
  const items = [
    {
      label: 'Total Won',
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: stats.won,
      change: 0, // Sementara 0 karena kita hitung real-time
      isPositive: true,
    },
    {
      label: 'Total Lost',
      icon: <XCircle className="w-4 h-4" />,
      value: stats.lost,
      change: 0, 
      isPositive: false,
    },
    {
      label: 'Total Leads',
      icon: <Globe className="w-4 h-4" />,
      value: stats.total,
      change: 0, 
      isPositive: true,
    },
    {
      label: 'Win Rate',
      icon: null,
      value: `${stats.rate}%`,
      change: 0,
      isPositive: true,
    },
  ];

  return (
    <div className="bg-gray-100/50 border border-gray-200 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        
        {items.map((item, index) => (
          <div key={index} className="px-4 py-3 flex items-center">
            
            <div className="flex w-full items-center justify-center"> 
                
                {/* ICON & LABEL */}
                <span className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap shrink-0">
                   {item.icon}
                   {item.label}
                </span>

                {/* VALUE */}
                <span className="text-3xl font-bold text-gray-900 ml-3">
                   {item.value}
                </span>

                {/* PERSENTASE */}
                <div className={cn(
                  "flex items-center text-xs font-semibold self-center ml-2", 
                  item.change === 0 ? "text-gray-400" :
                  (item.isPositive ? "text-green-600" : "text-red-600")
                )}>
                  {item.change !== 0 && (
                      item.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {item.change === 0 ? <Minus className="w-3 h-3 mr-1" /> : `${Math.abs(item.change)}%`}
                </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  XCircle, 
  Globe,
  Database,
  ClipboardClock,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lead } from '@/lib/types'; 

interface MetricsStripProps {
  leads: Lead[] | undefined; 
}

export default function MetricsStrip({ leads = [] }: MetricsStripProps) { 
  
  // --- 1. STATE USER ---
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    const rawData = localStorage.getItem("user");
    if (rawData) {
      try {
        setCurrentUser(JSON.parse(rawData));
      } catch (e) {
        console.error("Gagal parse user", e);
      }
    }
  }, []);

  // --- 2. LOGIKA HITUNG (REVISI FINAL: CONVERSION RATE BASE) ---
  const stats = useMemo(() => {
    
    // Safety Check
    if (!currentUser || !leads || !Array.isArray(leads)) {
        return { 
          visibleWon: 0, 
          visibleLost: 0, 
          openDealsCount: 0, 
          grandTotal: 0,
          winRate: 0, 
          lostRate: 0, 
          openRate: 0, 
          completionRate: 0
        };
    }

    // A. FILTER ROLE (Ambil data milik user ini saja)
    const myAllLeads = leads.filter((lead) => {
        if (currentUser.role === "ADMIN") return true;
        if (currentUser.role === "SALES") {
             const assignedUsers = (lead as any).assignedUsers || [];
             return assignedUsers.some((u: any) => String(u.id) === String(currentUser.id));
        }
        return false;
    });

    // --- HITUNG VALUE ---

    // 1. GRAND TOTAL
    const grandTotal = myAllLeads.length;

    // Filter leads yang aktif (tidak di-archive) untuk tampilan dashboard
    const visibleLeads = myAllLeads.filter(l => !l.isArchived);

    // 2. STATUS COUNTS
    const visibleWon = visibleLeads.filter(l => l.status === "WON").length;
    const visibleLost = visibleLeads.filter(l => l.status === "LOST").length;
    // Open Deals = Bukan Won & Bukan Lost
    const openDealsCount = visibleLeads.filter(l => l.status !== 'WON' && l.status !== 'LOST').length;

    const totalFinished = visibleWon + visibleLost; // Total yang sudah kelar

    // --- HITUNG PERSENTASE (DENOMINATOR: GRAND TOTAL) ---
    // Agar totalnya menjadi 100% (Won% + Lost% + Open% = 100%)

    // A. Win Rate (Conversion Rate)
    const winRate = grandTotal > 0 
      ? Math.round((visibleWon / grandTotal) * 100) 
      : 0;

    // B. Loss Rate
    const lostRate = grandTotal > 0 
      ? Math.round((visibleLost / grandTotal) * 100) 
      : 0;

    // C. Open Rate (Sisa Pekerjaan)
    const openRate = grandTotal > 0 
      ? Math.round((openDealsCount / grandTotal) * 100) 
      : 0;

    // D. Completion Rate (Seberapa banyak yang sudah diproses)
    const completionRate = grandTotal > 0
      ? Math.round((totalFinished / grandTotal) * 100)
      : 0;

    return { 
      visibleWon, 
      visibleLost, 
      openDealsCount, 
      grandTotal,
      winRate, 
      lostRate, 
      openRate, 
      completionRate
    };

  }, [leads, currentUser]);

  // --- 3. CONFIG TAMPILAN ---
  const items = [
    {
      label: 'Total Won',
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: stats.visibleWon,
      change: `${stats.winRate}%`, 
      subLabel: "Win Rate", // Label diperjelas
      isPositive: true, 
      status: 'success'
    },
    {
      label: 'Total Lost',
      icon: <XCircle className="w-4 h-4" />,
      value: stats.visibleLost,
      change: `${stats.lostRate}%`, 
      subLabel: "Loss Rate",
      isPositive: false,
      status: 'danger'
    },
    {
      label: 'WIP Leads', // Nama baru yang lebih profesional
      icon: <Globe className="w-4 h-4" />,
      value: stats.openDealsCount, // Angka: 3
      change: `${stats.openRate}%`, // Persen: 33%
      subLabel: "In Progress",
      isPositive: true,
      status: 'neutral'
    },
    {
      label: 'Total Leads', 
      icon: <Database className="w-4 h-4" />, 
      value: stats.grandTotal, // Angka: 9
      change: `${stats.completionRate}%`, // Persen: 67%
      subLabel: "Completed",
      isPositive: true, 
      status: 'info'
    },
  ];

  // --- 4. RENDER UI ---
  return (
    <div className="bg-gray-100/50 border border-gray-200 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        
        {items.map((item, index) => {
            
            // Logic Warna & Icon Status
            let colorClass = "text-gray-500"; 
            let IconComp = Minus;

            if (item.status === 'success') {
                colorClass = "text-green-600";
                IconComp = TrendingUp; 
            } else if (item.status === 'danger') {
                colorClass = "text-red-600";
                IconComp = TrendingDown; 
            } else if (item.status === 'neutral') {
                colorClass = "text-blue-600";
                IconComp = ClipboardClock; // Icon Refresh/Cycle untuk proses
            } else { // Info / Total
                 colorClass = "text-gray-600";
                 IconComp = ClipboardCheck; 
            }

            return (
              <div key={index} className="px-4 py-3 flex items-center">
                
                <div className="flex w-full items-center justify-center"> 
                    
                    <span className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap shrink-0">
                      {item.icon}
                      {item.label}
                    </span>

                    <span className="text-3xl font-bold text-gray-900 ml-3">
                      {item.value}
                    </span>

                    <div className="flex flex-col ml-3 items-start">
                        <div className={cn(
                        "flex items-center text-xs font-bold", 
                        colorClass
                        )}>
                            <IconComp className="w-3 h-3 mr-1" />
                            {item.change}
                        </div>
                        {/* Sub Label untuk konteks */}
                        <span className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
                            {item.subLabel}
                        </span>
                    </div>

                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
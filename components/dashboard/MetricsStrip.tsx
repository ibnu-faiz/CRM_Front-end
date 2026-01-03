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

// 1. UPDATE INTERFACE PROPS
interface MetricsStripProps {
  leads: Lead[] | undefined; 
  month: number;
  year: number;
  isAllTime: boolean;
}

export default function MetricsStrip({ leads = [], month, year, isAllTime }: MetricsStripProps) { 
  
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

  // 2. LOGIKA HITUNG (DITAMBAH FILTER TANGGAL)
  const stats = useMemo(() => {
    
    // Safety Check
    if (!currentUser || !leads || !Array.isArray(leads)) {
        return { 
          visibleWon: 0, visibleLost: 0, openDealsCount: 0, grandTotal: 0,
          winRate: 0, lostRate: 0, openRate: 0, completionRate: 0
        };
    }

    // FILTER 1: FILTER ROLE & FILTER TANGGAL SEKALIGUS
    const filteredLeads = leads.filter((lead) => {
        // A. Filter Role
        let isRoleMatch = false;
        if (currentUser.role === "ADMIN") {
            isRoleMatch = true;
        } else if (currentUser.role === "SALES") {
             const assignedUsers = (lead as any).assignedUsers || [];
             isRoleMatch = assignedUsers.some((u: any) => String(u.id) === String(currentUser.id));
        }

        if (!isRoleMatch) return false;

        // B. Filter Tanggal (Time)
        // Jika All Time -> Lolos
        if (isAllTime) return true;

        // Jika Filter Bulan -> Cek createdAt
        const leadDate = new Date(lead.createdAt); // Pastikan lead punya field createdAt
        return leadDate.getMonth() === month && leadDate.getFullYear() === year;
    });

    // --- HITUNG VALUE BERDASARKAN HASIL FILTER ---

    // 1. GRAND TOTAL (Sesuai Filter Waktu)
    const grandTotal = filteredLeads.length;

    // Filter leads yang aktif (tidak di-archive)
    const visibleLeads = filteredLeads.filter(l => !l.isArchived);

    // 2. STATUS COUNTS
    const visibleWon = visibleLeads.filter(l => l.status === "WON").length;
    const visibleLost = visibleLeads.filter(l => l.status === "LOST").length;
    // Open Deals = Bukan Won & Bukan Lost
    const openDealsCount = visibleLeads.filter(l => l.status !== 'WON' && l.status !== 'LOST').length;

    const totalFinished = visibleWon + visibleLost; 

    // --- HITUNG PERSENTASE ---
    const winRate = grandTotal > 0 ? Math.round((visibleWon / grandTotal) * 100) : 0;
    const lostRate = grandTotal > 0 ? Math.round((visibleLost / grandTotal) * 100) : 0;
    const openRate = grandTotal > 0 ? Math.round((openDealsCount / grandTotal) * 100) : 0;
    const completionRate = grandTotal > 0 ? Math.round((totalFinished / grandTotal) * 100) : 0;

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

  }, [leads, currentUser, month, year, isAllTime]); // Dependency Array Updated

  // --- 3. CONFIG TAMPILAN ---
  const items = [
    {
      label: 'Total Won',
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: stats.visibleWon,
      change: `${stats.winRate}%`, 
      subLabel: "Win Rate",
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
      label: 'WIP Leads',
      icon: <Globe className="w-4 h-4" />,
      value: stats.openDealsCount,
      change: `${stats.openRate}%`,
      subLabel: "In Progress",
      isPositive: true,
      status: 'neutral'
    },
    {
      label: 'Total Leads', 
      icon: <Database className="w-4 h-4" />, 
      value: stats.grandTotal,
      change: `${stats.completionRate}%`,
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
            let colorClass = "text-gray-500"; 
            let IconComp = Minus;

            if (item.status === 'success') {
                colorClass = "text-green-600"; IconComp = TrendingUp; 
            } else if (item.status === 'danger') {
                colorClass = "text-red-600"; IconComp = TrendingDown; 
            } else if (item.status === 'neutral') {
                colorClass = "text-blue-600"; IconComp = ClipboardClock;
            } else { 
                 colorClass = "text-gray-600"; IconComp = ClipboardCheck; 
            }

            return (
              <div key={index} className="px-4 py-3 flex items-center">
                <div className="flex w-full items-center justify-center"> 
                    <span className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap shrink-0">
                      {item.icon} {item.label}
                    </span>
                    <span className="text-3xl font-bold text-gray-900 ml-3">
                      {item.value}
                    </span>
                    <div className="flex flex-col ml-3 items-start">
                        <div className={cn("flex items-center text-xs font-bold", colorClass)}>
                            <IconComp className="w-3 h-3 mr-1" />
                            {item.change}
                        </div>
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
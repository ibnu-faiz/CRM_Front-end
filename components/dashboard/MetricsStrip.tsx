"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Database 
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

  // --- 2. LOGIKA HITUNG (SESUAI REQUEST TERAKHIR) ---
  const stats = useMemo(() => {
    
    // Safety Check
    if (!currentUser || !leads || !Array.isArray(leads)) {
        return { 
          visibleWon: 0, 
          visibleLost: 0, 
          activeLeadsCount: 0, 
          grandTotal: 0,
          winRate: 0, 
          lostRate: 0, 
          inProgressRatio: 0, 
          archiveRatio: 0
        };
    }

    // A. FILTER ROLE (Langkah Pertama: Ambil jatah data user)
    const myAllLeads = leads.filter((lead) => {
        if (currentUser.role === "ADMIN") return true;
        if (currentUser.role === "SALES") {
             const assignedUsers = (lead as any).assignedUsers || [];
             return assignedUsers.some((u: any) => String(u.id) === String(currentUser.id));
        }
        return false;
    });

    // --- HITUNG VALUE UTAMA ---

    // 1. TOTAL LEADS (Kartu 4): Semua data (Archive + Non-Archive)
    const grandTotal = myAllLeads.length;

    // 2. ACTIVE LEADS (Kartu 3): Semua data KECUALI Archive
    // (Termasuk Won/Lost yang belum di-archive)
    const visibleLeads = myAllLeads.filter(l => !l.isArchived);
    const activeLeadsCount = visibleLeads.length;

    // 3. TOTAL WON (Kartu 1): Status WON & TIDAK Archive
    const visibleWon = visibleLeads.filter(l => l.status === "WON").length;

    // 4. TOTAL LOST (Kartu 2): Status LOST & TIDAK Archive
    const visibleLost = visibleLeads.filter(l => l.status === "LOST").length;


    // --- HITUNG PERSENTASE (INDIKATOR) ---

    // A. Win Rate & Loss Rate (Dari data yang TAMPIL saja)
    // Rumus: Won / (Won + Lost) -> Hanya menghitung deal yang selesai dan belum di-archive
    const visibleFinished = visibleWon + visibleLost; 

    const winRate = visibleFinished > 0 
      ? Math.round((visibleWon / visibleFinished) * 100) 
      : 0;

    const lostRate = visibleFinished > 0 
      ? Math.round((visibleLost / visibleFinished) * 100) 
      : 0;

    // B. In Progress Ratio (Untuk Active Leads)
    // Berapa persen dari "Active Leads" yang statusnya masih jalan (Bukan Won/Lost)?
    const inProgressCount = visibleLeads.filter(l => l.status !== 'WON' && l.status !== 'LOST').length;
    
    const inProgressRatio = activeLeadsCount > 0 
      ? Math.round((inProgressCount / activeLeadsCount) * 100) 
      : 0;

    // C. Archive Ratio (Untuk Total Leads)
    // Berapa persen dari "Total Leads" yang statusnya Archive?
    const archiveCount = myAllLeads.filter(l => l.isArchived).length;
    
    const archiveRatio = grandTotal > 0
      ? Math.round((archiveCount / grandTotal) * 100)
      : 0;

    return { 
      visibleWon, 
      visibleLost, 
      activeLeadsCount, 
      grandTotal,
      winRate, 
      lostRate, 
      inProgressRatio, 
      archiveRatio
    };

  }, [leads, currentUser]);

  // --- 3. CONFIG TAMPILAN ---
  const items = [
    {
      label: 'Total Won',
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: stats.visibleWon,
      change: `${stats.winRate}%`, // Win Rate (dari data visible)
      isPositive: true, 
      status: 'success'
    },
    {
      label: 'Total Lost',
      icon: <XCircle className="w-4 h-4" />,
      value: stats.visibleLost,
      change: `${stats.lostRate}%`, // Loss Rate (dari data visible)
      isPositive: false,
      status: 'danger'
    },
    {
      label: 'Active Leads', // Semua yang tidak di-archive
      icon: <Globe className="w-4 h-4" />,
      value: stats.activeLeadsCount, 
      change: `${stats.inProgressRatio}%`, // % yang statusnya masih jalan (bukan won/lost)
      isPositive: true,
      status: 'neutral'
    },
    {
      label: 'Total Leads', // Grand Total (Archive + Non-Archive)
      icon: <Database className="w-4 h-4" />, 
      value: stats.grandTotal, 
      change: `${stats.archiveRatio}%`, // % yang di-archive
      isPositive: false, // Netral/Info
      status: 'info'
    },
  ];

  // --- 4. RENDER UI ---
  return (
    <div className="bg-gray-100/50 border border-gray-200 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        
        {items.map((item, index) => {
            
            // Logic Warna & Icon
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
                IconComp = TrendingUp; // Progress naik
            } else {
                 colorClass = "text-gray-500";
                 IconComp = Database; // Icon Database untuk total
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

                    <div className={cn(
                      "flex items-center text-xs font-semibold self-center ml-2", 
                      colorClass
                    )}>
                      <IconComp className="w-3 h-3 mr-1" />
                      {item.change}
                    </div>

                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
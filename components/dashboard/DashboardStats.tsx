"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import StatsCard from "@/components/dashboard/StatsCard";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { Wallet, Loader2, CreditCard, Signal } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { Lead } from "@/lib/types";

// 1. Tambah prop 'stripIsAllTime' di interface
interface DashboardStatsProps {
  month: number;
  year: number;
  isAllTime: boolean;      // Untuk 3 Kartu Atas (Financial)
  stripIsAllTime: boolean; // Untuk Metrics Strip Bawah (Operational)
}

interface StatItem {
  value: number;
  change: number;
  isPositive: boolean;
}

interface DashboardData {
  pipelineValue: StatItem;
  activeDeals: StatItem;
  avgDeal: StatItem;
  metrics?: any; 
}

interface LeadsApiResponse {
  leads: Lead[];
  total: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 2. Destructure prop baru
export default function DashboardStats({ month, year, isAllTime, stripIsAllTime }: DashboardStatsProps) {
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { data: leadsData, isLoading: isLeadsLoading } = useSWR<LeadsApiResponse>(
    `${API_URL}/leads`, 
    fetcher
  );

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Logika fetch stats card TETAP menggunakan 'isAllTime' (Default: Bulan Ini)
        const queryParams = isAllTime 
            ? `?range=all` 
            : `?month=${month}&year=${year}`;

        const res = await fetch(`${API_URL}/dashboard/stats${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed');
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error('Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [month, year, isAllTime]); 

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if ((loading || isLeadsLoading) && !data) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 3 Kartu Atas: Menggunakan data dari API yang dipengaruhi 'isAllTime' (Financial View) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatsCard
          title="Total Opportunity Value"
          value={formatRupiah(data?.pipelineValue.value || 0)}
          change={`${data?.pipelineValue.change}%`}
          isPositive={data?.pipelineValue.isPositive || false}
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatsCard
          title="Total Opportunities"
          value={data?.activeDeals.value.toString() || "0"}
          change={`${data?.activeDeals.change}%`}
          isPositive={data?.activeDeals.isPositive || false}
          icon={<CreditCard className="w-4 h-4" />}
        />
        <StatsCard
          title="Avg. Deal Size"
          value={formatRupiah(data?.avgDeal.value || 0)}
          change={`${data?.avgDeal.change}%`}
          isPositive={data?.avgDeal.isPositive || false}
          icon={<Signal className="w-4 h-4" />}
        />
      </div>
      
      {/* 3. Metrics Strip Bawah:
         Menggunakan 'stripIsAllTime' (Operational View).
         - Saat Reset: stripIsAllTime = TRUE (Semua leads terbaca).
         - Saat Filter Nov: stripIsAllTime = FALSE (Hanya leads Nov).
      */}
      <MetricsStrip 
        leads={leadsData?.leads || []} 
        month={month}
        year={year}
        isAllTime={stripIsAllTime} 
      />
    </div>
  );
}
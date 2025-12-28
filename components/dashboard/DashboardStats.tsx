'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard'; 
import MetricCard from '@/components/dashboard/MetricCard'; // <--- IMPORT INI
import { Wallet, TrendingUp, Target, Loader2, Trophy, Users, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

// 1. UPDATE INTERFACE SESUAI BACKEND BARU
interface StatItem {
  value: number;
  change: number;
  isPositive: boolean;
}

interface DashboardData {
  // Bagian Atas
  pipelineValue: StatItem;
  activeDeals: StatItem;
  avgDeal: StatItem;
  
  // Bagian Bawah (Metrics Row)
  metrics: {
    totalWon: StatItem;
    totalLost: StatItem;
    totalLeads: StatItem;
    conversionRate: StatItem;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data (Sama seperti sebelumnya)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Default range = month (sesuai backend)
        const res = await fetch(`${API_URL}/dashboard/stats?range=month`, {
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

    fetchStats();
  }, []);

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: MAIN STATS (Kartu Besar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Pipeline Value"
          value={formatRupiah(data?.pipelineValue.value || 0)}
          change={`${data?.pipelineValue.change}%`}
          isPositive={data?.pipelineValue.isPositive || false}
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatsCard
          title="Active Deals"
          value={data?.activeDeals.value.toString() || "0"}
          change={`${data?.activeDeals.change}%`}
          isPositive={data?.activeDeals.isPositive || false}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatsCard
          title="Average Deals"
          value={formatRupiah(data?.avgDeal.value || 0)}
          change={`${data?.avgDeal.change}%`}
          isPositive={data?.avgDeal.isPositive || false}
          icon={<Target className="w-4 h-4" />}
        />
      </div>

      {/* SECTION 2: METRICS ROW (Kartu Kecil) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Won */}
        <MetricCard 
          label="Total Won"
          value={data?.metrics.totalWon.value || 0}
          change={`${data?.metrics.totalWon.change}%`}
          isPositive={true} 
          icon={<Trophy className="w-5 h-5 text-yellow-600" />}
        />
        
        {/* Total Lost */}
        <MetricCard 
          label="Total Lost"
          value={data?.metrics.totalLost.value || 0}
          change={`${data?.metrics.totalLost.change}%`}
          isPositive={false} // Merah kalau naik
          icon={<Target className="w-5 h-5 text-red-600" />}
        />

        {/* Total Leads (Volume) */}
        <MetricCard 
          label="Total Leads"
          value={data?.metrics.totalLeads.value || 0}
          change={`${data?.metrics.totalLeads.change}%`}
          isPositive={true}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />

        {/* Win Rate (Conversion) */}
        <MetricCard 
          label="Win Rate"
          value={`${data?.metrics.conversionRate.value}%`} // Pakai Persen
          change={`${data?.metrics.conversionRate.change}%`}
          isPositive={true}
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
        />
      </div>

    </div>
  );
}
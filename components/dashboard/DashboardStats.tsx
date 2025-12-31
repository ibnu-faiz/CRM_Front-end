'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr'; 
import StatsCard from '@/components/dashboard/StatsCard'; 
import MetricsStrip from '@/components/dashboard/MetricsStrip'; 
import { Wallet, TrendingUp, Target, Loader2, Trophy, Users, UserCheck, CreditCard, Signal } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher } from '@/lib/fetcher'; 
import { Lead } from '@/lib/types'; 

// --- TYPE DEFINITIONS ---

interface StatItem {
  value: number;
  change: number;
  isPositive: boolean;
}

interface DashboardData {
  pipelineValue: StatItem;
  activeDeals: StatItem;
  avgDeal: StatItem;
}

// ✅ TAMBAHAN 1: Interface untuk respon API Leads (Sesuai Log CCTV tadi)
interface LeadsApiResponse {
  leads: Lead[];
  total: number;
}

// ✅ TAMBAHAN 2: Interface User (agar MetricsStrip bisa filter)
interface User {
    id: string;
    role: string;
    name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardStats() {
  // A. State untuk Data Stats (Top Cards)
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ TAMBAHAN 3: State User untuk dikirim ke MetricsStrip
  const [currentUser, setCurrentUser] = useState<User | any>(null);

  // B. Ambil Data Leads Mentah 
  // ✅ PERBAIKAN: Gunakan interface LeadsApiResponse (bukan Lead[])
  const { data: leadsData, isLoading: isLeadsLoading } = useSWR<LeadsApiResponse>(
    `${API_URL}/leads`, 
    fetcher
  );

  // C. Fetch Data Stats & Get User
  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. Ambil User dari LocalStorage (untuk keperluan Filter MetricsStrip)
        // Sesuaikan key-nya dengan sistem login Anda (misal: 'user' atau 'currentUser')
        const storedUser = localStorage.getItem('user'); 
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Gagal parse user", e);
            }
        }

        // 2. Fetch Dashboard Stats
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

    initData();
  }, []);

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Loading State
  if (loading && !data) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      
      {/* SECTION 1: MAIN STATS (Kartu Besar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          icon={<CreditCard className="w-4 h-4" />}
        />
        <StatsCard
          title="Average Deals"
          value={formatRupiah(data?.avgDeal.value || 0)}
          change={`${data?.avgDeal.change}%`}
          isPositive={data?.avgDeal.isPositive || false}
          icon={<Signal className="w-4 h-4" />}
        />
      </div>

      {/* SECTION 2: METRICS STRIP */}
      {/* ✅ PERBAIKAN KRUSIAL DI SINI: */}
      <MetricsStrip 
       
         leads={leadsData?.leads || []} 
         
       
      />

    </div>
  );
}
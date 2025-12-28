// app/(main)/dashboard/page.tsx

import LeadsChart from '@/components/dashboard/LeadsChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ActivityList from '@/components/dashboard/ActivityList';
import RecentDeals from '@/components/dashboard/RecentDeals';
import PipelineOverview from '@/components/dashboard/PipelineOverview';
import LeadSourceChart from '@/components/dashboard/LeadSourceChart';
import QuarterSummary from '@/components/dashboard/QuarterSummary';
import { Button } from '@/components/ui/button';
import { Filter, Wallet, TrendingUp, Trophy, Target, Users, UserCheck } from 'lucide-react';

import DashboardStats from '@/components/dashboard/DashboardStats';


export default function DashboardPage() {
  return (
    <div className="p-6 space-y-3 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Showing data from current month</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Main Stats Cards */}
      <DashboardStats />


     {/* 3. Main Content Grid (Layout Dua Menara) */}
      {/* Grid Utama: 3 Kolom. Kiri ambil 2 bagian, Kanan ambil 1 bagian */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        
        {/* === MENARA KIRI (Sekarang ambil 3 dari 5 bagian = 60%) === */}
        <div className="lg:col-span-3 space-y-3">
          
          <LeadsChart />
          <RevenueChart />

          {/* Bagian bawah kiri tetap dibagi 2 kalau layar sangat lebar (xl) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
             <RecentDeals />
             <PipelineOverview />
          </div>

        </div>

        {/* === MENARA KANAN (Sekarang otomatis dapat 2 bagian sisa = 40%) === */}
        {/* Lebih lega untuk Activity List & Pie Chart */}
        <div className="lg:col-span-2 space-y-3">
          
          <ActivityList />
          <LeadSourceChart />
          <QuarterSummary />

        </div>

      </div>
    </div>
  );
}
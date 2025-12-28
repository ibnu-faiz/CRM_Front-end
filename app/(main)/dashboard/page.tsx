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
    <div className="p-6 space-y-6 transition-all duration-300 ease-in-out">
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

      {/* Metrics Row */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Trophy className="w-5 h-5" />}
          label="Total Won"
          value="300"
          change="+10%"
          isPositive={true}
        />
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          label="Total Lost"
          value="20"
          change="-3%"
          isPositive={false}
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Total Leads"
          value="450"
          change="+5%"
          isPositive={true}
        />
        <MetricCard
          icon={<UserCheck className="w-5 h-5" />}
          label="Active Leads"
          value="230"
          change="+3%"
          isPositive={true}
        />
      </div> */}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsChart />
        <ActivityList />
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <LeadSourceChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentDeals />
        <PipelineOverview />
        <QuarterSummary />
      </div>
    </div>
  );
}
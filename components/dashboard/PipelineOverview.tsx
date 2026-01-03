'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Kanban } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PipelineGroup {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

// 1. Update Props
interface PipelineOverviewProps {
  month: number;
  year: number;
  isAllTime: boolean; // <--- Tambah ini
}

export default function PipelineOverview({ month, year, isAllTime }: PipelineOverviewProps) {
  const [groups, setGroups] = useState<PipelineGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // 2. Logic URL Pintar
        const queryParams = isAllTime 
            ? `?range=all` 
            : `?month=${month}&year=${year}`;

        const res = await fetch(`${API_URL}/dashboard/pipeline-stats${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed');
        const rawData = await res.json();
        
        const stats: Record<string, number> = {};
        let totalAll = 0;
        
        rawData.forEach((item: any) => {
          const count = item.count !== undefined ? item.count : (item._count?.id || 0);
          stats[item.status] = count;
          totalAll += count;
        });

        const countQualification = (stats['LEAD_IN'] || 0) + (stats['CONTACT_MADE'] || 0) + (stats['NEED_IDENTIFIED'] || 0);
        const countProposal = (stats['PROPOSAL_MADE'] || 0);
        const countNegotiation = (stats['NEGOTIATION'] || 0);
        const countClosing = (stats['CONTRACT_SEND'] || 0);
        const countCompleted = (stats['WON'] || 0) + (stats['LOST'] || 0);

        const result = [
            { label: 'Qualification', count: countQualification, color: 'bg-blue-500' },
            { label: 'Proposal', count: countProposal, color: 'bg-indigo-500' },
            { label: 'Negotiation', count: countNegotiation, color: 'bg-purple-500' },
            { label: 'Contract Sent', count: countClosing, color: 'bg-orange-500' },
            { label: 'Completed', count: countCompleted, color: 'bg-emerald-500' },
        ];

        const finalData = result.map(item => ({
            ...item,
            percentage: totalAll > 0 ? (item.count / totalAll) * 100 : 0
        }));

        setGroups(finalData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [month, year, isAllTime]); // 3. Dependency update

  const isDataEmpty = !loading && groups.every(g => g.count === 0);

  return (
    <Card className="h-full bg-white hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-bold text-gray-800">Pipeline Overview</CardTitle>
        <p className="text-sm text-gray-500">
            {isAllTime ? "All time deals distribution" : "Distribution in selected period"}
        </p>
      </CardHeader>
      
      <CardContent className="px-3 pb-3 pt-0 flex-1 flex flex-col space-y-4">
        {loading ? (
           <div className="flex-1 flex items-center justify-center text-gray-400">
             <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
           </div>
        ) : isDataEmpty ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 py-8">
             <Kanban className="w-12 h-12 mb-3 opacity-20" />
             <p className="font-medium text-gray-500">Pipeline is empty</p>
             <p className="text-xs text-gray-400 mt-1 max-w-[200px] text-center">No deals found</p>
           </div>
        ) : (
          <div className="space-y-3 flex-1">
            {groups.map((group, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{group.label}</span>
                  <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                    {group.count} deals ({Math.round(group.percentage)}%)
                  </span>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-500 ease-in-out", group.color)} style={{ width: `${group.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-auto" asChild>
           <Link href="/leads">View Pipeline Board</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
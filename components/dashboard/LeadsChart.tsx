'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, FolderOpen } from 'lucide-react'; // Tambah icon FolderOpen

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ChartData {
  name: string;
  total: number;
}

export default function LeadsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_URL}/dashboard/leads-chart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch chart data');
        
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIKA CEK KOSONG ---
  // Cek apakah semua bulannya nol? (Total semua leads = 0)
  const isDataEmpty = !loading && data.every(item => item.total === 0);

  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-bold text-gray-800">Total Leads by Months</CardTitle>
        <p className="text-sm text-gray-500">Performance for current year</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading chart...
          </div>
        ) : isDataEmpty ? (
          // --- TAMPILAN KOSONG (EMPTY STATE) ---
          <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
            <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium text-gray-500">No data available yet</p>
            <p className="text-xs text-gray-400 mt-1">Start adding leads to see the chart</p>
          </div>
        ) : (
          // --- TAMPILAN CHART (NORMAL) ---
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar 
                  dataKey="total" 
                  fill="#111827" 
                  radius={[4, 4, 0, 0]} // Radius atas saja biar rapi
                  barSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
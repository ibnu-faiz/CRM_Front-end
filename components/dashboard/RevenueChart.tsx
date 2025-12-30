'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loader2, Wallet } from 'lucide-react'; // Tambah icon Wallet

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RevenueData {
  month: string;
  estimation: number;
  realisation: number;
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard/revenue-chart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed');
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

  // 2. Logic Cek Kosong (Tameng)
  // Backend Mas selalu kirim 12 bulan (Jan-Dec), jadi array tidak pernah kosong [].
  // Kita harus cek apakah ISI angkanya nol semua?
  const isDataEmpty = !loading && data.every(
    item => item.estimation === 0 && item.realisation === 0
  );

  // 3. Formatter Uang
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-bold text-gray-800">Estimation Revenue</CardTitle>
        <p className="text-sm text-gray-500">Realisation vs Potential (Estimation)</p>
      </CardHeader>
      <CardContent>
        
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-gray-400">
             <Loader2 className="w-6 h-6 animate-spin mr-2" />
             Loading revenue...
          </div>
        ) : isDataEmpty ? (
          // --- TAMPILAN KOSONG (EMPTY STATE) ---
          <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
            <Wallet className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium text-gray-500">No revenue data yet</p>
            <p className="text-xs text-gray-400 mt-1">Close deals to see revenue insights</p>
          </div>
        ) : (
          // --- TAMPILAN CHART (NORMAL) ---
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEstimation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1f2937" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1f2937" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRealisation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                
                <Tooltip
                  formatter={(value: number) => [formatTooltip(value)]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }} 
                  iconType="circle" 
                />

                <Area
                  type="monotone"
                  dataKey="estimation"
                  stroke="#1f2937"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEstimation)"
                  name="Estimation (Potential)"
                />

                <Area
                  type="monotone"
                  dataKey="realisation"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRealisation)"
                  name="Realisation (Won)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader2, HelpCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SourceData {
  name: string;
  value: number;
  [key: string]: any;
}

const COLORS = [
  '#1f2937', '#4b5563', '#9ca3af', '#2563eb', '#10b981', '#f59e0b', 
];

export default function LeadSourceChart() {
  const [data, setData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard/leads-source`, {
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

  const isDataEmpty = !loading && data.length === 0;

  // --- FUNGSI CUSTOM LABEL (BADGE PERSEN) ---
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    // Hitung posisi label (sedikit di luar lingkaran chart)
    const radius = outerRadius * 1; // Jarak label dari pusat (1.35x jari-jari luar)
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      // foreignObject memungkinkan kita pakai HTML/Tailwind di dalam SVG Recharts
      <foreignObject x={x - 20} y={y - 12} width={40} height={24}>
        <div className="flex items-center justify-center w-full h-full bg-white/90 shadow-sm border border-gray-100 rounded-full text-[10px] font-bold text-gray-700 backdrop-blur-[1px]">
          {`${(percent * 100).toFixed(0)}%`}
        </div>
      </foreignObject>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="justify-center">
        <CardTitle className="text-lg font-bold text-center">Lead Source Breakdown</CardTitle>
      </CardHeader>
      
      <CardContent className="justify-center">
        {loading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
           </div>
        ) : isDataEmpty ? (
           <div className="h-[250px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
             <HelpCircle className="w-12 h-12 mb-3 opacity-20" />
             <p className="font-medium text-gray-500">No source data</p>
           </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={40} // Sedikit dikecilkan biar proporsional
                  outerRadius={80} // Dikecilkan agar label muat di dalam kotak
                  paddingAngle={1}
                  dataKey="value"
                  label={renderCustomizedLabel} // <--- PASANG LABEL DISINI
                  labelLine={false} // Hilangkan garis
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => [`${value} Leads`, 'Count']}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
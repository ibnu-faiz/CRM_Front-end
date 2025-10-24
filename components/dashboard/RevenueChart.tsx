// src/components/dashboard/RevenueChart.tsx
'use client';

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

const data = [
  { month: 'Jan', estimation: 300, realisation: 250 },
  { month: 'Feb', estimation: 350, realisation: 300 },
  { month: 'March', estimation: 400, realisation: 380 },
  { month: 'May', estimation: 380, realisation: 350 },
  { month: 'June', estimation: 420, realisation: 400 },
  { month: 'July', estimation: 380, realisation: 360 },
  { month: 'August', estimation: 450, realisation: 420 },
  { month: 'Sept', estimation: 400, realisation: 380 },
  { month: 'Oct', estimation: 480, realisation: 450 },
  { month: 'Nov', estimation: 420, realisation: 400 },
  { month: 'Dec', estimation: 460, realisation: 440 },
];

export default function RevenueChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Estimation Revenue by Months</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEstimation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRealisation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
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
              name="Estimation"
            />
            <Area
              type="monotone"
              dataKey="realisation"
              stroke="#6b7280"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRealisation)"
              name="Realisation"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
// components/dashboard/LeadSourceChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Website', value: 25, color: '#9ca3af' },
  { name: 'Ads / Campaign', value: 12, color: '#6b7280' },
  { name: 'Referral', value: 29, color: '#4b5563' },
  { name: 'Event / Offline', value: 17, color: '#374151' },
  { name: 'Social Media', value: 17, color: '#1f2937' },
];

export default function LeadSourceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead Source Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
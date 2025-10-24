// components/dashboard/QuarterSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, TrendingUp } from 'lucide-react';

const summaryItems = [
  {
    icon: CheckCircle2,
    label: 'Total Deal',
    value: 'RP 10.000.000',
  },
  {
    icon: FileText,
    label: 'Average Size',
    value: 'RP 10.000.000',
  },
  {
    icon: TrendingUp,
    label: 'Revenue',
    value: 'RP 10.000.000',
  },
];

export default function QuarterSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quarter Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                View →
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
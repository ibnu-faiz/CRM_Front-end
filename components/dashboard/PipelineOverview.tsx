// components/dashboard/PipelineOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const stages = [
  { name: 'Qualified', deals: 2, percentage: 13 },
  { name: 'Demo Scheduled', deals: 2, percentage: 13 },
  { name: 'Negotiations Started', deals: 2, percentage: 13 },
  { name: 'Contract Sent', deals: 2, percentage: 13 },
  { name: 'Closing', deals: 2, percentage: 13 },
];

export default function PipelineOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pipeline Overview</CardTitle>
        <p className="text-sm text-gray-500">Distribution deals across stages</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{stage.name}</span>
              <span className="text-sm text-gray-500">{stage.deals} deals ({stage.percentage}%)</span>
            </div>
            <Progress value={stage.percentage * 7} className="h-2" />
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4">
          View All
        </Button>
      </CardContent>
    </Card>
  );
}
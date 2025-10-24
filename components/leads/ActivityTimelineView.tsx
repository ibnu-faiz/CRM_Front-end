'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Calendar } from 'lucide-react';
import AddActivityTimelineModal from './AddActivityTimelineModal';

interface ActivityTimelineViewProps {
  leadId: string;
}

interface Activity {
  id: number;
  type: string;
  icon: any;
  title: string;
  date: string;
  user: string;
  description: string;
}

export default function ActivityTimelineView({ leadId }: ActivityTimelineViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      type: 'call',
      icon: Phone,
      title: '[Sample] Final contact attempt',
      date: '7/11/2025, 7:21:57 PM Mahendra Dwi Purwanto',
      user: 'Gloria Quinn',
      description: 'Called to discuss the proposal details and next steps',
    },
    {
      id: 2,
      type: 'meeting',
      icon: Calendar,
      title: 'Meeting notes',
      date: '7/11/2025, 7:21:57 PM Mahendra Dwi Purwanto',
      user: 'Gloria Quinn',
      description: 'Called to discuss the proposal details and next steps',
    },
  ]);

  const handleAddActivity = (newActivity: Activity) => {
    setActivities((prev) => [...prev, newActivity]);
  };

  return (
    <div className="space-y-4">
      {/* Add Activity Button */}
      {/* <div className="flex justify-end">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 gap-2"
        >
          + Add Activity
        </Button>
      </div> */}

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{activity.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{activity.date}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gray-900 text-white text-xs">
                          {activity.user
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{activity.user}</span>
                    </div>
                    <p className="text-sm text-gray-700">{activity.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <AddActivityTimelineModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={handleAddActivity}
      />
    </div>
  );
}

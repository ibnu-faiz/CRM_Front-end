// src/components/dashboard/ActivityList.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, Eye } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { id: 'meeting', label: 'Meeting' },
  { id: 'call', label: 'Call' },
  { id: 'email', label: 'E-mail' },
  { id: 'invoice', label: 'Invoice' },
];

const activities = {
  today: [
    {
      id: 1,
      type: 'meeting',
      title: 'Weekly Team Sync',
      time: 'Today at 03:00 - 03:00 PM',
      location: 'Cmlabs Office',
      attendees: 'INC: Dadhvan Okta',
    },
  ],
  upcoming: [
    {
      id: 2,
      type: 'meeting',
      title: 'Client Presentation',
      time: '09:30 - 12:00 PM',
      description: 'You have meeting with Angela A.',
      date: 'Tomorrow',
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Marketing Strategy Session',
      time: '08:00 - 11:00 AM',
      description: 'You have meeting with Amelia AI Saturday,',
      date: '19/11/2025',
    },
    {
      id: 4,
      type: 'meeting',
      title: 'Marketing Strategy Session',
      time: '08:00 - 11:00 AM',
      description: 'You have meeting with Amelia AI Saturday,',
      date: '19/11/2025',
    },
  ],
};

export default function ActivityList() {
  const [activeTab, setActiveTab] = useState('meeting');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Activities</CardTitle>
        <div className="flex gap-2 mt-4">
          {tabs.map((tab) => (
            <Badge
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'secondary'}
              className={`cursor-pointer px-4 py-2 ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today Activities */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Today Activities</h3>
          {activities.today.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-800 text-white rounded-lg p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 bg-white text-gray-900 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                21
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold mb-1">{activity.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{activity.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{activity.attendees}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white flex-shrink-0"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Location
              </Button>
            </div>
          ))}
        </div>

        {/* Upcoming Activities */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Upcoming</h3>
          <div className="space-y-3">
            {activities.upcoming.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0 bg-gray-200">
                  <AvatarFallback className="text-sm font-semibold">
                    {activity.title.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-sm text-gray-600">{activity.date}</p>
                </div>
                <span className="text-sm text-gray-600 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full">
          View All
        </Button>
      </CardContent>
    </Card>
  );
}
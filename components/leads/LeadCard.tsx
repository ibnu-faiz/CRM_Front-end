// components/leads/LeadCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, GripVertical, Eye } from 'lucide-react';

interface Lead {
  id: number;
  title: string;
  company: string;
  value: string;
  priority: string;
  status: string;
  responsible: string;
}

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if dragging
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      return;
    }
    router.push(`/leads/${lead.id}`);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('leadId', lead.id.toString());
    e.dataTransfer.setData('leadTitle', lead.title);
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group" 
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2 flex-1">
            <button 
              data-drag-handle
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{lead.title}</h4>
              <p className="text-xs text-gray-500">{lead.company}</p>
            </div>
          </div>
          <button 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/leads/${lead.id}`);
            }}
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
          <DollarSign className="w-3 h-3" />
          <span>{lead.value}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">7/7/2025</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {lead.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {lead.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Users className="w-3 h-3" />
          <span>{lead.responsible}</span>
        </div>
      </CardContent>
    </Card>
  );
}
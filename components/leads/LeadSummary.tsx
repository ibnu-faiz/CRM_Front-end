// components/leads/LeadSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from "lucide-react";


interface LeadSummaryProps {
  onEdit: () => void;
}

export default function LeadSummary({ onEdit }: LeadSummaryProps) {
  const [detailOpen, setDetailOpen] = useState(true);
  const [sourceOpen, setSourceOpen] = useState(true);
  const [personOpen, setPersonOpen] = useState(true);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Summary</CardTitle>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500">Deal Value</p>
            <p className="font-semibold">IDR 30.000</p>
          </div>
          <div>
            <p className="text-gray-500">Company</p>
            <p className="font-semibold">Company name</p>
          </div>
          <div>
            <p className="text-gray-500">Contact Person</p>
            <p className="font-semibold">Lorem Ipsum Sit Dolor</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">High Priority</Badge>
            <Badge variant="secondary">New Client</Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>7/7/2025</span>
          </div>
        </CardContent>
      </Card>

      {/* Detail Card */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-semibold"
            onClick={() => setDetailOpen(!detailOpen)}
          >
            Detail
            {detailOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>
        {detailOpen && (
          <CardContent className="text-sm space-y-2">
            <p className="text-gray-600">
              Your details section is empty. Add custom fields or drag and drop existing ones to populate it.
            </p>
            <Button variant="link" className="p-0 h-auto text-gray-900">
              Drag and drop fields →
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Source Card */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-semibold"
            onClick={() => setSourceOpen(!sourceOpen)}
          >
            <span className="flex items-center gap-2">
              Source
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </span>
            {sourceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>
        {sourceOpen && (
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Source origin</span>
              <span className="font-semibold">API</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Source channel</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Source channel ID</span>
              <span>-</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Person Card */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-semibold"
            onClick={() => setPersonOpen(!personOpen)}
          >
            Person
            {personOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>
        {personOpen && (
          <CardContent className="text-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">👤</span>
              <span>Lorem Ipsum Sit Dolor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📞</span>
              <span>852-252-9773</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📧</span>
              <span className="truncate">lorem.ipsum@email.com</span>
              <Badge variant="secondary" className="text-xs">MAIN</Badge>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
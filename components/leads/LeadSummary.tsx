'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ChevronDown, ChevronUp, CalendarClock, CalendarPlus, User, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { Lead } from '@/lib/types';

interface LeadSummaryProps {
  lead: Lead;
  onEdit: () => void;
}

export default function LeadSummary({ lead, onEdit }: LeadSummaryProps) {
  const [detailOpen, setDetailOpen] = useState(true);
  const [sourceOpen, setSourceOpen] = useState(true);
  const [personOpen, setPersonOpen] = useState(true);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UK', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getPriorityLabel = (priority: string | null | undefined) => {
    const labels: Record<string, string> = {
      LOW: 'Low Priority',
      MEDIUM: 'Medium Priority',
      HIGH: 'High Priority',
    };
    return priority ? labels[priority] || priority : 'Unknown Priority';
  };

  const getClientTypeLabel = (clientType: string | null) => {
    if (!clientType) return null;
    const labels: Record<string, string> = {
      new: 'New Client',
      existing: 'Existing Client',
    };
    return labels[clientType.toLowerCase()] || clientType;
  };

  return (
    <div className="space-y-3">
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
          {/* Deal Value */}
          <div>
            <p className="font-semibold">Deal Value</p>
            <p className="text-gray-500">
              {lead.currency ?? 'IDR'}{' '}
              {typeof lead.value === 'number'
                ? lead.value.toLocaleString('id-ID')
                : '0'}
            </p>
          </div>

          {/* Company */}
          {lead.company && (
            <div>
              <p className="font-semibold">Company</p>
              <p className="text-gray-500">{lead.company}</p>
            </div>
          )}

          {/* Contact Person */}
          {lead.contacts && (
            <div>
              <p className="font-semibold">Contact Person</p>
              <p className="text-gray-500">{lead.contacts}</p>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getPriorityLabel(lead.priority)}
            </Badge>
            {lead.clientType && (
              <Badge variant="secondary">
                {getClientTypeLabel(lead.clientType)}
              </Badge>
            )}
          </div>

          {/* Created At (Tanggal Dibuat) */}
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarPlus className="w-4 h-4" />
            <span>{formatDate(lead.createdAt)}</span>
          </div>

          {/* Due Date (Jatuh Tempo) */}
          {lead.dueDate && (
            <div className="flex items-center gap-2 text-gray-500"> {/* Opsional: warna beda untuk due date */}
              <CalendarClock className="w-4 h-4" />
              <span>{formatDate(lead.dueDate)}</span>
            </div>
          )}
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
            {lead.description ? (
              <p className="text-gray-600 whitespace-pre-wrap">{lead.description}</p>
            ) : (
              <>
                <p className="text-gray-600">
                  Your details section is empty.
                </p>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Source Card (UPDATED) */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-semibold"
            onClick={() => setSourceOpen(!sourceOpen)}
          >
            <span className="flex items-center gap-2">
              Source
              {/* Badge Beta tetap ada sebagai info UI */}
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </span>
            {sourceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>

        {sourceOpen && (
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Source origin</span>
              {/* Data dari Database: sourceOrigin */}
              <span className="font-semibold">{lead.sourceOrigin || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Source channel</span>
              {/* Data dari Database: sourceChannel */}
              <span>{lead.sourceChannel || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Source channel ID</span>
              {/* Data dari Database: sourceChannelId (Truncate agar tidak kepanjangan) */}
              <span className="truncate max-w-[150px]" title={lead.sourceChannelId || ''}>
                {lead.sourceChannelId || '-'}
              </span>
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
            {lead.contacts && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{lead.contacts}</span>
              </div>
            )}

            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{lead.phone}</span>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="truncate">{lead.email}</span>
                <Badge variant="secondary" className="text-xs">MAIN</Badge>
              </div>
            )}

            {!lead.contacts && !lead.phone && !lead.email && (
              <p className="text-gray-500">No contact information available</p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Phone, MoreHorizontal, User, FileText } from 'lucide-react';
import { LeadActivity } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

// --- Helper Functions ---
// Format untuk tanggal di header (Created At)
const formatCreationDate = (isoString?: string) => {
  if (!isoString) return '-';
  // Contoh: 17 Nov 2025
  return new Date(isoString).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

// Format untuk tanggal & waktu call
const formatCallDate = (isoString?: string) => {
  if (!isoString) return 'Not scheduled';
  // Contoh: 18 Nov 2025, 10:00
  return new Date(isoString).toLocaleString('en-UK', {
    dateStyle: 'full',
  });
};

const formatCallTime = (isoString?: string) => {
  if (!isoString) return 'Not scheduled';
  // Contoh: 18 Nov 2025, 10:00
  return new Date(isoString).toLocaleString('en-US', {
    timeStyle: 'short',
  });
};
// ---

// --- Props Baru ---
interface CallViewProps {
  calls: LeadActivity[] | undefined;
  error: any;
  onEditCall: (callId: string) => void;
  onDeleteCall: (callId: string) => void;
  onUpdateCall: (callId: string, metaUpdate: any) => void; // Prop baru untuk update
}

export default function CallView({ calls, error, onEditCall, onDeleteCall, onUpdateCall }: CallViewProps) {
  
  if (error) {
    return <div className="text-red-500 p-4">Failed to load Call {(error as any).info?.error}</div>;
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Phone className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium">No calls logged yet</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">Scheduled calls and call logs will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {calls && calls.length > 0 ? (
          calls.map((call) => {
            const title = call.content;
            const meta = call.meta || {};
            const callTime = meta.callTime;
            const callNotes = meta.callNotes;
            const callStatus = meta.callStatus;
            const callResult = meta.callResult;
            const contactName = meta.contactName;
            const duration = meta.duration;

            return (
              <Card key={call.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Call Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-300 text-black">
                          <Phone className="w-5 h-5 fill-current" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{title}</h4>
                        <p className="text-sm text-gray-500">
                          Created by {call.createdBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* TANGGAL DIBUAT (Created At) */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatCreationDate(call.createdAt)}</span>
                      </div>
                      
                      {/* Tombol Edit/Delete */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditCall(call.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteCall(call.id)} className="text-red-500">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* --- TAMPILAN DETAIL BARU --- */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                    {/* Contact */}
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-gray-600">{contactName || '-'}</p>
                      </div>
                    </div>
                    {/* Duration */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-gray-600">{duration || '-'}</p>
                      </div>
                    </div>
                    {/* Waktu Telepon */}
                    <div className="flex items-start gap-3 col-span-2">
                      <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Call Time</p>
                        <p className="text-sm text-gray-600">{formatCallDate(callTime)}</p>
                        <p className="text-sm text-gray-600">at {formatCallTime(callTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Call Notes (jika ada) */}
                  {callNotes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Call Notes</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{callNotes}</p>
                    </div>
                  )}

                  {/* --- DROPDOWN INTERAKTIF BARU --- */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Status Dropdown */}
                      <div className="grid gap-1.5">
                        <Label>Status</Label>
                        <Select
                          value={callStatus}
                          onValueChange={(newStatus) => {
                            onUpdateCall(call.id, { callStatus: newStatus });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Set status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="missed">Missed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Result Dropdown */}
                      <div className="grid gap-1.5">
                        <Label>Result</Label>
                        <Select
                          value={callResult}
                          onValueChange={(newResult) => {
                            onUpdateCall(call.id, { callResult: newResult });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Set result..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="not-interested">Not Interested</SelectItem>
                            <SelectItem value="callback">Call Back Later</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-500 text-center p-4">There is no Call</p>
        )}
      </div>
    </div>
  );
}
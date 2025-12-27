'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { StickyNote, Edit, Trash2, Calendar, Paperclip } from 'lucide-react';
import { LeadActivity } from '@/lib/types';
import Image from 'next/image'; // 1. Impor Next.js Image

// --- Helper di luar komponen ---

// 2. Fungsi Helper untuk Cek Tipe File
const isImage = (url: string) => {
  if (!url) return false;
  // Memeriksa ekstensi file yang umum untuk gambar
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

// 3. Fungsi Helper untuk Mendapatkan Nama File
const getFileName = (url: string) => {
  if (!url) return 'attachment';
  try {
    // Decode URI (misal: "file%20saya.pdf" -> "file saya.pdf")
    // Ambil bagian terakhir setelah '/'
    return decodeURIComponent(url.split('/').pop() || 'attachment');
  } catch (e) {
    // Fallback jika terjadi error decoding
    return url.split('/').pop() || 'attachment';
  }
};
// ---

// Terima 'notes' dan 'error' sebagai props
interface NotesViewProps {
  notes: LeadActivity[] | undefined;
  error: any;
  onEditNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesView({ notes, error, onEditNote, onDeleteNote }: NotesViewProps) {
  
  if (error) {
    return <div className="text-red-500 p-4">Failed to load Notes {(error as any).info?.error}</div>;
  }
  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <StickyNote className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium">No notes added yet</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">Notes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {notes && notes.length > 0 ? (
          notes.map((note) => {
            // 4. Ambil URL Attachment dari Meta
            const attachmentUrl = note.meta?.attachmentUrl;

            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-300 text-black">
                          <StickyNote className="w-5 h-5 fill-black text-gray-300" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">Note</h4>
                        <p className="text-sm text-gray-500">
                          Note by {note.createdBy.name}
                        </p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(note.createdAt).toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'})}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditNote(note.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* --- 5. Tampilkan Attachment (Blok Baru) --- */}
                  {attachmentUrl && (
                    <div className="mt-4 rounded-lg border overflow-hidden">
                      {isImage(attachmentUrl) ? (
                        // Jika ini gambar, tampilkan gambar
                        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <Image 
                            src={attachmentUrl} 
                            alt="Attachment" 
                            width={800} // Lebar kontainer
                            height={400} // Tinggi default
                            className="w-full h-auto object-cover" 
                          />
                        </a>
                      ) : (
                        // Jika file lain (PDF, DOCX, dll), tampilkan link
                        <a 
                          href={attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-blue-600 hover:underline truncate">
                            {getFileName(attachmentUrl)}
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                  {/* --- Akhir Blok Attachment --- */}

                </CardContent>
              </Card>
            )
          })
        ) : (
          <p className="text-gray-500 text-center p-4">There is no Note</p>
        )}
      </div>
    </div>
  );
}
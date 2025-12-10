'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // <-- Impor Input
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, File as FileIcon, X, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  noteId?: string | null;
  onNoteAdded: () => void;
}

export default function AddNoteModal({
  open,
  onOpenChange,
  leadId,
  noteId,
  onNoteAdded,
}: AddNoteModalProps) {
  const isEditMode = noteId !== null && noteId !== undefined;
  
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null); // State untuk file baru
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | null>(null); // State untuk file lama
  const [removeAttachment, setRemoveAttachment] = useState(false); // State untuk hapus file
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ambil data saat mode edit
  useEffect(() => {
    const fetchNoteData = async () => {
      if (isEditMode && open) {
        setLoading(true);
        try {
          const noteData = await fetcher(
            `${API_URL}/leads/${leadId}/notes/${noteId}`
          ) as LeadActivity;
          setContent(noteData.content);
          setExistingAttachmentUrl(noteData.meta?.attachmentUrl || null);
        } catch (err) {
          setError('Failed to load record Notes');
          toast.error('Failed to load record Notes');
        } finally {
          setLoading(false);
        }
      } else {
        // Reset form
        setContent('');
        setFile(null);
        setExistingAttachmentUrl(null);
        setRemoveAttachment(false);
        setError('');
      }
    };

    fetchNoteData();
  }, [isEditMode, open, noteId, leadId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const url = isEditMode
      ? `${API_URL}/leads/${leadId}/notes/${noteId}`
      : `${API_URL}/leads/${leadId}/notes`;
    
    const method = isEditMode ? 'PATCH' : 'POST';

    // --- BUAT FORMDATA ---
    const formData = new FormData();
    formData.append('content', content);
    
    if (file) {
      formData.append('attachment', file); // Tambahkan file baru
    }
    
    if (isEditMode && removeAttachment) {
      formData.append('removeAttachment', 'true'); // Kirim flag hapus
    }
    // ---

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          // HAPUS 'Content-Type': 'application/json'
          // Browser akan mengaturnya ke 'multipart/form-data' secara otomatis
          'Authorization': `Bearer ${token}`
        },
        body: formData, // Kirim FormData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save Notes');
      }

      toast.success(isEditMode ? 'Note updated successfully' : 'Note created successfully');
      onNoteAdded();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'There is an error');
      toast.error(err instanceof Error ? err.message : 'There is an error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExistingAttachmentUrl(null); // Hapus file lama jika ada
      setRemoveAttachment(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter note..."
              rows={6}
              className="resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* --- BAGIAN FILE INPUT BARU --- */}
          <div className="grid gap-1.5">
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            
            {/* Tampilkan file baru yang dipilih */}
            {file && (
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <FileIcon className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Tampilkan file lama (mode edit) */}
            {existingAttachmentUrl && (
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <a 
                  href={existingAttachmentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>{existingAttachmentUrl.split('/').pop()}</span>
                </a>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => {
                    setExistingAttachmentUrl(null);
                    setRemoveAttachment(true);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Tampilkan Input File jika belum ada file */}
            {!file && !existingAttachmentUrl && (
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                disabled={loading}
              />
            )}
          </div>
          {/* --- AKHIR BAGIAN FILE INPUT --- */}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? 'Update Note' : 'Create Note')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
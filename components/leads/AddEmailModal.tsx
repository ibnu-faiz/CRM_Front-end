'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Info, Paperclip, X, Save, Lock } from 'lucide-react'; // Tambah icon
import { toast } from 'sonner';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AddEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  emailId?: string | null;
  onEmailAdded: () => void;
}

export default function AddEmailModal({
  open,
  onOpenChange,
  leadId,
  emailId,
  onEmailAdded,
}: AddEmailModalProps) {
  const isEditMode = emailId !== null && emailId !== undefined;

  // --- State Form ---
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [to, setTo] = useState('');
  const [replyTo, setReplyTo] = useState(''); 
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  
  // State Status
  const [emailStatus, setEmailStatus] = useState<'DRAFT' | 'SENT'>('DRAFT'); // Default Draft buat baru
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cek apakah form harus dikunci (Read Only)
  // Dikunci jika Mode Edit DAN Statusnya SENT
  const isReadOnly = isEditMode && emailStatus === 'SENT';

  // 1. Decode Token
  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decoded = JSON.parse(jsonPayload);
          setCurrentUserEmail(decoded.email || 'User');
        } catch (e) {
          console.error("Gagal decode token", e);
        }
      }
    }
  }, [open]);

  // 2. Fetch Data
  useEffect(() => {
    const initData = async () => {
      setError('');
      
      if (isEditMode && emailId && open) {
        setLoading(true);
        try {
          const data = await fetcher(`${API_URL}/leads/${leadId}/emails/${emailId}`) as LeadActivity;
          const meta = data.meta || {};
          
          setSubject(data.content);
          setTo(meta.to || '');
          setCc(meta.cc || '');
          setBcc(meta.bcc || '');
          setReplyTo(meta.replyTo || ''); 
          setMessageBody(meta.messageBody || '');
          
          // SET STATUS (Penting!)
          // Jika tidak ada status di DB (data lama), anggap SENT agar aman
          setEmailStatus(meta.status || 'SENT'); 
          
          setAttachment(null); 
        } catch (err) {
          toast.error('Failed to load Email data');
        } finally {
          setLoading(false);
        }
      } else if (!isEditMode && open) {
        // Reset Form Baru
        setSubject('');
        setCc('');
        setBcc('');
        setReplyTo('');
        setMessageBody('');
        setAttachment(null);
        setEmailStatus('DRAFT'); // Default baru adalah Draft (sebelum dikirim)
        
        try {
          const leadRes = await fetcher(`${API_URL}/leads/${leadId}`);
          const leadEmail = leadRes.email || leadRes.lead?.email;
          if (leadEmail) setTo(leadEmail);
          else setTo('');
        } catch (e) {
          setTo('');
        }
      }
    };

    initData();
  }, [isEditMode, open, emailId, leadId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Fungsi Submit Universal (Bisa Send, Bisa Save Draft)
  const handleAction = async (action: 'SEND' | 'DRAFT') => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      // Tentukan URL & Method
      // Create -> POST /email
      // Edit -> PATCH /emails/:id
      // Tapi karena controller kita sudah canggih, PATCH bisa kirim email juga
      
      let url = isEditMode 
        ? `${API_URL}/leads/${leadId}/emails/${emailId}`
        : `${API_URL}/leads/${leadId}/email`;
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const formData = new FormData();
      // Field wajib
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('message', messageBody);
      
      // Field opsional
      if (cc) formData.append('cc', cc);
      if (bcc) formData.append('bcc', bcc);
      if (replyTo) formData.append('replyTo', replyTo);
      if (attachment) formData.append('file', attachment);

      // FLAG PENTING: isDraft
      // Jika action == 'DRAFT', kirim true. Jika 'SEND', kirim false.
      formData.append('isDraft', action === 'DRAFT' ? 'true' : 'false');

      // Khusus mode edit text (tanpa file), controller PATCH butuh field 'content' utk subject
      if (isEditMode) {
        formData.append('content', subject); 
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || 'Failed to process email');
      }

      const responseData = await res.json();
      toast.success(responseData.message || 'Success');
      onEmailAdded(); 
      onOpenChange(false);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error processing request';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? 'View / Edit Email' : 'Compose New Email'}
            {isReadOnly && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border">Sent</span>}
            {isEditMode && !isReadOnly && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded border">Draft</span>}
          </DialogTitle>
        </DialogHeader>

        {/* PERINGATAN READ ONLY */}
        {isReadOnly && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Email ini sudah terkirim (Sent). Anda tidak dapat mengubah isi atau mengirim ulang.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-2">From</Label>
              <Input value={`${currentUserEmail} (via CRM)`} disabled className="bg-gray-50 text-gray-500 italic" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="replyTo">Reply To <span className="text-gray-400 font-normal text-xs">(Optional)</span></Label>
              <Input id="replyTo" type="email" placeholder="Ex: personal@gmail.com" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} disabled={loading} />
            </div>
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="to">To <span className="text-red-500">*</span></Label>
            <Input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required disabled={loading || isReadOnly} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cc">Cc</Label>
              <Input id="cc" type="email" value={cc} onChange={(e) => setCc(e.target.value)} disabled={loading || isReadOnly} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bcc">Bcc</Label>
              <Input id="bcc" type="email" value={bcc} onChange={(e) => setBcc(e.target.value)} disabled={loading || isReadOnly} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required disabled={loading || isReadOnly} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
            <Textarea id="message" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} rows={8} className="resize-none" required disabled={loading || isReadOnly} />
          </div>

          {/* INPUT ATTACHMENT */}
          <div className="grid gap-1.5">
            <Label className="flex items-center gap-2"><Paperclip className="w-3.5 h-3.5" /> Attachment</Label>
            
            {/* Logic Tampilan Input File */}
            {!isReadOnly ? (
              <div className="flex items-center gap-2">
                <Input 
                  id="file" type="file" onChange={handleFileChange} disabled={loading}
                  className="cursor-pointer file:text-blue-600 file:font-semibold file:bg-blue-50 file:rounded-md file:border-0 file:mr-4 file:py-1 file:px-2"
                />
                {attachment && (
                  <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => { setAttachment(null); (document.getElementById('file') as HTMLInputElement).value = ""; }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Attachments cannot be edited on sent emails.</p>
            )}
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2"><Info className="w-4 h-4"/>{error}</div>}

          {/* TOMBOL AKSI */}
          <div className="flex gap-2 pt-4 border-t mt-2">
            
            {/* 1. Tombol Cancel (Selalu Ada) */}
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              Close
            </Button>

            {/* 2. Tombol Save Draft (Hanya jika belum SENT) */}
            {!isReadOnly && (
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1 gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
                disabled={loading}
                onClick={() => handleAction('DRAFT')}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </Button>
            )}

            {/* 3. Tombol Send (Hanya jika belum SENT) */}
            {!isReadOnly && (
              <Button 
                type="button" 
                className="flex-1 bg-gray-900 hover:bg-gray-800 gap-2"
                disabled={loading}
                onClick={() => handleAction('SEND')}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Now
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
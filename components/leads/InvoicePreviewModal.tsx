'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Loader2, Eye, Edit } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity, InvoiceItem } from '@/lib/types';

interface InvoicePreviewModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  invoiceId?: string | null;
  onEditInvoice: (invoiceId: string) => void;
}

// --- HELPERS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
};
const formatDate = (isoString?: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('en-UK', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InvoicePreviewModal({ 
  open, onOpenChange, leadId, invoiceId, onEditInvoice
}: InvoicePreviewModal) {

  const [isDownloading, setIsDownloading] = useState(false);

  const { data: invoice, error, isLoading } = useSWR<LeadActivity>(
    open && invoiceId ? `${API_URL}/leads/${leadId}/invoices/${invoiceId}` : null,
    fetcher
  );

  const meta = invoice?.meta || {};
  const items = meta.items || [];
  const notes = meta.notes || '';
  
  const billedBy = meta.billedBy || 'cmlabs';
  const billedTo = meta.billedTo || '(Client Name)';
  
  const subtotal = meta.subtotal || 0;
  const tax = meta.tax || 0;
  const totalAmount = meta.totalAmount || 0;

  // --- FUNGSI DOWNLOAD ---
  const handleDownloadPdf = async () => {
    if (!invoiceId) return;
    setIsDownloading(true);
    
    try {
       const token = localStorage.getItem('token'); 
       const pdfUrl = `/api/invoices/${invoiceId}/pdf?leadId=${leadId}&token=${token}`;
       window.open(pdfUrl, '_blank');
       
    } catch (error) {
       console.error("Download failed", error);
    } finally {
       setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-[#d1d5db] p-4">
        
        {/* Header Modal */}
         <DialogHeader className="flex flex-row items-center justify-between pb-3 px-7">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span className="text-lg font-semibold">Preview</span>
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={() => { if (invoiceId) { onOpenChange(false); onEditInvoice(invoiceId); } }}>
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadPdf} disabled={isDownloading || isLoading}>
               {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Container */}
        <div className="overflow-y-auto overflow-x-hidden max-h-[calc(95vh-80px)] px-2 pb-4">
          {isLoading && <div className="flex justify-center h-96 items-center"><Loader2 className="animate-spin w-8 h-8" /></div>}
          
          {!isLoading && invoice && (
            // KERTAS A4 PREVIEW
            <div 
              className="bg-[#ffffff] rounded-sm border border-[#f3f4f6] p-10 space-y-8 text-[#111827] mx-auto max-w-[210mm] min-h-[297mm] flex flex-col shadow-lg"
              style={{ backgroundColor: '#ffffff', color: '#111827' }}
            >
              
              {/* 1. Header Invoice */}
               <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-[#000000] mb-1">Invoice</h1>
                  <p className="text-sm text-[#6b7280] font-medium tracking-wide break-all">
                    {/* --- PERBAIKAN DISINI --- */}
                    {/* Gunakan title (format baru) atau content (format lama) */}
                    {invoice.title || invoice.content || '(No Number)'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <h2 className="text-xl font-bold text-[#1f2937] whitespace-nowrap">CRM cmlabs</h2>
                </div>
              </div>
              <div className="border-t border-gray-400 mb-6"></div>

              {/* 2. Alamat (Billed By & To) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Kiri: Billed By */}
                <div className="min-w-0 flex flex-col">
                  <h4 className="text-sm font-semibold text-[#111827] mb-2">Billed By:</h4>
                  <div className="text-sm text-[#4b5563] leading-relaxed break-words flex-1">
                    <div className="font-bold text-[#000000] mb-1">
                      {billedBy.split('\n')[0]}
                    </div>
                    <div className="whitespace-pre-wrap">
                      {billedBy.split('\n').slice(1, -1).join('\n')}
                    </div>
                  </div>
                  <div className="text-sm text-[#4b5563] mt-auto pt-2">
                    {billedBy.split('\n').slice(-1)[0]}
                  </div>
                </div>

                {/* Kolom Kanan: Billed To */}
                 <div className="min-w-0 flex flex-col">
                  <h4 className="text-sm font-semibold text-[#111827] mb-2">Billed To:</h4>
                  <div className="text-sm text-[#4b5563] leading-relaxed break-words flex-1">
                    <div className="font-bold text-[#000000] mb-1">
                      {billedTo.split('\n')[0] || 'Client Name'}
                    </div>
                    <div className="whitespace-pre-wrap">
                      {billedTo.split('\n').slice(1, -1).join('\n') || 'Client Address...'}
                    </div>
                  </div>
                  <div className="text-sm text-[#4b5563] mt-auto pt-2">
                    {billedTo.split('\n').slice(-1)[0] || ''}
                  </div>
                </div>
              </div>

              {/* 3. Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-[#111827] mb-1">Date Invoice:</h4>
                  <p className="text-sm font-medium text-[#1f2937]">
                    {formatDate(meta.invoiceDate)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111827] mb-1">Due Date:</h4>
                  <p className="text-sm font-medium text-[#1f2937]">
                    {formatDate(meta.dueDate)}
                  </p>
                </div>
              </div>


              {/* 4. Tabel Item */}
              <div className="rounded-lg overflow-visible border border-[#f3f4f6]">
                <table className="w-full table-auto">
                  <thead className="bg-[#f3f4f6]">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold text-sm text-[#374151]">Item Name</th>
                      <th className="text-center py-3 px-3 font-semibold text-sm text-[#374151] whitespace-nowrap">Qty</th>
                      <th className="text-right py-3 px-3 font-semibold text-sm text-[#374151] whitespace-nowrap">Unit Price</th>
                      <th className="text-right py-3 px-3 font-semibold text-sm text-[#374151] whitespace-nowrap">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9fafb]">
                    {items.map((item: InvoiceItem, index: number) => (
                      <tr key={index}>
                        <td className="py-3 px-3 text-sm font-medium text-[#111827]">{item.name}</td>
                        <td className="text-center py-3 px-3 text-sm text-[#4b5563] whitespace-nowrap">{item.qty}</td>
                        <td className="text-right py-3 px-3 text-sm text-[#4b5563] whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-3 px-3 text-sm font-semibold text-[#111827] whitespace-nowrap">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-400 my-2"></div>

              {/* 5. Total Calculation */}
             <div className="space-y-4 pt-2">
                {/* Totals */}
                <div className="bg-[#f9fafb] p-4 rounded-lg border border-[#f3f4f6]">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <span className="font-semibold text-[#111827] text-left">Subtotal</span>
                      <span className="font-semibold text-[#111827] text-right">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <span className="font-semibold text-[#111827] text-left">Tax (10%)</span>
                      <span className="font-semibold text-[#111827] text-right">{formatCurrency(tax)}</span>
                    </div>
                    
                    <div className="h-px bg-[#e5e7eb] my-2" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <span className="font-bold text-base text-[#111827] text-left">Total Amount</span>
                      <span className="font-bold text-lg text-[#111827] text-right">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div className="bg-[#f3f4f6] p-4 rounded-lg border border-[#f3f4f6]">
                    <h4 className="font-bold mb-1 text-sm text-[#000000]">Notes</h4>
                    <p className="text-sm text-[#4b5563] leading-relaxed">{notes}</p>
                  </div>
                )}
              </div>

              {/* Spacer untuk mendorong footer ke bawah */}
              <div className="flex-1"></div>


              {/* 7. Footer */}
              <div className="mt-8 pt-8 border-t border-gray-400 text-center text-xs text-gray-400">
                <p className="font-bold mb-1 text-gray-900">THANK YOU FOR YOUR BUSINESS!</p>
                <div className="flex justify-center gap-4 mt-2">
                   <span>088897233</span>
                   <span>•</span>
                   <span>cmlabs</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
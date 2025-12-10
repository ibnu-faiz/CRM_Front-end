'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity, InvoiceItem } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface InvoicePreviewModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  invoiceId?: string | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
};

export default function InvoicePreviewModal({ 
  open, onOpenChange, leadId, invoiceId 
}: InvoicePreviewModal) {

  const { data: invoice, error, isLoading } = useSWR<LeadActivity>(
    open && invoiceId ? `${API_URL}/leads/${leadId}/invoices/${invoiceId}` : null,
    fetcher
  );

  const meta = invoice?.meta || {};
  const items = meta.items || [];
  const notes = meta.notes || '';
  
  // Baca data yang sudah diperbaiki
  const billedBy = meta.billedBy || 'cmlabs';
  const billedTo = meta.billedTo || '(Client Name)';
  
  const subtotal = meta.subtotal || 0;
  const tax = meta.tax || 0;
  const totalAmount = meta.totalAmount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Preview Invoice</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Printer className="w-4 h-4" /></Button>
          </div>
        </DialogHeader>

        {isLoading && <div className="flex justify-center h-96 items-center"><Loader2 className="animate-spin w-8 h-8" /></div>}
        
        {!isLoading && invoice && (
          <div className="bg-white border rounded-lg p-10 space-y-8 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-3xl font-bold mb-1 text-gray-900">INVOICE</h2>
                <p className="text-base text-gray-500 font-medium">#{invoice.content}</p>
              </div>
              <div className="text-right">
                {/* Logo bisa ditaruh di sini */}
                <h3 className="text-xl font-bold text-gray-800">cmlabs</h3>
              </div>
            </div>

            {/* Address Info */}
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Billed By</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {billedBy}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Billed To</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {billedTo}
                </p>
              </div>
            </div>

            {/* Date Section (DIHAPUS SESUAI REQUEST) */}
            {/* <div className="grid grid-cols-2 gap-8 bg-gray-50 p-4 rounded"> ... </div> */}

            {/* Items Table */}
            <div className="mt-8">
              <table className="w-full">
                <thead className="border-b-2 border-gray-900">
                  <tr>
                    <th className="text-left py-3 font-bold text-sm uppercase text-gray-600">Item Description</th>
                    <th className="text-center py-3 font-bold text-sm uppercase text-gray-600 w-20">Qty</th>
                    <th className="text-right py-3 font-bold text-sm uppercase text-gray-600 w-32">Price</th>
                    <th className="text-right py-3 font-bold text-sm uppercase text-gray-600 w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {items.map((item: InvoiceItem, index: number) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 font-medium">{item.name}</td>
                      <td className="text-center py-4">{item.qty}</td>
                      <td className="text-right py-4 text-gray-500">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-4 font-bold text-gray-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary & Notes */}
            <div className="flex flex-col md:flex-row justify-between gap-8 pt-4">
              <div className="flex-1">
                {notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-2 text-xs uppercase text-gray-500">Notes & Terms</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-72 space-y-3">
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-500">Tax (10%)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                  <span className="font-bold text-xl">Total</span>
                  <span className="font-bold text-xl text-blue-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-12 text-gray-400 text-xs">
              <p>Thank you for your business</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
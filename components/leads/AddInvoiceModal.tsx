'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity, ActivityType } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DEF_BY_COMPANY = "cmlabs";
const DEF_BY_ADDRESS = "Jl. Seruni No.9, Lowokwaru, Kec.\nLowokwaru, Kota Malang, Jawa Timur";
const DEF_BY_EMAIL = "marketing@cmlabs.co";

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  invoiceId?: string | null;
  onInvoiceAdded: () => void;
}

// Helper Format Tanggal
const formatToDate = (value: any) => {
  if (!value) return ''; 
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Helper Parse Legacy String
const parseLegacyString = (fullText: string) => {
  if (!fullText) return { company: '', address: '', email: '' };
  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length === 0) return { company: '', address: '', email: '' };

  const company = lines[0];
  let email = '';
  let addressLines = [];

  const lastLine = lines[lines.length - 1];
  if (lines.length > 1 && lastLine.includes('@')) {
    email = lastLine;
    addressLines = lines.slice(1, lines.length - 1);
  } else {
    addressLines = lines.slice(1);
  }

  return { company, email, address: addressLines.join('\n') };
};

export default function AddInvoiceModal({ 
  open, onOpenChange, leadId, invoiceId, onInvoiceAdded 
}: AddInvoiceModalProps) {
  
  const isEditMode = invoiceId !== null && invoiceId !== undefined;
  
  // State Form
  const [invoiceNo, setInvoiceNo] = useState('');
  const [status, setStatus] = useState('draft');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  // State Billed By
  const [byCompany, setByCompany] = useState(DEF_BY_COMPANY);
  const [byAddress, setByAddress] = useState(DEF_BY_ADDRESS);
  const [byEmail, setByEmail] = useState(DEF_BY_EMAIL);

  // State Billed To
  const [toCompany, setToCompany] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [toEmail, setToEmail] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([{ name: '', qty: 1, unitPrice: 0, total: 0 }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Item Logic
  const addItem = () => setItems([...items, { name: '', qty: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    let newItem = { ...newItems[index], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      const qty = field === 'qty' ? parseFloat(value) || 0 : newItem.qty;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : newItem.unitPrice;
      newItem.total = qty * unitPrice;
    }
    newItems[index] = newItem;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; 
  const totalAmount = subtotal + tax;

  // Fetch Data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      setError('');
      
      if (isEditMode && open) {
        setLoading(true);
        try {
          const data = await fetcher(`${API_URL}/leads/${leadId}/invoices/${invoiceId}`) as LeadActivity;
          const meta = data.meta || {};
          
          setInvoiceNo(data.content); 
          setStatus(meta.status || 'draft');
          setInvoiceDate(formatToDate(meta.invoiceDate || data.createdAt));
          setDueDate(formatToDate(meta.dueDate));
          
          // Load Billed By
          if (meta.byCompany || meta.byAddress) {
             setByCompany(meta.byCompany || '');
             setByAddress(meta.byAddress || '');
             setByEmail(meta.byEmail || '');
          } else if (meta.billedBy) {
             const parsed = parseLegacyString(meta.billedBy);
             setByCompany(parsed.company);
             setByAddress(parsed.address);
             setByEmail(parsed.email);
          } else {
             setByCompany(DEF_BY_COMPANY);
             setByAddress(DEF_BY_ADDRESS);
             setByEmail(DEF_BY_EMAIL);
          }

          // Load Billed To
          if (meta.toCompany || meta.toAddress) {
             setToCompany(meta.toCompany || '');
             setToAddress(meta.toAddress || '');
             setToEmail(meta.toEmail || '');
          } else if (meta.billedTo) {
             const parsed = parseLegacyString(meta.billedTo);
             setToCompany(parsed.company);
             setToAddress(parsed.address);
             setToEmail(parsed.email);
          } else {
             setToCompany('');
             setToAddress('');
             setToEmail('');
          }

          setItems(meta.items || [{ name: '', qty: 0, unitPrice: 0, total: 0 }]);
          setNotes(meta.notes || '');
        } catch (err) {
          toast.error('Gagal memuat data invoice');
        } finally {
          setLoading(false);
        }
      } else if (!isEditMode && open) {
        // Reset
        setInvoiceNo(''); 
        setStatus('draft');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        
        setByCompany(DEF_BY_COMPANY);
        setByAddress(DEF_BY_ADDRESS);
        setByEmail(DEF_BY_EMAIL);

        setToCompany('');
        setToAddress('');
        setToEmail('');

        setItems([{ name: '', qty: 0, unitPrice: 0, total: 0 }]);
        setNotes('');
      }
    };
    fetchInvoiceData();
  }, [isEditMode, open, invoiceId, leadId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const combinedBilledBy = `${byCompany}\n${byAddress}\n${byEmail}`;
    const combinedBilledTo = `${toCompany}\n${toAddress}\n${toEmail}`;

    const payload = {
      ...(isEditMode && { content: invoiceNo }),
      status,
      invoiceDate: invoiceDate ? new Date(invoiceDate).toISOString() : new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      
      billedBy: combinedBilledBy,
      billedTo: combinedBilledTo,

      byCompany, byAddress, byEmail,
      toCompany, toAddress, toEmail,

      items,
      notes,
      subtotal,
      tax,
      totalAmount
    };

    const url = isEditMode
      ? `${API_URL}/leads/${leadId}/invoices/${invoiceId}`
      : `${API_URL}/leads/${leadId}/invoices`; 
    
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save Invoice');
      }

      toast.success(isEditMode ? 'Invoice updated' : 'Invoice created');
      onInvoiceAdded();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Invoice' : 'Add New Invoice'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-1.5">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={isEditMode ? invoiceNo : ''} 
                placeholder={isEditMode ? '' : '(Auto Generated by System)'} 
                readOnly 
                className="bg-gray-100 text-gray-500 font-medium"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-1.5">
              <Label>Invoice Date</Label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} disabled={loading} required />
            </div>
            <div className="grid gap-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BILLED BY (FROM) */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Billed By (From)</h3>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Company Name</Label>
                <Input value={byCompany} onChange={(e) => setByCompany(e.target.value)} className="bg-white" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Address</Label>
                <Textarea value={byAddress} onChange={(e) => setByAddress(e.target.value)} rows={3} className="bg-white resize-none" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Email</Label>
                <Input value={byEmail} onChange={(e) => setByEmail(e.target.value)} className="bg-white" />
              </div>
            </div>

            {/* BILLED TO (CLIENT) */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Billed To (Client)</h3>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Client / Company Name</Label>
                <Input value={toCompany} onChange={(e) => setToCompany(e.target.value)} className="bg-white" placeholder="PT Maju Mundur" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Address</Label>
                <Textarea value={toAddress} onChange={(e) => setToAddress(e.target.value)} rows={3} className="bg-white resize-none" placeholder="Alamat..." />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Email</Label>
                <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} className="bg-white" placeholder="client@email.com" />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="grid gap-1.5">
            <Label>Items</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="text-left p-3 font-medium w-1/4">Item Name</th>
                    <th className="text-center p-3 font-medium w-24">Qty</th>
                    <th className="text-center p-3 font-medium w-56">Unit Price</th>
                    <th className="text-right p-3 font-medium w-56">Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        <Input value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} className="border-0 focus-visible:ring-0" placeholder="Item..." />
                      </td>
                      <td className="p-2">
                        {/* QTY: Added CSS to hide spinner */}
                        <Input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => updateItem(index, 'qty', e.target.value)} 
                          className="text-center border-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        />
                      </td>
                      <td className="p-2">
                        {/* UNIT PRICE: Added CSS to hide spinner */}
                        <Input 
                          type="number" 
                          value={item.unitPrice} 
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} 
                          className="text-right border-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        />
                      </td>
                      <td className="p-2 text-right font-medium">IDR {item.total.toLocaleString('id-ID')}</td>
                      <td className="p-2"><Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="ghost" className="mt-2 gap-2 w-fit" onClick={addItem}><Plus className="w-4 h-4" /> Add Item</Button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="grid gap-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="resize-none" />
            </div>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between border-b py-2"><span className="text-sm text-gray-600">Subtotal</span><span className="font-medium">IDR {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between border-b py-2"><span className="text-sm text-gray-600">Tax (10%)</span><span className="font-medium">IDR {tax.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between pt-2"><span className="font-bold text-lg">Total</span><span className="font-bold text-lg">IDR {totalAmount.toLocaleString('id-ID')}</span></div>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2"><Info className="w-4 h-4"/>{error}</div>}

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Update Invoice' : 'Create Invoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
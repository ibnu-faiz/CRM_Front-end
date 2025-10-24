// components/leads/AddInvoiceModal.tsx
'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus, Edit } from 'lucide-react';

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: number | null;
}

export default function AddInvoiceModal({ open, onOpenChange, invoiceId }: AddInvoiceModalProps) {
  const isEditMode = invoiceId !== null && invoiceId !== undefined;
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: 'item 1', qty: 0, unitPrice: 0, total: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { name: 'item 1', qty: 0, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      newItems[index].total = newItems[index].qty * newItems[index].unitPrice;
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10%
  const totalAmount = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isEditMode ? 'Invoice updated' : 'Invoice created');
    onOpenChange(false);
  };

  const handlePreview = () => {
    console.log('Preview invoice');
    // Open preview modal
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Number & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNumber"
                  defaultValue="INV-20250801-001"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Invoice numbers must be unique</p>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Date & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" />
              <p className="text-xs text-gray-500 mt-1">Must not be earlier than the Invoice Date.</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <Label>Items</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="text-left p-3 font-medium">Item Name</th>
                    <th className="text-center p-3 font-medium w-24">Qty*</th>
                    <th className="text-center p-3 font-medium w-32">Unit Price*</th>
                    <th className="text-right p-3 font-medium w-32">Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="border-0 focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItem(index, 'qty', Math.max(0, item.qty - 1))}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                            className="w-12 text-center border-0 focus-visible:ring-0 p-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItem(index, 'qty', item.qty + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="text-center border-0 focus-visible:ring-0"
                          placeholder="IDR 0"
                        />
                      </td>
                      <td className="p-2 text-right">
                        IDR {item.total}
                      </td>
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add Item Button */}
            <Button
              type="button"
              variant="ghost"
              className="mt-2 gap-2"
              onClick={addItem}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
            <p className="text-xs text-gray-500 mt-1">The quantity of items must be greater than 0</p>
          </div>

          {/* Notes & Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter Lead Description"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 text-right mt-1">0/100</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Subtotal</span>
                <span className="font-medium">IDR {subtotal}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Tax (10%)</span>
                <span className="font-medium">IDR {tax}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-gray-900">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold">IDR {totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-700">
              Create Invoice
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handlePreview}
            >
              Preview Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
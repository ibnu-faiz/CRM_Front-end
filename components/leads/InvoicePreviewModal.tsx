// components/leads/InvoicePreviewModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Download, Printer, Check } from 'lucide-react';

interface InvoicePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: number | null;
}

export default function InvoicePreviewModal({ open, onOpenChange, invoiceId }: InvoicePreviewModalProps) {
  const handleSaveAsDraft = () => {
    console.log('Save as draft');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white">
              👁
            </span>
            Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSaveAsDraft}
            >
              <Check className="w-4 h-4" />
              Save as Draft
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Preview */}
        <div className="bg-white border rounded-lg p-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold mb-2">Invoice</h2>
              <p className="text-sm text-gray-600">INV-20250801-001</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold">CRM cmlabs</h3>
            </div>
          </div>

          {/* Billed By & Billed To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Billed By:</h4>
              <p className="text-sm text-gray-700">cmlabs</p>
              <p className="text-sm text-gray-600">
                Jl. Seruni No.9, Lowokwaru, Kec.<br />
                Lowokwaru, Kota Malang, Jawa Timur<br />
                marketing@cmlabs.co
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Billed To:</h4>
              <p className="text-sm text-gray-700">company name</p>
              <p className="text-sm text-gray-600">
                Jl. Indonesia No.10, Kelurahan,<br />
                Kecamatan, Kota, Provinsi<br />
                companyname@email.com
              </p>
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600">Date Invoice:</p>
              <p className="font-semibold">August 1, 2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date:</p>
              <p className="font-semibold">August 1, 2025</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full">
              <thead className="border-b-2 border-gray-900">
                <tr>
                  <th className="text-left py-3 font-semibold">Item Name</th>
                  <th className="text-center py-3 font-semibold w-20">Qty</th>
                  <th className="text-right py-3 font-semibold w-32">Unit Price</th>
                  <th className="text-right py-3 font-semibold w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Item 1</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-right py-3">IDR 0</td>
                  <td className="text-right py-3">IDR 0</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Item 1</td>
                  <td className="text-center py-3">0</td>
                  <td className="text-right py-3">IDR 0</td>
                  <td className="text-right py-3">IDR 0</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm">Subtotal</span>
                <span className="font-medium">IDR 0</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm">Tax(10%)</span>
                <span className="font-medium">IDR 0</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold">IDR 0</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-sm text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t">
            <p className="text-xl font-bold mb-2">THANK YOU!</p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <span>089897233</span>
              <span className="font-semibold">cmlabs</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// components/leads/InvoiceView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddInvoiceModal from './AddInvoiceModal';
import InvoicePreviewModal from './InvoicePreviewModal';

const mockInvoices = [
  {
    id: 1,
    invoiceNo: 'INV-20250801-001',
    date: 'August 1, 2025',
    dueDate: 'August 1, 2025',
    status: 'draft',
    total: 'IDR 0',
  },
  {
    id: 2,
    invoiceNo: 'INV-20250801-001',
    date: 'August 1, 2025',
    dueDate: 'August 1, 2025',
    status: 'draft',
    total: 'IDR 0',
  },
  {
    id: 3,
    invoiceNo: 'INV-20250801-001',
    date: 'August 1, 2025',
    dueDate: 'August 1, 2025',
    status: 'draft',
    total: 'IDR 0',
  },
];

interface InvoiceViewProps {
  leadId: string;
}

export default function InvoiceView({ leadId }: InvoiceViewProps) {
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);

  const handlePreview = (invoiceId: number) => {
    setSelectedInvoice(invoiceId);
    setIsPreviewOpen(true);
  };

  const handleEdit = (invoiceId: number) => {
    setSelectedInvoice(invoiceId);
    setIsAddInvoiceOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Add Invoice Button */}
      {/* <div className="flex justify-end">
        <Button
          onClick={() => setIsAddInvoiceOpen(true)}
          className="bg-gray-800 hover:bg-gray-700"
        >
          + Add Invoice
        </Button>
      </div> */}

      {/* Invoice Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Invoice No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{invoice.total}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(invoice.id)}>
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <AddInvoiceModal
        open={isAddInvoiceOpen}
        onOpenChange={(open) => {
          setIsAddInvoiceOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
        invoiceId={selectedInvoice}
      />

      <InvoicePreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        invoiceId={selectedInvoice}
      />
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react"; // Tambahan 1
import { useSearchParams } from "next/navigation"; // Tambahan 2
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, ReceiptText, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadActivity } from "@/lib/types";

interface InvoiceViewProps {
  invoices: LeadActivity[] | undefined;
  error: any;
  onEditInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onPreviewInvoice: (invoiceId: string) => void;
  onUpdateStatus: (invoiceId: string, newStatus: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoString?: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("en-UK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AVAILABLE_STATUSES = ["Draft", "Sent", "Pending", "Paid", "Overdue"];

const getStatusColorClass = (statusRaw: string) => {
  const status = (statusRaw || "draft").toLowerCase();

  if (status === "paid") {
    return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
  } else if (status === "sent") {
    return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
  } else if (status === "overdue") {
    return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
  } else if (status === "pending") {
    return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
  }
  return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
};

export default function InvoiceView({
  invoices,
  error,
  onEditInvoice,
  onDeleteInvoice,
  onPreviewInvoice,
  onUpdateStatus,
}: InvoiceViewProps) {
  
  // --- INTEGRASI HIGHLIGHT DARI DASHBOARD ---
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  // Ref diganti ke HTMLTableRowElement karena kita pakai Table
  const itemRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (highlightId && itemRefs.current[highlightId]) {
      setTimeout(() => {
        itemRefs.current[highlightId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500); // Delay sedikit agar table render sempurna
    }
  }, [highlightId, invoices]);

  if (error)
    return <div className="text-red-500 p-4">Failed to load Invoices</div>;

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="border rounded-lg bg-white shadow-sm w-full overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="w-[25%] px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Invoice No.
              </TableHead>
              <TableHead className="w-[15%] px-1 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Date
              </TableHead>
              <TableHead className="w-[15%] px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Due Date
              </TableHead>
              <TableHead className="w-[15%] px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Status
              </TableHead>
              <TableHead className="w-[20%] px-7 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Total
              </TableHead>
              <TableHead className="w-[10%] px-6 py-3" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => {
                const meta = invoice.meta || {};
                const status = meta.status || "draft";
                // Fallback amount agar aman
                const total = meta.totalAmount || meta.amount || 0;
                const statusColor = getStatusColorClass(status);

                // Cek Highlight
                const isHighlighted = highlightId === invoice.id;

                return (
                  <TableRow
                    key={invoice.id}
                    ref={(el) => { itemRefs.current[invoice.id] = el; }} // Pasang REF disini
                    className={`transition-colors border-b border-gray-100 last:border-0 ${
                        isHighlighted 
                          ? "bg-blue-50/80 hover:bg-blue-100/50 border-blue-200 shadow-inner" // Warna Highlight
                          : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Invoice No: TITLE */}
                    <TableCell className="px-2 py-2 align-middle text-center">
                      <button
                        onClick={() => onPreviewInvoice(invoice.id)}
                        className="text-left text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm"
                        title={invoice.title || invoice.content} 
                      >
                        {invoice.title || invoice.content || "(No Number)"}
                      </button>
                      {/* Subtitle Company Name agar lebih lengkap */}
                      <div className="text-[10px] text-gray-500 truncate max-w-[150px] mx-auto">
                        {meta.companyName || ""}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-1 py-2 text-sm text-gray-600 align-middle whitespace-nowrap text-center">
                      {formatDate(meta.invoiceDate || invoice.createdAt)}
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className={`px-2 py-2 text-sm align-middle whitespace-nowrap text-center ${
                        status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-600'
                    }`}>
                      {formatDate(meta.dueDate)}
                    </TableCell>

                    {/* Status Dropdown */}
                    <TableCell className="px-4 py-2 align-middle text-center">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border capitalize outline-none focus:ring-2 focus:ring-blue-500 ${statusColor}`}
                          >
                            {status}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-32">
                          <DropdownMenuLabel className="text-xs text-gray-500">
                            Change Status
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {AVAILABLE_STATUSES.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() =>
                                onUpdateStatus(invoice.id, option.toLowerCase())
                              }
                              className="text-xs cursor-pointer flex justify-between items-center"
                            >
                              {option}
                              {status.toLowerCase() ===
                                option.toLowerCase() && (
                                <Check className="w-3 h-3 text-blue-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="px-7 py-2 text-right font-bold text-gray-900 text-sm align-middle whitespace-nowrap">
                      {formatCurrency(total)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-2 text-right align-middle">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-700 rounded-full"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onPreviewInvoice(invoice.id)}
                            className="cursor-pointer"
                          >
                            <ReceiptText className="w-4 h-4 mr-2 text-gray-500" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditInvoice(invoice.id)}
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteInvoice(invoice.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-full">
                      <ReceiptText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 text-lg font-medium">
                      No invoices found
                    </p>
                    <p className="text-sm text-gray-500">
                      Create a new invoice to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
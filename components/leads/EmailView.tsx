"use client";

import { useEffect, useRef } from "react"; 
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Calendar,
  Edit,
  Trash2,
  Paperclip,
  CornerUpLeft,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { LeadActivity } from "@/lib/types";

// Helper Date
const formatCreationDate = (isoString?: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

// Helper File Name
const getFileName = (url: string) => {
  if (!url) return "attachment";
  try {
    return decodeURIComponent(url.split("/").pop() || "attachment");
  } catch (e) {
    return url.split("/").pop() || "attachment";
  }
};

interface EmailViewProps {
  emails: LeadActivity[] | undefined;
  error: any;
  onEditEmail: (emailId: string) => void;
  onDeleteEmail: (emailId: string) => void;
}

export default function EmailView({
  emails,
  error,
  onEditEmail,
  onDeleteEmail,
}: EmailViewProps) {
  
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
   if (highlightId && itemRefs.current[highlightId]) {
      setTimeout(() => {
        itemRefs.current[highlightId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [highlightId, emails]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading emails.
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Mail className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium">No emails logged yet</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Sent emails and drafts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => {
        // Ambil Data Meta
        const {
          to,
          cc,
          bcc,
          replyTo,
          messageBody,
          attachmentUrl,
          status,
        } = email.meta || {};
        
        // --- PERBAIKAN DISINI ---
        // Ambil Subject dari title (Schema Baru) atau content (Schema Lama)
        const subject = email.title || email.content || '(No Subject)';

        // Cek Status (Default SENT jika data lama tidak punya status)
        const isDraft = status === "DRAFT";

        const isHighlighted = highlightId === email.id;

       return (
          <div
            key={email.id}
            ref={(el) => { itemRefs.current[email.id] = el; }} // Penting untuk auto-scroll
            className={`transition-all duration-500 rounded-lg ${
              isHighlighted ? "ring-2 ring-blue-500 ring-offset-2 scale-[1.01] z-10" : ""
            }`}
          >
            <Card
              className={`group transition-all duration-200 ${
                isHighlighted 
                  ? "border-blue-500 bg-blue-50/50 shadow-md" 
                  : isDraft
                  ? "border-yellow-300 bg-yellow-50/30"
                  : "hover:border-gray-400"
              }`}
            >
              <CardContent className="p-5">
                {/* Header: User, Date & Status Badge */}
                <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        className={`border ${
                          isDraft
                            ? "bg-yellow-100 border-yellow-200 text-yellow-600"
                            : isHighlighted
                            ? "bg-blue-100 border-blue-200 text-blue-600"
                            : "bg-blue-50 border-blue-100 text-blue-600"
                        }`}
                      >
                        <Mail className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Sent by: {email.createdBy?.name || "System"}
                        </h4>

                        {/* BADGE STATUS */}
                        {isDraft ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 capitalize tracking-wide">
                            <Clock className="w-3 h-3" /> Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 capitalize tracking-wide">
                            <CheckCircle2 className="w-3 h-3" /> Sent
                          </span>
                        )}

                        {/* BADGE HIGHLIGHT (Muncul saat diklik dari dashboard) */}
                        {isHighlighted && (
                          <span className="text-[10px] bg-blue-600 text-white font-bold animate-pulse uppercase">
                           
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatCreationDate(email.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500"
                      onClick={() => onEditEmail(email.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => onDeleteEmail(email.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Email Metadata Box */}
                <div className={`${isHighlighted ? 'bg-white' : 'bg-white/80'} rounded-md p-3 mb-4 text-sm space-y-1.5 border border-gray-200 shadow-sm`}>
                  <div className="grid grid-cols-[80px_1fr] gap-2 mb-2">
                    <span className="text-gray-500 font-medium">Subject:</span>
                    <span className="font-bold text-gray-900">{subject}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                    <span className="text-gray-500">To:</span>
                    <span className="text-gray-700 font-medium">{to || "-"}</span>
                  </div>
                  {/* REPLY TO TETAP ADA DI SINI */}
                  {replyTo && (
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <span className="text-gray-500 flex items-center gap-1">
                        <CornerUpLeft className="w-3 h-3" /> Reply To:
                      </span>
                      <span className="text-blue-600 underline truncate">
                        {replyTo}
                      </span>
                    </div>
                  )}
                  {cc && (
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <span className="text-gray-500">Cc:</span>
                      <span className="text-gray-600">{cc}</span>
                    </div>
                  )}
                  {bcc && (
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <span className="text-gray-500">Bcc:</span>
                      <span className="text-gray-600">{bcc}</span>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {messageBody || (
                    <span className="text-gray-400 italic">(No content)</span>
                  )}
                </div>

                {/* Attachment */}
                {attachmentUrl && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border hover:bg-blue-50 transition-colors w-fit text-blue-600 text-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="underline">
                        {getFileName(attachmentUrl)}
                      </span>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
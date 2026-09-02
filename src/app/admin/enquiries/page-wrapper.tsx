"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { markEnquiryAsReadAction } from "../actions";
import { Check, Clock, Mail, MessageSquare, Phone, X } from "lucide-react";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  enquiries: Enquiry[];
}

export function EnquiriesPageWrapper({ enquiries }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markEnquiryAsReadAction(id);
    });
  };

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-[var(--color-muted-foreground)] mb-3 sm:mb-4" />
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">No enquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:gap-3">
      {enquiries.map((enquiry) => (
        <Card
          key={enquiry.id}
          className={`hover:border-[var(--color-accent)]/50 transition-colors ${
            !enquiry.is_read ? "border-l-4 border-l-[var(--color-accent)]" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 p-2 sm:p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-[family-name:var(--font-heading)] text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                  {enquiry.name}
                </h3>
                {!enquiry.is_read && (
                  <span className="px-1 sm:px-1.5 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-[9px] sm:text-[10px] font-medium shrink-0">
                    New
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)]">
                <span className="flex items-center gap-0.5">
                  <Phone className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                  {enquiry.phone}
                </span>
                {enquiry.email && (
                  <span className="flex items-center gap-0.5 truncate">
                    <Mail className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                    {enquiry.email}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                  {new Date(enquiry.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {!enquiry.is_read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(enquiry.id)}
                disabled={isPending}
                className="text-[var(--color-accent)] border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 h-6 sm:h-7 text-[9px] sm:text-[10px] shrink-0 ml-1"
              >
                <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                <span className="hidden sm:inline">Mark Read</span>
                <span className="sm:hidden">Read</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0">
            <div className="bg-[var(--color-muted)]/30 rounded-lg p-1.5 sm:p-2">
              <p className="text-[9px] sm:text-[10px] text-[var(--color-foreground)] leading-relaxed line-clamp-2">
                {enquiry.message}
              </p>
            </div>
            <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 h-6 sm:h-7 text-[9px] sm:text-[10px]"
              >
                <a
                  href={`https://wa.me/91${enquiry.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                  WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 h-6 sm:h-7 text-[9px] sm:text-[10px]"
              >
                <a href={`tel:${enquiry.phone}`}>
                  <Phone className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                  Call
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
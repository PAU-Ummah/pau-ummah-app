"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy, X } from "lucide-react";

export interface DonateModalProps {
  accountName: string;
  accountNumber: string;
  bankName: string;
  label?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
}

export function DonateModal({
  accountName,
  accountNumber,
  bankName,
  label = "Donate Now",
  triggerVariant = "secondary",
  triggerSize = "default",
  triggerClassName,
}: DonateModalProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // no-op; in rare cases clipboard APIs may be blocked
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={cn("shadow-floating", triggerClassName)}
        >
          {label}
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl focus:outline-none",
        )}>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="space-y-5">
            <div className="space-y-1">
              <DialogPrimitive.Title className="text-lg font-bold text-[var(--brand-primary)]">
                Donation Details
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-slate-600">
                Use the details below to make a transfer.
              </DialogPrimitive.Description>
            </div>

            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Account Name</span>
                <span className="text-sm font-semibold text-slate-800">{accountName}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Account Number</span>
                  <span className="text-base font-semibold tracking-wider text-slate-900">{accountNumber}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Bank</span>
                <span className="text-sm font-semibold text-slate-800">{bankName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Jazaakallahu Khayran for your generosity. May it be accepted and multiplied Allahuma Aameen.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

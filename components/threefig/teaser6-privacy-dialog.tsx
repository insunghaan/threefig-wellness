"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface Teaser6PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Teaser6PrivacyDialog({
  open,
  onOpenChange,
}: Teaser6PrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="teaser6-privacy-dialog" showCloseButton={true}>
        <DialogTitle className="teaser6-dialog-title">
          Your inbox. Your call.
        </DialogTitle>
        <DialogDescription className="teaser6-dialog-desc">
          Join the waitlist and we’ll keep your email only to send occasional
          3fig product updates and launch notifications. We never sell your data. Unsubscribe anytime.
        </DialogDescription>
        <div className="teaser6-dialog-body-text">
          <p>
            We use Google Analytics and Microsoft Clarity to understand website
            usage, and the Meta Pixel to measure visits and successful waitlist
            registrations from our ads. We do not include your email address in
            Meta event parameters.
          </p>
          <p>
            3fig supports everyday skin wellness. It is not a medical device and
            does not diagnose, treat, or prevent any medical condition.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

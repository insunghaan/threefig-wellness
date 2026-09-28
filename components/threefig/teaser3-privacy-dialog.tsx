"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface Teaser3PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Teaser3PrivacyDialog({
  open,
  onOpenChange,
}: Teaser3PrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="teaser3-privacy-dialog" showCloseButton={true}>
        <DialogTitle className="teaser3-dialog-title">
          Your inbox. Your call.
        </DialogTitle>
        <DialogDescription className="teaser3-dialog-desc">
          Join the launch list and we’ll keep your email only to send occasional
          3fig product updates. We never sell it. Leave anytime.
        </DialogDescription>
        <div className="teaser3-dialog-body-text">
          <p>
            We use Google Analytics and Microsoft Clarity to understand website
            usage, and the Meta Pixel to measure visits and successful new
            waitlist registrations from our ads. We do not include your email
            address in Meta event parameters.
          </p>
          <p>
            3fig supports everyday wellness. It does not diagnose, prevent or
            treat medical conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

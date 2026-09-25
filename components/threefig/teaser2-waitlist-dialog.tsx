"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Sparkles, Loader2, BadgePercent } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "./analytics";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";

export interface Teaser2WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function Teaser2WaitlistDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  onSuccess,
}: Teaser2WaitlistDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<"register" | "optional_survey" | "confirmed">("register");

  // Optional survey state
  const [interestReason, setInterestReason] = useState("");
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  // Hidden 20% Exit Interception state
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [hasShownExitOffer, setHasShownExitOffer] = useState(false);

  const submitting = useRef(false);
  const attributionRef = useRef<Attribution | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setShowExitOffer(false);
    }
  }, [open]);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  useEffect(() => {
    attributionRef.current = captureBrowserAttribution();
  }, []);

  // STEP 1: Save Email Registration Immediately
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    submitting.current = true;
    setStatus("submitting");
    setErrorMessage("");

    try {
      const clientTimezone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
          : "";
      const clientLanguage =
        typeof navigator !== "undefined" ? navigator.language || "" : "";

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          attribution: attributionRef.current || captureBrowserAttribution(),
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save your email. Please try again.");
      }

      if (result.created === true) {
        trackEvent("generate_lead", { lead_source: "waitlist_teaser2" });
      }

      setStatus("success");
      setStep("confirmed");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      submitting.current = false;
    }
  }

  // Handle Dialog Close Interception (Exit Offer)
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      // If user has not completed registration and hasn't seen the exit offer yet
      if (step === "register" && status !== "success" && !showExitOffer && !hasShownExitOffer) {
        setShowExitOffer(true);
        setHasShownExitOffer(true);
        return;
      }
      handleClose();
    } else {
      onOpenChange(true);
    }
  }

  function handleResumeFromExitOffer() {
    setShowExitOffer(false);
  }

  function handleDismissExitOffer() {
    handleClose();
  }

  function handleClose() {
    setStatus("idle");
    setStep("register");
    setErrorMessage("");
    setShowExitOffer(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="fig-dialog teaser2-dialog-content"
        showCloseButton={true}
      >
        {/* State A: Registration Confirmed */}
        {step === "confirmed" ? (
          <div className="teaser2-dialog-success">
            <div className="teaser2-dialog-badge-wrap">
              <span className="teaser2-dialog-success-icon">
                <Check size={26} strokeWidth={2.5} />
              </span>
            </div>
            <DialogTitle className="teaser2-dialog-title">You’re on the early list.</DialogTitle>
            <DialogDescription className="teaser2-dialog-desc">
              Your founding spot is reserved. We’ll notify you first when beta reservations open, with free 3FIG membership for life.
            </DialogDescription>

            <div className="teaser2-dialog-perks-box">
              <div className="teaser2-dialog-perk-row">
                <Sparkles size={16} />
                <span>Free 3FIG membership for life</span>
              </div>
              <div className="teaser2-dialog-perk-row">
                <Check size={16} />
                <span>Priority beta hardware reservation queue</span>
              </div>
            </div>

            <button
              type="button"
              className="teaser2-dialog-submit-btn"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : showExitOffer ? (
          /* State B: Hidden 20% Discount Exit Interception */
          <div className="teaser2-dialog-exit-wrap">
            <div className="teaser2-dialog-header">
              <span className="teaser2-dialog-exit-eyebrow">ONE MORE THING</span>
              <DialogTitle className="teaser2-dialog-title">20% off your ring.</DialogTitle>
              <DialogDescription className="teaser2-dialog-desc">
                Finish your early-access signup and we’ll add 20% off your 3FIG ring.
              </DialogDescription>
            </div>

            <div className="teaser2-dialog-exit-perk">
              <div className="teaser2-exit-perk-icon">
                <BadgePercent size={22} />
              </div>
              <div className="teaser2-exit-perk-text">
                <strong>20% Off Hardware at Launch</strong>
                <p>Reserved alongside your free lifetime membership.</p>
              </div>
            </div>

            <div className="teaser2-dialog-exit-actions">
              <button
                type="button"
                className="teaser2-dialog-submit-btn"
                onClick={handleResumeFromExitOffer}
              >
                <span>Add My 20%</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="teaser2-dialog-secondary-btn"
                onClick={handleDismissExitOffer}
              >
                Maybe later
              </button>
            </div>
          </div>
        ) : (
          /* State C: Primary Step 1 Registration Form */
          <form className="teaser2-dialog-form" onSubmit={handleRegister}>
            <div className="teaser2-dialog-header">
              <span className="teaser2-dialog-eyebrow">YOUR EARLY-ACCESS BENEFIT</span>
              <DialogTitle className="teaser2-dialog-title">Free for life.</DialogTitle>
              <DialogDescription className="teaser2-dialog-desc">
                Complete your registration to secure free lifetime 3FIG membership.
              </DialogDescription>
            </div>

            <div className="teaser2-dialog-fields">
              <div className="teaser2-input-group">
                <label htmlFor="t2-email-input" className="teaser2-input-label">
                  Email address
                </label>
                <input
                  id="t2-email-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="teaser2-text-input"
                  disabled={status === "submitting"}
                  autoFocus
                />
              </div>

              {errorMessage && (
                <p className="teaser2-dialog-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="teaser2-dialog-submit-btn"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Securing access...</span>
                  </>
                ) : (
                  <>
                    <span>Claim Free Lifetime Access</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <p className="teaser2-dialog-microcopy">
              Membership only. Ring sold separately.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

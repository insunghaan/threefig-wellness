"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Loader2, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { trackEvent } from "./analytics";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";

export interface Teaser3WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  emailDraft?: string;
  onEmailDraftChange?: (email: string) => void;
  selectedOffer?: string | null;
  onOfferSelect?: (offer: string | null) => void;
  triggerElement?: HTMLElement | null;
  onSuccess?: () => void;
}

type DialogView = "signup" | "exit-offer" | "confirmed" | "already-registered";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Teaser3WaitlistDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  emailDraft,
  onEmailDraftChange,
  selectedOffer,
  onOfferSelect,
  triggerElement,
  onSuccess,
}: Teaser3WaitlistDialogProps) {
  const [internalEmail, setInternalEmail] = useState(defaultEmail);
  const email = emailDraft !== undefined ? emailDraft : internalEmail;

  const updateEmail = (val: string) => {
    setInternalEmail(val);
    onEmailDraftChange?.(val);
  };

  const [view, setView] = useState<DialogView>("signup");
  const [inputStatus, setInputStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const submitting = useRef(false);
  const attributionRef = useRef<Attribution | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Reset view & errors when opened, but keep email draft intact
  useEffect(() => {
    if (open) {
      setView("signup");
      setErrorMessage("");
      setInputStatus("idle");
    }
  }, [open]);

  useEffect(() => {
    if (defaultEmail && emailDraft === undefined) {
      setInternalEmail(defaultEmail);
    }
  }, [defaultEmail, emailDraft]);

  useEffect(() => {
    attributionRef.current = captureBrowserAttribution();
    if (typeof window !== "undefined") {
      (window as unknown as { __setTeaser3DialogView?: (v: DialogView) => void }).__setTeaser3DialogView = setView;
    }
  }, []);

  // Restore focus to original trigger without unexpected scrolling
  function handleRestoreFocus() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        let target = triggerElement;
        if (
          !target ||
          !document.body.contains(target) ||
          target.getAttribute("aria-hidden") === "true" ||
          target.tabIndex === -1 ||
          (target as HTMLButtonElement).disabled
        ) {
          const isMobile = typeof window !== "undefined" && window.innerWidth <= 860;
          target = isMobile
            ? (document.querySelector(".teaser3-mobile-btn") as HTMLElement)
            : (document.querySelector(".teaser3-desktop-btn") as HTMLElement);
        }
        if (target && typeof target.focus === "function") {
          target.focus({ preventScroll: true });
        }
      }, 70);
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }

    submitting.current = true;
    setInputStatus("submitting");
    setErrorMessage("");

    try {
      const clientTimezone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
          : "";
      const clientLanguage =
        typeof navigator !== "undefined" ? navigator.language || "" : "";

      const currentAttribution = attributionRef.current || captureBrowserAttribution();
      const payloadAttribution = selectedOffer
        ? { ...currentAttribution, offer: selectedOffer }
        : currentAttribution;

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          attribution: payloadAttribution,
          survey: selectedOffer ? { subscription_preference: selectedOffer } : undefined,
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });

      const result = (await response.json()) as { message?: string; error?: string; created?: boolean };
      if (!response.ok) {
        throw new Error(result.error || "Unable to save your spot. Please try again.");
      }

      if (result.created === true) {
        trackEvent("generate_lead", {
          lead_source: "teaser3_waitlist",
          offer: selectedOffer || "standard",
        });
        setView("confirmed");
        // Clear draft only on successful submission
        updateEmail("");
      } else {
        // Already registered email
        setView("already-registered");
      }

      setInputStatus("idle");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
      setInputStatus("error");
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    } finally {
      submitting.current = false;
    }
  }

  // Handle open/close requests from Radix (ESC, overlay click)
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      const exitShown =
        typeof window !== "undefined" && sessionStorage.getItem("t3_exit_shown") === "1";

      // If user attempts to close from signup view without success and hasn't seen exit offer yet
      if (view === "signup" && !exitShown) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("t3_exit_shown", "1");
        }
        setView("exit-offer");
        return; // Keep dialog open, show exit offer inside same frame
      }

      handleCloseFinal();
    } else {
      onOpenChange(true);
    }
  }

  // Final dismissal closing the modal completely
  function handleCloseFinal() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("t3_exit_shown", "1");
    }
    onOpenChange(false);
  }

  // From exit offer: return to signup view to claim the 20% offer, preserving draft
  function handleClaimOffer() {
    onOfferSelect?.("early_20_off");
    setView("signup");
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 60);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="teaser3-dialog-overlay" />
        <DialogPrimitive.Content
          className="teaser3-dialog-content"
          aria-describedby="t3-dialog-description"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            handleRestoreFocus();
          }}
        >
          {/* Minimum 44x44px accessible close control */}
          <button
            type="button"
            className="teaser3-dialog-close"
            onClick={() => handleOpenChange(false)}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {/* VIEW 1: INITIAL SIGNUP */}
          {view === "signup" && (
            <div className="teaser3-dialog-inner">
              <span className="teaser3-dialog-eyebrow">3FIG EARLY ACCESS</span>
              <DialogPrimitive.Title className="teaser3-dialog-title">
                App access. Free for life.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-dialog-desc"
              >
                Join the launch list to reserve your founding member spot and enjoy free 3FIG app access for life.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-condition">
                <p>
                  {selectedOffer === "early_20_off"
                    ? "20% ring discount applied upon launch. Zero monthly membership fees for all core wellness signals, insights, and rhythm analysis."
                    : "Zero monthly membership fees for all core wellness signals, insights, and rhythm analysis. Ring purchase required upon launch."}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} noValidate className="teaser3-dialog-form">
                <div className="teaser3-dialog-field">
                  <label htmlFor="t3-waitlist-email" className="teaser3-dialog-label">
                    Email address
                  </label>
                  <input
                    ref={emailInputRef}
                    id="t3-waitlist-email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck="false"
                    className={`teaser3-dialog-input ${errorMessage ? "has-error" : ""}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      updateEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    disabled={inputStatus === "submitting"}
                    aria-describedby={errorMessage ? "t3-email-error" : undefined}
                    aria-invalid={errorMessage ? true : undefined}
                    required
                  />
                  {errorMessage && (
                    <p id="t3-email-error" className="teaser3-dialog-error" role="alert">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="teaser3-dialog-btn-primary"
                  disabled={inputStatus === "submitting"}
                >
                  {inputStatus === "submitting" ? (
                    <>
                      <Loader2 className="teaser3-dialog-spinner" size={18} />
                      <span>Saving your spot...</span>
                    </>
                  ) : (
                    <>
                      <span>Count me in</span>
                      <ArrowRight size={16} className="teaser3-dialog-btn-arrow" />
                    </>
                  )}
                </button>
              </form>

              <p className="teaser3-dialog-privacy">
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          )}

          {/* VIEW 2: EXIT OFFER */}
          {view === "exit-offer" && (
            <div className="teaser3-dialog-inner">
              <span className="teaser3-dialog-eyebrow">YOUR EARLY ACCESS OFFER</span>
              <DialogPrimitive.Title className="teaser3-dialog-title">
                Start with 20% off.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-dialog-desc"
              >
                Join the launch list today to guarantee 20% off your 3FIG smart ring, plus lifetime free app membership upon release.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-condition">
                <p>
                  Zero monthly membership fees for all core wellness signals, rhythm analysis, and skin insights. 20% discount applied automatically at ring launch.
                </p>
              </div>

              <div className="teaser3-dialog-exit-actions">
                <button
                  type="button"
                  className="teaser3-dialog-btn-primary"
                  onClick={handleClaimOffer}
                >
                  <span>Claim my offer</span>
                  <ArrowRight size={16} className="teaser3-dialog-btn-arrow" />
                </button>

                <button
                  type="button"
                  className="teaser3-dialog-btn-secondary"
                  onClick={handleCloseFinal}
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: CONFIRMED SUCCESS */}
          {view === "confirmed" && (
            <div className="teaser3-dialog-inner">
              <span className="teaser3-dialog-eyebrow">FOUNDING MEMBER RESERVED</span>
              <DialogPrimitive.Title className="teaser3-dialog-title">
                You’re on the launch list.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-dialog-desc"
              >
                Your spot is confirmed{email ? <> for <strong>{email}</strong></> : ""}. We’ve reserved your free lifetime app subscription and priority launch access.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-perks">
                <div className="teaser3-dialog-perk-row">
                  <Check size={18} className="teaser3-dialog-check-icon" />
                  <span>Lifetime free app subscription secured</span>
                </div>
                <div className="teaser3-dialog-perk-row">
                  <Check size={18} className="teaser3-dialog-check-icon" />
                  <span>Priority access when ring hardware opens</span>
                </div>
              </div>

              <button
                type="button"
                className="teaser3-dialog-btn-primary"
                onClick={handleCloseFinal}
              >
                Got it
              </button>
            </div>
          )}

          {/* VIEW 4: ALREADY REGISTERED */}
          {view === "already-registered" && (
            <div className="teaser3-dialog-inner">
              <span className="teaser3-dialog-eyebrow">ALREADY RESERVED</span>
              <DialogPrimitive.Title className="teaser3-dialog-title">
                You’re already on the list.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-dialog-desc"
              >
                {email ? <strong>{email}</strong> : "This email"} is already registered as a founding member with lifetime app access secured.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-perks">
                <div className="teaser3-dialog-perk-row">
                  <Check size={18} className="teaser3-dialog-check-icon" />
                  <span>Lifetime free app subscription reserved</span>
                </div>
              </div>

              <button
                type="button"
                className="teaser3-dialog-btn-primary"
                onClick={handleCloseFinal}
              >
                Got it
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

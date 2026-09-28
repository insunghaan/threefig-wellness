"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Loader2, X, Sparkles, ShieldCheck } from "lucide-react";
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

type DialogView =
  | "signup"
  | "exit-offer"
  | "confirmed"
  | "already-registered"
  | "survey"
  | "survey-success";

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
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [inputStatus, setInputStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const submitting = useRef(false);
  const attributionRef = useRef<Attribution | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Optional Survey State
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [intendedUser, setIntendedUser] = useState("");
  const [primaryFeatures, setPrimaryFeatures] = useState<string[]>([]);
  const [subscriptionPreference, setSubscriptionPreference] = useState("");
  const [surveyStatus, setSurveyStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [surveyError, setSurveyError] = useState("");

  const togglePrimaryFeature = (val: string) => {
    setPrimaryFeatures((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  // Reset view & errors when opened, but keep email draft intact
  useEffect(() => {
    if (open) {
      setView("signup");
      setErrorMessage("");
      setInputStatus("idle");
      setSurveyStatus("idle");
      setSurveyError("");
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

      setSubmittedEmail(cleanEmail);

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

  async function handleSurveySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (surveyStatus === "submitting") return;

    const targetEmail = (submittedEmail || email).trim().toLowerCase();
    if (!targetEmail) {
      setView("survey-success");
      return;
    }

    setSurveyStatus("submitting");
    setSurveyError("");

    try {
      const clientTimezone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
          : "";
      const clientLanguage =
        typeof navigator !== "undefined" ? navigator.language || "" : "";
      const currentAttribution = attributionRef.current || captureBrowserAttribution();

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          attribution: currentAttribution,
          survey: {
            gender: gender || undefined,
            age: age || undefined,
            intended_user: intendedUser || undefined,
            primary_feature: primaryFeatures.length > 0 ? primaryFeatures.join(", ") : undefined,
            subscription_preference: subscriptionPreference || undefined,
          },
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(result.error || "Unable to save survey preferences.");
      }



      setSurveyStatus("idle");
      setView("survey-success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSurveyError(msg);
      setSurveyStatus("error");
    }
  }

  // Handle open/close requests from Radix (ESC, overlay click, close button)
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      handleCloseFinal();
    } else {
      onOpenChange(true);
    }
  }

  // Final dismissal closing the modal completely without promotional follow-up
  function handleCloseFinal() {
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

  const displayConfirmedEmail = submittedEmail || email;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="teaser3-dialog-overlay" />
        <DialogPrimitive.Content
          className={`teaser3-dialog-content ${view === "survey" ? "is-survey-mode" : ""}`}
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
              <span className="teaser3-dialog-eyebrow">3fig EARLY ACCESS</span>
              <DialogPrimitive.Title className="teaser3-dialog-title">
                App access. Free for life.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-dialog-desc"
              >
                Join the launch list to reserve your founding member spot and enjoy free 3fig app access for life.
              </DialogPrimitive.Description>

              {/* Enhanced Benefits with Polished Icons */}
              <div className="teaser3-dialog-perks-highlight">
                <div className="teaser3-dialog-perk-card">
                  <div className="teaser3-dialog-perk-icon-wrap" aria-hidden="true">
                    <Sparkles size={18} className="teaser3-dialog-perk-icon" />
                  </div>
                  <div className="teaser3-dialog-perk-info">
                    <strong className="teaser3-dialog-perk-title">Lifetime Free App Access</strong>
                    <p className="teaser3-dialog-perk-desc">
                      Zero monthly membership fees for life as a founding member.
                    </p>
                  </div>
                </div>

                <div className="teaser3-dialog-perk-card">
                  <div className="teaser3-dialog-perk-icon-wrap" aria-hidden="true">
                    <ShieldCheck size={18} className="teaser3-dialog-perk-icon" />
                  </div>
                  <div className="teaser3-dialog-perk-info">
                    <strong className="teaser3-dialog-perk-title">Priority Ring Reservation</strong>
                    <p className="teaser3-dialog-perk-desc">
                      {selectedOffer === "early_20_off"
                        ? "Guaranteed 20% discount on your ring at launch."
                        : "Priority reservation access when ring pre-orders open."}
                    </p>
                  </div>
                </div>
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
                      <span>Get early access</span>
                      <ArrowRight size={16} className="teaser3-dialog-btn-arrow" />
                    </>
                  )}
                </button>
              </form>
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
                Join the launch list today to guarantee 20% off your 3fig smart ring, plus lifetime free app membership upon release.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-perks-highlight">
                <div className="teaser3-dialog-perk-card">
                  <div className="teaser3-dialog-perk-icon-wrap" aria-hidden="true">
                    <Sparkles size={18} className="teaser3-dialog-perk-icon" />
                  </div>
                  <div className="teaser3-dialog-perk-info">
                    <strong className="teaser3-dialog-perk-title">Lifetime Free App Access</strong>
                    <p className="teaser3-dialog-perk-desc">
                      Zero monthly membership fees for life as a founding member.
                    </p>
                  </div>
                </div>

                <div className="teaser3-dialog-perk-card is-highlight">
                  <div className="teaser3-dialog-perk-icon-wrap" aria-hidden="true">
                    <ShieldCheck size={18} className="teaser3-dialog-perk-icon" />
                  </div>
                  <div className="teaser3-dialog-perk-info">
                    <strong className="teaser3-dialog-perk-title">20% Hardware Discount</strong>
                    <p className="teaser3-dialog-perk-desc">
                      Discount applied automatically to your ring at launch.
                    </p>
                  </div>
                </div>
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

          {/* VIEW 3: CONFIRMED SUCCESS (With Optional Survey Prompt) */}
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
                Your spot is confirmed{displayConfirmedEmail ? <> for <strong>{displayConfirmedEmail}</strong></> : ""}. We’ve reserved your free lifetime app subscription and priority launch access.
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

              {/* Optional Survey Invitation Card */}
              <div className="teaser3-survey-invite-card">
                <div className="teaser3-survey-invite-head">
                  <span className="teaser3-survey-invite-badge">OPTIONAL · 1 MINUTE</span>
                  <h4 className="teaser3-survey-invite-title">Help us tailor 3fig to your skin rhythm</h4>
                  <p className="teaser3-survey-invite-desc">
                    Answer 4 quick questions so we can prioritize the features that matter most to you.
                  </p>
                </div>

                <div className="teaser3-survey-invite-actions">
                  <button
                    type="button"
                    className="teaser3-dialog-btn-primary teaser3-survey-start-btn"
                    onClick={() => setView("survey")}
                  >
                    <span>Take quick survey (1 min)</span>
                    <ArrowRight size={16} className="teaser3-dialog-btn-arrow" />
                  </button>

                  <button
                    type="button"
                    className="teaser3-dialog-btn-secondary teaser3-survey-done-btn"
                    onClick={handleCloseFinal}
                  >
                    Done
                  </button>
                </div>
              </div>
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
                {displayConfirmedEmail ? <strong>{displayConfirmedEmail}</strong> : "This email"} is already registered as a founding member with lifetime app access secured.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-perks">
                <div className="teaser3-dialog-perk-row">
                  <Check size={18} className="teaser3-dialog-check-icon" />
                  <span>Lifetime free app subscription reserved</span>
                </div>
              </div>

              {/* Optional Survey Invitation Card */}
              <div className="teaser3-survey-invite-card">
                <div className="teaser3-survey-invite-head">
                  <span className="teaser3-survey-invite-badge">OPTIONAL · 1 MINUTE</span>
                  <h4 className="teaser3-survey-invite-title">Help us tailor 3fig to your skin rhythm</h4>
                  <p className="teaser3-survey-invite-desc">
                    Share your preferences to help guide our upcoming features.
                  </p>
                </div>

                <div className="teaser3-survey-invite-actions">
                  <button
                    type="button"
                    className="teaser3-dialog-btn-primary teaser3-survey-start-btn"
                    onClick={() => setView("survey")}
                  >
                    <span>Take quick survey (1 min)</span>
                    <ArrowRight size={16} className="teaser3-dialog-btn-arrow" />
                  </button>

                  <button
                    type="button"
                    className="teaser3-dialog-btn-secondary teaser3-survey-done-btn"
                    onClick={handleCloseFinal}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: OPTIONAL SURVEY */}
          {view === "survey" && (
            <div className="teaser3-dialog-inner teaser3-survey-inner">
              <div className="teaser3-survey-header">
                <span className="teaser3-dialog-eyebrow">FOUNDING MEMBER SURVEY · OPTIONAL</span>
                <DialogPrimitive.Title className="teaser3-dialog-title">
                  Help us tailor 3fig to you.
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  id="t3-dialog-description"
                  className="teaser3-dialog-desc"
                >
                  Your feedback helps us fine-tune ring insights and priority features before launch.
                </DialogPrimitive.Description>
              </div>

              <form onSubmit={handleSurveySubmit} className="teaser3-survey-form">
                {/* Question 1: Gender */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-label">Gender</span>
                  <div className="teaser3-survey-chips">
                    {[
                      { value: "Female", label: "Female" },
                      { value: "Male", label: "Male" },
                      { value: "Non-binary", label: "Non-binary" },
                      { value: "Prefer not to say", label: "Prefer not to say" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`teaser3-survey-chip ${gender === opt.value ? "is-selected" : ""}`}
                        onClick={() => setGender(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Age */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-label">Age</span>
                  <div className="teaser3-survey-chips">
                    {["Under 20", "20–29", "30–39", "40–49", "50+"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser3-survey-chip ${age === opt ? "is-selected" : ""}`}
                        onClick={() => setAge(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Who will use */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-label">Who will use this 3fig?</span>
                  <div className="teaser3-survey-chips">
                    {[
                      { value: "For myself", label: "For myself" },
                      { value: "As a gift", label: "As a gift" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`teaser3-survey-chip ${intendedUser === opt.value ? "is-selected" : ""}`}
                        onClick={() => setIntendedUser(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Primary Features */}
                <div className="teaser3-survey-group">
                  <div className="teaser3-survey-group-header">
                    <span className="teaser3-survey-label">Which feature interests you most?</span>
                    <small className="teaser3-survey-subhint">Select all that apply</small>
                  </div>
                  <div className="teaser3-survey-cards">
                    {[
                      {
                        value: "Sleep analysis",
                        label: "Sleep analysis",
                        hint: "Circadian rhythm & overnight recovery",
                      },
                      {
                        value: "Stress tracking",
                        label: "Stress tracking",
                        hint: "Daily load & heart rate variability",
                      },
                      {
                        value: "Food & nutrition logging",
                        label: "Food & nutrition logging",
                        hint: "Meal patterns aligned with skin responses",
                      },
                    ].map((opt) => {
                      const isSelected = primaryFeatures.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`teaser3-survey-card ${isSelected ? "is-selected" : ""}`}
                          onClick={() => togglePrimaryFeature(opt.value)}
                        >
                          <div className="teaser3-survey-card-check">
                            <Check size={14} />
                          </div>
                          <div className="teaser3-survey-card-text">
                            <strong>{opt.label}</strong>
                            <small>{opt.hint}</small>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 5: Budget / Subscription expectation */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-label">Target subscription expectation</span>
                  <div className="teaser3-survey-cards">
                    {[
                      {
                        value: "$5/mo - Basic (Sleep Analysis, Stress Tracking)",
                        label: "$5 / month · Basic",
                        hint: "Sleep Analysis, Stress Tracking",
                      },
                      {
                        value: "$8/mo - Premium (Basic + Menstrual Cycle, Temperature Tracking)",
                        label: "$8 / month · Premium",
                        hint: "Basic + Menstrual Cycle, Temperature Tracking",
                      },
                    ].map((opt) => {
                      const isSelected = subscriptionPreference === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`teaser3-survey-card ${isSelected ? "is-selected" : ""}`}
                          onClick={() => setSubscriptionPreference(opt.value)}
                        >
                          <div className="teaser3-survey-card-check">
                            <Check size={14} />
                          </div>
                          <div className="teaser3-survey-card-text">
                            <strong>{opt.label}</strong>
                            <small>{opt.hint}</small>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {surveyError && (
                  <p className="teaser3-dialog-error" role="alert">
                    {surveyError}
                  </p>
                )}

                <div className="teaser3-survey-form-actions">
                  <button
                    type="submit"
                    className="teaser3-dialog-btn-primary"
                    disabled={surveyStatus === "submitting"}
                  >
                    {surveyStatus === "submitting" ? (
                      <>
                        <Loader2 className="teaser3-dialog-spinner" size={18} />
                        <span>Saving preferences...</span>
                      </>
                    ) : (
                      <>
                        <span>Save preferences</span>
                        <ArrowRight size={16} className="teaser3-dialog-btn-arrow" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="teaser3-dialog-btn-secondary"
                    onClick={handleCloseFinal}
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 6: SURVEY SUCCESS */}
          {view === "survey-success" && (
            <div className="teaser3-dialog-inner">
              <span className="teaser3-dialog-eyebrow">PREFERENCES RECORDED</span>
              <DialogPrimitive.Title className="teaser3-dialog-title">
                Thank you for your input!
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-dialog-desc"
              >
                Your preferences have been saved. We’re excited to have you with us on the journey to launching 3fig.
              </DialogPrimitive.Description>

              <div className="teaser3-dialog-perks">
                <div className="teaser3-dialog-perk-row">
                  <Check size={18} className="teaser3-dialog-check-icon" />
                  <span>Founding member reservation active</span>
                </div>
                <div className="teaser3-dialog-perk-row">
                  <Check size={18} className="teaser3-dialog-check-icon" />
                  <span>Product preferences recorded</span>
                </div>
              </div>

              <button
                type="button"
                className="teaser3-dialog-btn-primary"
                onClick={handleCloseFinal}
              >
                Done
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

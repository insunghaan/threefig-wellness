"use client";

import React, { useState, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, X, Loader2 } from "lucide-react";
import { trackEvent } from "./analytics";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";

export type Teaser3DialogView =
  | "signup"
  | "confirmed"
  | "already-registered"
  | "survey"
  | "survey-success";

export interface Teaser3WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSource?: string;
  defaultEmail?: string;
  emailDraft?: string;
  onEmailDraftChange?: (email: string) => void;
  selectedOffer?: string | null;
  onOfferSelect?: (offer: string | null) => void;
  triggerElement?: HTMLElement | null;
  onSuccess?: () => void;
}

export function Teaser3WaitlistDialog({
  open,
  onOpenChange,
  initialSource = "teaser3_waitlist",
  defaultEmail = "",
  emailDraft,
  onEmailDraftChange,
  triggerElement,
  onSuccess,
}: Teaser3WaitlistDialogProps) {
  const [view, setView] = useState<Teaser3DialogView>("signup");
  const [internalEmail, setInternalEmail] = useState(defaultEmail);
  const email = emailDraft !== undefined ? emailDraft : internalEmail;

  const updateEmail = (val: string) => {
    setInternalEmail(val);
    onEmailDraftChange?.(val);
  };

  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [displayConfirmedEmail, setDisplayConfirmedEmail] = useState("");

  const attributionRef = useRef<Attribution | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Optional Survey state
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [intendedUser, setIntendedUser] = useState("");
  const [primaryFeatures, setPrimaryFeatures] = useState<string[]>([]);
  const [subscriptionPreference, setSubscriptionPreference] = useState("");
  const [isSurveySubmitting, setIsSurveySubmitting] = useState(false);
  const [surveyError, setSurveyError] = useState("");

  useEffect(() => {
    attributionRef.current = captureBrowserAttribution();
  }, []);

  // Sync defaultEmail when open
  useEffect(() => {
    if (defaultEmail && emailDraft === undefined) {
      setInternalEmail(defaultEmail);
    }
  }, [defaultEmail, emailDraft]);

  // Reset form state when dialog opens
  useEffect(() => {
    if (open) {
      setView("signup");
      setEmailError("");
      setServerError("");
      setSurveyError("");
      setGender("");
      setAge("");
      setIntendedUser("");
      setPrimaryFeatures([]);
      setSubscriptionPreference("");
    }
  }, [open]);

  // Restore focus to original trigger when closed
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
      }, 60);
    });
  }

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }
    setEmailError("");
    setServerError("");
    setIsSubmitting(true);

    const clientTimezone =
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        : "";
    const clientLanguage =
      typeof navigator !== "undefined" ? navigator.language || "" : "";

    const currentAttribution = attributionRef.current || captureBrowserAttribution();
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          attribution: {
            ...currentAttribution,
            lead_source: initialSource,
          },
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string; created?: boolean };

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setDisplayConfirmedEmail(cleanEmail);

      // Track lead generation
      if (data.created === true) {
        trackEvent("generate_lead", {
          lead_source: initialSource,
          offer: "lifetime_free_and_20_off",
        });
        setView("confirmed");
        onSuccess?.();
      } else {
        setView("already-registered");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (val: string) => {
    setPrimaryFeatures((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSurveySubmitting(true);
    setSurveyError("");

    const surveyData = {
      ...(gender ? { gender } : {}),
      ...(age ? { age } : {}),
      ...(intendedUser ? { intended_user: intendedUser } : {}),
      ...(primaryFeatures.length > 0 ? { primary_feature: primaryFeatures.join(", ") } : {}),
      ...(subscriptionPreference ? { subscription_preference: subscriptionPreference } : {}),
    };

    const clientTimezone =
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        : "";
    const clientLanguage =
      typeof navigator !== "undefined" ? navigator.language || "" : "";
    const currentAttribution = attributionRef.current || captureBrowserAttribution();

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: displayConfirmedEmail || email.trim().toLowerCase(),
          attribution: {
            ...currentAttribution,
            lead_source: `${initialSource}_survey`,
          },
          survey: surveyData,
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Unable to save survey response.");
      }

      setView("survey-success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving survey. Please try again.";
      setSurveyError(msg);
    } finally {
      setIsSurveySubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
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
          {/* Circular Close Button */}
          <DialogPrimitive.Close className="teaser3-dialog-close" aria-label="Close dialog">
            <X size={18} />
          </DialogPrimitive.Close>

          {/* VIEW 1: SIGNUP FORM (Dual Panel on Desktop, Top Banner on Mobile) */}
          {view === "signup" && (
            <div className="teaser3-modal-grid">
              {/* Desktop Left Aside: Background Image + Semi-transparent dark overlay + Benefits */}
              <aside className="teaser3-modal-aside" aria-hidden="true">
                <img
                  src="/images/teaser3/modal-aside-desktop.png"
                  alt=""
                  className="teaser3-modal-aside-bg"
                />
                {/* Semi-transparent dark overlay for high text contrast */}
                <div className="teaser3-modal-aside-overlay" />

                <div className="teaser3-modal-aside-content">
                  <p className="teaser3-modal-aside-eyebrow">3FIG EARLY ACCESS</p>
                  <h3 className="teaser3-modal-aside-title">
                    No app fees.<br />For life.
                  </h3>
                  <p className="teaser3-modal-aside-subtitle">YOUR WAITLIST BENEFITS</p>
                  <ul className="teaser3-modal-aside-list">
                    <li>
                      <strong>20% off</strong> the ring at launch
                    </li>
                    <li>
                      <strong>Free lifetime</strong> app subscription
                    </li>
                  </ul>
                </div>
              </aside>

              {/* Mobile-Only Top Banner Header: Landscape image with dark overlay */}
              <div className="teaser3-modal-banner-header" aria-hidden="true">
                <img
                  src="/images/teaser3/modal-banner-mobile.png"
                  alt=""
                  className="teaser3-modal-banner-img"
                />
                {/* Semi-transparent dark overlay for high text contrast */}
                <div className="teaser3-modal-banner-overlay" />

                {/* Header Text Overlay */}
                <div className="teaser3-modal-banner-content">
                  <p className="teaser3-modal-banner-eyebrow">WAITLIST BENEFITS</p>
                  <h3 className="teaser3-modal-banner-title">
                    <span>20% off the ring at launch</span>
                    <span className="teaser3-modal-banner-divider">·</span>
                    <span>Free lifetime app subscription</span>
                  </h3>
                </div>
              </div>

              {/* Lower / Right Form Section */}
              <div className="teaser3-modal-form-body">
                <p className="teaser3-modal-eyebrow">JOIN THE WAITLIST</p>
                <DialogPrimitive.Title asChild>
                  <h2 className="teaser3-modal-title">Join now. Never pay app subscription fees.</h2>
                </DialogPrimitive.Title>
                <DialogPrimitive.Description id="t3-dialog-description" className="teaser3-modal-desc">
                  Get 20% off the ring at launch + a free lifetime app subscription.
                </DialogPrimitive.Description>

                {/* Signup Form */}
                <form
                  onSubmit={handleEmailSubmit}
                  className="teaser3-waitlist-form"
                  noValidate
                >
                  <div className="teaser3-form-group">
                    <label htmlFor="t3-modal-email" className="teaser3-form-label">
                      Email address
                    </label>
                    <input
                      ref={emailInputRef}
                      id="t3-modal-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        updateEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      className={`teaser3-form-input ${emailError ? "has-error" : ""}`}
                      disabled={isSubmitting}
                      required
                    />
                    {emailError && (
                      <p className="teaser3-form-error" role="alert">
                        {emailError}
                      </p>
                    )}
                    {serverError && (
                      <p className="teaser3-form-error" role="alert">
                        {serverError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="teaser3-form-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="teaser3-spinner" />
                        <span>Reserving spot...</span>
                      </>
                    ) : (
                      <span>Join the waitlist</span>
                    )}
                  </button>

                  <p className="teaser3-reassurance">
                    No spam. Priority access when reservations open.
                  </p>
                </form>
              </div>
            </div>
          )}

          {/* VIEW 2: CONFIRMED SUCCESS */}
          {view === "confirmed" && (
            <div className="teaser3-modal-confirmed">
              <span className="teaser3-modal-eyebrow">FOUNDING MEMBER RESERVED</span>
              <DialogPrimitive.Title asChild>
                <h2>You’re on the launch list.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-confirm-lead"
              >
                Your spot is confirmed{displayConfirmedEmail ? <> for <strong>{displayConfirmedEmail}</strong></> : ""}.
                We’ve reserved your free lifetime app subscription and 20% discount on the ring at launch.
              </DialogPrimitive.Description>

              <div className="teaser3-perks-confirmed">
                <div className="teaser3-perk-row">
                  <span className="teaser3-check-badge">✓</span>
                  <span>Lifetime free app subscription secured</span>
                </div>
                <div className="teaser3-perk-row">
                  <span className="teaser3-check-badge">✓</span>
                  <span>20% off hardware when launch orders open</span>
                </div>
              </div>

              {/* Optional Survey Invitation Card */}
              <div className="teaser3-survey-invite-card">
                <span className="teaser3-survey-badge">OPTIONAL · 1 MINUTE</span>
                <h4>Help us tailor 3fig to your skin rhythm</h4>
                <p>
                  Answer 4 quick questions so we can prioritize the features that matter most to you.
                </p>

                <div className="teaser3-survey-actions">
                  <button
                    type="button"
                    className="teaser3-btn-primary-12"
                    onClick={() => setView("survey")}
                  >
                    <span>Take quick survey (1 min)</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="teaser3-btn-secondary-12"
                    onClick={() => onOpenChange(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: ALREADY REGISTERED */}
          {view === "already-registered" && (
            <div className="teaser3-modal-confirmed">
              <span className="teaser3-modal-eyebrow">ALREADY RESERVED</span>
              <DialogPrimitive.Title asChild>
                <h2>You’re already on the list.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-confirm-lead"
              >
                {displayConfirmedEmail ? <strong>{displayConfirmedEmail}</strong> : "This email"} is already registered as a founding member with lifetime app access secured.
              </DialogPrimitive.Description>

              <div className="teaser3-perks-confirmed">
                <div className="teaser3-perk-row">
                  <span className="teaser3-check-badge">✓</span>
                  <span>Lifetime free app subscription secured</span>
                </div>
              </div>

              {/* Optional Survey Invitation Card */}
              <div className="teaser3-survey-invite-card">
                <span className="teaser3-survey-badge">OPTIONAL · 1 MINUTE</span>
                <h4>Help us tailor 3fig to your skin rhythm</h4>
                <p>
                  Share your preferences to help guide our upcoming features.
                </p>

                <div className="teaser3-survey-actions">
                  <button
                    type="button"
                    className="teaser3-btn-primary-12"
                    onClick={() => setView("survey")}
                  >
                    <span>Take quick survey (1 min)</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="teaser3-btn-secondary-12"
                    onClick={() => onOpenChange(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: OPTIONAL SURVEY */}
          {view === "survey" && (
            <div className="teaser3-survey-content">
              <span className="teaser3-modal-eyebrow">FOUNDING MEMBER SURVEY · OPTIONAL</span>
              <DialogPrimitive.Title asChild>
                <h2>Help us tailor 3fig to you.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description id="t3-dialog-description" className="teaser3-survey-sub">
                Your feedback helps us fine-tune ring insights and priority features before launch.
              </DialogPrimitive.Description>

              <form onSubmit={handleSurveySubmit} className="teaser3-survey-form">
                {/* Question 1: Gender */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-q-label">Gender</span>
                  <div className="teaser3-survey-chips">
                    {["Female", "Male", "Non-binary", "Prefer not to say"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser3-survey-chip ${gender === opt ? "is-selected" : ""}`}
                        onClick={() => setGender(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Age */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-q-label">Age</span>
                  <div className="teaser3-survey-chips">
                    {["Under 25", "25–34", "35–44", "45–54", "55+"].map((opt) => (
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

                {/* Question 3: Who will use this 3fig? */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-q-label">Who will use this 3fig?</span>
                  <div className="teaser3-survey-chips">
                    {["For myself", "Gift for someone", "Both"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser3-survey-chip ${intendedUser === opt ? "is-selected" : ""}`}
                        onClick={() => setIntendedUser(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Primary Features */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-q-label">Which feature interests you most? (Select all that apply)</span>
                  <div className="teaser3-survey-chips">
                    {[
                      "Skin Balance score",
                      "Sleep & recovery tracking",
                      "Barrier protection guidance",
                      "Habit & rhythm correlation",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser3-survey-chip ${primaryFeatures.includes(opt) ? "is-selected" : ""}`}
                        onClick={() => toggleFeature(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 5: Subscription expectation */}
                <div className="teaser3-survey-group">
                  <span className="teaser3-survey-q-label">Target subscription expectation</span>
                  <div className="teaser3-survey-chips">
                    {["$0/mo (Free tier)", "$5–$10/mo", "$10–$15/mo", "Don't know yet"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser3-survey-chip ${subscriptionPreference === opt ? "is-selected" : ""}`}
                        onClick={() => setSubscriptionPreference(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {surveyError && (
                  <p className="teaser3-form-error" role="alert">
                    {surveyError}
                  </p>
                )}

                <div className="teaser3-survey-submit-actions">
                  <button
                    type="submit"
                    className="teaser3-btn-primary-12"
                    disabled={isSurveySubmitting}
                  >
                    {isSurveySubmitting ? (
                      <>
                        <Loader2 size={15} className="teaser3-spinner" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Submit preferences</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="teaser3-btn-secondary-12"
                    onClick={() => onOpenChange(false)}
                  >
                    Skip
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 5: SURVEY SUCCESS */}
          {view === "survey-success" && (
            <div className="teaser3-modal-confirmed">
              <span className="teaser3-modal-eyebrow">THANK YOU</span>
              <DialogPrimitive.Title asChild>
                <h2>Preferences saved.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t3-dialog-description"
                className="teaser3-confirm-lead"
              >
                We’ll use your answers to refine 3fig for your launch experience.
              </DialogPrimitive.Description>
              <div style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="teaser3-btn-primary-12"
                  onClick={() => onOpenChange(false)}
                  style={{ width: "100%" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, ArrowRight, X, Loader2 } from "lucide-react";
import { trackEvent } from "./analytics";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";

export type Teaser4DialogView =
  | "signup"
  | "confirmed"
  | "already-registered"
  | "survey"
  | "survey-success";

interface Teaser4WaitlistDialogProps {
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

export function Teaser4WaitlistDialog({
  open,
  onOpenChange,
  initialSource = "teaser4_waitlist",
}: Teaser4WaitlistDialogProps) {
  const [view, setView] = useState<Teaser4DialogView>("signup");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [displayConfirmedEmail, setDisplayConfirmedEmail] = useState("");

  const attributionRef = useRef<Attribution | null>(null);

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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setView("signup");
      setEmail("");
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
        <DialogPrimitive.Overlay className="teaser4-dialog-overlay" />
        <DialogPrimitive.Content
          className={`teaser4-dialog-content ${view === "survey" ? "is-survey-mode" : ""}`}
          aria-describedby="teaser4-dialog-desc"
        >
          {/* Circular Close Button */}
          <DialogPrimitive.Close className="teaser4-dialog-close" aria-label="Close dialog">
            <X size={18} />
          </DialogPrimitive.Close>

          {/* VIEW 1: SIGNUP FORM (Full-size Banner Header with Benefits + Form Body) */}
          {view === "signup" && (
            <div className="teaser4-modal-card">
              {/* Top Banner Header: Full-size background image with Waitlist Benefits */}
              <div className="teaser4-modal-banner-header">
                <picture className="teaser4-modal-banner-picture">
                  <source
                    media="(max-width: 640px)"
                    srcSet="/images/teaser4/modal-banner-mobile.png"
                  />
                  <img
                    src="/images/teaser4/modal-banner-desktop.png"
                    alt=""
                    className="teaser4-modal-banner-img"
                  />
                </picture>

                {/* Dark semi-opaque overlay for high text contrast */}
                <div className="teaser4-modal-banner-overlay" />

                {/* Header Text Overlay */}
                <div className="teaser4-modal-banner-content">
                  <p className="teaser4-modal-banner-eyebrow">WAITLIST BENEFITS</p>
                  <h3 className="teaser4-modal-banner-title">
                    <span>20% off the ring at launch</span>
                    <span className="teaser4-modal-banner-divider">·</span>
                    <span>Free lifetime app subscription</span>
                  </h3>
                </div>
              </div>

              {/* Lower Form Section */}
              <div className="teaser4-modal-form-body">
                <p className="eyebrow">JOIN THE WAITLIST</p>
                <DialogPrimitive.Title asChild>
                  <h2>Join now. Never pay app subscription fees.</h2>
                </DialogPrimitive.Title>
                <DialogPrimitive.Description id="teaser4-dialog-desc" className="teaser4-modal-desc">
                  Get 20% off the ring at launch + a free lifetime app subscription.
                </DialogPrimitive.Description>

                {/* Actual Real Production Signup Form */}
                <form
                  onSubmit={handleEmailSubmit}
                  className="teaser4-waitlist-form"
                  noValidate
                >
                  <div className="teaser4-form-group">
                    <label htmlFor="t4-modal-email" className="teaser4-form-label">
                      Email address
                    </label>
                    <input
                      id="t4-modal-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      className={`teaser4-form-input ${emailError ? "has-error" : ""}`}
                      disabled={isSubmitting}
                      required
                    />
                    {emailError && (
                      <p className="teaser4-form-error" role="alert">
                        {emailError}
                      </p>
                    )}
                    {serverError && (
                      <p className="teaser4-form-error" role="alert">
                        {serverError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="button teaser4-form-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Reserving spot...</span>
                      </>
                    ) : (
                      <>
                        <span>Join the waitlist</span>
                        <span>↗</span>
                      </>
                    )}
                  </button>

                  <p className="teaser4-reassurance">
                    No spam. Priority access when reservations open.
                  </p>
                  <p className="teaser4-modal-small-print">
                    No payment required to join. Ring sold separately.
                  </p>
                </form>
              </div>
            </div>
          )}

          {/* VIEW 2: CONFIRMED SUCCESS (With Optional Survey Prompt) */}
          {view === "confirmed" && (
            <div className="teaser4-modal-confirmed">
              <span className="eyebrow">FOUNDING MEMBER RESERVED</span>
              <DialogPrimitive.Title asChild>
                <h2>You’re on the launch list.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="teaser4-dialog-desc"
                className="teaser4-confirm-lead"
              >
                Your spot is confirmed{displayConfirmedEmail ? <> for <strong>{displayConfirmedEmail}</strong></> : ""}.
                We’ve reserved your free lifetime app subscription and 20% discount on the ring at launch.
              </DialogPrimitive.Description>

              <div className="teaser4-perks-confirmed">
                <div className="teaser4-perk-row">
                  <span className="teaser4-check-badge">✓</span>
                  <span>Lifetime free app subscription secured</span>
                </div>
                <div className="teaser4-perk-row">
                  <span className="teaser4-check-badge">✓</span>
                  <span>20% off hardware when launch orders open</span>
                </div>
              </div>

              {/* Optional Survey Invitation Card */}
              <div className="teaser4-survey-invite-card">
                <span className="teaser4-survey-badge">OPTIONAL · 1 MINUTE</span>
                <h4>Help us tailor 3fig to your skin rhythm</h4>
                <p>
                  Answer 4 quick questions so we can prioritize the features that matter most to you.
                </p>

                <div className="teaser4-survey-actions">
                  <button
                    type="button"
                    className="teaser4-btn-primary-12"
                    onClick={() => setView("survey")}
                  >
                    <span>Take quick survey (1 min)</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="teaser4-btn-secondary-12"
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
            <div className="teaser4-modal-confirmed">
              <span className="eyebrow">ALREADY RESERVED</span>
              <DialogPrimitive.Title asChild>
                <h2>You’re already on the list.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="teaser4-dialog-desc"
                className="teaser4-confirm-lead"
              >
                {displayConfirmedEmail ? <strong>{displayConfirmedEmail}</strong> : "This email"} is already registered as a founding member with lifetime app access secured.
              </DialogPrimitive.Description>

              <div className="teaser4-perks-confirmed">
                <div className="teaser4-perk-row">
                  <span className="teaser4-check-badge">✓</span>
                  <span>Lifetime free app subscription secured</span>
                </div>
              </div>

              {/* Optional Survey Invitation Card */}
              <div className="teaser4-survey-invite-card">
                <span className="teaser4-survey-badge">OPTIONAL · 1 MINUTE</span>
                <h4>Help us tailor 3fig to your skin rhythm</h4>
                <p>
                  Share your preferences to help guide our upcoming features.
                </p>

                <div className="teaser4-survey-actions">
                  <button
                    type="button"
                    className="teaser4-btn-primary-12"
                    onClick={() => setView("survey")}
                  >
                    <span>Take quick survey (1 min)</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="teaser4-btn-secondary-12"
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
            <div className="teaser4-survey-content">
              <span className="eyebrow">FOUNDING MEMBER SURVEY · OPTIONAL</span>
              <DialogPrimitive.Title asChild>
                <h2>Help us tailor 3fig to you.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description id="teaser4-dialog-desc" className="survey-sub">
                Your feedback helps us fine-tune ring insights and priority features before launch.
              </DialogPrimitive.Description>

              <form onSubmit={handleSurveySubmit} className="teaser4-survey-form">
                {/* Question 1: Gender */}
                <div className="teaser4-survey-group">
                  <span className="teaser4-survey-q-label">Gender</span>
                  <div className="teaser4-survey-chips">
                    {["Female", "Male", "Non-binary", "Prefer not to say"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser4-survey-chip ${gender === opt ? "is-selected" : ""}`}
                        onClick={() => setGender(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Age */}
                <div className="teaser4-survey-group">
                  <span className="teaser4-survey-q-label">Age</span>
                  <div className="teaser4-survey-chips">
                    {["Under 25", "25–34", "35–44", "45–54", "55+"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser4-survey-chip ${age === opt ? "is-selected" : ""}`}
                        onClick={() => setAge(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Who will use this 3fig? */}
                <div className="teaser4-survey-group">
                  <span className="teaser4-survey-q-label">Who will use this 3fig?</span>
                  <div className="teaser4-survey-chips">
                    {["For myself", "Gift for someone", "Both"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser4-survey-chip ${intendedUser === opt ? "is-selected" : ""}`}
                        onClick={() => setIntendedUser(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Primary Features */}
                <div className="teaser4-survey-group">
                  <span className="teaser4-survey-q-label">Which feature interests you most? (Select all that apply)</span>
                  <div className="teaser4-survey-chips">
                    {[
                      "Skin Balance score",
                      "Sleep & recovery tracking",
                      "Barrier protection guidance",
                      "Habit & rhythm correlation",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser4-survey-chip ${primaryFeatures.includes(opt) ? "is-selected" : ""}`}
                        onClick={() => toggleFeature(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 5: Subscription expectation */}
                <div className="teaser4-survey-group">
                  <span className="teaser4-survey-q-label">Target subscription expectation</span>
                  <div className="teaser4-survey-chips">
                    {["$0/mo (Free tier)", "$5–$10/mo", "$10–$15/mo", "Don't know yet"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`teaser4-survey-chip ${subscriptionPreference === opt ? "is-selected" : ""}`}
                        onClick={() => setSubscriptionPreference(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {surveyError && (
                  <p className="teaser4-form-error" role="alert">
                    {surveyError}
                  </p>
                )}

                <div className="teaser4-survey-submit-actions">
                  <button
                    type="submit"
                    className="teaser4-btn-primary-12"
                    disabled={isSurveySubmitting}
                  >
                    {isSurveySubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Submit preferences</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="teaser4-btn-secondary-12"
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
            <div className="teaser4-modal-confirmed">
              <span className="eyebrow">THANK YOU</span>
              <DialogPrimitive.Title asChild>
                <h2>Preferences saved.</h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="teaser4-dialog-desc"
                className="teaser4-confirm-lead"
              >
                We’ll use your answers to refine 3fig for your launch experience.
              </DialogPrimitive.Description>
              <div style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="teaser4-btn-primary-12"
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

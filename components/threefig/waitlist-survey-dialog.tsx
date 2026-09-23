"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Sparkles, Loader2, Heart, BadgePercent, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "./analytics";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";

export interface WaitlistSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function WaitlistSurveyDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  onSuccess,
}: WaitlistSurveyDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [intendedUser, setIntendedUser] = useState("");
  const [primaryFeature, setPrimaryFeature] = useState("");
  const [subscriptionPreference, setSubscriptionPreference] = useState("");
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [hasShownExitOffer, setHasShownExitOffer] = useState(false);
  const submitting = useRef(false);
  const attributionRef = useRef<Attribution | null>(null);

  useEffect(() => {
    if (open) {
      setShowExitOffer(false);
      setHasShownExitOffer(false);
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

  async function handleSubmit(e: React.FormEvent) {
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
          survey: {
            gender: gender || undefined,
            age: age || undefined,
            intended_user: intendedUser || undefined,
            primary_feature: primaryFeature || undefined,
            subscription_preference: subscriptionPreference || undefined,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save your response. Please try again.");
      }

      if (result.created === true) trackEvent("generate_lead", { lead_source: "waitlist" });
      setStatus("success");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      submitting.current = false;
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (status !== "success" && !showExitOffer && !hasShownExitOffer) {
        setShowExitOffer(true);
        setHasShownExitOffer(true);
        return;
      }
      handleReset();
    } else {
      onOpenChange(true);
    }
  }

  function handleResumeSurvey() {
    setShowExitOffer(false);
  }

  function handleDismiss() {
    handleReset();
  }

  function handleReset() {
    setStatus("idle");
    setErrorMessage("");
    setShowExitOffer(false);
    setHasShownExitOffer(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="fig-dialog skin-survey-dialog" showCloseButton={true}>
        {status === "success" ? (
          <div className="skin-survey-success">
            <div className="skin-survey-badge-wrap">
              <span className="skin-survey-success-icon">
                <Check size={28} strokeWidth={2.5} />
              </span>
            </div>
            <DialogTitle className="skin-survey-title">You’re on the early list.</DialogTitle>
            <DialogDescription className="skin-survey-desc">
              Thank you for sharing your thoughts. Your early spot is reserved, complete with a 20% launch discount, lifetime free subscription, and priority access when reservations open.
            </DialogDescription>
            <div className="skin-survey-perks">
              <div className="skin-survey-perk-item">
                <Sparkles size={16} />
                <span>Lifetime Free Subscription</span>
              </div>
              <div className="skin-survey-perk-item">
                <Heart size={16} />
                <span>20% off device at launch</span>
              </div>
            </div>
            <button
              type="button"
              className="skin-survey-submit-btn skin-survey-done-btn"
              onClick={handleReset}
            >
              Done
            </button>
          </div>
        ) : showExitOffer ? (
          <div className="skin-survey-exit-wrap">
            <div className="skin-survey-header skin-survey-exit-header">
              <span className="skin-survey-exit-kicker-pill">
                <Gift size={14} />
                <span>BEFORE YOU GO · SPECIAL BONUS</span>
              </span>
              <DialogTitle className="skin-survey-title skin-survey-exit-title">
                Unlock an extra 20% off your 3FIG ring.
              </DialogTitle>
              <DialogDescription className="skin-survey-desc skin-survey-exit-desc">
                Don’t leave empty-handed. Take 30 seconds to finish your survey and secure both founding privileges:
              </DialogDescription>
            </div>

            <div className="skin-survey-exit-perks">
              <div className="skin-survey-exit-perk-card is-highlighted">
                <div className="skin-survey-exit-perk-icon">
                  <BadgePercent size={20} />
                </div>
                <div className="skin-survey-exit-perk-text">
                  <span className="skin-survey-exit-perk-badge">SPECIAL BONUS</span>
                  <strong>20% Device Discount at Launch</strong>
                  <p>Save 20% on the 3FIG smart ring when pre-orders open.</p>
                </div>
              </div>

              <div className="skin-survey-exit-perk-card">
                <div className="skin-survey-exit-perk-icon">
                  <Sparkles size={20} />
                </div>
                <div className="skin-survey-exit-perk-text">
                  <span className="skin-survey-exit-perk-badge">FOUNDING PERK</span>
                  <strong>Lifetime Free App Subscription</strong>
                  <p>Full access to sleep, rhythm, and skin signals with zero monthly fees.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="skin-survey-submit-btn skin-survey-exit-continue-btn"
              onClick={handleResumeSurvey}
            >
              Continue Survey & Claim 20% Off <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="skin-survey-exit-dismiss"
              onClick={handleDismiss}
            >
              Maybe next time
            </button>
          </div>
        ) : (
          <form className="skin-survey-form" onSubmit={handleSubmit}>
            <div className="skin-survey-header">
              <p className="skin-survey-kicker">3FIG FOUNDING MEMBER EXCLUSIVE</p>
              <DialogTitle className="skin-survey-title">
                Claim your Lifetime Free Subscription.
              </DialogTitle>
              <DialogDescription className="skin-survey-desc">
                Complete this quick 1-minute survey to secure your founding member spot and enjoy free 3FIG subscription for life.
              </DialogDescription>

              <div className="skin-survey-lifetime-callout">
                <div className="skin-survey-lifetime-icon">
                  <Sparkles size={20} />
                </div>
                <div className="skin-survey-lifetime-content">
                  <span className="skin-survey-lifetime-pill">FOUNDING MEMBER PERK</span>
                  <strong className="skin-survey-lifetime-title">100% Free Subscription For Life</strong>
                  <p className="skin-survey-lifetime-desc">
                    Zero monthly membership fees for all core wellness signals, insights, and rhythm analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="skin-survey-group">
              <label htmlFor="survey-email" className="skin-survey-label">
                Email Address <span className="skin-survey-required">*</span>
              </label>
              <input
                id="survey-email"
                type="email"
                className="skin-survey-input"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
              />
            </div>

            {/* Question 1: Gender */}
            <div className="skin-survey-group">
              <span className="skin-survey-label">Gender</span>
              <div className="skin-survey-chips">
                {[
                  { value: "Female", label: "Female" },
                  { value: "Male", label: "Male" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`skin-survey-chip ${gender === opt.value ? "is-selected" : ""}`}
                    onClick={() => setGender(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Age */}
            <div className="skin-survey-group">
              <span className="skin-survey-label">Age</span>
              <div className="skin-survey-chips">
                {["Under 20", "20–29", "30–39", "40–49", "50+"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`skin-survey-chip ${age === opt ? "is-selected" : ""}`}
                    onClick={() => setAge(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: User */}
            <div className="skin-survey-group">
              <span className="skin-survey-label">Who will use this 3FIG?</span>
              <div className="skin-survey-chips">
                {[
                  { value: "For myself", label: "For myself" },
                  { value: "As a gift", label: "As a gift" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`skin-survey-chip ${intendedUser === opt.value ? "is-selected" : ""}`}
                    onClick={() => setIntendedUser(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Primary Feature */}
            <div className="skin-survey-group">
              <span className="skin-survey-label">Which feature interests you most?</span>
              <div className="skin-survey-cards">
                {[
                  { value: "Sleep analysis", label: "Sleep analysis", hint: "Circadian rhythm & overnight recovery" },
                  { value: "Stress tracking", label: "Stress tracking", hint: "Daily load & heart rate variability" },
                  { value: "Food & nutrition logging", label: "Food & nutrition logging", hint: "Meal patterns aligned with skin responses" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`skin-survey-card ${primaryFeature === opt.value ? "is-selected" : ""}`}
                    onClick={() => setPrimaryFeature(opt.value)}
                  >
                    <div className="skin-survey-card-check">
                      {primaryFeature === opt.value && <Check size={14} />}
                    </div>
                    <div className="skin-survey-card-text">
                      <strong>{opt.label}</strong>
                      <small>{opt.hint}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 5: Budget / Subscription */}
            <div className="skin-survey-group">
              <span className="skin-survey-label">Target subscription expectation</span>
              <div className="skin-survey-cards">
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
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`skin-survey-card ${subscriptionPreference === opt.value ? "is-selected" : ""}`}
                    onClick={() => setSubscriptionPreference(opt.value)}
                  >
                    <div className="skin-survey-card-check">
                      {subscriptionPreference === opt.value && <Check size={14} />}
                    </div>
                    <div className="skin-survey-card-text">
                      <strong>{opt.label}</strong>
                      <small>{opt.hint}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <p className="skin-survey-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="skin-survey-submit-btn"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving your spot…
                </>
              ) : (
                <>
                  Join Early Access <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="skin-survey-footer-note">
              No spam. Unsubscribe anytime. Your responses remain confidential.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

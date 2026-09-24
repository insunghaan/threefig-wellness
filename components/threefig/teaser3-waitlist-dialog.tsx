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

export interface Teaser3WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function Teaser3WaitlistDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  onSuccess,
}: Teaser3WaitlistDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [step, setStep] = useState<"email" | "confirmed">("email");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [intendedUser, setIntendedUser] = useState("");
  const [primaryFeatures, setPrimaryFeatures] = useState<string[]>([]);
  const [surveySaved, setSurveySaved] = useState(false);

  function togglePrimaryFeature(val: string) {
    setPrimaryFeatures((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  }

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [surveyStatus, setSurveyStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showExitOffer, setShowExitOffer] = useState(false);
  const submitting = useRef(false);
  const attributionRef = useRef<Attribution | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setShowExitOffer(false);
    }
  }, [open]);

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop = 0;
    }
  }, [showExitOffer, step]);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  useEffect(() => {
    attributionRef.current = captureBrowserAttribution();
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
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
          email: cleanEmail,
          attribution: attributionRef.current || captureBrowserAttribution(),
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });

      const result = (await response.json()) as { message?: string; error?: string; created?: boolean };
      if (!response.ok) {
        throw new Error(result.error || "Unable to save your spot. Please try again.");
      }

      if (result.created === true) {
        trackEvent("generate_lead", { lead_source: "teaser3_waitlist" });
      }

      setStatus("success");
      setStep("confirmed");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  async function handleSurveySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSurveyStatus("submitting");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          survey: {
            gender: gender || undefined,
            age_group: age || undefined,
            intended_user: intendedUser || undefined,
            primary_features: primaryFeatures.length ? primaryFeatures : undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save survey.");
      }
      setSurveyStatus("success");
      setSurveySaved(true);
    } catch {
      setSurveyStatus("error");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      const exitShown = typeof window !== "undefined" && sessionStorage.getItem("t3_exit_shown") === "1";
      if (step === "email" && status !== "success" && !showExitOffer && !exitShown) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("t3_exit_shown", "1");
        }
        setShowExitOffer(true);
        return;
      }
      handleClose();
    } else {
      onOpenChange(true);
    }
  }

  function handleClose() {
    setShowExitOffer(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent ref={dialogRef} className="fig-dialog skin-survey-dialog teaser3-waitlist-dialog" showCloseButton={true}>
        {showExitOffer ? (
          <div className="skin-survey-exit-wrap">
            <div className="skin-survey-exit-badge">
              <BadgePercent size={18} />
              <span>SPECIAL FOUNDING OFFER</span>
            </div>
            <DialogTitle className="skin-survey-exit-title">
              Wait! Don&apos;t miss your 20% hardware discount.
            </DialogTitle>
            <DialogDescription className="skin-survey-exit-desc">
              Join the launch list today to guarantee 20% off your 3FIG smart ring, plus lifetime free app membership upon release.
            </DialogDescription>
            <div className="skin-survey-exit-actions">
              <button
                type="button"
                className="skin-survey-submit-btn"
                onClick={() => setShowExitOffer(false)}
              >
                Claim My 20% Discount
              </button>
              <button
                type="button"
                className="skin-survey-skip-btn"
                onClick={handleClose}
              >
                No thanks, I will pay full price
              </button>
            </div>
          </div>
        ) : step === "confirmed" ? (
          <div className="skin-survey-confirmed-wrap">
            <div className="skin-survey-confirmed-header">
              <div className="skin-survey-success-icon">
                <Check size={28} />
              </div>
              <DialogTitle className="skin-survey-title">
                You&apos;re on the founding member list!
              </DialogTitle>
              <DialogDescription className="skin-survey-desc">
                Your spot is confirmed for <strong>{email}</strong>. We&apos;ve reserved your 100% Free Lifetime App Subscription.
              </DialogDescription>
            </div>

            <div className="skin-survey-perk-summary">
              <div className="skin-survey-perk-item">
                <Gift size={18} />
                <span>Lifetime free app subscription secured</span>
              </div>
              <div className="skin-survey-perk-item">
                <Sparkles size={18} />
                <span>Priority access when ring hardware opens</span>
              </div>
            </div>

            {!surveySaved ? (
              <form className="skin-survey-form teaser3-post-reg-survey" onSubmit={handleSurveySubmit}>
                <div className="teaser3-survey-intro">
                  <p className="skin-survey-kicker">OPTIONAL 30-SECOND SURVEY</p>
                  <p className="teaser3-survey-intro-text">
                    Help us shape the 3FIG experience for your skin routine.
                  </p>
                </div>

                {/* Gender */}
                <div className="skin-survey-group">
                  <label className="skin-survey-label">What is your gender?</label>
                  <div className="skin-survey-options-grid">
                    {[
                      { val: "female", label: "Female" },
                      { val: "male", label: "Male" },
                      { val: "non_binary", label: "Non-binary" },
                      { val: "prefer_not", label: "Prefer not to say" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`skin-survey-chip ${gender === opt.val ? "is-selected" : ""}`}
                        onClick={() => setGender(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="skin-survey-group">
                  <label className="skin-survey-label">What is your age?</label>
                  <div className="skin-survey-options-grid">
                    {[
                      { val: "under_20", label: "Under 20" },
                      { val: "20_29", label: "20–29" },
                      { val: "30_39", label: "30–39" },
                      { val: "40_49", label: "40–49" },
                      { val: "50_plus", label: "50+" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`skin-survey-chip ${age === opt.val ? "is-selected" : ""}`}
                        onClick={() => setAge(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intended User */}
                <div className="skin-survey-group">
                  <label className="skin-survey-label">Who is this ring for?</label>
                  <div className="skin-survey-options-grid">
                    {[
                      { val: "myself", label: "Myself" },
                      { val: "partner", label: "Partner / Spouse" },
                      { val: "family", label: "Family member" },
                      { val: "gift", label: "Gift" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`skin-survey-chip ${intendedUser === opt.val ? "is-selected" : ""}`}
                        onClick={() => setIntendedUser(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Features */}
                <div className="skin-survey-group">
                  <label className="skin-survey-label">Which features interest you most? (Select all that apply)</label>
                  <div className="skin-survey-options-grid">
                    {[
                      { val: "sleep_skin", label: "Sleep & Skin Recovery" },
                      { val: "stress_hrv", label: "Stress & HRV Tracking" },
                      { val: "food_pattern", label: "Food & Flareup Patterns" },
                      { val: "balance_score", label: "Daily Skin Balance Score" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`skin-survey-chip ${primaryFeatures.includes(opt.val) ? "is-selected" : ""}`}
                        onClick={() => togglePrimaryFeature(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="teaser3-survey-actions">
                  <button
                    type="submit"
                    className="skin-survey-submit-btn"
                    disabled={surveyStatus === "submitting"}
                  >
                    {surveyStatus === "submitting" ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Saving...
                      </>
                    ) : (
                      "Complete & Save"
                    )}
                  </button>
                  <button
                    type="button"
                    className="skin-survey-skip-btn"
                    onClick={handleClose}
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            ) : (
              <div className="teaser3-survey-done">
                <p>Thank you for your feedback!</p>
                <button
                  type="button"
                  className="skin-survey-submit-btn skin-survey-done-btn"
                  onClick={handleClose}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        ) : (
          <form className="skin-survey-form teaser3-email-first-form" onSubmit={handleEmailSubmit}>
            <div className="skin-survey-header">
              <p className="skin-survey-kicker">3FIG FOUNDING MEMBER EXCLUSIVE</p>
              <DialogTitle className="skin-survey-title">
                Claim your Lifetime Free App Subscription.
              </DialogTitle>
              <DialogDescription className="skin-survey-desc">
                Join the early list to secure your founding member spot and enjoy free 3FIG app subscription for life.
              </DialogDescription>

              <div className="skin-survey-lifetime-callout">
                <div className="skin-survey-lifetime-icon">
                  <Sparkles size={20} />
                </div>
                <div className="skin-survey-lifetime-content">
                  <span className="skin-survey-lifetime-pill">FOUNDING MEMBER PERK</span>
                  <strong className="skin-survey-lifetime-title">100% Free App Subscription For Life</strong>
                  <p className="skin-survey-lifetime-desc">
                    Zero monthly membership fees for all core wellness signals, insights, and rhythm analysis. (Ring purchase required upon launch).
                  </p>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="skin-survey-group">
              <label htmlFor="t3-survey-email" className="skin-survey-label">
                Email Address <span className="skin-survey-required">*</span>
              </label>
              <input
                id="t3-survey-email"
                type="email"
                className="skin-survey-input"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "submitting"}
                autoFocus
              />
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
                  <Loader2 className="animate-spin" size={16} />
                  Claiming your spot...
                </>
              ) : (
                <>
                  Claim Free Lifetime Access
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="skin-survey-footer-note">
              No spam. Unsubscribe anytime. We never sell your personal information.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

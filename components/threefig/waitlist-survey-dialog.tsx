"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Sparkles, Loader2, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const attributionRef = useRef<Attribution | null>(null);

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
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

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

      setStatus("success");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function handleReset() {
    setStatus("idle");
    setErrorMessage("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              Thank you for sharing your thoughts. Your early spot is reserved, complete with a 20% launch discount and priority access when reservations open.
            </DialogDescription>
            <div className="skin-survey-perks">
              <div className="skin-survey-perk-item">
                <Sparkles size={16} />
                <span>20% off device at launch</span>
              </div>
              <div className="skin-survey-perk-item">
                <Heart size={16} />
                <span>Lifetime core updates</span>
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
        ) : (
          <form className="skin-survey-form" onSubmit={handleSubmit}>
            <div className="skin-survey-header">
              <p className="skin-survey-kicker">3FIG EARLY ACCESS</p>
              <DialogTitle className="skin-survey-title">Help us build 3FIG for you.</DialogTitle>
              <DialogDescription className="skin-survey-desc">
                Join our private pre-registration list. Answering these quick questions helps us tailor the experience.
              </DialogDescription>
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
                    value: "Under $10/mo regardless of features",
                    label: "Under $10 / month",
                    hint: "I prefer a budget under $10/month regardless of features.",
                  },
                  {
                    value: "$10 or more/mo if features deliver value",
                    label: "$10 or more / month",
                    hint: "I am comfortable with $10+/month if the insights deliver genuine value.",
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

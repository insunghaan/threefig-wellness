"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Loader2, X, Sparkles, Tag, ShieldCheck } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { trackEvent } from "./analytics";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";

export interface Teaser6WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  emailDraft?: string;
  onEmailDraftChange?: (email: string) => void;
  triggerElement?: HTMLElement | null;
  onSuccess?: () => void;
}

type DialogView =
  | "signup"
  | "confirmed"
  | "already-registered"
  | "survey"
  | "survey-success";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Teaser6WaitlistDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  emailDraft,
  onEmailDraftChange,
  triggerElement,
  onSuccess,
}: Teaser6WaitlistDialogProps) {
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
  }, []);

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
            ? (document.querySelector(".teaser6-mobile-btn") as HTMLElement)
            : (document.querySelector(".teaser6-desktop-btn") as HTMLElement);
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
      const payloadAttribution = {
        ...currentAttribution,
        offer: "early_access_lifetime_and_20_off",
        campaign_iteration: "teaser6",
      };

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          attribution: payloadAttribution,
          survey: { subscription_preference: "lifetime_free_and_20_off" },
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
          lead_source: "teaser6_waitlist",
          offer: "lifetime_free_and_20_off",
        });
        setView("confirmed");
        updateEmail("");
      } else {
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
            subscription_preference: subscriptionPreference || "lifetime_free_and_20_off",
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

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  const displayConfirmedEmail = submittedEmail || email;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="teaser6-dialog-overlay" />
        <DialogPrimitive.Content
          className={`teaser6-dialog-content ${view === "survey" ? "is-survey-mode" : ""}`}
          aria-describedby="t6-dialog-description"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            handleRestoreFocus();
          }}
        >
          {/* Accessible close control */}
          <button
            type="button"
            className="teaser6-dialog-close"
            onClick={() => handleOpenChange(false)}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {/* VIEW 1: EXPLICIT OFFER SIGNUP */}
          {view === "signup" && (
            <div className="teaser6-dialog-inner">
              <span className="teaser6-dialog-eyebrow">FOUNDING MEMBER ACCESS</span>
              <DialogPrimitive.Title className="teaser6-dialog-title">
                Join the waitlist.<br />Get the app free for life.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t6-dialog-description"
                className="teaser6-dialog-desc"
              >
                Reserve your spot now to unlock full 3FIG app access with zero monthly fees, plus 20% off your smart ring when pre-orders open.
              </DialogPrimitive.Description>

              {/* Exact requested offer hierarchy */}
              <div className="teaser6-dialog-perks-highlight">
                <div className="teaser6-dialog-perk-card">
                  <div className="teaser6-dialog-perk-icon-wrap" aria-hidden="true">
                    <Sparkles size={18} className="teaser6-dialog-perk-icon" />
                  </div>
                  <div className="teaser6-dialog-perk-info">
                    <strong className="teaser6-dialog-perk-title">Free App Access for Life</strong>
                    <p className="teaser6-dialog-perk-desc">
                      Zero subscription fees. Free lifetime membership for waitlist members.
                    </p>
                  </div>
                </div>

                <div className="teaser6-dialog-perk-card is-highlight">
                  <div className="teaser6-dialog-perk-icon-wrap" aria-hidden="true">
                    <Tag size={18} className="teaser6-dialog-perk-icon" />
                  </div>
                  <div className="teaser6-dialog-perk-info">
                    <strong className="teaser6-dialog-perk-title">Get 20% off the ring at launch</strong>
                    <p className="teaser6-dialog-perk-desc">
                      Guaranteed launch pricing applied automatically to your ring order.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} noValidate className="teaser6-dialog-form">
                <div className="teaser6-dialog-field">
                  <label htmlFor="t6-waitlist-email" className="teaser6-dialog-label">
                    Email address
                  </label>
                  <input
                    ref={emailInputRef}
                    id="t6-waitlist-email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck="false"
                    className={`teaser6-dialog-input ${errorMessage ? "has-error" : ""}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      updateEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    disabled={inputStatus === "submitting"}
                    aria-describedby={errorMessage ? "t6-email-error" : undefined}
                    aria-invalid={errorMessage ? true : undefined}
                    required
                  />
                  {errorMessage && (
                    <p id="t6-email-error" className="teaser6-dialog-error" role="alert">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="teaser6-dialog-btn-primary"
                  disabled={inputStatus === "submitting"}
                >
                  {inputStatus === "submitting" ? (
                    <>
                      <Loader2 className="teaser6-dialog-spinner" size={18} />
                      <span>Saving your spot...</span>
                    </>
                  ) : (
                    <>
                      <span>Join the waitlist</span>
                      <ArrowRight size={16} className="teaser6-dialog-btn-arrow" />
                    </>
                  )}
                </button>

                {/* Supporting conditions */}
                <div className="teaser6-dialog-conditions">
                  <span>No payment required to join.</span>
                  <span className="teaser6-dialog-condition-dot">•</span>
                  <span>Ring sold separately.</span>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 2: CONFIRMED */}
          {view === "confirmed" && (
            <div className="teaser6-dialog-inner">
              <div className="teaser6-dialog-confirmed-icon-wrap" aria-hidden="true">
                <Check size={28} className="teaser6-dialog-confirmed-icon" />
              </div>
              <DialogPrimitive.Title className="teaser6-dialog-title">
                You’re on the waitlist.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t6-dialog-description"
                className="teaser6-dialog-desc"
              >
                We saved your spot for <strong>{displayConfirmedEmail}</strong>. You’ve locked in lifetime free app access and your 20% ring discount.
              </DialogPrimitive.Description>

              <div className="teaser6-dialog-confirmed-card">
                <span className="teaser6-dialog-confirmed-card-title">What happens next</span>
                <ul className="teaser6-dialog-confirmed-card-list">
                  <li>We’ll email you when ring sizing kits and pre-orders open.</li>
                  <li>Your 20% discount and lifetime free app access will be tied to your email.</li>
                  <li>No commitment or payment required until you place your order.</li>
                </ul>
              </div>

              <div className="teaser6-dialog-exit-actions">
                <button
                  type="button"
                  className="teaser6-dialog-btn-primary"
                  onClick={() => setView("survey")}
                >
                  <span>Answer 3 quick questions (optional)</span>
                  <ArrowRight size={16} className="teaser6-dialog-btn-arrow" />
                </button>
                <button
                  type="button"
                  className="teaser6-dialog-btn-secondary"
                  onClick={() => handleOpenChange(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: ALREADY REGISTERED */}
          {view === "already-registered" && (
            <div className="teaser6-dialog-inner">
              <div className="teaser6-dialog-confirmed-icon-wrap is-already" aria-hidden="true">
                <Check size={28} className="teaser6-dialog-confirmed-icon" />
              </div>
              <DialogPrimitive.Title className="teaser6-dialog-title">
                You’re already registered.
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t6-dialog-description"
                className="teaser6-dialog-desc"
              >
                <strong>{displayConfirmedEmail}</strong> is already on the 3FIG waitlist. Your lifetime free app access and 20% launch discount are secured.
              </DialogPrimitive.Description>

              <div className="teaser6-dialog-exit-actions">
                <button
                  type="button"
                  className="teaser6-dialog-btn-primary"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: OPTIONAL SURVEY */}
          {view === "survey" && (
            <div className="teaser6-dialog-inner teaser6-survey-container">
              <span className="teaser6-dialog-eyebrow">HELP US BUILD FOR YOU</span>
              <DialogPrimitive.Title className="teaser6-dialog-title">
                Quick preferences
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t6-dialog-description"
                className="teaser6-dialog-desc"
              >
                Takes 30 seconds. Help us tailor 3FIG to your skin goals.
              </DialogPrimitive.Description>

              <form onSubmit={handleSurveySubmit} className="teaser6-survey-form">
                {/* Age group */}
                <div className="teaser6-survey-group">
                  <span className="teaser6-survey-label">What is your age range?</span>
                  <div className="teaser6-survey-chips">
                    {["18–24", "25–34", "35–44", "45+"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`teaser6-survey-chip ${age === item ? "is-selected" : ""}`}
                        onClick={() => setAge(age === item ? "" : item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary feature */}
                <div className="teaser6-survey-group">
                  <span className="teaser6-survey-label">What interests you most?</span>
                  <div className="teaser6-survey-chips">
                    {[
                      "Daily Skin Balance Score",
                      "Sleep & skin correlation",
                      "Stress & inflammation trends",
                      "Actionable daily steps",
                    ].map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        className={`teaser6-survey-chip ${primaryFeatures.includes(feature) ? "is-selected" : ""}`}
                        onClick={() => togglePrimaryFeature(feature)}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                {surveyError && (
                  <p className="teaser6-dialog-error" role="alert">
                    {surveyError}
                  </p>
                )}

                <div className="teaser6-dialog-exit-actions">
                  <button
                    type="submit"
                    className="teaser6-dialog-btn-primary"
                    disabled={surveyStatus === "submitting"}
                  >
                    {surveyStatus === "submitting" ? (
                      <>
                        <Loader2 className="teaser6-dialog-spinner" size={18} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save preferences</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="teaser6-dialog-btn-secondary"
                    onClick={() => handleOpenChange(false)}
                  >
                    Skip & finish
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 5: SURVEY SUCCESS */}
          {view === "survey-success" && (
            <div className="teaser6-dialog-inner">
              <div className="teaser6-dialog-confirmed-icon-wrap" aria-hidden="true">
                <Check size={28} className="teaser6-dialog-confirmed-icon" />
              </div>
              <DialogPrimitive.Title className="teaser6-dialog-title">
                Thank you!
              </DialogPrimitive.Title>
              <DialogPrimitive.Description
                id="t6-dialog-description"
                className="teaser6-dialog-desc"
              >
                Your preferences have been saved. We’ll be in touch with updates leading up to launch.
              </DialogPrimitive.Description>
              <button
                type="button"
                className="teaser6-dialog-btn-primary"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

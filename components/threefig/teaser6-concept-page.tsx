"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Teaser6ReviewBar } from "./teaser6-review-bar";
import { Teaser6PrivacyDialog } from "./teaser6-privacy-dialog";
import { Teaser6WaitlistDialog } from "./teaser6-waitlist-dialog";

export function Teaser6ConceptPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "teaser6-concept-inline",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || "Failed to join. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="t6c-root">
      {/* Internal Review Controller Bar */}
      <Teaser6ReviewBar currentVersion="concept" />

      {/* Navigation Header */}
      <header className="t6c-nav">
        <div className="t6c-nav-inner">
          <Link href="/teaser6/concept" className="t6c-brand">
            <img
              src="/images/threefig-logo.png"
              alt="3FIG"
              className="t6c-brand-logo"
              width={88}
              height={45}
            />
          </Link>

          <nav className="t6c-nav-links">
            <a href="#overview" className="t6c-nav-link">Overview</a>
            <a href="#what-you-get" className="t6c-nav-link">What You Get</a>
            <a href="#hardware" className="t6c-nav-link">The Ring</a>
            <a href="#faq" className="t6c-nav-link">FAQ</a>
          </nav>

          <button
            type="button"
            className="t6c-nav-cta"
            onClick={() => setWaitlistModalOpen(true)}
          >
            <span>Join Waitlist</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ====================================================================
          SECTION 1: HERO & BIOMETRIC TRIAD
          ==================================================================== */}
      <section id="overview" className="t6c-hero">
        <div className="t6c-container">
          <div className="t6c-hero-top">
            <div className="t6c-hero-kicker">
              <span className="t6c-kicker-dot" />
              <span>SKIN WELLNESS SMART RING</span>
            </div>

            <h1 className="t6c-hero-title">
              Understand your skin <br />
              <span className="t6c-hero-title-accent">from within.</span>
            </h1>

            <p className="t6c-hero-lead">
              Continuous sleep, stress, and temperature metrics from the 3FIG smart ring pair with daily skin check-ins to compute your Skin Balance Score. Spot patterns, anticipate barrier shifts, and know what to do next.
            </p>
          </div>

          {/* Triad Flow: Ring Tracking -> Daily Log -> App Insight */}
          <div className="t6c-triad-grid">
            {/* Card 1: Ring Capture */}
            <div className="t6c-triad-card">
              <span className="t6c-triad-badge">01 • CONTINUOUS TRACKING</span>
              <h3 className="t6c-triad-h">The Ring Captures</h3>
              <p className="t6c-triad-p">
                Discreet titanium sensors monitor sleep architecture, HRV, resting heart rate, and fingertip temperature trends automatically.
              </p>
              <div className="t6c-triad-visual">
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Deep Sleep</span>
                  <span className="t6c-telemetry-val">1h 48m</span>
                </div>
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Overnight HRV</span>
                  <span className="t6c-telemetry-val">58 ms</span>
                </div>
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Temp Delta</span>
                  <span className="t6c-telemetry-val">+0.2°F</span>
                </div>
              </div>
            </div>

            {/* Card 2: User Check-in */}
            <div className="t6c-triad-card">
              <span className="t6c-triad-badge">02 • DAILY LOG</span>
              <h3 className="t6c-triad-h">You Check In</h3>
              <p className="t6c-triad-p">
                Take 10 seconds in the morning to note texture, oiliness, and barrier sensations to anchor your data to real sensations.
              </p>
              <div className="t6c-triad-visual">
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Barrier Feel</span>
                  <span className="t6c-telemetry-val">Calm & Resilient</span>
                </div>
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Hydration</span>
                  <span className="t6c-telemetry-val">Comfortable</span>
                </div>
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Skin Mood</span>
                  <span className="t6c-telemetry-val">Balanced</span>
                </div>
              </div>
            </div>

            {/* Card 3: App Synthesis */}
            <div className="t6c-triad-card is-focal">
              <span className="t6c-triad-badge">03 • APP SYNTHESIS</span>
              <h3 className="t6c-triad-h">Skin Balance Score</h3>
              <p className="t6c-triad-p">
                The 3FIG app synthesizes internal recovery metrics and your skin check-in into one clear daily wellness composite.
              </p>
              <div className="t6c-triad-visual">
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Daily Balance</span>
                  <span className="t6c-telemetry-val" style={{ color: "#ff5c38" }}>86 / 100</span>
                </div>
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Status</span>
                  <span className="t6c-telemetry-val">Optimal Recovery</span>
                </div>
                <div className="t6c-telemetry-row">
                  <span className="t6c-telemetry-label">Daily Action</span>
                  <span className="t6c-telemetry-val">Barrier Hydration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Waitlist Offer Card */}
          <div className="t6c-hero-offer-banner">
            <h2 className="t6c-offer-headline">
              Join the waitlist. Get the app free for life.
            </h2>
            <p className="t6c-offer-benefit">
              Get 20% off the ring at launch.
            </p>

            {!submitted ? (
              <form onSubmit={handleInlineSubmit} className="t6c-inline-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="t6c-inline-input"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="t6c-inline-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Securing...</span>
                    </>
                  ) : (
                    <>
                      <span>Join the waitlist</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="t6c-inline-success" style={{ padding: "12px", color: "#10b981", fontWeight: 600 }}>
                <CheckCircle2 size={20} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                <span>You&apos;re on the early list! Lifetime app access secured.</span>
              </div>
            )}

            {errorMsg && (
              <p style={{ color: "#e11d48", fontSize: "13px", margin: "6px 0" }}>
                {errorMsg}
              </p>
            )}

            <div className="t6c-offer-conditions">
              <span>No payment required to join.</span>
              <span>•</span>
              <span>Ring sold separately.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: WHAT YOU GET (Specific to Skin)
          ==================================================================== */}
      <section id="what-you-get" className="t6c-features">
        <div className="t6c-container">
          <div className="t6c-section-header">
            <span className="t6c-section-eyebrow">WHAT YOU GET</span>
            <h2 className="t6c-section-h2">
              Understand your skin. <br />
              <span style={{ color: "#ff5c38" }}>Know what to do next.</span>
            </h2>
            <p className="t6c-section-lead">
              No bloated medical dashboards. 3FIG delivers three essential skin wellness capabilities.
            </p>
          </div>

          <div className="t6c-features-grid">
            {/* Feature 01 */}
            <div className="t6c-feature-card">
              <span className="t6c-feature-num">FEATURE 01</span>
              <h3 className="t6c-feature-title">See your Skin Balance Score.</h3>
              <p className="t6c-feature-desc">
                A single daily score combining your sleep recovery, daytime stress metrics, and morning skin check-in. Know where your skin stands before applying your routine.
              </p>
              <div className="t6c-score-preview">
                <div className="t6c-score-circle">
                  <svg viewBox="0 0 100 100" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,92,56,0.12)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#ff5c38" strokeWidth="8" strokeDasharray="264" strokeDashoffset="37" strokeLinecap="round" />
                  </svg>
                  <span className="t6c-score-val">86</span>
                  <span className="t6c-score-tag">Good</span>
                </div>
                <div style={{ fontSize: "12px", color: "#5a5f6d" }}>Sleep 78 • Recovery 82 • Check-in Calm</div>
              </div>
            </div>

            {/* Feature 02 */}
            <div className="t6c-feature-card">
              <span className="t6c-feature-num">FEATURE 02</span>
              <h3 className="t6c-feature-title">Find patterns in your skin and habits.</h3>
              <p className="t6c-feature-desc">
                Compare 7-day sleep duration and recovery trends against your recorded skin barrier sensations. Spot patterns without guessing.
              </p>
              <div className="t6c-chart-preview">
                <svg viewBox="0 0 280 100" style={{ width: "100%", height: "auto" }}>
                  <line x1="10" x2="270" y1="25" y2="25" stroke="rgba(17,19,23,0.06)" strokeDasharray="2 3" strokeWidth="1" />
                  <line x1="10" x2="270" y1="55" y2="55" stroke="rgba(17,19,23,0.06)" strokeDasharray="2 3" strokeWidth="1" />
                  <line x1="10" x2="270" y1="85" y2="85" stroke="rgba(17,19,23,0.06)" strokeDasharray="2 3" strokeWidth="1" />
                  {/* Sleep curve */}
                  <path d="M 20,65 L 60,50 L 100,58 L 140,40 L 180,44 L 220,25 L 260,30" fill="none" stroke="#ff5c38" strokeWidth="1.8" />
                  {/* Skin curve */}
                  <path d="M 20,72 L 60,60 L 100,62 L 140,50 L 180,48 L 220,35 L 260,40" fill="none" stroke="#10b981" strokeWidth="1.8" strokeDasharray="3 3" />
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <text key={i} x={20 + i * 40} y="98" textAnchor="middle" fontSize="10" fill="#717684">{d}</text>
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "8px", fontSize: "11px", color: "#5a5f6d" }}>
                  <span style={{ color: "#ff5c38" }}>— Sleep Recovery</span>
                  <span style={{ color: "#10b981" }}>··· Barrier Comfort</span>
                </div>
              </div>
            </div>

            {/* Feature 03 */}
            <div className="t6c-feature-card">
              <span className="t6c-feature-num">FEATURE 03</span>
              <h3 className="t6c-feature-title">Get one daily action for skin wellness.</h3>
              <p className="t6c-feature-desc">
                Receive one realistic next move tailored to today’s balance score—like prioritizing early hydration or dialing back harsh actives on high-stress days.
              </p>
              <div className="t6c-action-preview">
                <span className="t6c-action-badge">TONIGHT&apos;S MOVE • 8:30 PM</span>
                <h4 className="t6c-action-text">Focus on barrier hydration.</h4>
                <p className="t6c-action-sub">
                  Daytime recovery signals suggest mild autonomic strain. Favor barrier restoration over active exfoliants tonight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: HARDWARE ARCHITECTURE (Dark Obsidian Contrast)
          ==================================================================== */}
      <section id="hardware" className="t6c-hardware">
        <div className="t6c-container">
          <div className="t6c-hardware-grid">
            <div className="t6c-hardware-media">
              <Image
                src="/images/teaser2-ring-still-life.webp"
                alt="Polished silver 3FIG smart ring on dark stone"
                width={560}
                height={700}
                className="t6c-hardware-img"
              />
            </div>

            <div className="t6c-hardware-content">
              <span className="t6c-section-eyebrow">HARDWARE ARCHITECTURE</span>
              <h2 className="t6c-section-h2">
                Precision titanium. <br />
                Screen-free comfort.
              </h2>
              <p className="t6c-section-lead">
                Engineered for uninterrupted sleep and daily wear. High-precision sensors monitor vital signs without distracting screens or vibrations.
              </p>

              <div className="t6c-specs-list">
                <div className="t6c-spec-item">
                  <h4 className="t6c-spec-title">Multi-Wavelength PPG Sensors</h4>
                  <p className="t6c-spec-desc">
                    Captures pulse waveform, resting heart rate, and heart rate variability (HRV) directly from finger micro-arteries.
                  </p>
                </div>
                <div className="t6c-spec-item">
                  <h4 className="t6c-spec-title">Thermal Skin Sensors</h4>
                  <p className="t6c-spec-desc">
                    Detects nocturnal peripheral temperature fluctuations linked to circadian rhythm shifts and inflammatory recovery.
                  </p>
                </div>
                <div className="t6c-spec-item">
                  <h4 className="t6c-spec-title">Aerospace Titanium & 6-Day Battery</h4>
                  <p className="t6c-spec-desc">
                    Ultra-lightweight, 50m water-resistant, and charges fully in 45 minutes for nearly a week of continuous tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: INSTAGRAM MOODBOARD QUOTE MOMENT
          ==================================================================== */}
      <section className="t6c-brand-quote">
        <div className="t6c-quote-container">
          <h2 className="t6c-quote-h2">
            Inside body signals. <br />
            Outside natural glow.
          </h2>
          <p className="t6c-quote-p">
            Skin understood from within. Connect everyday habits to how your skin looks and feels.
          </p>
          <button
            type="button"
            className="t6c-quote-btn"
            onClick={() => setWaitlistModalOpen(true)}
          >
            <span>Join the waitlist</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ====================================================================
          SECTION 5: FAQ
          ==================================================================== */}
      <section id="faq" className="t6c-faq">
        <div className="t6c-container">
          <div className="t6c-section-header">
            <span className="t6c-section-eyebrow">FREQUENTLY ASKED</span>
            <h2 className="t6c-section-h2">Questions & honest answers.</h2>
          </div>

          <div className="t6c-faq-list">
            {[
              {
                q: "What do I get by joining the waitlist?",
                a: "You secure free lifetime 3FIG app access (no monthly membership fees) and 20% off your smart ring at launch. Joining is completely free with no payment required.",
              },
              {
                q: "Is the smart ring included for free?",
                a: "No. The ring is precision titanium hardware and sold separately. Waitlist members receive guaranteed 20% off launch pricing and free lifetime app access.",
              },
              {
                q: "What does the ring track vs what I record?",
                a: "The ring continuously tracks sleep architecture, resting heart rate, HRV, and finger temperature trends. You take 10 seconds each morning to log skin observations. The app correlates these data streams into your Skin Balance Score.",
              },
              {
                q: "When will 3FIG become available?",
                a: "Pre-orders and ring sizing kits roll out later this year. Waitlist members receive priority invitation batches before the public release.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="t6c-faq-item">
                <button
                  type="button"
                  className="t6c-faq-q"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="t6c-faq-a">
                    <p style={{ margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="t6c-footer">
        <div className="t6c-footer-inner">
          <span>© 2026 3FIG</span>
          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#5a5f6d",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Privacy & Disclaimers
          </button>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <Teaser6WaitlistDialog
        open={waitlistModalOpen}
        onOpenChange={setWaitlistModalOpen}
      />

      {/* Privacy Policy Dialog */}
      <Teaser6PrivacyDialog
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
      />
    </div>
  );
}

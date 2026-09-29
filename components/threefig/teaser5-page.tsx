"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Moon, 
  Activity, 
  Zap, 
  Fingerprint, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  Droplets,
  Clock,
  RotateCw
} from "lucide-react";
import { TeaserReviewBar, FontOption } from "./teaser-review-bar";

export function Teaser5Page() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="t5-root">
      {/* Review Controller Bar (Internal Team Controls) */}
      <TeaserReviewBar currentVersion="v5" />

      {/* Navigation Header */}
      <header className="t5-nav">
        <div className="t5-nav-inner">
          <Link href="/teaser5" className="t5-brand">
            <img 
              src="/images/threefig-logo.png" 
              alt="3fig" 
              className="t5-brand-logo" 
              width={88} 
              height={45} 
            />
          </Link>

          <nav className="t5-nav-links">
            <a href="#mechanism">How It Works</a>
            <a href="#biometrics">Biometric Engine</a>
            <a href="#ring">The Hardware</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a href="#waitlist" className="t5-nav-cta">
            Claim 20% Off
          </a>
        </div>
      </header>

      {/* ====================================================================
          HERO SECTION: High-Contrast Bio-Tech Editorial
          ==================================================================== */}
      <section className="t5-hero">
        <div className="t5-hero-glow" aria-hidden="true" />
        <div className="t5-container t5-hero-container">
          <div className="t5-hero-badge">
            <span className="t5-badge-pulse" />
            <span>THE FIRST SMART RING FOR SKIN SCIENCE</span>
          </div>

          <h1 className="t5-hero-title">
            Skin, understood <br className="t5-br-desktop" />
            <span className="t5-hero-highlight">from within.</span>
          </h1>

          <p className="t5-hero-quote">
            &ldquo;NOT MORE DATA. MORE MEANING.&rdquo;
          </p>

          <p className="t5-hero-subtitle">
            While standard wearables count steps, 3fig captures continuous nocturnal biosignals 
            from your finger’s microvasculature to compute your daily <strong>Skin Balance Score</strong>.
            Catch internal inflammation 24 hours before flare-ups ever surface.
          </p>

          {/* Quick Hero Waitlist Input */}
          <div className="t5-hero-cta-box" id="waitlist-quick">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="t5-hero-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="t5-hero-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="t5-hero-submit" disabled={loading}>
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Claim 20% Off + Free App</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="t5-hero-success">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <span>You&apos;re on the founding member VIP list! 20% code reserved.</span>
              </div>
            )}
            <p className="t5-hero-note">
              Zero payment required today · Lifetime free app membership included
            </p>
          </div>

          {/* Hero Visual Composition: Ring Macro on Obsidian Texture & Live Data Card */}
          <div className="t5-hero-visual-stage">
            <div className="t5-hero-visual-main">
              <picture>
                <source srcSet="/images/newhero0928.png?v=0928v3" type="image/png" />
                <img
                  src="/images/newhero0928.png?v=0928v3"
                  alt="3fig smart ring with live skin balance telemetry"
                  className="t5-hero-device-img"
                  width={1200}
                  height={1500}
                  fetchPriority="high"
                />
              </picture>

              {/* Floating Live Sensor Telemetry Pill */}
              <div className="t5-floating-telemetry">
                <div className="t5-telemetry-status">
                  <span className="t5-status-dot" />
                  <span>OVERNIGHT SKIN ENGINE ACTIVE</span>
                </div>
                <div className="t5-telemetry-data">
                  <div className="t5-data-item">
                    <span className="t5-data-val">86</span>
                    <span className="t5-data-lbl">Skin Balance</span>
                  </div>
                  <div className="t5-data-sep" />
                  <div className="t5-data-item">
                    <span className="t5-data-val text-emerald-400">Optimal</span>
                    <span className="t5-data-lbl">Barrier State</span>
                  </div>
                  <div className="t5-data-sep" />
                  <div className="t5-data-item">
                    <span className="t5-data-val">-0.2°F</span>
                    <span className="t5-data-lbl">Temp Shift</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          THE CAUSALITY: What the ring tracks ➔ How it computes ➔ What you see
          ==================================================================== */}
      <section className="t5-section t5-mechanism-section" id="mechanism">
        <div className="t5-container">
          <div className="t5-section-header text-center">
            <span className="t5-kicker">THE 3FIG CAUSAL PIPELINE</span>
            <h2 className="t5-section-title">
              How the ring knows <br />
              <span className="t5-gradient-text">your skin from within.</span>
            </h2>
            <p className="t5-section-desc">
              Your skin doesn&apos;t exist in isolation. It reflects deep autonomic recovery, 
              nocturnal heat dissipation, and internal stress before visible signs emerge.
            </p>
          </div>

          {/* Interactive 3-Step Tab Switcher */}
          <div className="t5-pipeline-tabs">
            <button
              type="button"
              className={`t5-pipeline-tab ${activeStep === 1 ? "is-active" : ""}`}
              onClick={() => setActiveStep(1)}
            >
              <span className="t5-tab-num">01</span>
              <span className="t5-tab-text">Finger Biosensing</span>
            </button>
            <button
              type="button"
              className={`t5-pipeline-tab ${activeStep === 2 ? "is-active" : ""}`}
              onClick={() => setActiveStep(2)}
            >
              <span className="t5-tab-num">02</span>
              <span className="t5-tab-text">Physiological Engine</span>
            </button>
            <button
              type="button"
              className={`t5-pipeline-tab ${activeStep === 3 ? "is-active" : ""}`}
              onClick={() => setActiveStep(3)}
            >
              <span className="t5-tab-num">03</span>
              <span className="t5-tab-text">Actionable Skin Balance</span>
            </button>
          </div>

          {/* Step Detail Card */}
          <div className="t5-step-display-card">
            {activeStep === 1 && (
              <div className="t5-step-grid">
                <div className="t5-step-info">
                  <div className="t5-step-badge">STEP 01: NIGHTLY CAPTURE</div>
                  <h3 className="t5-step-heading">Dense capillary sensing directly from your finger.</h3>
                  <p className="t5-step-body">
                    The finger holds an exceptionally dense network of capillaries and arterio-venous anastomoses. 
                    3fig’s medical-grade optical photoplethysmography (PPG) and digital temperature sensors capture 
                    millisecond-accurate pulse transit time, HRV, and distal skin cooling throughout every sleep stage.
                  </p>
                  <ul className="t5-step-bullets">
                    <li><Check size={16} className="text-coral-500" /> Continuous overnight skin temperature (±0.05°C precision)</li>
                    <li><Check size={16} className="text-coral-500" /> Heart Rate Variability (HRV) autonomic balance</li>
                    <li><Check size={16} className="text-coral-500" /> Deep & REM restorative sleep architecture</li>
                  </ul>
                </div>
                <div className="t5-step-media">
                  <div className="t5-sensor-graphic">
                    <div className="t5-sensor-pulse-ring" />
                    <img 
                      src="/images/threefig-ring-sensor-macro-crop.png" 
                      alt="3fig optical sensor array" 
                      className="t5-sensor-img"
                    />
                    <div className="t5-sensor-tag">
                      <span className="t5-led-indicator" />
                      <span>Optical Biosensor Array · 50Hz Sampling</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="t5-step-grid">
                <div className="t5-step-info">
                  <div className="t5-step-badge">STEP 02: DERMATOLOGICAL ANALYSIS</div>
                  <h3 className="t5-step-heading">Translating internal physiology into epidermal biology.</h3>
                  <p className="t5-step-body">
                    During deep slow-wave sleep, cellular division in the basal epidermis peaks while human growth hormone 
                    stimulates collagen remodeling. When nocturnal temperature stays elevated or HRV plunges, 
                    micro-inflammation suppresses barrier synthesis. 3fig calculates this relationship every night.
                  </p>
                  <ul className="t5-step-bullets">
                    <li><Check size={16} className="text-coral-500" /> Models nocturnal trans-epidermal moisture recovery</li>
                    <li><Check size={16} className="text-coral-500" /> Correlates stress hormone markers with skin sensitivity</li>
                    <li><Check size={16} className="text-coral-500" /> Flags low-grade inflammation 24 hours in advance</li>
                  </ul>
                </div>
                <div className="t5-step-media">
                  <div className="t5-algorithm-card">
                    <div className="t5-algo-head">
                      <span>BIOMETRIC CORRELATION ENGINE</span>
                      <span className="t5-algo-badge">ACCURACY: 94.2%</span>
                    </div>
                    <div className="t5-algo-chart">
                      <div className="t5-chart-legend">
                        <span className="t5-leg-sleep">Sleep Restoration</span>
                        <span className="t5-leg-skin">Barrier Stability</span>
                      </div>
                      <svg viewBox="0 0 320 80" className="w-full h-20" fill="none">
                        <path d="M 10,65 C 50,60 80,30 130,40 C 180,50 220,15 260,20 C 290,25 310,10 315,10" stroke="#3b82f6" strokeWidth="1.5" />
                        <path d="M 10,70 C 50,66 80,42 130,46 C 180,32 220,24 260,18 C 290,14 310,12 315,12" stroke="#ff5c38" strokeWidth="1.5" strokeDasharray="3 2" />
                      </svg>
                    </div>
                    <div className="t5-algo-verdict">
                      <span>Epidermal resilience index: +24% when Slow-Wave Sleep &gt; 90 mins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="t5-step-grid">
                <div className="t5-step-info">
                  <div className="t5-step-badge">STEP 03: DAILY MORNING CLARITY</div>
                  <h3 className="t5-step-heading">One definitive score. One actionable next move.</h3>
                  <p className="t5-step-body">
                    No overwhelming medical spreadsheets or meaningless calorie counts. You wake up to a single, 
                    authoritative <strong>Skin Balance Score (0-100)</strong> and an evidence-backed recommendation 
                    tailored to today’s barrier resilience.
                  </p>
                  <ul className="t5-step-bullets">
                    <li><Check size={16} className="text-coral-500" /> Know whether today is safe for strong active serums</li>
                    <li><Check size={16} className="text-coral-500" /> Receive predictive flare-up warnings before breakouts begin</li>
                    <li><Check size={16} className="text-coral-500" /> Verify which skincare products deliver verified results</li>
                  </ul>
                </div>
                <div className="t5-step-media">
                  <div className="t5-action-card">
                    <div className="t5-action-badge">TONIGHT&apos;S EVIDENCE-BASED PROTOCOL</div>
                    <div className="t5-action-title">Shift bedtime 25 minutes earlier</div>
                    <p className="t5-action-desc">
                      Recovery telemetry shows cellular moisture retention peaks when sleep onset occurs prior to 10:45 PM.
                    </p>
                    <div className="t5-action-impact">
                      <Sparkles size={14} className="text-coral-500" />
                      <span>Projected skin barrier resilience: +19% tomorrow morning</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          WHAT YOU GET: Inverted Pyramid Skin-First Value
          ==================================================================== */}
      <section className="t5-section t5-value-section" id="biometrics">
        <div className="t5-container">
          <div className="t5-section-header">
            <span className="t5-kicker">CONCRETE VALUE</span>
            <h2 className="t5-section-title">
              What 3fig gives you <br />
              <span className="t5-gradient-text">every single morning.</span>
            </h2>
          </div>

          <div className="t5-cards-grid">
            {/* Card 1: Score */}
            <div className="t5-value-card">
              <span className="t5-card-num">01</span>
              <h3 className="t5-card-title">Your daily Skin Balance Score.</h3>
              <p className="t5-card-body">
                Wake up to one clear number. See how last night&apos;s deep sleep, temperature balance, 
                and physiological recovery translate directly into your skin barrier resilience.
              </p>
              <div className="t5-card-preview-box">
                <div className="t5-preview-score">
                  <span className="t5-score-huge">86</span>
                  <div className="t5-score-meta">
                    <strong>Skin Balance: Optimal</strong>
                    <span>High moisture barrier retention</span>
                  </div>
                </div>
                <div className="t5-score-bar">
                  <div className="t5-score-fill" style={{ width: "86%" }} />
                </div>
              </div>
            </div>

            {/* Card 2: 24h Early Warning */}
            <div className="t5-value-card">
              <span className="t5-card-num">02</span>
              <h3 className="t5-card-title">Spot skin flare-ups before they surface.</h3>
              <p className="t5-card-body">
                Skin reacts to internal inflammation 24 hours before breakouts or redness appear. 
                3fig tracks subtle skin temperature shifts and HRV drops to warn you early.
              </p>
              <div className="t5-card-preview-box">
                <div className="t5-warning-pill">
                  <span className="t5-warning-dot" />
                  <span>Early Inflammation Warning: Moderate</span>
                </div>
                <p className="t5-warning-tip">
                  Distal temp shifted +0.4°F overnight with elevated resting pulse. Simplify skincare routine today to calm barrier.
                </p>
              </div>
            </div>

            {/* Card 3: Routine Proof */}
            <div className="t5-value-card">
              <span className="t5-card-num">03</span>
              <h3 className="t5-card-title">Prove which routines actually work.</h3>
              <p className="t5-card-body">
                Stop guessing which expensive serums or habits actually help. Compare your nightly 
                biometric recovery against your skin logs to see real data proof.
              </p>
              <div className="t5-card-preview-box">
                <div className="t5-verified-row">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Retinoid Routine Verified</span>
                </div>
                <p className="t5-verified-note">
                  Correlated with +22% morning barrier comfort over 14 consecutive nights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          THE HARDWARE: Ultra-Slim Titanium Precision
          ==================================================================== */}
      <section className="t5-section t5-hardware-section" id="ring">
        <div className="t5-container">
          <div className="t5-hardware-grid">
            <div className="t5-hardware-copy">
              <span className="t5-kicker">PRECISION ENGINEERING</span>
              <h2 className="t5-section-title">
                Sleek aerospace titanium. <br />
                <span className="t5-gradient-text">Engineered for skin.</span>
              </h2>
              <p className="t5-section-desc">
                No screens. No buzzing notifications. Built from medical-grade hypoallergenic titanium 
                to disappear effortlessly onto your finger day and night.
              </p>

              <div className="t5-specs-list">
                <div className="t5-spec-item">
                  <div className="t5-spec-icon-wrap">
                    <Activity size={18} />
                  </div>
                  <div>
                    <strong>Dual Optical Photoplethysmography (PPG)</strong>
                    <p>Green & infrared LEDs track pulse waveform and autonomic variability.</p>
                  </div>
                </div>

                <div className="t5-spec-item">
                  <div className="t5-spec-icon-wrap">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <strong>Digital Negative Temperature Coefficient Sensor</strong>
                    <p>Detects subtle peripheral vascular shifts down to 0.05°C precision.</p>
                  </div>
                </div>

                <div className="t5-spec-item">
                  <div className="t5-spec-icon-wrap">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong>50M Water Resistance & 7-Day Battery</strong>
                    <p>Wear in the shower, pool, or gym. Wireless fast charging in under 60 mins.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="t5-hardware-media">
              <img 
                src="/images/threefig-ring-front-product.webp" 
                alt="3fig smart ring titanium finish" 
                className="t5-ring-product-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOUNDER OFFER & CONVERTING WAITLIST
          ==================================================================== */}
      <section className="t5-section t5-waitlist-section" id="waitlist">
        <div className="t5-container">
          <div className="t5-waitlist-card">
            <div className="t5-waitlist-header">
              <span className="t5-kicker">FOUNDING MEMBER EXCLUSIVE</span>
              <h2 className="t5-waitlist-title">
                Get 20% off the ring at launch + <br />
                <span className="t5-gradient-text">Free lifetime app subscription.</span>
              </h2>
              <p className="t5-waitlist-subtitle">
                Join the waitlist today. Zero payment required now. Lock in $120/year waived forever 
                and get priority reservation when the first hardware batch drops.
              </p>
            </div>

            <div className="t5-perks-trio">
              <div className="t5-perk-box">
                <Sparkles size={18} className="text-coral-500" />
                <strong>Free App For Life</strong>
                <span>Zero monthly membership fees ever ($120/yr saved)</span>
              </div>
              <div className="t5-perk-box">
                <ShieldCheck size={18} className="text-coral-500" />
                <strong>20% Ring Discount</strong>
                <span>Exclusive promo code emailed for launch batch</span>
              </div>
              <div className="t5-perk-box">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <strong>No Payment Today</strong>
                <span>100% free to join. Zero commitment. Cancel anytime.</span>
              </div>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="t5-waitlist-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="t5-waitlist-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="t5-waitlist-btn" disabled={loading}>
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Claim 20% Off & Free App</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="t5-waitlist-complete">
                <CheckCircle2 size={24} className="text-emerald-400" />
                <div>
                  <strong>You&apos;re officially on the founder list!</strong>
                  <p>Check your inbox soon for your exclusive 20% reservation code.</p>
                </div>
              </div>
            )}

            <p className="t5-waitlist-safe">
              No credit card required. We respect your inbox privacy.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FAQ SECTION
          ==================================================================== */}
      <section className="t5-section t5-faq-section" id="faq">
        <div className="t5-container t5-faq-container">
          <div className="t5-section-header text-center">
            <span className="t5-kicker">QUESTIONS & ANSWERS</span>
            <h2 className="t5-section-title">Common questions.</h2>
          </div>

          <div className="t5-faq-list">
            {[
              {
                q: "Why does a smart ring focus on skin instead of just fitness?",
                a: "Your skin is your body's largest organ and directly mirrors internal autonomic recovery, nocturnal microcirculation, and systemic inflammation. While other rings focus merely on burned calories, 3fig connects internal biometric recovery with dermatological barrier science."
              },
              {
                q: "How does 3fig detect skin flare-ups 24 hours in advance?",
                a: "Subtle nocturnal skin temperature elevations paired with autonomic HRV dips indicate low-grade inflammatory stress up to 24 hours before erythema, sensitivity, or acne lesions physically appear on the face."
              },
              {
                q: "Is there any payment required to join the waitlist?",
                a: "No. Joining the waitlist is completely free with zero payment required today. You will receive an exclusive 20% discount code and lifetime free app membership when hardware pre-orders open."
              },
              {
                q: "Can I wear the ring in water or during skincare routines?",
                a: "Yes. 3fig is rated to 50M water resistance. It is completely safe for hand washing, showers, swimming, and applying skincare products."
              }
            ].map((faq, i) => (
              <div key={i} className={`t5-faq-item ${activeFaq === i ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="t5-faq-trigger"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <ChevronRight size={18} className="t5-faq-arrow" />
                </button>
                {activeFaq === i && (
                  <div className="t5-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="t5-footer">
        <div className="t5-container t5-footer-inner">
          <div className="t5-footer-brand">
            <img src="/images/threefig-logo.png" alt="3fig" width={76} height={39} />
            <p>The first smart ring built for skin science.</p>
          </div>
          <div className="t5-footer-copy">
            © {new Date().getFullYear()} 3fig Wellness Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

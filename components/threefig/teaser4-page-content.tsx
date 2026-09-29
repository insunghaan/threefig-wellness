"use client";

import React, { useState, useEffect } from "react";
import { Teaser4WaitlistDialog } from "./teaser4-waitlist-dialog";

export function Teaser4PageContent({ initialOpen = false }: { initialOpen?: boolean }) {
  const [signupOpen, setSignupOpen] = useState(initialOpen);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openSignup = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSignupOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { openTeaser4Signup?: () => void }).openTeaser4Signup = () => setSignupOpen(true);
      const checkOpen = () => {
        const params = new URLSearchParams(window.location.search);
        if (
          params.get("signup") === "1" ||
          params.get("join") === "1" ||
          window.location.hash === "#signup"
        ) {
          setSignupOpen(true);
        }
      };
      checkOpen();
      window.addEventListener("hashchange", checkOpen);
      return () => {
        window.removeEventListener("hashchange", checkOpen);
        delete (window as unknown as { openTeaser4Signup?: () => void }).openTeaser4Signup;
      };
    }
  }, []);

  return (
    <div className="teaser4-root">
      <a href="#main" className="skip">
        Skip to main content
      </a>

      {/* SITE HEADER (Initial landing: only logo visible, nav & button hidden; revealed on scroll) */}
      <header
        className={`site-header ${isScrolled ? "is-scrolled" : "is-top"}`}
        role="banner"
      >
        <a href="/teaser4" aria-label="3fig home" className="site-logo-link">
          <img
            src="/review/assets/logo.png"
            alt="3fig"
            className="logo"
            width={76}
            height={26}
          />
        </a>
        <nav aria-label="Primary navigation" className="header-nav">
          <a href="#results">Your skin insights</a>
          <a href="#how">How it works</a>
          <a href="#ring">The ring</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button
          type="button"
          className="button small header-cta-btn"
          onClick={openSignup}
          data-location="nav"
        >
          <span>Get early access</span>
          <span>↗</span>
        </button>
      </header>

      <main id="main">
        {/* HERO SECTION */}
        <section className="hero hero-a" aria-label="Introduction">
          <div className="hero-copy">
            <p className="eyebrow">
              THE SKIN WELLNESS SMART RING
            </p>
            <h1>
              Skin Balance.<br />
              <span className="hero-subline" style={{ fontStyle: 'normal' }}>
                Built from your body signals.
              </span>
            </h1>
            <p className="hero-lead">
              Track sleep, stress signals, and recovery. Add a skin check-in. See
              your daily Skin Balance and the patterns behind it.
            </p>
            <div className="hero-cta-wrap">
              <button
                type="button"
                className="button hero-cta-btn"
                onClick={openSignup}
                data-location="hero"
              >
                <span>Get early access</span>
                <span>↗</span>
              </button>
            </div>
            <p className="hero-perks">
              20% off the ring at launch.<br />
              Free lifetime app subscription.
            </p>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <picture>
              <source type="image/webp" srcSet="/images/teaser4/hero-ring-phone.webp" />
              <img
                src="/images/teaser4/hero-ring-phone.jpg"
                alt="3fig smart ring next to the 3fig app showing Skin Balance score"
                width={910}
                height={1024}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
        </section>

        {/* MEET 3FIG */}
        <section className="section meet" id="meet">
          <div className="section-top">
            <p className="eyebrow">MEET 3FIG</p>
            <h2>Your Skin Balance. The data behind it.</h2>
            <p>
              See your daily score alongside ring measurements and skin
              check-ins.
            </p>
          </div>

          <div
            className="dashboard"
            role="region"
            aria-label="3fig daily report preview"
          >
            <div className="dash-top">
              <img
                src="/review/assets/logo.png"
                alt="3fig"
                width={49}
                height={17}
              />
              <span>YOUR DAILY SKIN REPORT</span>
              <span>Today</span>
            </div>

            <div className="dash-body">
              {/* Left Score Dial */}
              <div className="dash-score">
                <div className="score-header">
                  <span className="live-dot">TODAY’S SKIN BALANCE</span>
                  <span>Day 14</span>
                </div>
                <div className="score-main">
                  <div className="score-dial" aria-hidden="true">
                    <svg viewBox="0 0 142 142">
                      <circle cx="71" cy="71" r="65" className="dial-track" />
                      <circle cx="71" cy="71" r="65" className="dial-value" />
                    </svg>
                    <div>
                      <strong>86</strong>
                      <small>/ 100</small>
                    </div>
                  </div>
                  <div className="score-caption">
                    <strong>Steady</strong>
                    <p>
                      Your body signals and skin check-in are close to your usual
                      range.
                    </p>
                  </div>
                </div>

                <div className="signal-rows">
                  <div>
                    <span>Sleep duration</span>
                    <b>7h 42m</b>
                  </div>
                  <div>
                    <span>Recovery trend</span>
                    <b>Stable</b>
                  </div>
                  <div>
                    <span>Skin check-in</span>
                    <b>Comfortable</b>
                  </div>
                </div>
              </div>

              {/* Right Trend Chart */}
              <div className="dash-trend">
                <div>
                  <div className="score-header">
                    <span>YOUR WEEK</span>
                    <span>7 days</span>
                  </div>
                  <h3>Sleep &amp; skin comfort</h3>
                  <div className="legend" aria-hidden="true">
                    <span>
                      <i /> Skin comfort
                    </span>
                    <span>
                      <i /> Sleep consistency
                    </span>
                  </div>
                  <div className="line-chart" aria-hidden="true">
                    <svg viewBox="0 0 440 140">
                      <g className="gridlines">
                        <path d="M 0 20 L 440 20" />
                        <path d="M 0 60 L 440 60" />
                        <path d="M 0 100 L 440 100" />
                      </g>
                      <path
                        d="M 20 95 C 60 90, 80 82, 130 84 C 180 86, 210 65, 260 62 C 310 59, 360 48, 420 38"
                        className="line-primary"
                      />
                      <circle cx="420" cy="38" r="4" className="endpoint" />
                      <path
                        d="M 20 105 C 70 102, 100 95, 150 92 C 200 89, 240 76, 290 70 C 340 64, 380 58, 420 54"
                        className="line-secondary"
                      />
                    </svg>
                    <div className="week">
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                      <span>S</span>
                    </div>
                  </div>
                </div>
                <p className="chart-note">
                  Compare your skin check-ins with your sleep patterns.
                </p>
              </div>
            </div>

            <div className="dash-bottom">
              <span>RING DATA + YOUR CHECK-INS</span>
              <p>One daily summary. See the data behind it.</p>
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </div>
        </section>

        {/* OUTCOMES / WHAT YOU GET */}
        <section className="section outcomes" id="results">
          <div className="section-top">
            <p className="eyebrow">WHAT YOU GET</p>
            <h2>Your skin today. Your patterns over time.</h2>
            <p>
              See your Skin Balance, the signals behind it, and what to try next.
            </p>
          </div>

          <div className="outcome-list">
            {/* Outcome 1 */}
            <article className="outcome">
              <div className="outcome-copy">
                <span className="number">01 / TODAY</span>
                <h3>Understand today’s Skin Balance.</h3>
                <p>
                  Every morning, 3fig pairs your sleep and recovery signals with
                  how your skin feels to create your daily score.
                </p>
                <p className="secondary">
                  One number. Clear context behind it.
                </p>
              </div>
              <div className="data-card" aria-hidden="true">
                <div className="score-header">
                  <span className="live-dot">TODAY’S SCORE</span>
                  <span>8:30 AM</span>
                </div>
                <div className="score-main">
                  <div className="score-dial">
                    <svg viewBox="0 0 142 142">
                      <circle cx="71" cy="71" r="65" className="dial-track" />
                      <circle cx="71" cy="71" r="65" className="dial-value" />
                    </svg>
                    <div>
                      <strong>86</strong>
                      <small>/ 100</small>
                    </div>
                  </div>
                  <div className="score-caption">
                    <strong>Steady</strong>
                    <p>Within your normal range.</p>
                  </div>
                </div>
                <div className="signal-rows">
                  <div>
                    <span>Sleep</span>
                    <b>7h 42m</b>
                  </div>
                  <div>
                    <span>Skin check-in</span>
                    <b>Comfortable</b>
                  </div>
                </div>
                <p className="data-footnote">
                  Generated from ring data and your morning check-in.
                </p>
              </div>
            </article>

            {/* Outcome 2 */}
            <article className="outcome">
              <div className="outcome-copy">
                <span className="number">02 / PATTERNS</span>
                <h3>See when your skin feels different.</h3>
                <p>
                  Track your Skin Balance alongside sleep consistency, late
                  meals, and travel to see what might be affecting your skin.
                </p>
                <p className="secondary">
                  Spot connections without second-guessing.
                </p>
              </div>
              <div className="data-card trend-card" aria-hidden="true">
                <div className="score-header">
                  <span>LAST 7 DAYS</span>
                  <span>Trend view</span>
                </div>
                <h4>Sleep &amp; skin comfort</h4>
                <div className="legend">
                  <span>
                    <i /> Skin comfort
                  </span>
                  <span>
                    <i /> Sleep consistency
                  </span>
                </div>
                <div className="line-chart">
                  <svg viewBox="0 0 440 120">
                    <g className="gridlines">
                      <path d="M 0 20 L 440 20" />
                      <path d="M 0 60 L 440 60" />
                      <path d="M 0 100 L 440 100" />
                    </g>
                    <path
                      d="M 20 85 C 70 80, 110 70, 160 72 C 210 74, 250 50, 310 46 C 360 42, 390 35, 420 30"
                      className="line-primary"
                    />
                    <circle cx="420" cy="30" r="4" className="endpoint" />
                    <path
                      d="M 20 95 C 70 92, 110 85, 160 80 C 210 75, 260 62, 310 58 C 360 54, 390 48, 420 44"
                      className="line-secondary"
                    />
                  </svg>
                  <div className="week">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                </div>
                <div className="comparison-note">
                  <span>PATTERN NOTED</span>
                  <p>Skin comfort rated higher after 7+ hours of sleep.</p>
                </div>
              </div>
            </article>

            {/* Outcome 3 */}
            <article className="outcome">
              <div className="outcome-copy">
                <span className="number">03 / NEXT STEP</span>
                <h3>Choose a habit. Track your skin’s response.</h3>
                <p>
                  When your score shifts, 3fig suggests a simple daily habit—like
                  an earlier wind-down—and helps you track whether it makes a
                  difference.
                </p>
                <p className="secondary">Small adjustments. Real feedback.</p>
              </div>
              <div className="data-card action-card" aria-hidden="true">
                <div className="score-header">
                  <span>TODAY’S FOCUS</span>
                  <span>Recovery</span>
                </div>
                <div className="moon">☾</div>
                <h4>Start winding down 20 minutes earlier.</h4>
                <p>
                  Your last two lower scores followed shorter sleep windows.
                </p>
                <div className="action-time">
                  <span>TARGET WIND-DOWN</span>
                  <div>
                    <strong>10:20</strong>
                    <small>PM</small>
                  </div>
                </div>
                <div className="next-check">
                  <span>TOMORROW</span>
                  <p>Log your skin check-in after wake-up</p>
                  <span>↗</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section how" id="how">
          <div className="section-top">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>The ring measures. You add context.</h2>
            <p>3fig brings both together to help you understand your skin.</p>
          </div>

          <div className="how-grid">
            <article>
              <div className="how-image">
                <img
                  src="/review/assets/sleep.webp"
                  alt="Sleeping with 3fig ring"
                  loading="lazy"
                  width={380}
                  height={418}
                />
                <span>01 / RING</span>
              </div>
              <h3>Track your body.</h3>
              <p>
                Sleep, heart rate, HRV, temperature trends, and movement—measured
                quietly while you sleep and live.
              </p>
            </article>

            <article>
              <div className="how-image">
                <img
                  src="/review/assets/skin.webp"
                  alt="Checking skin comfort in morning mirror"
                  loading="lazy"
                  width={380}
                  height={418}
                />
                <span>02 / YOU</span>
              </div>
              <h3>Log your skin.</h3>
              <p>
                Note how your skin feels with a quick check-in. Add meal notes
                when you want more context.
              </p>
            </article>

            <article>
              <div className="how-image">
                <img
                  src="/review/assets/knit.webp"
                  alt="Checking insights on 3fig mobile app"
                  loading="lazy"
                  width={380}
                  height={418}
                />
                <span>03 / APP</span>
              </div>
              <h3>See the connection.</h3>
              <p>
                View your Skin Balance summary, compare trends, and choose a
                daily action to test.
              </p>
            </article>
          </div>
        </section>

        {/* THE RING (FOUNDATION) */}
        <section className="foundation" id="ring">
          <div className="foundation-image">
            <img
              src="/review/assets/ring-stone.webp"
              alt="3fig ring close-up on natural stone surface"
              loading="lazy"
              width={800}
              height={620}
            />
          </div>
          <div className="foundation-copy">
            <p className="eyebrow">THE RING</p>
            <h2>Body data. Skin insight.</h2>
            <p>
              Wear 3fig through sleep and daily life. See your signals in the
              app.
            </p>
            <dl>
              <div>
                <dt>Sleep</dt>
                <dd>Duration and sleep patterns</dd>
              </div>
              <div>
                <dt>Heart rate &amp; HRV</dt>
                <dd>Signals for stress and recovery trends</dd>
              </div>
              <div>
                <dt>Temperature &amp; movement</dt>
                <dd>Changes from your personal baseline</dd>
              </div>
            </dl>
            <button
              type="button"
              className="button"
              onClick={openSignup}
              data-location="ring"
            >
              <span>Get early access</span>
              <span>↗</span>
            </button>
          </div>
        </section>

        {/* SKIN SCIENCE */}
        <section className="section science" id="science">
          <div>
            <p className="eyebrow">SKIN SCIENCE</p>
            <h2>Your body signals. Your skin context.</h2>
          </div>
          <div>
            <p>
              3fig combines physiological trends with what you report about your
              skin. The app helps you compare those records over time so you can
              see what supports your skin’s steady state.
            </p>
            <div className="method">
              <span>Measured by the ring</span>
              <b>Sleep · Heart rate · HRV · Temperature · Movement</b>
            </div>
            <div className="method">
              <span>Added by you</span>
              <b>Skin check-ins · Meal notes</b>
            </div>
            <p className="small-print">
              Skin Balance is a wellness estimate based on your physiological
              trends and self-reported check-ins. The ring does not directly
              measure skin hydration or diagnose skin conditions.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section faq" id="faq">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2>Before you join.</h2>
          </div>
          <div className="questions">
            <details>
              <summary>What do I get for joining?</summary>
              <p>
                You lock in 20% off the ring at launch and a free lifetime app
                subscription. No subscription fees, ever.
              </p>
            </details>
            <details>
              <summary>Is the ring free?</summary>
              <p>
                No. The ring is a separate hardware purchase. Joining the
                waitlist gives you 20% off the ring and makes your app
                subscription free for life.
              </p>
            </details>
            <details>
              <summary>Does the ring measure my skin directly?</summary>
              <p>
                The ring measures physiological signals—sleep, HRV, heart rate,
                and temperature trends. You log how your skin feels. 3fig
                correlates both into your daily Skin Balance.
              </p>
            </details>
            <details>
              <summary>Do I have to log every meal?</summary>
              <p>
                No. Meal notes are optional. Add them when you want to see if
                late eating or specific foods affect your morning Skin Balance.
              </p>
            </details>
            <details>
              <summary>What happens after I register?</summary>
              <p>
                We’ll send an email confirming your waitlist spot and discounts.
                As launch approaches, you’ll get sizing kit access and first
                choice of ring finishes.
              </p>
            </details>
          </div>
        </section>

        {/* WAITLIST BENEFITS SECTION (CENTERED SINGLE COLUMN, NO RING IMAGE)
            Preserves copy and CTA: "Join the waitlist ↗" exactly as required. */}
        <section className="offer" id="access">
          <div>
            <p className="eyebrow">WAITLIST BENEFITS</p>
            <h2>
              Your ring, 20% off.<br />
              Your app, free for life.
            </h2>
            <p>
              Join the waitlist for a launch discount and no app subscription fees.
            </p>
            <button
              type="button"
              className="button"
              onClick={openSignup}
              data-location="final"
            >
              <span>Join the waitlist</span>
              <span>↗</span>
            </button>
            <p className="offer-fine">
              No payment required to join. Ring sold separately.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer role="contentinfo">
        <img
          src="/review/assets/logo.png"
          alt="3fig"
          className="logo"
          width={60}
          height={21}
        />
        <span>Skin wellness. Built on body signals.</span>
        <small>© 2026 3fig</small>
      </footer>

      {/* MOBILE FLOATING CTA DOCK (Fixed at bottom of screen, floats above hero image & content) */}
      <aside
        className={`teaser4-floating-dock ${signupOpen ? "is-hidden" : "is-visible"}`}
        aria-label="Waitlist registration"
      >
        <button
          type="button"
          className="button floating-dock-btn"
          onClick={openSignup}
          data-location="floating_dock"
        >
          <span>Get early access</span>
          <span>↗</span>
        </button>
      </aside>

      {/* WAITLIST DIALOG (With desktop dual-panel & mobile compact stacked layout) */}
      <Teaser4WaitlistDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        initialSource="teaser4_waitlist"
      />
    </div>
  );
}

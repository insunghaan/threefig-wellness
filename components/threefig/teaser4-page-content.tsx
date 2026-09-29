"use client";

import React, { useState, useEffect, useRef } from "react";
import { Teaser4WaitlistDialog } from "./teaser4-waitlist-dialog";

const OUTCOMES_ITEMS = [
  {
    num: "01 / TODAY",
    titleLine1: "Understand today’s",
    titleLine2: "Skin Balance.",
    desc: "Every morning, 3fig pairs your sleep and recovery signals with how your skin feels to create your daily score.",
    secondary: "One number. Clear context behind it.",
    imageWebp: "/images/teaser4/what-you-get-01.webp",
    imagePng: "/images/teaser4/what-you-get-01.png",
    alt: "Skin Balance daily score breakdown card",
  },
  {
    num: "02 / PATTERNS",
    titleLine1: "See when your skin",
    titleLine2: "feels different.",
    desc: "Track your Skin Balance alongside sleep consistency, late meals, and travel to see what might be affecting your skin.",
    secondary: "Spot connections without second-guessing.",
    imageWebp: "/images/teaser4/what-you-get-02.webp",
    imagePng: "/images/teaser4/what-you-get-02.png",
    alt: "7-day sleep consistency and skin comfort patterns card",
  },
  {
    num: "03 / NEXT STEP",
    titleLine1: "Choose a habit.",
    titleLine2: "Track your skin’s response.",
    desc: "When your score shifts, 3fig suggests a simple daily habit—like an earlier wind-down—and helps you track whether it makes a difference.",
    secondary: "Small adjustments. Real feedback.",
    imageWebp: "/images/teaser4/what-you-get-03.webp",
    imagePng: "/images/teaser4/what-you-get-03.png",
    alt: "Tonight wind-down recommendation card",
  },
];

export function Teaser4PageContent({ initialOpen = false }: { initialOpen?: boolean }) {
  const [signupOpen, setSignupOpen] = useState(initialOpen);
  const [isScrolled, setIsScrolled] = useState(false);

  // What You Get Mobile Carousel state
  const [activeOutcomeIdx, setActiveOutcomeIdx] = useState(0);
  const outcomesTrackRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOutcomesScroll = () => {
    const el = outcomesTrackRef.current;
    if (!el) return;
    const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft || "20");
    const scrollLeft = el.scrollLeft;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const target = child.offsetLeft - paddingLeft;
      const diff = Math.abs(target - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    if (closestIdx !== activeOutcomeIdx) {
      setActiveOutcomeIdx(closestIdx);
    }
  };

  const scrollToOutcomeSlide = (idx: number) => {
    const el = outcomesTrackRef.current;
    if (!el) return;
    const slideEl = el.children[idx] as HTMLElement | undefined;
    if (slideEl) {
      const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft || "20");
      const targetScroll = slideEl.offsetLeft - paddingLeft;
      el.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
      setActiveOutcomeIdx(idx);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0 && activeOutcomeIdx < OUTCOMES_ITEMS.length - 1) {
        scrollToOutcomeSlide(activeOutcomeIdx + 1);
      } else if (deltaX > 0 && activeOutcomeIdx > 0) {
        scrollToOutcomeSlide(activeOutcomeIdx - 1);
      }
    }
  };

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

          {/* Desktop alternating rows */}
          <div className="outcome-desktop-list">
            {OUTCOMES_ITEMS.map((item, idx) => (
              <article key={item.num} className={`outcome outcome-${idx + 1}`}>
                <div className="outcome-copy">
                  <span className="number">{item.num}</span>
                  <h3 className="outcome-title">
                    {item.titleLine1} <br className="outcome-title-br" />
                    {item.titleLine2}
                  </h3>
                  <p>{item.desc}</p>
                  <p className="secondary">{item.secondary}</p>
                </div>
                <div className="outcome-card-visual">
                  <picture>
                    <source type="image/webp" srcSet={item.imageWebp} />
                    <img
                      src={item.imagePng}
                      alt={item.alt}
                      className="outcome-component-img"
                      width={512}
                      height={512}
                      loading="lazy"
                    />
                  </picture>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile carousel with natural 2-line wrapped titles & tight pagination dots */}
          <div className="outcome-mobile-carousel">
            <div
              ref={outcomesTrackRef}
              className="outcome-carousel-track"
              onScroll={handleOutcomesScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {OUTCOMES_ITEMS.map((item, idx) => {
                const isActive = activeOutcomeIdx === idx;
                return (
                  <div
                    key={item.num}
                    className={`outcome-carousel-slide ${isActive ? "is-active" : ""}`}
                  >
                    <div className="outcome-copy">
                      <span className="number">{item.num}</span>
                      <h3 className="outcome-title">
                        {item.titleLine1} <br />
                        {item.titleLine2}
                      </h3>
                      <p>{item.desc}</p>
                      <p className="secondary">{item.secondary}</p>
                    </div>
                    <div className="outcome-card-visual">
                      <picture>
                        <source type="image/webp" srcSet={item.imageWebp} />
                        <img
                          src={item.imagePng}
                          alt={item.alt}
                          className="outcome-component-img"
                          width={400}
                          height={400}
                          loading="lazy"
                        />
                      </picture>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Pagination Dots */}
            <div
              className="outcome-carousel-dots"
              role="tablist"
              aria-label="What You Get navigation"
            >
              {OUTCOMES_ITEMS.map((item, idx) => (
                <button
                  key={item.num}
                  type="button"
                  role="tab"
                  className={`outcome-carousel-dot ${activeOutcomeIdx === idx ? "is-active" : ""}`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-selected={activeOutcomeIdx === idx}
                  onClick={() => scrollToOutcomeSlide(idx)}
                />
              ))}
            </div>
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
              <div className="how-image how-image-ring">
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

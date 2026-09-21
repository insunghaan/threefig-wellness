"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";
import { trackEvent } from "./analytics";
import {
  Activity,
  ArrowRight,
  BadgePercent,
  BatteryMedium,
  CalendarDays,
  Check,
  Gift,
  HeartPulse,
  Menu,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Utensils,
  X,
} from "lucide-react";
import { Brand } from "./visuals";
import { reflectionDisclosure } from "@/lib/threefig/reflections";
import { ReflectionCarousel } from "./reflection-carousel";
import { PathwayCarousel } from "./pathway-carousel";
import { PatternPreview } from "./pattern-preview";
import { SkinDifferenceSection } from "./skin-difference-section";
import { SkinBalanceSlider } from "./skin-balance-slider";
import { EvidenceMobileCarousel } from "./evidence-carousel";
import { WaitlistSurveyDialog } from "./waitlist-survey-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const signals = [
  { icon: MoonStar, label: "Sleep, timing & rhythm", note: "Continuous ring sensing" },
  { icon: HeartPulse, label: "Resting heart rate & HRV", note: "Continuous ring sensing" },
  { icon: Thermometer, label: "Temperature shifts", note: "Continuous ring sensing" },
  { icon: Activity, label: "Movement & recovery", note: "Continuous ring sensing" },
  { icon: Sparkles, label: "Skin check-ins", note: "Lightweight 2-second note" },
  { icon: Utensils, label: "Meal notes", note: "Optional check-in" },
];

function TwoLines({ text }: { text: string }) {
  return <>{text.split(/(?<=\.)\s+/).map((line) => <span className="skin-title-line" key={line}>{line}</span>)}</>;
}

export default function Landing() {
  const attribution = useRef<Attribution | null>(null);
  const signupStarted = useRef(false);
  const submitting = useRef(false);
  useEffect(() => { attribution.current = captureBrowserAttribution(); }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("submitting");
    setMessage("");
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
          email,
          company,
          attribution: attribution.current || captureBrowserAttribution(),
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });
      const result = (await response.json()) as { message?: string; error?: string; created?: boolean };
      if (!response.ok) throw new Error(result.error || "Please try again.");
      if (result.created === true) trackEvent("generate_lead", { lead_source: "waitlist" });
      setStatus("success");
      setMessage(result.message || "You’re on the list.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t save your email. Please try again.",
      );
    } finally {
      submitting.current = false;
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="skin-site" onClick={(event) => {
      const link = (event.target as Element).closest('a[href="#updates"]');
      if (link) trackEvent("cta_click", { placement: link.closest("header") ? "header" : link.closest("footer") ? "footer" : "hero" });
    }}>
      <a className="skin-skip" href="#main">
        Skip to content
      </a>

      <header className="skin-header-wrap">
        <div className="skin-header">
          <Link href="/" aria-label="3FIG home" onClick={closeMenu}>
            <Brand />
          </Link>
          <nav
            className={menuOpen ? "skin-nav is-open" : "skin-nav"}
            aria-label="Main navigation"
          >
            <a href="#rhythm" onClick={closeMenu}>Skin Rhythm</a>
            <a href="#inputs" onClick={closeMenu}>The inputs</a>
            <a href="#ring" onClick={closeMenu}>The ring</a>
            <a href="#evidence" onClick={closeMenu}>The science</a>
          </nav>
          <button
            className="skin-header-cta"
            type="button"
            onClick={() => setSurveyOpen(true)}
          >
            Join early <ArrowRight size={16} />
          </button>
          <button
            className="skin-menu"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        <section className="skin-hero">
          <img
            className="skin-hero-image"
            src="/images/threefig-hero-master.png"
            alt="A model extending her hand toward the camera, with a polished 3FIG smart ring in focus against warm amber light"
            fetchPriority="high"
            width={1024}
            height={576}
          />
          <div className="skin-hero-copy">
            <p className="skin-kicker">MEET 3FIG</p>
            <h1>
              Your skin responds to
              <br />
              <em>more than skincare.</em>
            </h1>
            <p className="skin-hero-lead">
              The smart ring that quietly connects how your skin feels with sleep, recovery, and body signals over time.
            </p>
            <div className="skin-hero-actions">
              <button
                className="skin-button"
                type="button"
                onClick={() => setSurveyOpen(true)}
              >
                Join early <ArrowRight size={18} />
              </button>
              <a className="skin-text-link" href="#difference">
                See how it works
              </a>
            </div>
          </div>
          <a className="skin-hero-scroll" href="#difference">
            See how it works <span>↓</span>
          </a>
        </section>

        {/* The 3FIG Difference: Three Signals. One Skin Balance. */}
        <SkinDifferenceSection />

        {/* Skin Balance Index: Dedicated Horizontal Slider (NOW / WHY / NEXT) */}
        <SkinBalanceSlider />

        {/* Repositioned Sleep / Food / Stress as Inputs into Skin Rhythm */}
        <section id="inputs" className="skin-pathways" aria-labelledby="inputs-title">
          <div className="skin-shell">
            <div className="skin-pattern-intro">
              <div className="skin-section-heading">
                <p className="skin-kicker">THE EVERYDAY INPUTS</p>
                <h2 id="inputs-title">
                  Life in dialogue<br />
                  <em>with your skin.</em>
                </h2>
                <p>
                  Sleep, temperature and recovery are sensed continuously by the ring.
                  Food is a lightweight, optional note whenever you choose to add context.
                  Together, they shape the rhythm 3FIG interprets for you.
                </p>
              </div>
              <PatternPreview />
            </div>
          </div>
          <PathwayCarousel />
        </section>

        <section id="ring" className="skin-ring-section">
          <div
            className="skin-ring-photo"
            role="img"
            aria-label="A polished black smart ring balanced on dark sculptural stone"
          />
          <div className="skin-ring-copy">
            <p className="skin-kicker">THE SENSING FOUNDATION</p>
            <h2>
              Always on.<br />
              <em>Never in the way.</em>
            </h2>
            <p>
              The ring is the sensing layer. Skin Rhythm is the interpretation layer.
              Crafted in featherlight titanium with multi-day battery life, 3FIG tracks
              physiological baselines 24/7 so your skin’s story becomes legible.
            </p>
            <div className="skin-signal-grid">
              {signals.map(({ icon: Icon, label, note }) => (
                <div key={label}>
                  <Icon className="skin-signal-icon" size={20} strokeWidth={1.8} />
                  <div className="skin-signal-content">
                    <strong className="skin-signal-label">{label}</strong>
                    <span className="skin-signal-note">{note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="skin-reflections" aria-labelledby="reflections-title" aria-describedby="reflections-disclosure">
          <div className="skin-shell">
            <div className="skin-section-heading">
              <p className="skin-kicker">BETA PARTICIPANT PERSPECTIVES</p>
              <h2 id="reflections-title">
                Less guessing.<br />
                <em>More understanding.</em>
              </h2>
              <p id="reflections-disclosure" className="skin-reflection-disclosure">{reflectionDisclosure}</p>
            </div>
          </div>
          <ReflectionCarousel />
        </section>

        <section id="evidence" className="skin-evidence skin-shell">
          <div className="skin-evidence-intro">
            <p className="skin-kicker">THE SKIN–BODY CONNECTION</p>
            <h2 id="evidence-title">
              Different signals.<br />
              <em>One connected system.</em>
            </h2>
            <p>
              The latest reviews keep pointing in the same direction: sleep,
              nutrition and stress interact with pathways relevant to skin
              function and aging. 3FIG is designed to turn those everyday
              signals into context you can use — never a diagnosis.
            </p>
            <div className="skin-evidence-note">
              <span>THE TAKEAWAY</span>
              <strong>Your skin doesn’t live in a separate tab.</strong>
            </div>
          </div>
          {/* Desktop Study Cards */}
          <div className="skin-study-list skin-desktop-studies">
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/42641586/"
              target="_blank"
              rel="noreferrer"
            >
              <span>01 · SLEEP</span>
              <h3>A 2026 review maps sleep and circadian rhythm to skin barrier, immune activity and repair.</h3>
              <p>Biegański et al. · Sleep Medicine Reviews · 2026</p>
              <ArrowRight />
            </a>
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/42389732/"
              target="_blank"
              rel="noreferrer"
            >
              <span>02 · NUTRITION</span>
              <h3>A 2026 review finds nutrition can influence glycation, oxidative stress and pathways involved in skin aging.</h3>
              <p>Piquero-Casals et al. · Frontiers in Aging · 2026</p>
              <ArrowRight />
            </a>
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/41962101/"
              target="_blank"
              rel="noreferrer"
            >
              <span>03 · STRESS</span>
              <h3>A 2026 review links chronic stress pathways with oxidative stress, matrix breakdown and impaired barrier function.</h3>
              <p>Ahmed et al. · Wiadomości Lekarskie · 2026</p>
              <ArrowRight />
            </a>
          </div>

          {/* Mobile Evidence 3-Slide Carousel */}
          <div className="skin-mobile-studies">
            <EvidenceMobileCarousel />
          </div>
          <p className="skin-study-caveat">
            Research on sleep, nutrition and stress informs our approach.
            These studies examine the skin–body connection, not 3FIG’s effectiveness.
          </p>
        </section>

        <section className="skin-story">
          <div className="skin-story-number" aria-hidden="true">3</div>
          <div className="skin-story-copy">
            <p className="skin-kicker">WHY 3FIG</p>
            <h2>
              Not more data.<br />
              <em>More meaning.</em>
            </h2>
            <p>
              Skin rarely changes for one reason. Sleep slips. Meals shift.
              Stress stacks up. Most tools record the moments, then leave you to
              connect them.
            </p>
            <p>
              3FIG is designed to bring those signals into one clear pattern —
              so the day feels less like a puzzle, and the next step feels more
              like yours.
            </p>
            <p className="skin-small-print">
              One ring. Three pathways. A picture that gets more personal with
              every day.
            </p>
          </div>
        </section>

        <section id="updates" className="skin-updates">
          <div className="skin-update-motion" aria-hidden="true">
            <span className="skin-update-light skin-update-light-a" />
            <span className="skin-update-light skin-update-light-b" />
            <span className="skin-update-light skin-update-light-c" />
          </div>
          <div className="skin-update-content">
            <p className="skin-kicker">YOUR NEXT CHAPTER, WITH 3FIG</p>
            <h2>
              A little closer.<br />
              <em>To your everyday.</em>
            </h2>
            <p>
              Be among the first to meet 3FIG. Join the launch list for thoughtful
              updates, early access and a little something to welcome you.
            </p>
            <div
              className="skin-early-benefits"
              role="group"
              aria-label="Pre-registration benefits: 20% device discount and lifetime subscription"
            >
              <article>
                <span className="skin-benefit-icon" aria-hidden="true">
                  <BadgePercent size={24} />
                </span>
                <div>
                  <span>20% OFF AT LAUNCH</span>
                  <strong>20% device discount when orders open.</strong>
                </div>
              </article>
              <article>
                <span className="skin-benefit-icon" aria-hidden="true">
                  <Sparkles size={23} />
                </span>
                <div>
                  <span>LIFETIME SUBSCRIPTION</span>
                  <strong>Free subscription for life as a founding member.</strong>
                </div>
              </article>
            </div>
            <div className="skin-benefit-note">
              <span className="skin-benefit-note-icon" aria-hidden="true">
                <Gift size={16} />
              </span>
              <p>
                <strong>Pre-registration benefit:</strong> 20% device discount at launch and lifetime subscription included.
              </p>
            </div>
            {status === "success" ? (
              <div className="skin-form-success" role="status">
                <Check size={22} />
                <div>
                  <strong>{message}</strong>
                  <span>Only the news worth opening.</span>
                </div>
              </div>
            ) : (
              <form
                className="skin-signup"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSurveyOpen(true);
                }}
              >
                <div className="skin-signup-row">
                  <input
                    id="launch-email"
                    aria-label="Email address"
                    type="email"
                    data-clarity-mask="true"
                    onFocus={() => { if (!signupStarted.current) { signupStarted.current = true; trackEvent("signup_start"); } }}
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={status === "submitting"}
                  />
                  <input
                    className="skin-honeypot"
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    aria-hidden="true"
                  />
                  <button type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Joining…" : "Join early"}
                    <ArrowRight size={18} />
                  </button>
                </div>
                {status === "error" && (
                  <p className="skin-form-error" role="alert">{message}</p>
                )}
                <p className="skin-consent">
                  Occasional 3FIG updates. No clutter. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="skin-footer">
        <p className="skin-footer-copy">Your skin. Your signals. One clearer story.</p>
        <span className="skin-footer-copyright">© 2026 3FIG</span>
      </footer>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="fig-dialog skin-privacy-dialog">
          <DialogTitle>Your inbox. Your call.</DialogTitle>
          <DialogDescription>
            Join the launch list and we’ll keep your email only to send
            occasional 3FIG product updates. We never sell it. Leave anytime.
          </DialogDescription>
          <p>
            We use Google Analytics and Microsoft Clarity to understand website usage.
            Campaign attribution is remembered in your browser for up to 90 days and
            saved with your signup to help us understand how people find 3FIG.
          </p>
          <p>
            3FIG supports everyday wellness. It does not diagnose, prevent
            or treat medical conditions.
          </p>
        </DialogContent>
      </Dialog>

      <WaitlistSurveyDialog
        open={surveyOpen}
        onOpenChange={setSurveyOpen}
        defaultEmail={email}
        onSuccess={() => {
          setStatus("success");
          setMessage("You’re in. Welcome to the 3FIG launch list.");
        }}
      />
    </div>
  );
}

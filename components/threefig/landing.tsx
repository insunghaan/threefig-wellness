"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const signals = [
  { icon: MoonStar, label: "Sleep, timing & rhythm" },
  { icon: HeartPulse, label: "Resting heart rate & HRV" },
  { icon: Thermometer, label: "Temperature shifts" },
  { icon: Activity, label: "Movement & recovery" },
  { icon: Sparkles, label: "Skin check-ins" },
  { icon: Utensils, label: "Meal notes" },
];

function TwoLines({ text }: { text: string }) {
  return <>{text.split(/(?<=\.)\s+/).map((line) => <span className="skin-title-line" key={line}>{line}</span>)}</>;
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          client_timezone: clientTimezone,
          client_language: clientLanguage,
        }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Please try again.");
      setStatus("success");
      setMessage(result.message || "You’re on the list.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t save your email. Please try again.",
      );
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="skin-site">
      <a className="skin-skip" href="#main">
        Skip to content
      </a>

      <header className="skin-header">
        <Link href="/" aria-label="3FIG home" onClick={closeMenu}>
          <Brand />
        </Link>
        <nav
          className={menuOpen ? "skin-nav is-open" : "skin-nav"}
          aria-label="Main navigation"
        >
          <a href="#why" onClick={closeMenu}>Why 3FIG</a>
          <a href="#three" onClick={closeMenu}>The pattern</a>
          <a href="#ring" onClick={closeMenu}>The ring</a>
          <a href="#evidence" onClick={closeMenu}>The science</a>
        </nav>
        <a className="skin-header-cta" href="#updates">
          Join early <ArrowRight size={16} />
        </a>
        <button
          className="skin-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="main">
        <section className="skin-hero">
          <img
            className="skin-hero-image"
            src="/images/threefig-hero-amber.webp"
            width="1024"
            height="576"
            alt="A model extending her hand toward the camera, with a polished silver ring in focus against warm amber light"
            fetchPriority="high"
          />
          <div className="skin-hero-copy">
            <p className="skin-kicker">THE SKIN WELLNESS RING</p>
            <h1>
              Skin, understood
              <br />
              <em>from within.</em>
            </h1>
            <p className="skin-hero-lead">
              Sleep. Food. Stress. They all show up on your skin. 3FIG connects
              the dots — and turns them into one clear next move.
            </p>
            <div className="skin-hero-actions">
              <a className="skin-button" href="#updates">
                Join early <ArrowRight size={18} />
              </a>
              <a className="skin-text-link" href="#three">
                See the pattern
              </a>
            </div>
          </div>
          <a className="skin-hero-scroll" href="#why">
            Look beneath the surface <span>↓</span>
          </a>
        </section>

        <section id="why" className="skin-statement skin-shell">
          <p className="skin-kicker">GOOD SKIN STARTS BEFORE SKINCARE</p>
          <h2>
            Your skin remembers
            <br />
            <em>more than you think.</em>
          </h2>
          <p className="skin-statement-body">
            The late night. The rushed lunch. The week that wouldn’t quit. 3FIG
            connects those moments with how your skin feels, so the pattern gets
            clearer — without turning life into a spreadsheet.
          </p>
          <div className="skin-three-words" aria-label="The three pathways">
            <span>Sleep</span>
            <i />
            <span>Food</span>
            <i />
            <span>Stress</span>
          </div>
        </section>

        <section id="three" className="skin-pathways" aria-labelledby="pathways-title">
          <div className="skin-shell">
            <div className="skin-pattern-intro">
              <div className="skin-section-heading">
                <p className="skin-kicker">SLEEP. FOOD. STRESS. ONE STORY.</p>
                <h2 id="pathways-title"><TwoLines text="Connect the dots. Change the plot." /></h2>
                <p>
                  3FIG pairs continuous body signals with quick check-ins. The more
                  it learns, the more personal the next step feels.
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
            aria-label="A polished silver ring balanced on dark sculptural stone"
          />
          <div className="skin-ring-copy">
            <p className="skin-kicker">WHY A RING? LIFE DOESN’T PAUSE.</p>
            <h2>
              Always on.
              <br />
              Never in the way.
            </h2>
            <p>
              Day and night, the 3FIG ring is designed to notice subtle shifts
              in rhythm, recovery and movement. Add a quick skin or meal
              check-in, and the signal gets its story.
            </p>
            <div className="skin-signal-grid">
              {signals.map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon size={18} strokeWidth={1.55} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="skin-specs skin-shell" aria-labelledby="spec-title">
          <div>
            <p className="skin-kicker">THE BASICS. AND THE BETWEEN-THE-LINES.</p>
            <h2 id="spec-title"><TwoLines text="Everyday signals. A more personal picture." /></h2>
          </div>
          <div className="skin-spec-list">
            <article>
              <HeartPulse />
              <h3>The daily picture</h3>
              <p>Sleep, activity, resting heart rate, HRV, recovery and temperature — quietly tracked.</p>
            </article>
            <article>
              <Sparkles />
              <h3>Skin, in context</h3>
              <p>Skin check-ins meet food and stress patterns, so isolated moments become a clearer story.</p>
            </article>
            <article>
              <BatteryMedium />
              <h3>Built to stay on</h3>
              <p>A considered shape and a quiet presence. Designed to feel at home in your everyday.</p>
            </article>
            <article>
              <ShieldCheck />
              <h3>Your data. Your call.</h3>
              <p>Your baseline stays yours, with clear controls over what is collected and used.</p>
            </article>
          </div>
        </section>

        <section className="skin-reflections" aria-labelledby="reflections-title" aria-describedby="reflections-disclosure">
          <div className="skin-shell">
            <div className="skin-section-heading">
              <p className="skin-kicker">EVERYDAY PERSPECTIVES</p>
              <h2 id="reflections-title"><TwoLines text="Less guessing. More understanding." /></h2>
              <p id="reflections-disclosure" className="skin-reflection-disclosure">{reflectionDisclosure}</p>
            </div>
          </div>
          <ReflectionCarousel />
        </section>

        <section id="evidence" className="skin-evidence skin-shell">
          <div className="skin-evidence-intro">
            <p className="skin-kicker">THE SKIN–BODY CONNECTION</p>
            <h2><TwoLines text="Different signals. One connected system." /></h2>
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
          <div className="skin-study-list">
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
              Not more data.
              <br />
              More meaning.
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
              A little closer.
              <br />
              <em>To your everyday.</em>
            </h2>
            <p>
              Be among the first to meet 3FIG. Join the launch list for thoughtful
              updates, early access and a little something to welcome you.
            </p>
            <div
              className="skin-early-benefits"
              role="group"
              aria-label="Early access benefits for the first 10 people"
            >
              <article>
                <span className="skin-benefit-icon" aria-hidden="true">
                  <CalendarDays size={23} />
                </span>
                <div>
                  <span>THREE MONTHS. ON US.</span>
                  <strong>Full 3FIG access from day one.</strong>
                </div>
              </article>
              <article>
                <span className="skin-benefit-icon" aria-hidden="true">
                  <BadgePercent size={24} />
                </span>
                <div>
                  <span>30% OFF THE RING</span>
                  <strong>A launch code for the first in line.</strong>
                </div>
              </article>
            </div>
            <div className="skin-benefit-note">
              <span className="skin-benefit-note-icon" aria-hidden="true">
                <Gift size={16} />
              </span>
              <p>
                <strong>First 10 only.</strong> Join early and both are yours.
                We’ll confirm by email.
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
              <form className="skin-signup" onSubmit={joinWaitlist}>
                <div className="skin-signup-row">
                  <input
                    id="launch-email"
                    aria-label="Email address"
                    type="email"
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
                    {status === "submitting" ? "Saving your spot…" : "Save my spot"}
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
        <div>
          <Brand />
          <p>Your skin. Your signals. One clearer story.</p>
        </div>
        <nav aria-label="Footer navigation">
          <button type="button" onClick={() => setPrivacyOpen(true)}>Privacy</button>
          <a href="#updates">Join early</a>
        </nav>
        <span>© 2026 3FIG</span>
      </footer>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="fig-dialog skin-privacy-dialog">
          <DialogTitle>Your inbox. Your call.</DialogTitle>
          <DialogDescription>
            Join the launch list and we’ll keep your email only to send
            occasional 3FIG product updates. We never sell it. Leave anytime.
          </DialogDescription>
          <p>
            3FIG supports everyday wellness. It does not diagnose, prevent
            or treat medical conditions.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

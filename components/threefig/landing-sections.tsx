"use client";
import { useEffect, useState } from "react";
import Link from "./navigation";
import { ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { Brand, OrganicForm, RhythmDial, Ring } from "./visuals";
import { actions, actual, suggested } from "@/lib/threefig/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function LandingSections() {
  const [rhythm, setRhythm] = useState("compare"),
    [finish, setFinish] = useState("silver"),
    [email, setEmail] = useState(""),
    [joined, setJoined] = useState(false),
    [privacy, setPrivacy] = useState(false);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("3fig-interest");
      if (saved) {
        setEmail(saved);
        setJoined(true);
      }
    } catch {}
  }, []);
  return (
    <>
      <section id="approach" className="feature-section age-section">
        <div className="section-copy">
          <p className="eyebrow">01 / 3FIG AGE</p>
          <h2>
            Your age tells one story.
            <br />
            <em>Your body tells another.</em>
          </h2>
          <p>
            See how your long-term health pattern compares with your calendar
            age. A little perspective on the things that are helping.
          </p>
          <Link className="text-link" href="/app/age">
            Get to know your 3FIG Age <ArrowRight size={17} />
          </Link>
        </div>
        <div className="age-comparison">
          <div className="calendar-number">
            <span>48</span>
            <p>Calendar age</p>
          </div>
          <div className="age-divider" />
          <div className="pattern-number">
            <span>44.7</span>
            <p>3FIG Age</p>
          </div>
          <div className="age-comparison-note">
            <span>−3.3 years</span>
            <p>Your current health pattern looks a little younger.</p>
          </div>
          <p className="fine-print">
            Illustrative estimate. Not a clinical measure of biological age.
          </p>
        </div>
      </section>
      <section id="rhythm" className="feature-section rhythm-section">
        <div className="rhythm-visual">
          <RhythmDial mode={rhythm} />
          <div className="dial-legend">
            <span>
              <i className="legend-band" />
              Suggested rhythm
            </span>
            <span>
              <i className="legend-dot" />
              Actual day
            </span>
          </div>
        </div>
        <div className="section-copy">
          <p className="eyebrow">02 / 3FIG RHYTHM</p>
          <h2>
            Your body has
            <br />
            <em>its own time.</em>
          </h2>
          <p>
            When to focus. When to move. When to call it a day. Find the rhythm
            that feels more like you.
          </p>
          <Tabs
            value={rhythm}
            onValueChange={setRhythm}
            className="rhythm-tabs"
          >
            <TabsList aria-label="Rhythm view">
              <TabsTrigger value="suggested">Suggested</TabsTrigger>
              <TabsTrigger value="actual">Actual day</TabsTrigger>
              <TabsTrigger value="compare">Together</TabsTrigger>
            </TabsList>
            {["suggested", "actual", "compare"].map((view) => (
              <TabsContent value={view} key={view}>
                <p className="rhythm-caption" aria-live="polite">
                  {rhythm === "actual"
                    ? "Movement at 5:20 PM. Sleep at 11:50 PM. A day lived at your own pace."
                    : rhythm === "suggested"
                      ? "Late afternoon tends to work well for movement."
                      : "Your afternoon found its rhythm. Your evening settled a little later."}
                </p>
              </TabsContent>
            ))}
          </Tabs>
          <Link className="text-link" href="/app/rhythm">
            Find your rhythm <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="three-section">
        <div className="three-intro">
          <p className="eyebrow">03 / TODAY’S 3</p>
          <h2>
            You don’t need ten things.
            <br />
            <em>Just three.</em>
          </h2>
          <p>
            All that understanding, made useful.
            <br />
            Three small things for the day you’re actually having.
          </p>
        </div>
        <div className="three-actions">
          {actions.map((a, i) => (
            <Link href="/app/today" key={a.id}>
              <span>0{i + 1}</span>
              <h3>{a.title}</h3>
              <ArrowUpRight size={21} />
            </Link>
          ))}
        </div>
        <div className="three-ending">
          <OrganicForm progress={3} />
          <p>
            And when you’re done?
            <br />
            <span>That’s enough for today.</span>
          </p>
        </div>
      </section>
      <section className="learning-section">
        <div className="learning-heading">
          <p className="eyebrow">A LITTLE TIME. A BETTER UNDERSTANDING.</p>
          <h2>
            Give it <em>three weeks.</em>
          </h2>
          <p>
            Wear your ring. Live normally.
            <br />
            3FIG starts learning what’s normal for you.
          </p>
        </div>
        <div className="learning-path">
          {[
            {
              time: "DAY 1",
              title: "Observe",
              detail: "Small signals, quietly gathered.",
            },
            {
              time: "WEEK 1",
              title: "Learn",
              detail: "Your everyday patterns begin to appear.",
            },
            {
              time: "WEEK 2",
              title: "Understand",
              detail: "A clearer picture of your personal baseline.",
            },
            {
              time: "AROUND WEEK 3",
              title: "Reveal",
              detail: "Your first 3FIG Age. Your first rhythm.",
            },
          ].map((s, i) => (
            <div key={s.title}>
              <span className={`learning-mark mark-${i}`} aria-hidden="true" />
              <p className="eyebrow">{s.time}</p>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </div>
          ))}
        </div>
        <Link className="text-link" href="/app">
          Experience your first three weeks <ArrowRight size={17} />
        </Link>
      </section>
      <section className="change-section">
        <div className="change-art" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">MADE FOR YOUR NEXT CHAPTER</p>
        <h2>
          Your body changes.
          <br />
          Understanding it
          <br />
          <em>should get easier.</em>
        </h2>
        <p>
          Sleep feels different. Energy comes and goes.
          <br />
          Recovery takes its own time.
        </p>
        <p>
          Designed with women in midlife in mind, 3FIG helps you see
          <br className="desktop-break" /> what’s changing, without making it
          your whole day.
        </p>
      </section>
      <section id="ring" className="feature-section ring-section">
        <div className="section-copy">
          <p className="eyebrow">QUIET TECHNOLOGY</p>
          <h2>
            It notices.
            <br />
            <em>3FIG makes sense of it.</em>
          </h2>
          <p>
            A simple ring, quietly gathering the signals of your everyday life.
            Sleep, movement, and resting patterns — turned into understanding.
          </p>
          <p className="ring-tagline">
            Quiet on your hand. Useful everywhere else.
          </p>
          <a className="text-link" href="#early-access">
            Be part of what’s next <ArrowRight size={17} />
          </a>
        </div>
        <div className="ring-display">
          <Ring finish={finish} />
          <div className="finish-picker" role="group" aria-label="Ring finish">
            <button
              onClick={() => setFinish("silver")}
              aria-pressed={finish === "silver"}
              aria-label="Soft silver"
            >
              <span className="silver-swatch" />
            </button>
            <button
              onClick={() => setFinish("gold")}
              aria-pressed={finish === "gold"}
              aria-label="Warm gold"
            >
              <span className="gold-swatch" />
            </button>
          </div>
          <p>{finish === "silver" ? "Soft silver" : "Warm gold"}</p>
          <span className="fine-print">
            Ring concept. Final hardware to be confirmed.
          </span>
        </div>
      </section>
      <section id="science" className="science-section">
        <div className="section-copy">
          <p className="eyebrow">SCIENCE, WITH PERSPECTIVE</p>
          <h2>
            Thoughtful by nature.
            <br />
            <em>Careful by design.</em>
          </h2>
          <p>
            Your body is more than a number. We think the way we talk about it
            should reflect that.
          </p>
        </div>
        <div className="science-details">
          <details open>
            <summary>
              A pattern, not a diagnosis.<span>+</span>
            </summary>
            <p>
              3FIG Age is a wellness estimate of the age your recent health
              pattern resembles. It isn’t a medically validated biological age,
              a diagnosis, or a prediction of disease.
            </p>
          </details>
          <details>
            <summary>
              Personal before precise.<span>+</span>
            </summary>
            <p>
              The proposed model starts with your personal baseline and
              considers age- and sex-relevant patterns from established
              population health research. An estimate should move only when
              sustained evidence supports a change. The values in this concept
              are illustrative.
            </p>
          </details>
          <details>
            <summary>
              Understanding takes time.<span>+</span>
            </summary>
            <p>
              About three weeks may be enough for a first view, depending on
              data quality. It is a starting point, not a definitive chronotype.
              Your rhythm becomes more personal over time. The ring does not
              measure hormones.
            </p>
          </details>
          <details>
            <summary>
              Our evidence, in the open.<span>+</span>
            </summary>
            <p>
              Verified references and a transparent method will be published
              here as the model is developed and evaluated.
            </p>
            <div className="reference-placeholder">
              RESEARCH LIBRARY
              <br />
              <span>Verified references to be added.</span>
            </div>
          </details>
        </div>
      </section>
      <section id="early-access" className="early-section">
        <p className="eyebrow">A LITTLE LESS TO MANAGE</p>
        <h2>
          More room <em>for you.</em>
        </h2>
        <p>Be among the first to get to know 3FIG.</p>
        {joined ? (
          <div className="signup-success" role="status">
            <Check size={22} />
            <h3>Your interest is saved.</h3>
            <p>
              This preview stores your request in this browser session.
              <br />
              You haven’t joined a live mailing list.
            </p>
            <button className="text-link" onClick={() => setJoined(false)}>
              Use a different email <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form
            className="signup-form"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                sessionStorage.setItem("3fig-interest", email.trim());
              } catch {}
              setJoined(true);
            }}
          >
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" aria-label="Claim Free Lifetime Access">
              <ArrowRight size={23} />
            </button>
          </form>
        )}
        <p className="early-note">
          {!joined && "Concept preview · Your email stays in this browser."}
        </p>
        <Link className="text-link" href="/app">
          Take a quiet look around <ArrowUpRight size={16} />
        </Link>
      </section>
      <footer className="site-footer">
        <Link href="/" aria-label="3FIG home">
          <Brand />
        </Link>
        <p>Three things. Just for today.</p>
        <nav aria-label="Footer">
          <button onClick={() => setPrivacy(true)}>Privacy</button>
          <Link href="/design">Design system</Link>
          <Link href="/app">Try 3FIG</Link>
        </nav>
        <span>© 2026 3FIG</span>
      </footer>
      <Dialog open={privacy} onOpenChange={setPrivacy}>
        <DialogContent className="fig-dialog">
          <DialogTitle>Yours to understand.</DialogTitle>
          <DialogDescription>
            Wearable readings remain sample data. Actions, the quick journal,
            settings, and the interest form stay in this browser session. Skin
            areas you choose to save and entries added to signal history are
            stored privately in your signed-in account. Original photos are not
            uploaded; photo observations are calculated on your device. Hosting
            infrastructure may process ordinary request information.
          </DialogDescription>
          <p>
            Open a saved photo or signal’s history to remove a record. Resetting
            the app preview clears only its browser-session state.
          </p>
          <Link className="text-link" href="/app/you/privacy">
            Your data controls <ArrowRight size={16} />
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";
import Link from "./navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Brand, OrganicForm, RhythmDial } from "./visuals";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
export default function DesignSystem() {
  const [checked, setChecked] = useState(false),
    [enabled, setEnabled] = useState(false);
  return (
    <main className="design-page">
      <header>
        <Link href="/" aria-label="3FIG home">
          <Brand />
        </Link>
        <Link className="text-link" href="/">
          <ArrowLeft size={16} /> Back to the experience
        </Link>
      </header>
      <div className="design-intro">
        <p className="eyebrow">3FIG / DESIGN LANGUAGE / 03 — QUIET COLOR</p>
        <h1>A softer kind of clarity.</h1>
        <p>Warm light. Quiet surfaces. A little room for you.</p>
      </div>
      <section>
        <div className="design-label">
          <span>01</span>
          <h2>Foundations</h2>
        </div>
        <div className="color-swatches">
          {[
            ["Pearl", "#F7F8FA"],
            ["Ink", "#302C35"],
            ["Plum", "#4B354C"],
            ["Rose", "#F16AAB"],
            ["Apricot", "#FFBB98"],
            ["Lavender", "#C4B5E9"],
            ["Periwinkle", "#D7DDF6"],
            ["Citron", "#E7F58E"],
          ].map(([label, color]) => (
            <div key={color}>
              <span style={{ background: color }} />
              <h3>{label}</h3>
              <p>{color}</p>
            </div>
          ))}
        </div>
        <p className="design-note">
          Pearl makes room. Apricot, rose, and lavender carry warmth. Plum
          anchors text and actions. Citron is a small accent; status always
          includes a label or a control state.
        </p>
      </section>
      <section>
        <div className="design-label">
          <span>02</span>
          <h2>Type with room to breathe</h2>
        </div>
        <div className="type-specimens">
          <div>
            <span className="eyebrow">DISPLAY / INSTRUMENT SERIF / 400</span>
            <p>Know your body.</p>
            <em>Do what matters.</em>
          </div>
          <div>
            <span className="eyebrow">NUMERALS / HELVETICA NEUE / 300</span>
            <strong>44.7</strong>
            <p className="type-label">3FIG Age</p>
          </div>
        </div>
        <p className="design-note">
          Instrument Serif gives headlines an open, human rhythm. Helvetica Neue
          keeps controls and measurements clear. Body 16–18px; display headings
          35–47px in the app. Quiet metadata stays secondary.
        </p>
      </section>
      <section>
        <div className="design-label">
          <span>03</span>
          <h2>A day, gently complete</h2>
        </div>
        <div className="form-states">
          {[0, 1, 2, 3].map((n) => (
            <div key={n}>
              <OrganicForm progress={n} />
              <span>{n} / 3</span>
              <p>
                {
                  [
                    "Room to begin.",
                    "A small beginning.",
                    "A little more care.",
                    "That’s enough for today.",
                  ][n]
                }
              </p>
            </div>
          ))}
        </div>
        <p className="design-note">
          The original sculptural fig becomes clearer as the three actions are
          completed. Its shape and inner highlights stay familiar; lavender,
          rose and peach gently deepen. There is no bounce or continuous motion.
        </p>
      </section>
      <section>
        <div className="design-label">
          <span>04</span>
          <h2>Useful, quiet controls</h2>
        </div>
        <div className="control-specimens">
          <button className="button" onClick={() => setChecked(!checked)}>
            A small action <ArrowRight size={17} />
          </button>
          <button
            className="button button-light"
            onClick={() => setEnabled(!enabled)}
          >
            A quieter option
          </button>
          <label>
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(!!v)}
            />{" "}
            {checked ? "Done for today" : "A little movement"}
          </label>
          <label>
            <Switch checked={enabled} onCheckedChange={setEnabled} /> Gentle
            reminders
          </label>
        </div>
        <p className="design-note">
          Plum marks the primary action. Translucent white keeps other choices
          light. Rounded panels, 8–24px spacing, visible focus and generous
          touch areas keep the experience easy to navigate.
        </p>
      </section>
      <section>
        <div className="design-label">
          <span>05</span>
          <h2>A little light. A little depth.</h2>
        </div>
        <div className="design-surface-examples">
          <div className="surface-light">
            <h3>Atmosphere</h3>
            <p>
              A trace of apricot, rose and lavender, diffused into pearl. Color
              stays behind the content, with no decorative imagery.
            </p>
          </div>
          <div className="surface-glass">
            <h3>Soft glass</h3>
            <p>
              Translucent surfaces, a softly blurred backdrop and a fine light
              edge. The color beneath remains visible.
            </p>
          </div>
          <div className="surface-paper">
            <h3>Clear space</h3>
            <p>
              A denser glass surface for forms and dialogs. Enough separation to
              read clearly, without a solid white box.
            </p>
          </div>
        </div>
        <p className="design-note">
          Panel radius 36–40px. Pills and circular controls use a full radius.
          App dialogs remain inside the device with a 12px inset and scroll
          internally.
        </p>
      </section>
      <section className="design-rhythm">
        <div>
          <div className="design-label">
            <span>06</span>
            <h2>Time, made human</h2>
          </div>
          <h3>Late afternoon works well for movement.</h3>
          <p>
            The sentence comes first. The outer bands show suggested timing.
            Inner dots show the actual day. Detailed times remain available as
            text in the app.
          </p>
          <div className="dial-legend">
            <span>
              <i className="legend-band" />
              Suggested
            </span>
            <span>
              <i className="legend-dot" />
              Actual
            </span>
          </div>
        </div>
        <RhythmDial />
      </section>
      <section>
        <div className="design-label">
          <span>07</span>
          <h2>Language that leaves you lighter</h2>
        </div>
        <div className="voice-examples">
          <p>“Your sleep has been helping.”</p>
          <p>“Late afternoon may suit you better.”</p>
          <p>“That’s enough for today.”</p>
        </div>
        <p className="design-note">
          Everyday language. No guilt, urgency, medical certainty, or reward
          mechanics. Explain a pattern without turning it into a verdict.
        </p>
      </section>
      <footer>
        <Brand />
        <span>Meaning before data. Three actions. No more.</span>
        <Link className="text-link" href="/app">
          Experience 3FIG <ArrowRight size={16} />
        </Link>
      </footer>
    </main>
  );
}

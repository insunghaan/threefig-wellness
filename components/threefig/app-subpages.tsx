"use client";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Moon,
  Bluetooth,
  BatteryFull,
} from "./app-icons";
import Link from "./navigation";
import { Ring, OrganicForm } from "./visuals";
import { usePrototype } from "@/lib/threefig/state";
import { pattern } from "@/lib/threefig/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AppDialogContent } from "./app-dialog";
function DetailScreen({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="detail-screen">
      <Link className="detail-back" href="/app/you">
        <ArrowLeft size={17} /> Back to You
      </Link>
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
export function RingSettings() {
  const { state, update } = usePrototype();
  const [synced, setSynced] = useState(false);
  return (
    <DetailScreen label="QUIETLY WORKING" title="Your ring.">
      <p className="screen-subtitle">
        {state.ringConnected
          ? "Connected. Quietly keeping up with you."
          : "Ready whenever you are."}
      </p>
      <Ring finish={state.finish} />
      <div className="ring-setting-facts">
        <span>
          <Bluetooth size={15} /> Connection
        </span>
        <strong>{state.ringConnected ? "Connected" : "Disconnected"}</strong>
        <span>
          <BatteryFull size={15} /> Battery
        </span>
        <strong>82%</strong>
        <span>Finish</span>
        <strong>
          {state.finish === "silver" ? "Soft silver" : "Warm gold"}
        </strong>
      </div>
      <div className="finish-picker" role="group" aria-label="Ring finish">
        <button
          aria-pressed={state.finish === "silver"}
          aria-label="Soft silver"
          onClick={() => update({ finish: "silver" })}
        >
          <span className="silver-swatch" />
        </button>
        <button
          aria-pressed={state.finish === "gold"}
          aria-label="Warm gold"
          onClick={() => update({ finish: "gold" })}
        >
          <span className="gold-swatch" />
        </button>
      </div>
      <div className="detail-buttons">
        <button
          className="button full"
          disabled={!state.ringConnected}
          onClick={() => setSynced(true)}
        >
          {synced ? "You’re up to date" : "Sync demo ring"}
          {synced ? <Check size={17} /> : <ArrowRight size={17} />}
        </button>
        <p className="setting-feedback" role="status">
          {synced
            ? "Your sample signals are up to date."
            : state.ringConnected
              ? "Your sample data is ready to sync."
              : "Reconnect your demo ring to sync."}
        </p>
        <button
          className="button button-light full"
          onClick={() => {
            update({ ringConnected: !state.ringConnected });
            setSynced(false);
          }}
        >
          {state.ringConnected ? "Disconnect demo ring" : "Reconnect demo ring"}
          <Bluetooth size={17} />
        </button>
      </div>
      <details className="detail-disclosure">
        <summary>What does the ring notice?</summary>
        <p>
          Sleep timing, movement, and supported resting heart patterns.
          Available signals depend on the final hardware. The ring does not
          measure hormones.
        </p>
      </details>
      <p className="fine-print">Simulated hardware. No device is connected.</p>
    </DetailScreen>
  );
}
const interests = [
  "Sleep",
  "Energy",
  "Aging",
  "Recovery",
  "Daily rhythm",
  "Changes after 40",
];
const contexts = [
  "Changing sleep",
  "Fluctuating energy",
  "Feeling warmer",
  "A new routine",
  "Perimenopause",
  "Menopause",
];
export function ProfileSettings() {
  const { state, update } = usePrototype();
  const [age, setAge] = useState(String(state.calendarAge)),
    [selected, setSelected] = useState(state.interests),
    [context, setContext] = useState(state.context),
    [saved, setSaved] = useState(false);
  function toggle(
    value: string,
    values: string[],
    set: (next: string[]) => void,
  ) {
    set(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );
    setSaved(false);
  }
  return (
    <DetailScreen label="YOUR CONTEXT" title="A little about you.">
      <p className="screen-subtitle">Your context, in your own time.</p>
      <form
        className="profile-form detail-form"
        onSubmit={(e) => {
          e.preventDefault();
          update({ calendarAge: Number(age), interests: selected, context });
          setSaved(true);
        }}
      >
        <label htmlFor="profile-age">Calendar age</label>
        <input
          id="profile-age"
          type="number"
          min="18"
          max="100"
          required
          inputMode="numeric"
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setSaved(false);
          }}
        />
        <p className="journal-label">What you’d like to understand</p>
        <div className="journal-tags">
          {interests.map((s) => (
            <label key={s} className={selected.includes(s) ? "selected" : ""}>
              <Checkbox
                aria-label={s}
                checked={selected.includes(s)}
                onCheckedChange={() => toggle(s, selected, setSelected)}
              />
              {s}
            </label>
          ))}
        </div>
        <p className="journal-label">Optional context</p>
        <div className="journal-tags">
          {contexts.map((s) => (
            <label key={s} className={context.includes(s) ? "selected" : ""}>
              <Checkbox
                aria-label={s}
                checked={context.includes(s)}
                onCheckedChange={() => toggle(s, context, setContext)}
              />
              {s}
            </label>
          ))}
        </div>
        <button className="button full" type="submit">
          {saved ? "Details saved" : "Save your details"}
          {saved ? <Check size={17} /> : <ArrowRight size={17} />}
        </button>
        <p className="setting-feedback" role="status">
          {saved
            ? "Your details are saved in this browser session."
            : "Changes are saved only when you choose Save."}
        </p>
      </form>
    </DetailScreen>
  );
}
export function NotificationSettings() {
  const { state, update } = usePrototype();
  const [time, setTime] = useState(state.reminderTime),
    [enabled, setEnabled] = useState(state.reminders),
    [saved, setSaved] = useState(false);
  return (
    <DetailScreen label="ON YOUR TERMS" title="A gentle reminder.">
      <p className="screen-subtitle">A quiet nudge. Only if you want it.</p>
      <OrganicForm progress={1} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ reminders: enabled, reminderTime: time });
          setSaved(true);
        }}
      >
        <div className="reminder-setting">
          <label htmlFor="reminder-enabled">
            Evening reminder<small>A moment to start slowing down</small>
          </label>
          <Switch
            id="reminder-enabled"
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v);
              setSaved(false);
            }}
          />
        </div>
        <label className="journal-label" htmlFor="reminder-time">
          A time that suits you
        </label>
        <input
          className="time-input"
          id="reminder-time"
          type="time"
          required
          value={time}
          disabled={!enabled}
          onChange={(e) => {
            setTime(e.target.value);
            setSaved(false);
          }}
        />
        <button className="button full" type="submit">
          {saved ? "Preference saved" : "Save preference"}
          {saved ? <Check size={17} /> : <ArrowRight size={17} />}
        </button>
        <p className="setting-feedback" role="status">
          {saved
            ? "Your reminder preference is saved."
            : "You can change your mind at any time."}
        </p>
      </form>
      <p className="fine-print">
        Preview setting only. No notifications are scheduled or sent.
      </p>
    </DetailScreen>
  );
}
export function JournalScreen({ onEdit }: { onEdit: () => void }) {
  const { state } = usePrototype();
  const j = state.journal;
  return (
    <DetailScreen
      label="YOUR QUICK JOURNAL"
      title={j ? "A moment from today." : "How did today feel?"}
    >
      <p className="screen-subtitle">
        A little context. Nothing to keep up with.
      </p>
      {j ? (
        <div className="journal-entry">
          <p className="eyebrow">THURSDAY, SEPTEMBER 10</p>
          <h2>{j.mood || "In your own words."}</h2>
          {j.tags.length > 0 && (
            <div className="saved-tags">
              {j.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          )}
          <p className="journal-quote">
            {j.note || "A moment noticed. That’s enough."}
          </p>
          <button className="button full" onClick={onEdit}>
            Edit today’s note <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <OrganicForm progress={0} />
          <p className="detail-paragraph">
            Good, okay, or hard. A few words can help us understand your day,
            but you don’t need to record anything.
          </p>
          <button className="button full" onClick={onEdit}>
            Add a quick note <ArrowRight size={17} />
          </button>
        </>
      )}
      <Link className="detail-next" href="/app/insights">
        <span>
          A pattern worth noticing<small>When context adds understanding</small>
        </span>
        <ArrowRight size={17} />
      </Link>
    </DetailScreen>
  );
}
export function InsightsScreen() {
  return (
    <DetailScreen label="WE’VE NOTICED" title="Warm nights. More wake-ups.">
      <p className="detail-paragraph">{pattern}</p>
      <div className="pattern-illustration" aria-hidden="true">
        <div>
          <Moon size={21} />
          <span />
          <span />
          <span />
        </div>
        <div>
          <Moon size={21} />
          <span />
          <i />
          <span />
          <i />
          <span />
        </div>
      </div>
      <div className="insight-copy">
        <h2>A little context helps.</h2>
        <p>
          Your ring notices changes in sleep. When you choose to add how you
          felt, the two can tell a fuller story.
        </p>
        <h2>Something to notice, gently.</h2>
        <p>
          Keep your evening comfortable. If you feel like it, add a quick note
          after a warmer night. There’s no need to track every detail.
        </p>
      </div>
      <Link className="button full" href="/app/journal">
        Your quick journal <ArrowRight size={17} />
      </Link>
      <p className="fine-print">
        Illustrative pattern from earlier sample entries. This is an
        association, not a diagnosis or an explanation of its cause.
      </p>
    </DetailScreen>
  );
}
export function PrivacySettings({ onReset }: { onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const { state } = usePrototype();
  return (
    <DetailScreen label="YOURS, ALWAYS" title="On your terms.">
      <p className="detail-paragraph">
        A little understanding should come with a clear view of your data.
      </p>
      <div className="privacy-items">
        <div>
          <h2>Your body signals</h2>
          <p>
            Illustrative sample data. No wearable or health account is
            connected.
          </p>
        </div>
        <div>
          <h2>Your journal & choices</h2>
          <p>
            Saved only in this tab’s browser session. They are not sent to a
            3FIG backend.
          </p>
        </div>
        <div>
          <h2>Skin photos & signal entries</h2>
          <p>
            Selected skin areas, photo observations, and entries you add to a
            signal are saved to your private account. Your original photo is not
            uploaded. Image observations are calculated on your device; no
            external AI service receives your photo.
          </p>
          <Link className="text-link" href="/app/skin/history">
            Manage skin photos <ArrowRight size={15} />
          </Link>
          <Link className="text-link" href="/app/signals">
            Manage signal records <ArrowRight size={15} />
          </Link>
        </div>
        <div>
          <h2>Your reminders</h2>
          <p>
            {state.reminders
              ? "Your local preference is on."
              : "Your local preference is off."}{" "}
            No notifications are scheduled.
          </p>
        </div>
        <div>
          <h2>Closing this preview</h2>
          <p>
            Your browser may restore a previous session. Use the control below
            to explicitly clear your app choices and journal. Saved skin photos
            and signal entries remain in your account; remove those from their
            history screens.
          </p>
        </div>
      </div>
      <button
        className="button button-light full"
        onClick={() => setConfirm(true)}
      >
        Clear app session <ArrowRight size={17} />
      </button>
      <p className="fine-print">
        The landing-page interest form has separate browser storage. Hosting
        infrastructure may process ordinary request information.
      </p>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <AppDialogContent>
          <p className="eyebrow">A FRESH START</p>
          <DialogTitle>Clear your app session?</DialogTitle>
          <DialogDescription>
            This removes your journal, completed actions, and settings from this
            browser session and returns you to the beginning. Your saved photos
            and signal records are kept.
          </DialogDescription>
          <button className="button full" onClick={onReset}>
            Clear & start again <ArrowRight size={17} />
          </button>
          <button
            className="button button-light full"
            onClick={() => setConfirm(false)}
          >
            Keep my session
          </button>
        </AppDialogContent>
      </Dialog>
    </DetailScreen>
  );
}

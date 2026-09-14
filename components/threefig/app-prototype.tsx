"use client";
import { useEffect, useState } from "react";
import Link from "./navigation";
import { navigate } from "./navigation";
import {
  AppDialogProvider,
  AppDialogHost,
  AppDialogContent as DialogContent,
} from "./app-dialog";
import { SignalsScreen, MetricScreen } from "./signal-screens";
import {
  SkinHome,
  SkinCapture,
  SkinHistory,
  SkinCompare,
  SkinRecordScreen,
} from "./skin-screens";
import {
  RingSettings,
  ProfileSettings,
  PrivacySettings,
  NotificationSettings,
  JournalScreen,
  InsightsScreen,
} from "./app-subpages";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Circle,
  Sun,
  Activity,
  UserRound,
  Plus,
  BatteryFull,
  Bluetooth,
  Moon,
} from "./app-icons";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brand, OrganicForm, RhythmDial, Ring } from "./visuals";
import { AgeCounter } from "./age-counter";
import { usePrototype, type Journal } from "@/lib/threefig/state";
import {
  profile,
  actions,
  contributors,
  suggested,
  actual,
  pattern,
} from "@/lib/threefig/mock-data";

type Screen =
  | "welcome"
  | "today"
  | "age"
  | "rhythm"
  | "you"
  | "ring"
  | "profile"
  | "privacy"
  | "notifications"
  | "journal"
  | "insights"
  | "signals"
  | "metric"
  | "skin"
  | "skin-capture"
  | "skin-history"
  | "skin-compare"
  | "skin-record";
const navigation = [
  { key: "today", label: "Today", Icon: Sun },
  { key: "age", label: "Age", Icon: Circle },
  { key: "rhythm", label: "Rhythm", Icon: Activity },
  { key: "you", label: "You", Icon: UserRound },
];
export default function AppScreen({
  screen,
  metricId,
  recordId,
}: {
  screen: Screen;
  metricId?: string;
  recordId?: string;
}) {
  const { state, loaded, sample, reset, enterApp } = usePrototype();
  const [journal, setJournal] = useState(false),
    [insight, setInsight] = useState(false);
  useEffect(() => {
    if (loaded && screen !== "welcome") enterApp();
  }, [loaded, screen, enterApp]);
  const ready = state.stage === "ready",
    active = screen === "welcome" ? "today" : screen;
  function start() {
    reset();
    navigate("/app");
  }
  function demo() {
    sample();
    navigate("/app/today");
  }
  return (
    <AppDialogProvider>
      <div className="prototype-page">
        <aside className="prototype-aside">
          <Link href="/" aria-label="Back to 3FIG website">
            <Brand />
          </Link>
          <div className="prototype-intro">
            <p className="eyebrow">THE 3FIG EXPERIENCE</p>
            <h1>
              A little closer
              <br />
              to <em>yourself.</em>
            </h1>
            <p>
              Less to manage.
              <br />
              More to understand.
            </p>
          </div>
          <div className="prototype-controls">
            <p className="eyebrow">EXPLORE THE CONCEPT</p>
            <button disabled={!loaded} onClick={start}>
              Start from the beginning <ArrowRight size={17} />
            </button>
            <button disabled={!loaded} onClick={demo}>
              Step into a typical day <ArrowRight size={17} />
            </button>
            <Link href="/design">
              Our design language <ArrowUpRight size={17} />
            </Link>
          </div>
          <p className="prototype-disclaimer">
            Concept preview · Sample wearable data
            <br />
            No wearable connection or medical assessment.
          </p>
          <Link className="text-link" href="/">
            <ArrowLeft size={15} /> Back to 3FIG
          </Link>
        </aside>
        <div className="mobile-prototype-bar">
          <Link href="/" aria-label="Back to website">
            <ArrowLeft size={16} />
          </Link>
          <span>3FIG / CONCEPT PREVIEW</span>
          <button disabled={!loaded} onClick={start}>
            Restart
          </button>
        </div>
        <div className="app-device" data-screen={active}>
          <div className="app-status">
            <span>9:41</span>
            <span className="status-icons">
              <Activity size={13} />
              <BatteryFull size={17} />
            </span>
          </div>
          <header className="app-header">
            <Brand />
            {ready ? (
              <>
                <span>THU, SEPT 10</span>
                <button
                  aria-label="Open quick journal"
                  onClick={() => setJournal(true)}
                >
                  <Plus size={20} />
                </button>
              </>
            ) : (
              <span>YOUR OWN PACE</span>
            )}
          </header>
          <main
            className={`app-content ${!ready ? "flow-content" : ""}`}
            id="app-main"
          >
            {!loaded ? (
              <div className="app-loading">Getting settled…</div>
            ) : !ready ? (
              <FirstWeeks />
            ) : active === "today" ? (
              <Today onJournal={() => setJournal(true)} />
            ) : active === "age" ? (
              <Age />
            ) : active === "rhythm" ? (
              <Rhythm />
            ) : active === "signals" ? (
              <SignalsScreen />
            ) : active === "metric" ? (
              <MetricScreen metricId={metricId || ""} />
            ) : active === "skin" ? (
              <SkinHome />
            ) : active === "skin-capture" ? (
              <SkinCapture />
            ) : active === "skin-history" ? (
              <SkinHistory />
            ) : active === "skin-compare" ? (
              <SkinCompare />
            ) : active === "skin-record" ? (
              <SkinRecordScreen recordId={recordId || ""} />
            ) : active === "ring" ? (
              <RingSettings />
            ) : active === "profile" ? (
              <ProfileSettings />
            ) : active === "privacy" ? (
              <PrivacySettings onReset={start} />
            ) : active === "notifications" ? (
              <NotificationSettings />
            ) : active === "journal" ? (
              <JournalScreen onEdit={() => setJournal(true)} />
            ) : active === "insights" ? (
              <InsightsScreen />
            ) : (
              <You onRestart={start} />
            )}
          </main>
          {ready && (
            <nav className="app-nav" aria-label="App navigation">
              {navigation.map(({ key, label, Icon }) => (
                <Link
                  href={`/app/${key}`}
                  key={key}
                  aria-current={
                    active === key ||
                    (key === "you" &&
                      [
                        "ring",
                        "profile",
                        "privacy",
                        "notifications",
                        "journal",
                        "insights",
                        "signals",
                        "metric",
                        "skin",
                        "skin-capture",
                        "skin-history",
                        "skin-compare",
                        "skin-record",
                      ].includes(active))
                      ? "page"
                      : undefined
                  }
                >
                  <Icon size={21} strokeWidth={1.4} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          )}
          <div className="device-bottom">
            <div className="home-indicator" />
          </div>
          <AppDialogHost />
        </div>
        <aside className="prototype-side-note">
          <span>
            ONE SCREEN.
            <br />
            ONE IDEA.
          </span>
          <p>
            Three things.
            <br />
            Just for today.
          </p>
          <span>01 — 3FIG</span>
        </aside>
        <JournalModal
          open={journal}
          onOpenChange={setJournal}
          onInsight={() => setInsight(true)}
        />
        <PatternModal open={insight} onOpenChange={setInsight} />
      </div>
    </AppDialogProvider>
  );
}
function FirstWeeks() {
  const { state, update, sample } = usePrototype();
  const [connecting, setConnecting] = useState(false),
    [age, setAge] = useState(String(state.calendarAge));
  useEffect(() => {
    if (!connecting) return;
    const timer = setTimeout(() => {
      update({ ringConnected: true, step: 4 });
      setConnecting(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [connecting]);
  const toggle = (field: "interests" | "context", value: string) =>
    update({
      [field]: state[field].includes(value)
        ? state[field].filter((s) => s !== value)
        : [...state[field], value],
    });
  if (state.stage === "welcome")
    return (
      <div className="welcome-screen flow-screen">
        <p className="eyebrow">A QUIETER KIND OF WELLNESS</p>
        <h1>
          Let’s get to know
          <br />
          your body.
        </h1>
        <OrganicForm progress={2} />
        <p>
          You live your life.
          <br />
          We’ll help you understand the signals.
        </p>
        <div className="flow-bottom">
          <button
            className="button full"
            onClick={() => update({ stage: "onboarding", step: 0, day: 0 })}
          >
            Begin with you <ArrowRight size={18} />
          </button>
          <button className="text-link" onClick={sample}>
            Explore a sample day
          </button>
        </div>
      </div>
    );
  if (state.stage === "onboarding")
    return (
      <div className="flow-screen onboarding-screen">
        <div className="flow-step">
          <button
            aria-label="Previous step"
            onClick={() =>
              state.step === 0
                ? update({ stage: "welcome" })
                : update({ step: state.step - 1 })
            }
          >
            <ArrowLeft size={19} />
          </button>
          <span>{state.step + 1} OF 5</span>
        </div>
        {state.step === 0 ? (
          <>
            <p className="eyebrow">A PLACE TO BEGIN</p>
            <h1>A little about you.</h1>
            <p>Your calendar age gives your patterns a little context.</p>
            <form
              className="age-form"
              onSubmit={(e) => {
                e.preventDefault();
                update({ calendarAge: Number(age), step: 1 });
              }}
            >
              <label htmlFor="calendar-age">Your calendar age</label>
              <div>
                <input
                  id="calendar-age"
                  type="number"
                  inputMode="numeric"
                  min="18"
                  max="100"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <span>years</span>
              </div>
              <p>You can change this later.</p>
              <button className="button full" type="submit">
                Continue <ArrowRight size={18} />
              </button>
            </form>
          </>
        ) : state.step === 1 ? (
          <>
            <p className="eyebrow">WHAT BRINGS YOU HERE?</p>
            <h1>
              What would you like
              <br />
              to understand?
            </h1>
            <p>Choose what’s on your mind.</p>
            <div className="interest-list">
              {[
                "Sleep",
                "Energy",
                "Aging",
                "Recovery",
                "Daily rhythm",
                "Changes after 40",
              ].map((s) => (
                <label key={s}>
                  <span>{s}</span>
                  <Checkbox
                    aria-label={s}
                    checked={state.interests.includes(s)}
                    onCheckedChange={() => toggle("interests", s)}
                  />
                </label>
              ))}
            </div>
            <button className="button full" onClick={() => update({ step: 2 })}>
              Continue <ArrowRight size={18} />
            </button>
          </>
        ) : state.step === 2 ? (
          <>
            <p className="eyebrow">ONLY IF YOU’D LIKE</p>
            <h1>
              Anything else
              <br />
              on your mind?
            </h1>
            <p>A little context helps. Sharing it is always your choice.</p>
            <div className="context-options">
              {[
                "Changing sleep",
                "Fluctuating energy",
                "Feeling warmer",
                "A new routine",
                "Perimenopause",
                "Menopause",
              ].map((s) => (
                <label
                  key={s}
                  className={state.context.includes(s) ? "selected" : ""}
                >
                  <Checkbox
                    aria-label={s}
                    checked={state.context.includes(s)}
                    onCheckedChange={() => toggle("context", s)}
                  />
                  {s}
                </label>
              ))}
            </div>
            <p className="gentle-note">
              You don’t need a label to get to know your body.
            </p>
            <div className="flow-bottom">
              <button
                className="button full"
                onClick={() => update({ step: 3 })}
              >
                Continue <ArrowRight size={18} />
              </button>
              <button
                className="text-link"
                onClick={() => update({ context: [], step: 3 })}
              >
                Skip for now
              </button>
            </div>
          </>
        ) : state.step === 3 ? (
          <>
            <p className="eyebrow">QUIETLY CONNECTED</p>
            <h1>A small beginning.</h1>
            <p>
              Your ring gathers the signals.
              <br />
              3FIG helps make sense of them.
            </p>
            <Ring finish={state.finish} />
            <div className="flow-bottom">
              <button
                className="button full"
                disabled={connecting}
                onClick={() => setConnecting(true)}
              >
                {connecting ? "Finding your ring…" : "Connect demo ring"}
                <Bluetooth size={17} />
              </button>
              <p className="fine-print" role="status">
                {connecting
                  ? "Keep this preview open for a moment."
                  : "Simulated connection. No Bluetooth required."}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">YOU’RE CONNECTED</p>
            <h1>
              Wear it.
              <br />
              Live normally.
              <br />
              <em>We’ll do the rest.</em>
            </h1>
            <OrganicForm progress={1} />
            <p>
              We’ll take about three weeks to learn your baseline. There’s
              nothing to get right.
            </p>
            <div className="flow-bottom">
              <button
                className="button full"
                onClick={() => update({ stage: "calibration", day: 3 })}
              >
                Let’s begin <ArrowRight size={18} />
              </button>
              <p className="fine-print">This preview takes you to day 3.</p>
            </div>
          </>
        )}
      </div>
    );
  if (state.stage === "calibration") {
    const day = state.day;
    const title =
      day <= 7
        ? "Learning your sleep."
        : day <= 14
          ? "Your rhythm is starting to appear."
          : "Almost there.";
    return (
      <div className="flow-screen calibration-screen">
        <p className="eyebrow">DAY {day} / GETTING TO KNOW YOU</p>
        <h1>{title}</h1>
        <p>
          {day <= 7
            ? "A few nights in. We’re getting to know your rhythm."
            : day <= 14
              ? "We’re learning what’s normal for you, one ordinary day at a time."
              : "Your baseline is getting clearer. Your first Age and rhythm are nearly ready."}
        </p>
        <div className="calibration-visual">
          <OrganicForm progress={day <= 7 ? 0 : day <= 14 ? 1 : 2} />
          <div
            className="calibration-days"
            aria-label={`Day ${day} of about 21`}
          >
            {Array.from({ length: 21 }, (_, i) => (
              <span key={i} className={i < day ? "observed" : ""} />
            ))}
          </div>
          <p className="calibration-count">
            {day}
            <span> / about 21 days</span>
          </p>
        </div>
        <p className="gentle-note">
          For now, just live your life.
          <br />
          Your body is giving us plenty to learn.
        </p>
        <div className="flow-bottom">
          <p className="eyebrow preview-time">PREVIEW THE NEXT MOMENT</p>
          <button
            className="button button-light full"
            onClick={() =>
              day === 3
                ? update({ day: 10 })
                : day === 10
                  ? update({ day: 20 })
                  : update({ day: 21, stage: "age-ready" })
            }
          >
            {day === 3
              ? "Go to day 10"
              : day === 10
                ? "Go to day 20"
                : "Go to your first reveal"}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }
  if (state.stage === "age-ready")
    return (
      <div className="flow-screen ready-screen">
        <p className="eyebrow">DAY 21 / A FIRST UNDERSTANDING</p>
        <OrganicForm progress={3} />
        <h1>
          Your first
          <br />
          3FIG Age is ready.
        </h1>
        <p>
          Three weeks of living.
          <br />A little more understanding.
        </p>
        <div className="flow-bottom">
          <button
            className="button full"
            onClick={() => update({ stage: "age-reveal" })}
          >
            Meet your 3FIG Age <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  if (state.stage === "age-reveal")
    return (
      <div className="flow-screen reveal-screen">
        <p className="eyebrow">YOUR FIRST 3FIG AGE</p>
        <div className="age-reveal-number"><AgeCounter value={profile.age} /></div>
        <p className="reveal-label">3FIG Age</p>
        <h1>
          {state.calendarAge - 44.7 >= 1
            ? `About ${Math.round(state.calendarAge - 44.7)} years younger.`
            : "A first look at your pattern."}
        </h1>
        <p>
          Your current health pattern looks closer to 44.7.
          <br />
          Your calendar age is {state.calendarAge}.
        </p>
        <p className="gentle-note">
          A starting point for understanding.
          <br />
          Not a clinical measure of biological age.
        </p>
        <div className="flow-bottom">
          <button
            className="button full"
            onClick={() => update({ stage: "rhythm-ready" })}
          >
            And now, your rhythm <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  return (
    <div className="flow-screen rhythm-ready-screen">
      <p className="eyebrow">YOUR FIRST PERSONAL RHYTHM</p>
      <h1>
        Your body has
        <br />
        its own time.
      </h1>
      <RhythmDial mode="suggested" />
      <p>
        Late afternoon tends to work well for movement. This is a first view —
        it gets more personal over time.
      </p>
      <div className="flow-bottom">
        <button
          className="button full"
          onClick={() => update({ stage: "ready" })}
        >
          See today’s three <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
function Today({ onJournal }: { onJournal: () => void }) {
  const { state, toggleAction } = usePrototype(),
    [detail, setDetail] = useState<string | null>(null);
  const count = state.done.length;
  return (
    <div className={`today-screen ${count === 3 ? "day-complete" : ""}`}>
      <p className="eyebrow">TODAY’S 3</p>
      <h1 aria-live="polite">
        {count === 3 ? (
          <>
            That’s enough
            <br />
            for today.
          </>
        ) : (
          <>
            Three things.
            <br />
            Just for today.
          </>
        )}
      </h1>
      <OrganicForm progress={count} />
      <p className="daily-progress" aria-live="polite">
        {count} <span>/ 3</span>
        <em>
          {count === 3
            ? "A little care. A complete day."
            : "You don’t need to do everything."}
        </em>
      </p>
      <div className="daily-actions">
        {actions.map((a, i) => (
          <div
            className={`daily-action ${state.done.includes(a.id) ? "is-complete" : ""}`}
            key={a.id}
          >
            <div className="daily-action-main">
              <span className="action-number">0{i + 1}</span>
              <button
                className="action-title"
                aria-expanded={detail === a.id}
                onClick={() => setDetail(detail === a.id ? null : a.id)}
              >
                {a.title}
              </button>
              <Checkbox
                aria-label={`Complete: ${a.title}`}
                checked={state.done.includes(a.id)}
                onCheckedChange={() => toggleAction(a.id)}
              />
            </div>
            {detail === a.id && (
              <div className="action-detail">
                <p className="eyebrow">{a.time}</p>
                <p>{a.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="journal-prompt" onClick={onJournal}>
        <Plus size={16} />
        <span>How did today feel?</span>
        <span>Optional</span>
      </button>
      <p className="today-footnote">
        {count === 3
          ? "Nothing else needs your attention."
          : "A little understanding goes a long way."}
      </p>
    </div>
  );
}
function Age() {
  const { state } = usePrototype(),
    [why, setWhy] = useState(false);
  const delta = Math.round(state.calendarAge - profile.age),
    established = state.day > 21;
  return (
    <div className="age-screen">
      <p className="eyebrow">YOUR LONGER VIEW</p>
      <div className="age-main">
        <h1><AgeCounter value={profile.age} /></h1>
        <p>3FIG Age</p>
      </div>
      <h2>
        {delta > 0
          ? `About ${delta} years younger.`
          : "Your current health pattern."}
      </h2>
      <p className="age-calendar">Calendar age {state.calendarAge}</p>
      <div className="age-insight">
        <span className="subtle-pill">
          {established
            ? "−0.6 years since your last update"
            : "Your first estimate · Day 21"}
        </span>
        <p>
          Your sleep has been
          <br />
          more consistent lately.
        </p>
        <button className="text-link" onClick={() => setWhy(true)}>
          {established ? "Why has my Age changed?" : "What’s shaping my Age?"}{" "}
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="age-explanation">
        An estimate of the age your recent health pattern resembles. It changes
        when sustained patterns do.
      </p>
      <p className="fine-print">
        Illustrative wellness estimate. Not biological age.
      </p>
      <Link className="signal-context-link" href="/app/signals/age">
        Your Age history <ArrowRight size={15} />
      </Link>
      <Link className="signal-context-link" href="/app/signals">
        Explore your body signals <ArrowRight size={15} />
      </Link>
      <Dialog open={why} onOpenChange={setWhy}>
        <DialogContent className="fig-dialog age-dialog">
          <p className="eyebrow">A LITTLE MORE UNDERSTANDING</p>
          <DialogTitle>Your sleep has been helping.</DialogTitle>
          <DialogDescription>
            Small changes, sustained over time, give us a clearer picture.
          </DialogDescription>
          <div className="age-update">
            {established && (
              <>
                <span>45.3</span>
                <ArrowRight size={22} />
              </>
            )}
            <strong>44.7</strong>
          </div>
          <p className="fine-print">
            {established
              ? "Previous update → Current estimate · Sample history"
              : "Your first estimate · A starting point for understanding"}
          </p>
          <div className="contributors">
            {contributors.map((c) => (
              <details key={c.name}>
                <summary>
                  <div>
                    <span className="eyebrow">{c.status}</span>
                    <h3>{c.name}</h3>
                    <p>{c.detail}</p>
                  </div>
                  <ChevronRight size={18} />
                </summary>
                <p>{c.note}</p>
                <Link
                  className="text-link contributor-history"
                  href={`/app/signals/${c.name === "Sleep" ? "sleep-duration" : c.name === "Heart" ? "resting-heart-rate" : "active-minutes"}`}
                >
                  See records & trends <ArrowRight size={15} />
                </Link>
              </details>
            ))}
          </div>
          <details className="method-detail">
            <summary>How is this estimated?</summary>
            <p>
              The proposed model compares long-term sleep, resting heart
              patterns, and movement with age- and sex-relevant population
              patterns. Optional health context may refine it. These prototype
              values are sample data; no validated calculation is running here.
            </p>
          </details>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Rhythm() {
  const [mode, setMode] = useState("compare"),
    [why, setWhy] = useState(false);
  return (
    <div className="rhythm-screen">
      <p className="eyebrow">3FIG RHYTHM</p>
      <h1>
        Late afternoon
        <br />
        works well for movement.
      </h1>
      <p className="screen-subtitle">A little more in time with yourself.</p>
      <Tabs
        value={mode}
        onValueChange={setMode}
        className="rhythm-tabs app-rhythm-tabs"
      >
        <TabsList aria-label="Suggested and actual rhythm">
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="actual">Your day</TabsTrigger>
          <TabsTrigger value="compare">Together</TabsTrigger>
        </TabsList>
        {["suggested", "actual", "compare"].map((view) => (
          <TabsContent value={view} key={view}>
            <RhythmDial mode={view} />
            <div className="dial-legend">
              {view !== "actual" && (
                <span>
                  <i className="legend-band" />
                  Suggested
                </span>
              )}
              {view !== "suggested" && (
                <span>
                  <i className="legend-actual-line" />
                  Your day
                </span>
              )}
            </div>
            <p className="rhythm-observation">
              {view === "actual"
                ? "You moved at 5:20 PM. Your evening settled a little later."
                : view === "suggested"
                  ? "Your body tends to slow down after 9."
                  : "Your movement met your rhythm. Sleep came about 40 minutes later."}
            </p>
            <div className="rhythm-times">
              {(view === "actual" ? actual : suggested).map((s) => (
                <div key={s.label}>
                  <span>{s.label}</span>
                  <span>{s.time}</span>
                </div>
              ))}
            </div>
            {view === "compare" && (
              <details className="actual-details">
                <summary>See your actual day</summary>
                <div className="rhythm-times">
                  {actual.map((s) => (
                    <div key={s.label}>
                      <span>{s.label}</span>
                      <span>{s.time}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </TabsContent>
        ))}
      </Tabs>
      <Link className="signal-context-link" href="/app/signals/bedtime">
        Your sleep timing history <ArrowRight size={15} />
      </Link>
      <button className="text-link rhythm-why" onClick={() => setWhy(true)}>
        Your rhythm is getting more personal <ArrowRight size={15} />
      </button>
      <Dialog open={why} onOpenChange={setWhy}>
        <DialogContent className="fig-dialog">
          <p className="eyebrow">A GENTLY CHANGING RHYTHM</p>
          <DialogTitle>Your evenings have been shifting later.</DialogTitle>
          <DialogDescription>
            Over the past few weeks, you’ve been settling down later more often.
            We’ve gently moved your suggested slow-down time from 8:30 to around
            9.
          </DialogDescription>
          <p>
            One late night won’t reset your rhythm. We look for repeated
            patterns, then tell you when our understanding changes.
          </p>
          <p className="fine-print">
            Illustrative update. Your first rhythm is a starting point, not a
            definitive chronotype.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function JournalModal({
  open,
  onOpenChange,
  onInsight,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onInsight: () => void;
}) {
  const { state, update } = usePrototype();
  const [draft, setDraft] = useState<Journal>({ mood: "", tags: [], note: "" }),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    if (open) {
      setDraft(state.journal ?? { mood: "", tags: [], note: "" });
      setSaved(false);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fig-dialog journal-dialog">
        <p className="eyebrow">A MOMENT FOR YOU</p>
        <DialogTitle>
          {saved ? "A little context, kept." : "How did today feel?"}
        </DialogTitle>
        <DialogDescription>
          {saved
            ? "You don’t need to record anything else."
            : "A few seconds is enough. Everything here is optional."}
        </DialogDescription>
        {saved ? (
          <>
            <OrganicForm progress={2} />
            <button className="button full" onClick={() => onOpenChange(false)}>
              Back to your day <ArrowRight size={17} />
            </button>
            <button
              className="text-link"
              onClick={() => {
                onOpenChange(false);
                onInsight();
              }}
            >
              See a pattern we’ve noticed <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ journal: draft });
              setSaved(true);
            }}
          >
            <RadioGroup
              value={draft.mood}
              onValueChange={(mood) => setDraft({ ...draft, mood })}
              className="mood-options"
              aria-label="How today felt"
            >
              {["Good", "Okay", "Hard"].map((m, i) => (
                <label key={m} className={draft.mood === m ? "selected" : ""}>
                  <RadioGroupItem value={m} id={`mood-${m}`} />
                  <span className="mood-mark" aria-hidden="true">
                    {["◡", "—", "∿"][i]}
                  </span>
                  {m}
                </label>
              ))}
            </RadioGroup>
            <p className="journal-label">Anything you noticed?</p>
            <div className="journal-tags">
              {[
                "Warm",
                "Tired",
                "Restless",
                "Calm",
                "Strong",
                "Low energy",
              ].map((tag) => (
                <label
                  key={tag}
                  className={draft.tags.includes(tag) ? "selected" : ""}
                >
                  <Checkbox
                    aria-label={tag}
                    checked={draft.tags.includes(tag)}
                    onCheckedChange={() =>
                      setDraft({
                        ...draft,
                        tags: draft.tags.includes(tag)
                          ? draft.tags.filter((t) => t !== tag)
                          : [...draft.tags, tag],
                      })
                    }
                  />
                  {tag}
                </label>
              ))}
            </div>
            <label htmlFor="journal-note" className="journal-label">
              A little more, if you’d like
            </label>
            <textarea
              id="journal-note"
              placeholder="Anything on your mind…"
              maxLength={500}
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
            <button className="button full" type="submit">
              Keep this moment <ArrowRight size={17} />
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
function PatternModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fig-dialog pattern-dialog">
        <p className="eyebrow">WE’VE NOTICED</p>
        <DialogTitle>
          Warm nights.
          <br />
          More wake-ups.
        </DialogTitle>
        <DialogDescription>{pattern}</DialogDescription>
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
        <p>
          Your journal adds context to your sleep patterns. This is an
          association, not an explanation of what’s causing it.
        </p>
        <p className="fine-print">
          Illustrative pattern from earlier sample entries. One new journal
          entry doesn’t establish a pattern.
        </p>
      </DialogContent>
    </Dialog>
  );
}
function You({ onRestart }: { onRestart: () => void }) {
  const { state, update } = usePrototype();
  return (
    <div className="you-screen">
      <p className="eyebrow">A LITTLE SPACE FOR YOU</p>
      <h1>Hello, {profile.name}.</h1>
      <p className="screen-subtitle">Nothing to keep up with.</p>
      <Link className="ring-summary" href="/app/you/ring">
        <div className="mini-ring">
          <Ring finish={state.finish} />
        </div>
        <div>
          <h2>Your 3FIG ring</h2>
          <p>
            {state.ringConnected ? "Connected · 82% battery" : "Disconnected"}
          </p>
        </div>
        <ChevronRight size={18} />
      </Link>
      <div className="you-links">
        <Link href="/app/skin">
          <span>
            Skin check-in
            <small>A photo. A feeling. A little perspective.</small>
          </span>
          <ChevronRight size={18} />
        </Link>
        <Link href="/app/signals">
          <span>
            Your signals
            <small>Records, trends, and a little more context</small>
          </span>
          <ChevronRight size={18} />
        </Link>
        <Link href="/app/journal">
          <span>
            Your quick journal
            <small>
              {state.journal
                ? "A moment from today"
                : "Whenever you feel like it"}
            </small>
          </span>
          <ChevronRight size={18} />
        </Link>
        <Link href="/app/insights">
          <span>
            A pattern worth noticing<small>Warm nights and sleep</small>
          </span>
          <ChevronRight size={18} />
        </Link>
        <Link href="/app/you/profile">
          <span>
            About you
            <small>
              Age {state.calendarAge} ·{" "}
              {state.interests.join(", ") || "Your own interests"}
            </small>
          </span>
          <ChevronRight size={18} />
        </Link>
        <div className="reminder-setting">
          <Link href="/app/you/notifications">
            A gentle reminder
            <small>
              {state.reminders
                ? "Your evening reminder is on"
                : "Only if you want one"}
            </small>
          </Link>
          <Switch
            id="gentle-reminders"
            aria-label="A gentle reminder"
            checked={state.reminders}
            onCheckedChange={(reminders) => update({ reminders })}
          />
        </div>
        <Link href="/app/you/privacy">
          <span>Your data & privacy</span>
          <ChevronRight size={18} />
        </Link>
      </div>
      <button className="text-link replay-link" onClick={onRestart}>
        Revisit your first three weeks <ArrowRight size={16} />
      </button>
      <p className="fine-print you-fine">
        3FIG concept · Sample profile
        <br />
        Wellness understanding, not medical advice.
      </p>
    </div>
  );
}

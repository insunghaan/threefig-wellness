"use client";
import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Plus,
  Camera,
  Check,
  Trash2,
} from "./app-icons";
import Link from "./navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AppDialogContent } from "./app-dialog";
import {
  metrics,
  metricById,
  sampleRecords,
  formatMetric,
  windowRecords,
  recordSummary,
  dayLabel,
  exampleEnd,
  type Metric,
  type SignalRecord,
} from "@/lib/threefig/metrics";
import { useRecords, saveRequest } from "@/lib/threefig/use-records";
import {
  type SkinRecord,
  skinAreas,
  canComparePhotos,
} from "@/lib/threefig/skin";

export function RecordsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="records-error" role="alert">
      <p>{message}</p>
      {message.startsWith("Sign in") ? (
        <a href="/signin-with-chatgpt?return_to=/app/signals" target="_top">
          Sign in to continue <ArrowRight size={15} />
        </a>
      ) : (
        <button className="text-link" onClick={onRetry}>
          Try again <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
export function SignalsScreen() {
  const [group, setGroup] = useState("All");
  const groups = ["All", ...new Set(metrics.map((m) => m.group))];
  return (
    <div className="detail-screen signals-screen">
      <Link className="detail-back" href="/app/you">
        <ArrowLeft size={17} /> Back to You
      </Link>
      <p className="eyebrow">YOUR SIGNALS</p>
      <h1>
        A little more
        <br />
        understanding.
      </h1>
      <p className="screen-subtitle">
        One signal at a time. Your history, at your pace.
      </p>
      <Link href="/app/skin" className="skin-entry">
        <span className="skin-entry-icon">
          <Camera size={24} strokeWidth={1.3} />
        </span>
        <span>
          Skin has a story, too.
          <small>A photo. A feeling. A little context.</small>
        </span>
        <ArrowRight size={18} />
      </Link>
      <div
        className="signal-group-filter"
        role="group"
        aria-label="Filter signals"
      >
        {groups.map((g) => (
          <button
            key={g}
            aria-pressed={g === group}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>
      <p className="signal-list-note">
        Example readings below · open any signal for your records.
      </p>
      {groups
        .slice(1)
        .filter((g) => group === "All" || g === group)
        .map((g) => (
          <section className="signal-group" key={g}>
            <h2>{g}</h2>
            {metrics
              .filter((m) => m.group === g)
              .map((m) => (
                <Link
                  href={`/app/signals/${m.id}`}
                  key={m.id}
                  className="signal-row"
                >
                  <span>
                    {m.label}
                    <small>
                      {m.source === "Ring"
                        ? "Supported wearable data"
                        : m.source === "Photo"
                          ? "From your selected photo"
                          : m.source === "You"
                            ? "Your own observations"
                            : "Sustained updates"}
                    </small>
                  </span>
                  <span className="signal-row-value">
                    {formatMetric(m, m.sample)}
                    <small>{m.unit}</small>
                  </span>
                  <ChevronRight size={16} />
                </Link>
              ))}
          </section>
        ))}
      <p className="fine-print">
        Wearable readings and 3FIG Age remain illustrative in this concept. Your
        own entries and saved photo observations are stored separately.
      </p>
    </div>
  );
}
function TrendChart({
  metric,
  records,
  selected,
  onSelect,
}: {
  metric: Metric;
  records: SignalRecord[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  if (!records.length) return null;
  const min = Math.min(...records.map((r) => r.value)),
    max = Math.max(...records.map((r) => r.value)),
    pad = Math.max(
      (max - min) * 0.25,
      metric.kind === "rating" ? 0.5 : metric.unit === "years" ? 0.15 : 0.1,
    ),
    lo = min - pad,
    hi = max + pad;
  const first = Date.parse(records[0].observedAt),
    last = Date.parse(records[records.length - 1].observedAt),
    span = Math.max(86400000, last - first);
  const points = records.map((r, i) => ({
    ...r,
    x:
      records.length === 1
        ? 160
        : 24 + ((Date.parse(r.observedAt) - first) / span) * 272,
    y: 154 - ((r.value - lo) / (hi - lo)) * 125,
  }));
  const chosen =
    points.find((p) => p.id === selected) || points[points.length - 1];
  const path = points
    .map(
      (p, i) =>
        `${i === 0 || Date.parse(p.observedAt) - Date.parse(points[i - 1].observedAt) > (metric.id === "age" ? 20 : 2) * 86400000 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
    )
    .join(" ");
  return (
    <div className="trend-figure">
      <div className="chart-selection" aria-live="polite">
        <span>{dayLabel(chosen.observedAt)}</span>
        <strong>{formatMetric(metric, chosen.value, true)}</strong>
      </div>
      <svg viewBox="0 0 320 188" role="img" aria-labelledby={id}>
        <title id={id}>
          {metric.label} across {records.length} entries. Select a date below
          the chart for its value.
        </title>
        <line x1="24" y1="154" x2="296" y2="154" stroke="#dfe2d6" />
        <line
          x1="24"
          y1="90"
          x2="296"
          y2="90"
          stroke="#e9e9e0"
          strokeDasharray="3 5"
        />
        <path
          d={path}
          fill="none"
          stroke="#9380a5"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.x.toFixed(2)}
            cy={p.y.toFixed(2)}
            r={p.id === chosen.id ? 5 : 2}
            fill={p.id === chosen.id ? "#5d4b71" : "#b8adc4"}
          />
        ))}
        <text x="24" y="180">
          {dayLabel(records[0].observedAt)}
        </text>
        <text x="296" y="180" textAnchor="end">
          {dayLabel(records[records.length - 1].observedAt)}
        </text>
      </svg>
      <label className="chart-date-select">
        Explore a date
        <select
          aria-label="Choose a chart record"
          value={chosen.id}
          onChange={(e) => onSelect(e.target.value)}
        >
          {records.map((r) => (
            <option value={r.id} key={r.id}>
              {dayLabel(r.observedAt)} · {formatMetric(metric, r.value, true)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
export function MetricScreen({ metricId }: { metricId: string }) {
  const m = metricById(metricId);
  return m ? (
    <MetricDetail key={m.id} metric={m} />
  ) : (
    <div className="detail-screen">
      <h1>Signal not found.</h1>
      <Link className="button" href="/app/signals">
        Back to your signals
      </Link>
    </div>
  );
}
function MetricDetail({ metric: m }: { metric: Metric }) {
  const personal = useRecords<SignalRecord>(`/api/records?metric=${m.id}`),
    skin = useRecords<SkinRecord>(
      m.id.startsWith("skin-") ? "/api/skin" : null,
    );
  const [view, setView] = useState("example"),
    [days, setDays] = useState("30"),
    [section, setSection] = useState("trend"),
    [selected, setSelected] = useState(""),
    [area, setArea] = useState<string>(skinAreas[0]),
    [add, setAdd] = useState(false),
    [deleting, setDeleting] = useState<SignalRecord | null>(null),
    [busy, setBusy] = useState(false),
    [deleteError, setDeleteError] = useState("");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "yours")
      setView("yours");
  }, []);
  const own = useMemo(() => {
    if (!m.id.startsWith("skin-")) return personal.records;
    const photos = skin.records.filter(
      (r) =>
        (m.id === "skin-comfort" || r.area === area) &&
        (m.id === "skin-comfort" ? !!r.feeling : true),
    );
    const reference = photos[0];
    const compatible =
      m.id === "skin-comfort"
        ? photos
        : photos.filter(
            (r) =>
              reference &&
              (r.id === reference.id || canComparePhotos(r, reference)),
          );
    const derived: SignalRecord[] = compatible.map((r) => ({
      id: r.id,
      metricId: m.id,
      value:
        m.id === "skin-tone"
          ? r.analysis.colorVariation
          : m.id === "skin-texture"
            ? r.analysis.surfaceContrast
            : Number(r.feeling),
      observedAt: r.observedAt,
      note: r.note,
      source: "photo",
      area: r.area,
    }));
    return [...personal.records, ...derived];
  }, [personal.records, skin.records, m.id, area]);
  const all = view === "example" ? sampleRecords(m) : own,
    end =
      view === "example" ? exampleEnd : new Date().toISOString().slice(0, 10),
    n = Number(days),
    rows = windowRecords(all, n, end),
    summary = recordSummary(rows),
    previousEnd = new Date(Date.parse(`${end}T12:00:00Z`) - n * 86400000)
      .toISOString()
      .slice(0, 10),
    previous = recordSummary(windowRecords(all, n, previousEnd)),
    latest = rows[rows.length - 1];
  const loadError =
    personal.error || (m.id.startsWith("skin-") ? skin.error : "");
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setDeleteError("");
    try {
      await saveRequest(`/api/records/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      personal.reload();
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="detail-screen metric-screen">
      <Link href="/app/signals" className="detail-back">
        <ArrowLeft size={17} /> Your signals
      </Link>
      <p className="eyebrow">{m.group.toUpperCase()}</p>
      <h1>{m.label}.</h1>
      <p className="screen-subtitle">
        {m.source === "You"
          ? "Your own experience, over time."
          : m.source === "Photo"
            ? "A photo observation, over time."
            : "A longer view of your patterns."}
      </p>
      <Tabs
        className="record-source-tabs"
        value={view}
        onValueChange={(v) => {
          setView(v);
          setSelected("");
        }}
      >
        <TabsList aria-label="Record source">
          <TabsTrigger value="example">Example trend</TabsTrigger>
          <TabsTrigger value="yours">Your records</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="record-source-note">
        {view === "example"
          ? "Illustrative data · September 10, 2026"
          : m.source === "Ring"
            ? "Your connected-device records will appear here. No device is connected yet."
            : m.source === "3FIG estimate"
              ? "Personal estimates need a connected, validated model."
              : "Your saved records · private to your account"}
      </p>
      {view === "yours" && loadError && (
        <RecordsError
          message={loadError}
          onRetry={() => {
            personal.reload();
            skin.reload();
          }}
        />
      )}
      {m.source === "Photo" && view === "yours" && (
        <label className="compact-select">
          Skin area
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            {skinAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      )}
      <div className="metric-answer">
        <strong>{latest ? formatMetric(m, latest.value) : "—"}</strong>
        <span>{m.unit}</span>
        <p>
          {latest
            ? `${dayLabel(latest.observedAt)} · latest entry`
            : "Your first record will start the story."}
        </p>
      </div>
      <Tabs
        value={days}
        onValueChange={(v) => {
          setDays(v);
          setSelected("");
        }}
        className="period-tabs"
      >
        <TabsList aria-label="Trend period">
          {["7", "30", "90"].map((d) => (
            <TabsTrigger key={d} value={d}>
              {d} days
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Tabs
        value={section}
        onValueChange={setSection}
        className="detail-view-tabs"
      >
        <TabsList aria-label="Signal detail view">
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="records">History</TabsTrigger>
        </TabsList>
      </Tabs>
      {view === "yours" &&
      (personal.loading || (m.id.startsWith("skin-") && skin.loading)) ? (
        <p className="empty-records" role="status">
          Getting your records…
        </p>
      ) : rows.length === 0 ? (
        <div className="empty-records">
          <p>No entries in this period.</p>
          <small>
            {m.source === "You"
              ? "Add an observation whenever it feels useful."
              : m.source === "Photo"
                ? "Save a skin check-in to begin your photo history."
                : "Explore the example trend to see how this view will work."}
          </small>
        </div>
      ) : section === "trend" ? (
        <>
          <TrendChart
            metric={m}
            records={rows}
            selected={selected}
            onSelect={setSelected}
          />
          {summary && (
            <div className="trend-summary">
              <div>
                <span>Average of entries</span>
                <strong>{formatMetric(m, summary.average, true)}</strong>
              </div>
              <div>
                <span>{summary.count} entries</span>
                <strong>
                  {previous
                    ? `${summary.average - previous.average > 0 ? "+" : ""}${(summary.average - previous.average).toFixed(m.precision)} ${m.kind === "time" ? "min" : m.unit}`
                    : "More history needed"}
                </strong>
                <small>vs previous {days} days</small>
              </div>
            </div>
          )}
          <p className="chart-footnote">
            {m.id === "age"
              ? "Only estimate updates appear; days between updates are not new readings."
              : "Missing readings remain gaps. Values compare entries in equal periods."}
          </p>
        </>
      ) : (
        <div className="record-history">
          {[...rows].reverse().map((r) => (
            <div key={r.id}>
              <button
                className="record-history-main"
                onClick={() => {
                  setSelected(r.id);
                  setSection("trend");
                }}
              >
                <span>
                  {dayLabel(r.observedAt)}
                  <small>
                    {r.note ||
                      `${r.source === "example" ? "Example" : r.source === "photo" ? "Skin check-in" : "Your entry"} · ${r.area || m.source}`}
                  </small>
                </span>
                <strong>{formatMetric(m, r.value, true)}</strong>
              </button>
              {r.source === "manual" && (
                <button
                  className="icon-button"
                  aria-label={`Delete ${m.label} entry from ${dayLabel(r.observedAt)}`}
                  onClick={() => {
                    setDeleting(r);
                    setDeleteError("");
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
              {r.source === "photo" && (
                <Link
                  className="icon-button"
                  aria-label="Open photo record"
                  href={`/app/skin/record/${r.id}`}
                >
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      {m.source === "You" && (
        <button className="button full signal-add" onClick={() => setAdd(true)}>
          Add an entry <Plus size={17} />
        </button>
      )}
      {m.source === "Photo" && (
        <Link className="button full signal-add" href="/app/skin/capture">
          Add a skin check-in <Camera size={17} />
        </Link>
      )}
      <details className="detail-disclosure">
        <summary>What this tells you</summary>
        <p>{m.description}</p>
        {m.source === "Photo" && (
          <p>
            Only photos of the same area, routine, processing version, and
            reasonably similar brightness are compared. These descriptors are
            not clinical skin measurements.
          </p>
        )}
      </details>
      <section className="related-signals">
        <p className="eyebrow">A LITTLE MORE CONTEXT</p>
        {m.related.map((id) => {
          const related = metricById(id)!;
          return (
            <Link key={id} href={`/app/signals/${id}`}>
              {related.label}
              <ArrowRight size={16} />
            </Link>
          );
        })}
      </section>
      <EntryDialog
        metric={m}
        open={add}
        onOpenChange={setAdd}
        onSaved={() => {
          personal.reload();
          setView("yours");
          setSection("records");
        }}
      />
      <Dialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!busy && !v) setDeleting(null);
        }}
      >
        <AppDialogContent
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault();
          }}
        >
          <p className="eyebrow">YOUR RECORDS</p>
          <DialogTitle>Remove this entry?</DialogTitle>
          <DialogDescription>
            This removes the saved value and note from your history.
          </DialogDescription>
          {deleteError && <p role="alert">{deleteError}</p>}
          <button disabled={busy} className="button full" onClick={remove}>
            {busy ? "Removing…" : "Remove entry"}
          </button>
          <button
            disabled={busy}
            className="button button-light full"
            onClick={() => setDeleting(null)}
          >
            Keep it
          </button>
        </AppDialogContent>
      </Dialog>
    </div>
  );
}
function EntryDialog({
  metric: m,
  open,
  onOpenChange,
  onSaved,
}: {
  metric: Metric;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(""),
    [date, setDate] = useState(""),
    [note, setNote] = useState(""),
    [id, setId] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setValue("");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
      setId(crypto.randomUUID());
      setError("");
    }
  }, [open]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await saveRequest("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          metricId: m.id,
          value: Number(value),
          observedAt: `${date}T12:00:00.000Z`,
          note,
        }),
      });
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) onOpenChange(v);
      }}
    >
      <AppDialogContent>
        <p className="eyebrow">A MOMENT NOTICED</p>
        <DialogTitle>{m.label}.</DialogTitle>
        <DialogDescription>
          One entry is enough. Add only what you want to remember.
        </DialogDescription>
        <form className="entry-form" onSubmit={save}>
          <label htmlFor="entry-date">Date</label>
          <input
            id="entry-date"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label htmlFor="entry-value">
            {m.label}
            {m.kind !== "rating" ? ` (${m.unit})` : ""}
          </label>
          {m.scale ? (
            <select
              id="entry-value"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">Choose how it felt</option>
              {m.scale.map((v, i) => (
                <option value={i + m.min} key={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="entry-value"
              type="number"
              required
              min={m.min}
              max={m.max}
              step={10 ** -m.precision}
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <label htmlFor="entry-note">
            A little context <small>optional</small>
          </label>
          <textarea
            id="entry-note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything you’d like to remember…"
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button full" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save this entry"}
            {!busy && <Check size={17} />}
          </button>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}

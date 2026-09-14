export type Metric = {
  id: string;
  label: string;
  group: string;
  unit: string;
  description: string;
  source: "Ring" | "You" | "Photo" | "3FIG estimate";
  precision: number;
  min: number;
  max: number;
  sample: number;
  spread: number;
  change: number;
  related: string[];
  kind?: "time" | "rating";
  scale?: string[];
};
export const metrics: Metric[] = [
  {
    id: "age",
    label: "3FIG Age",
    group: "Your longer view",
    unit: "years",
    source: "3FIG estimate",
    precision: 1,
    min: 18,
    max: 100,
    sample: 44.7,
    spread: 0,
    change: -0.8,
    description:
      "An illustrative long-term wellness estimate. Updates appear only when sustained evidence changes. Skin photos do not change your 3FIG Age.",
    related: ["sleep-regularity", "resting-heart-rate", "active-minutes"],
  },
  {
    id: "sleep-duration",
    label: "Time asleep",
    group: "Sleep",
    unit: "hours",
    source: "Ring",
    precision: 1,
    min: 0,
    max: 24,
    sample: 7.3,
    spread: 0.6,
    change: 0.5,
    description:
      "Time asleep across the main sleep period, excluding awake intervals. Gaps mean there was no usable record.",
    related: ["sleep-regularity", "awakenings"],
  },
  {
    id: "sleep-regularity",
    label: "Bedtime variation",
    group: "Sleep",
    unit: "min",
    source: "Ring",
    precision: 0,
    min: 0,
    max: 360,
    sample: 24,
    spread: 9,
    change: -16,
    description:
      "How far each bedtime was from the personal reference time. A smaller number means a more similar bedtime, not a better person.",
    related: ["bedtime", "sleep-duration"],
  },
  {
    id: "awakenings",
    label: "Night wake-ups",
    group: "Sleep",
    unit: "times",
    source: "Ring",
    precision: 0,
    min: 0,
    max: 30,
    sample: 2,
    spread: 1,
    change: 0,
    description:
      "Longer wake periods estimated during sleep. Wearables can miss or misclassify brief awakenings.",
    related: ["sleep-duration", "temperature"],
  },
  {
    id: "bedtime",
    label: "Sleep time",
    group: "Sleep",
    unit: "",
    source: "Ring",
    precision: 0,
    min: 0,
    max: 2160,
    sample: 1430,
    spread: 25,
    change: 20,
    kind: "time",
    description:
      "When the main sleep period began. Times after midnight follow the previous evening on the chart so midnight does not create a false jump.",
    related: ["wake-time", "sleep-regularity"],
  },
  {
    id: "wake-time",
    label: "Wake time",
    group: "Sleep",
    unit: "",
    source: "Ring",
    precision: 0,
    min: 0,
    max: 1440,
    sample: 435,
    spread: 22,
    change: 10,
    kind: "time",
    description:
      "The end of the main sleep period. Your suggested rhythm is separate from what actually happened.",
    related: ["bedtime", "sleep-duration"],
  },
  {
    id: "resting-heart-rate",
    label: "Resting heart rate",
    group: "Heart",
    unit: "bpm",
    source: "Ring",
    precision: 0,
    min: 20,
    max: 250,
    sample: 61,
    spread: 3,
    change: -1,
    description:
      "A resting measurement from supported wearable data. Compare your own repeated measurements rather than treating a single value as a verdict.",
    related: ["hrv", "recovery"],
  },
  {
    id: "hrv",
    label: "Heart rate variability",
    group: "Heart",
    unit: "ms",
    source: "Ring",
    precision: 0,
    min: 1,
    max: 300,
    sample: 42,
    spread: 7,
    change: 2,
    description:
      "Variation in the time between heartbeats. Device, method, and timing matter; compare only measurements from the same source.",
    related: ["resting-heart-rate", "sleep-duration"],
  },
  {
    id: "steps",
    label: "Daily steps",
    group: "Movement",
    unit: "steps",
    source: "Ring",
    precision: 0,
    min: 0,
    max: 100000,
    sample: 6800,
    spread: 1500,
    change: -800,
    description:
      "Estimated steps in a day. This is a record of movement, with no daily target to meet.",
    related: ["active-minutes", "energy"],
  },
  {
    id: "active-minutes",
    label: "Active time",
    group: "Movement",
    unit: "min",
    source: "Ring",
    precision: 0,
    min: 0,
    max: 1440,
    sample: 34,
    spread: 12,
    change: -5,
    description:
      "Time the wearable classified as active. Final definitions depend on the connected device.",
    related: ["steps", "recovery"],
  },
  {
    id: "temperature",
    label: "Night temperature shift",
    group: "Recovery",
    unit: "°C",
    source: "Ring",
    precision: 2,
    min: -5,
    max: 5,
    sample: 0.16,
    spread: 0.2,
    change: 0.05,
    description:
      "A skin-temperature difference from your personal baseline, only on supported hardware. This is not core body temperature or a fever measurement.",
    related: ["awakenings", "cycle"],
  },
  {
    id: "recovery",
    label: "Feeling recovered",
    group: "Recovery",
    unit: "/ 5",
    source: "You",
    precision: 0,
    min: 1,
    max: 5,
    sample: 3,
    spread: 1,
    change: 0,
    kind: "rating",
    scale: ["Very little", "A little", "Somewhat", "Mostly", "Fully"],
    description:
      "Your own sense of recovery. This comes from you, not a hidden readiness score.",
    related: ["sleep-duration", "active-minutes"],
  },
  {
    id: "energy",
    label: "Energy",
    group: "Your context",
    unit: "/ 5",
    source: "You",
    precision: 0,
    min: 1,
    max: 5,
    sample: 3,
    spread: 1,
    change: 0,
    kind: "rating",
    scale: ["Very low", "Low", "In between", "Good", "Plenty"],
    description:
      "How much energy you felt you had. A brief check-in can add context to the signals your ring notices.",
    related: ["fatigue", "sleep-duration"],
  },
  {
    id: "mood",
    label: "Mood",
    group: "Your context",
    unit: "/ 5",
    source: "You",
    precision: 0,
    min: 1,
    max: 5,
    sample: 4,
    spread: 1,
    change: 0,
    kind: "rating",
    scale: ["Very hard", "Hard", "Okay", "Good", "Very good"],
    description:
      "How the day felt, in your own words. The scale helps you revisit entries; it is not a mental-health assessment.",
    related: ["energy", "sleep-duration"],
  },
  {
    id: "fatigue",
    label: "Fatigue",
    group: "Your context",
    unit: "/ 5",
    source: "You",
    precision: 0,
    min: 1,
    max: 5,
    sample: 2,
    spread: 1,
    change: 0,
    kind: "rating",
    scale: ["None", "A little", "Moderate", "Quite a lot", "A lot"],
    description:
      "Tiredness you choose to report. Fatigue and energy are related experiences, but they are not interchangeable.",
    related: ["energy", "recovery"],
  },
  {
    id: "weight",
    label: "Weight",
    group: "Your context",
    unit: "kg",
    source: "You",
    precision: 1,
    min: 20,
    max: 400,
    sample: 64.2,
    spread: 0.3,
    change: 0.1,
    description:
      "Optional entries from your own scale. Similar timing and conditions make a comparison easier. There is no weight target here.",
    related: ["active-minutes"],
  },
  {
    id: "systolic",
    label: "Blood pressure · upper",
    group: "Your context",
    unit: "mmHg",
    source: "You",
    precision: 0,
    min: 40,
    max: 300,
    sample: 118,
    spread: 6,
    change: 0,
    description:
      "The systolic value from a separate blood-pressure monitor. The ring does not measure blood pressure. This page records values without interpreting them.",
    related: ["diastolic", "resting-heart-rate"],
  },
  {
    id: "diastolic",
    label: "Blood pressure · lower",
    group: "Your context",
    unit: "mmHg",
    source: "You",
    precision: 0,
    min: 20,
    max: 200,
    sample: 76,
    spread: 4,
    change: 0,
    description:
      "The diastolic value from a separate blood-pressure monitor. For decisions about these readings, follow your clinician’s guidance.",
    related: ["systolic"],
  },
  {
    id: "cycle",
    label: "Period flow",
    group: "Your context",
    unit: "/ 4",
    source: "You",
    precision: 0,
    min: 0,
    max: 4,
    sample: 0,
    spread: 0,
    change: 0,
    kind: "rating",
    scale: ["None", "Spotting", "Light", "Medium", "Heavy"],
    description:
      "An optional record of bleeding. This does not predict fertility, measure hormones, or identify a menopause stage.",
    related: ["temperature", "energy"],
  },
  {
    id: "skin-tone",
    label: "Photo color variation",
    group: "Skin",
    unit: "RGB units",
    source: "Photo",
    precision: 1,
    min: 0,
    max: 255,
    sample: 12.4,
    spread: 1.5,
    change: -0.8,
    description:
      "The average spread of RGB color values in the center of your selected skin area. It describes pixels, not pigmentation, redness severity, or skin health. Lighting can change it.",
    related: ["skin-texture", "skin-comfort"],
  },
  {
    id: "skin-texture",
    label: "Photo surface contrast",
    group: "Skin",
    unit: "luma units",
    source: "Photo",
    precision: 1,
    min: 0,
    max: 255,
    sample: 5.2,
    spread: 0.7,
    change: -0.2,
    description:
      "Average brightness difference between neighboring pixels in the selected area. It is a photo texture descriptor, not a measurement of pores, wrinkles, elasticity, or hydration.",
    related: ["skin-tone", "skin-comfort"],
  },
  {
    id: "skin-comfort",
    label: "Skin comfort",
    group: "Skin",
    unit: "/ 5",
    source: "You",
    precision: 0,
    min: 1,
    max: 5,
    sample: 3,
    spread: 1,
    change: 0,
    kind: "rating",
    scale: [
      "Very uncomfortable",
      "Uncomfortable",
      "In between",
      "Comfortable",
      "Very comfortable",
    ],
    description:
      "How your skin feels to you. Dryness, tightness, or sensitivity may not be visible in a photograph.",
    related: ["skin-tone", "skin-texture"],
  },
];
export const metricById = (id: string) => metrics.find((m) => m.id === id);
export type SignalRecord = {
  id: string;
  metricId: string;
  value: number;
  observedAt: string;
  note: string;
  source: "example" | "manual" | "photo";
  area?: string;
};
export const exampleEnd = "2026-09-10";
export function sampleRecords(metric: Metric): SignalRecord[] {
  const end = Date.parse(`${exampleEnd}T12:00:00Z`);
  const days =
    metric.id === "age"
      ? [84, 70, 56, 42, 28, 14, 0]
      : Array.from({ length: 90 }, (_, i) => 89 - i);
  return days
    .filter((d) => metric.id === "age" || d % 17 !== 6)
    .map((d, i) => {
      let value =
        metric.sample -
        (metric.change * d) / 89 +
        Math.sin(i * 1.7) * metric.spread;
      if (d === 0) value = metric.sample;
      if (metric.id === "age")
        value = [46.1, 45.9, 45.7, 45.5, 45.4, 45.3, 44.7][i];
      if (metric.id === "cycle" && d !== 0)
        value = d % 29 < 5 ? Math.max(1, 4 - (d % 29)) : 0;
      return {
        id: `example-${metric.id}-${d}`,
        metricId: metric.id,
        value: Number(
          Math.max(metric.min, Math.min(metric.max, value)).toFixed(
            metric.precision,
          ),
        ),
        observedAt: new Date(end - d * 86400000).toISOString(),
        note:
          metric.id === "age"
            ? "Illustrative sustained update"
            : "Illustrative record",
        source: "example",
      };
    });
}
export function formatMetric(m: Metric, v: number, withUnit = false) {
  if (m.kind === "time") {
    const n = ((Math.round(v) % 1440) + 1440) % 1440;
    return `${Math.floor(n / 60) % 12 || 12}:${String(n % 60).padStart(2, "0")} ${n < 720 ? "AM" : "PM"}`;
  }
  const s = v.toLocaleString("en-US", {
    minimumFractionDigits: m.precision,
    maximumFractionDigits: m.precision,
  });
  return withUnit ? `${s} ${m.unit}` : s;
}
export function windowRecords(
  records: SignalRecord[],
  days: number,
  endDate: string,
) {
  const end = Date.parse(`${endDate.slice(0, 10)}T23:59:59.999Z`),
    start = end - days * 86400000;
  return records
    .filter((r) => {
      const t = Date.parse(r.observedAt);
      return t > start && t <= end;
    })
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
}
export function recordSummary(records: SignalRecord[]) {
  if (!records.length) return null;
  const values = records.map((r) => r.value);
  return {
    average: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}
export function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

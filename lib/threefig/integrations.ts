/** Future integration boundary. No device API or inference is invoked by the prototype. */
export type SignalKind =
  | "resting-heart-rate"
  | "hrv"
  | "sleep-duration"
  | "sleep-timing"
  | "movement"
  | "skin-temperature";
export interface BodySignal {
  kind: SignalKind;
  value: number;
  unit: string;
  observedAt: string;
  source: string;
  quality: "usable" | "limited" | "missing";
}
export interface WearableAdapter {
  supportedSignals(): Promise<SignalKind[]>;
  requestConnection(): Promise<{ connected: boolean; deviceName?: string }>;
  readSignals(from: string, to: string): Promise<BodySignal[]>;
  disconnect(): Promise<void>;
}
export interface PersonalBaseline {
  from: string;
  to: string;
  usableDays: number;
  signals: BodySignal[];
}
export interface AgeEstimate {
  value: number;
  previousValue?: number;
  updatedAt: string;
  evidenceWindow: { from: string; to: string };
  drivers: { label: string; summary: string }[];
  disclosure: string;
}
export interface RhythmWindow {
  label: string;
  startMinutes: number;
  endMinutes: number;
  rationale: string;
}
export interface DailyAction {
  id: string;
  title: string;
  reason: string;
}
export interface WellnessInterpretationService {
  assessBaseline(signals: BodySignal[]): Promise<PersonalBaseline | null>;
  estimateAge(baseline: PersonalBaseline): Promise<AgeEstimate | null>;
  suggestRhythm(baseline: PersonalBaseline): Promise<RhythmWindow[] | null>;
  selectTodaysThree(
    age: AgeEstimate | null,
    rhythm: RhythmWindow[] | null,
  ): Promise<[DailyAction, DailyAction, DailyAction]>;
}

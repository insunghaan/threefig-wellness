"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { demoJournal } from "./mock-data";
export type Stage =
  | "welcome"
  | "onboarding"
  | "calibration"
  | "age-ready"
  | "age-reveal"
  | "rhythm-ready"
  | "ready";
export type Journal = { mood: string; tags: string[]; note: string };
export type PrototypeState = {
  stage: Stage;
  step: number;
  day: number;
  calendarAge: number;
  interests: string[];
  context: string[];
  done: string[];
  journal: Journal | null;
  ringConnected: boolean;
  reminders: boolean;
  reminderTime: string;
  finish: string;
};
const initial: PrototypeState = {
  stage: "welcome",
  step: 0,
  day: 0,
  calendarAge: 48,
  interests: ["Sleep", "Daily rhythm"],
  context: [],
  done: [],
  journal: null,
  ringConnected: false,
  reminders: false,
  reminderTime: "22:00",
  finish: "silver",
};
const key = "3fig-prototype-v1";
function persist(state: PrototypeState) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* In-memory interactions still work when storage is unavailable. */
  }
}
const StateContext = createContext<{
  state: PrototypeState;
  loaded: boolean;
  update: (patch: Partial<PrototypeState>) => void;
  toggleAction: (id: string) => void;
  reset: () => void;
  sample: () => void;
  enterApp: () => void;
} | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(initial),
    [loaded, setLoaded] = useState(false);
  const current = useRef(state);
  useEffect(() => {
    let restored = initial;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const p = JSON.parse(raw);
        if (
          p &&
          [
            "welcome",
            "onboarding",
            "calibration",
            "age-ready",
            "age-reveal",
            "rhythm-ready",
            "ready",
          ].includes(p.stage) &&
          Array.isArray(p.done) &&
          Array.isArray(p.interests) &&
          Array.isArray(p.context)
        ) {
          restored = {
            ...initial,
            ...p,
            calendarAge:
              Number.isFinite(p.calendarAge) &&
              p.calendarAge >= 18 &&
              p.calendarAge <= 100
                ? p.calendarAge
                : 48,
            done: p.done.filter((id: string) =>
              ["move", "coffee", "rest"].includes(id),
            ),
            reminderTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(p.reminderTime)
              ? p.reminderTime
              : "22:00",
          };
        }
      }
    } catch {}
    current.current = restored;
    setState(restored);
    setLoaded(true);
  }, []);
  // Persist before a document navigation, not in a later effect that can be lost on unload.
  const commit = useCallback((next: PrototypeState) => {
    current.current = next;
    persist(next);
    setState(next);
  }, []);
  const update = useCallback(
    (patch: Partial<PrototypeState>) =>
      commit({ ...current.current, ...patch }),
    [commit],
  );
  const reset = useCallback(() => commit({ ...initial }), [commit]);
  const sample = useCallback(
    () =>
      commit({
        ...initial,
        stage: "ready",
        day: 35,
        ringConnected: true,
        journal: demoJournal,
      }),
    [commit],
  );
  const enterApp = useCallback(() => {
    if (current.current.stage !== "ready")
      commit({
        ...current.current,
        stage: "ready",
        day: 35,
        ringConnected: true,
        journal: current.current.journal ?? demoJournal,
      });
  }, [commit]);
  const toggleAction = useCallback(
    (id: string) => {
      const s = current.current;
      commit({
        ...s,
        done: s.done.includes(id)
          ? s.done.filter((x) => x !== id)
          : [...s.done, id],
      });
    },
    [commit],
  );
  return (
    <StateContext.Provider
      value={{ state, loaded, update, reset, sample, enterApp, toggleAction }}
    >
      {children}
    </StateContext.Provider>
  );
}
export function usePrototype() {
  const context = useContext(StateContext);
  if (!context) throw new Error("PrototypeProvider is required");
  return context;
}

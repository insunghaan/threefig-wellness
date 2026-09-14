"use client";
import { useCallback, useEffect, useState } from "react";
export function useRecords<T>(url: string | null) {
  const [records, setRecords] = useState<T[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    if (!url) {
      setRecords([]);
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(url, { cache: "no-store", signal: controller.signal })
      .then(async (r) => {
        // The prototype is public; personal storage remains access-controlled.
        // Visitors see the existing sample/empty states, never another user's records.
        if (r.status === 401 || r.status === 403) return { records: [] as T[] };
        const data = (await r.json()) as { records: T[]; error?: string };
        if (!r.ok) throw new Error(data.error || "Records are unavailable.");
        return data;
      })
      .then((data) => {
        setRecords(data.records);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [url, version]);
  return {
    records,
    loading,
    error,
    reload: useCallback(() => setVersion((v) => v + 1), []),
  };
}
export async function saveRequest(url: string, options: RequestInit) {
  const response = await fetch(url, { ...options, cache: "no-store" });
  if (response.status === 401 || response.status === 403)
    throw new Error("You can explore this prototype freely. Saving personal records is available only to authorized accounts.");
  const data = (await response.json()) as {
    id: string;
    deleted?: boolean;
    error?: string;
  };
  if (!response.ok)
    throw new Error(data.error || "We couldn’t save this. Please try again.");
  return data;
}

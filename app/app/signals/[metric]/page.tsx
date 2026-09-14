import AppScreen from "@/components/threefig/app-prototype";
import { metricById } from "@/lib/threefig/metrics";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ metric: string }>;
}) {
  const { metric } = await params;
  if (!metricById(metric)) notFound();
  return <AppScreen screen="metric" metricId={metric} />;
}

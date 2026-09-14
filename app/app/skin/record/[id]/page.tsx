import AppScreen from "@/components/threefig/app-prototype";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppScreen screen="skin-record" recordId={id} />;
}

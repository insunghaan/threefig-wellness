import { requireInternalUser } from "@/lib/threefig/internal-access";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function DesignLayout({ children }: { children: React.ReactNode }) {
  await requireInternalUser("/design");
  return children;
}

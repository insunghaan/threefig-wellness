import { requireInternalUser } from "@/lib/threefig/internal-access";
import { PrototypeProvider } from "@/lib/threefig/state";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireInternalUser("/app");
  return <PrototypeProvider>{children}</PrototypeProvider>;
}

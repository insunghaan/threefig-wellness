import { PrototypeProvider } from "@/lib/threefig/state";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PrototypeProvider>{children}</PrototypeProvider>;
}

import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isInternalUser } from "@/lib/threefig/internal-policy";

export const dynamic = "force-dynamic";
export const metadata = { title: "3FIG — App access", robots: { index: false, follow: false } };

export default async function AppAccess() {
  const user = await requireChatGPTUser("/app-access");
  if (isInternalUser(user.userId, env.THREEFIG_INTERNAL_USER_IDS)) redirect("/app");
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: 24, background: "#f6f3f7", color: "#44384b" }}>
      <section style={{ width: "100%", maxWidth: 480, padding: "40px 28px", borderRadius: 32, background: "rgba(255,255,255,.72)", border: "1px solid white" }}>
        <p style={{ marginBottom: 32, fontSize: 26, fontWeight: 600 }}>3FIG</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, lineHeight: 1.15 }}>Your private workspace.</h1>
        <p style={{ marginTop: 20, fontSize: 16, lineHeight: 1.7 }}>This account hasn’t been added to the internal app yet. Sign in with your approved account, or share your access ID with the workspace owner.</p>
        <p style={{ marginTop: 24, overflowWrap: "anywhere" }}>{user.email}</p>
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer" }}>Your access ID</summary>
          <code style={{ display: "block", marginTop: 12, overflowWrap: "anywhere", userSelect: "all" }}>{user.userId}</code>
        </details>
        <a href={chatGPTSignOutPath("/app")} target="_top" style={{ display: "block", marginTop: 28, padding: "16px 22px", borderRadius: 28, textAlign: "center", background: "#513b57", color: "white" }}>Use another account</a>
        <a href="/" style={{ display: "block", marginTop: 20, textAlign: "center" }}>Back to 3FIG</a>
      </section>
    </main>
  );
}

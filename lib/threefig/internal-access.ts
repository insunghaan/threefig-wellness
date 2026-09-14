import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { isInternalUser } from "./internal-policy";

export async function requireInternalUser(returnTo: string) {
  const user = await requireChatGPTUser(returnTo);
  if (!isInternalUser(user.userId, env.THREEFIG_INTERNAL_USER_IDS)) redirect("/app-access");
  return user;
}

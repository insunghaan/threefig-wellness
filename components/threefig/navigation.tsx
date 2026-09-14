import type { AnchorHTMLAttributes } from "react";

/** Document navigation avoids the runtime's broken production RSC transitions. */
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />;
}
export function navigate(href: string) {
  window.location.assign(href);
}

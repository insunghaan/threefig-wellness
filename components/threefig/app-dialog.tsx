"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "./app-icons";
import {
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";

const AppDialogContext = createContext<{
  host: HTMLDivElement | null;
  setHost: (node: HTMLDivElement | null) => void;
} | null>(null);
export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <AppDialogContext.Provider value={{ host, setHost }}>
      {children}
    </AppDialogContext.Provider>
  );
}
export function AppDialogHost() {
  const context = useContext(AppDialogContext);
  if (!context) throw new Error("AppDialogProvider is required");
  return <div className="app-dialog-host" ref={context.setHost} />;
}
export function AppDialogContent({
  children,
  className = "",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  const context = useContext(AppDialogContext);
  const returnFocus = useRef<HTMLElement | null>(null);
  if (!context?.host) return null;
  return (
    <DialogPortal container={context.host}>
      <DialogOverlay className="app-dialog-overlay" />
      <DialogPrimitive.Content
        {...props}
        data-slot="dialog-content"
        className={`fig-dialog app-dialog-panel ${className}`}
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement as HTMLElement;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (
            !context.host?.querySelector('[role="dialog"][data-state="open"]')
          )
            returnFocus.current?.focus({ preventScroll: true });
        }}
      >
        <DialogClose className="app-dialog-close" aria-label="Close">
          <X size={18} />
        </DialogClose>
        <div className="app-dialog-scroll">{children}</div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

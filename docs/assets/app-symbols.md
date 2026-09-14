# iOS prototype symbols

The owner confirmed on September 11, 2026 that this is an internal prototype for an iOS-only app. Apple system symbol artwork is confined to that prototype; the public landing page keeps its existing icon library.

Source: the installed macOS SF Symbols, exported through AppKit `NSImage(systemSymbolName:)`, Regular / Medium, as 112 × 112 alpha PNGs. Symbols use a 28-point common canvas and preserve optical aspect ratios. No Apple font is embedded or distributed.

`components/threefig/app-icons.tsx` maps the app's semantic icon names to system symbols. Alpha masks inherit currentColor; the selected navigation state uses the filled counterpart. The connection action uses antenna.radiowaves.left.and.right to communicate wireless pairing. The shared checkbox keeps its Radix behavior and uses the same native checkmark through an app-scoped mask.

Reference: https://developer.apple.com/sf-symbols/
Usage scope: internal iOS UI mockup only. Revisit the asset license before adapting these assets to a non-Apple product or public cross-platform service.

# 3FIG Google Agent Studio migration

This project is the authoritative source of the live 3FIG website currently published at:

https://threefig-wellness.insunghan.chatgpt.site

The checked-in source corresponds to the currently published production version. Treat the code and bundled assets in this archive as the source of truth. Do not recreate the website from the URL and do not generate a new design.

## Primary task

Import this existing project and make it run in the company Google Cloud environment while preserving the public landing page exactly.

## Non-negotiable visual requirements

- Do not redesign, reinterpret, simplify, or replace the current UI.
- Do not rewrite any public-facing copy.
- Preserve the exact desktop and mobile layouts, typography, spacing, colors, gradients, imagery, crops, icons, carousel behavior, navigation, dialog, form states, and motion.
- Use the existing files in `public/images`, `public/fonts`, and `public/icons`.
- Do not regenerate images and do not replace them with stock photography.
- Do not hotlink assets from the old live URL.
- Keep the testimonial carousel and its partial previous/next card visibility.
- Keep accessibility, keyboard interaction, focus states, and reduced-motion behavior.

## Runtime migration

The source currently uses a Next-compatible Vinext/Cloudflare runtime. Migrate only the hosting/runtime-specific parts required for Google Cloud.

- Prefer a standard Next.js application that can be deployed to Cloud Run.
- Preserve component boundaries and existing styles wherever possible.
- Replace Cloudflare-specific imports and bindings only where required.
- Do not change frontend markup or CSS merely to simplify the migration.
- Keep all secrets server-side and use Google Cloud Secret Manager or the deployment platform's secret configuration.

## Waitlist and data

- Preserve the visible waitlist form, validation, loading, success, honeypot, and error states exactly.
- Do not silently discard submissions.
- Do not expose existing or new credentials in frontend code.
- Before switching the production waitlist destination, report which backend will be used and which Google Cloud permissions are required.
- Waitlist welcome mail uses Brevo. See `docs/brevo-welcome.md`. The unused Google Apps Script integration was removed.
- If Firestore is selected, create the minimum schema and security rules necessary for server-side waitlist writes. The browser must not receive unrestricted Firestore write access.

## Verification gate

Before publishing:

1. Run the imported project and confirm the build succeeds.
2. Compare it with the live reference at 1440px desktop width and 390px mobile width.
3. Test navigation, mobile menu, testimonial carousel, privacy dialog, research links, and every waitlist form state.
4. Check for missing assets, layout overflow, console errors, and network errors.
5. List every remaining visible or functional difference.
6. Do not publish until the user explicitly approves the preview.

## Source control and deployment

- Create or connect a company-owned GitHub repository.
- Commit the imported source before making migration changes so the original state remains recoverable.
- Use a preview/staging deployment first.
- After approval, deploy to Cloud Run.
- Configure automatic production deployment only from the approved production branch.
- Preserve rollback capability and document the final deployment URL, environment variables, build command, start command, and rollback procedure.

Start by inspecting the existing repository and reporting the minimum runtime changes required. Do not create a new app from scratch.

# 3FIG waitlist analytics

Production GA4 stream: G-1689JHD6V6. Events run only on https://3fig.io/.

- `cta_click`: each Join early activation, with placement `header`, `hero`, `inputs`, or `signup`.
- `signup_start`: first opening of the waitlist dialog per page load (not first field input). Reopening via another CTA does not emit it again.
- `generate_lead`: only after a waitlist API response reports `created: true`; duplicates and errors do not emit it. No change to Meta Lead semantics.

The former delegated click handler matched `a[href="#updates"]`, which missed current buttons. All four entry buttons now use one handler.

Validation: production build; desktop (1440px) and mobile (390px) browser checks covering all four CTA placements, reopen deduplication and no lead on opening; existing waitlist success/duplicate/error marketing tests.

For reporting, keep only generate_lead as the waitlist key event. Use page_view → signup_start → generate_lead for funnel users; event counts are not unique people. Register event-scoped custom dimension `placement` only if button placement breakdown is needed.

# Brevo welcome email rollout

Brevo welcome email implementation. No historical registration is emailed automatically.

## Configuration

- `THREEFIG_WELCOME_ENABLED=true` enables creating outbox jobs for **new** signups.
- `BREVO_API_KEY`: mount an enabled version of Secret Manager `threefig-brevo-api-key` in project `ubeeslab`. Never commit, log, or paste this key in chat.
- `THREEFIG_MAIL_REPLY_TO=youngminlee@ubeeslab.com`: approved reply and test mailbox.
- Sender is fixed to `3FIG <welcome@3fig.io>`; authenticate the domain and register the sender in Brevo.
- `THREEFIG_MAIL_WORKER_TOKEN`: independent random secret of at least 32 characters for `POST /api/waitlist/welcome-retry` (Bearer authentication).
- Firestore project/database settings stay as configured on the deployed service.

The API request only includes the recipient email, reply mailbox and generic confirmation; no geo-location, health signals or signup metadata. No discount or promotional offer is promised. Requests to leave the list go to Reply-To and must be actioned by the operator. Campaign marketing and automatic unsubscribe handling are separate work.

## Behavior

Firestore atomically creates the signup and outbox record. Existing signups do not produce a new welcome job. An atomic claim prevents concurrent processing, reserves one daily attempt, and changes pending to sending before calling Brevo. The initial send is awaited before returning the signup response so Cloud Run request-based CPU does not suspend it.

- `accepted`: Brevo returned a message ID; this is **not confirmed inbox delivery**.
- `pending`: not attempted or explicitly throttled (429); eligible for later retry.
- `failed`: known rejection, such as unauthorized key or invalid sender; operator fixes the cause before resetting.
- `uncertain`: timeout/network failure, 5xx, or missing message ID; reconcile in Brevo before retrying.
- `sending`: an interrupted process may leave this state; reconcile instead of automatically resending.

Local UTC-day cap: 280 attempts, leaving headroom under Brevo's 300/day account limit. Other Brevo senders consume the same account quota. The Brevo Free plan remains the billing limit; the application must never upgrade the plan. A provider idempotency key is additional short-term protection, not a permanent exactly-once guarantee.

Cloud Run signups fail closed on Firestore errors. Its local filesystem is ephemeral and cannot be a durable fallback. Development retains the existing local fallback.

## Retry deployment (not yet provisioned)

Create a Firestore composite index for collection `threefig_welcome_outbox`: `status ASC`, `next_attempt_at ASC`. Wait for READY before activating a worker.

Schedule an authenticated POST to `/api/waitlist/welcome-retry` every 5 minutes with the independent worker token. Each invocation processes up to 10 pending jobs in due-time order. Cloud Scheduler is currently disabled; quota and cost must be checked before enabling it under the user's no-extra-cost constraint. Until scheduled, the endpoint supports manual authorized retry only. Cloud Run, Firestore and Secret Manager usage are separate from Brevo's free allowance.

The user confirmed Google Apps Script automation is not running. Its integration, sync endpoint, and dedicated tests have been removed. Existing stored `delivered_at` fields are retained without reinterpretation.

## Verification and activation

1. Store the key in Secret Manager using the GCP console and bind a specific enabled version to Cloud Run.
2. Confirm reply mailbox and a user-approved test recipient. Verify Brevo sender authorization and account sending activation.
3. Run local tests and production build. Review concurrent source changes before publishing; the repo has an automatic main deployment trigger.
4. Activate the required Firestore index and retry mechanism once the cost constraint is satisfied.
5. Deploy with the flag disabled; use a controlled test, then enable for new signups.
6. Verify one accepted message, actual delivery, sender/DKIM and the Reply-To. Test duplicate registration, provider throttling and database failure using isolated mocks/emulator, not real users.

Do not send the production historical waitlist as a test. API keys are not printed by the setup instructions or tests.

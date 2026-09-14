# 3FIG waitlist automation

The public form still stores submissions in D1. A private Google Apps Script polls the bearer-protected `/api/waitlist/sync` every minute. Each row is added to **3FIG 사전신청 명단**, then an admin notification is sent to **insung.han@ubeeslab.com** and a transactional welcome is sent to the submitted address. Replies go to the admin address.

## Configuration

- Sites secret: `THREEFIG_WAITLIST_SYNC_TOKEN` (a random 32-byte token).
- Google Script property: `SYNC_TOKEN` (same token; never commit it).
- `setupThreefig()` creates the private spreadsheet and one minute trigger. It saves `SPREADSHEET_ID` in Script Properties. Re-running setup reuses both.
- The Google account must authorize spreadsheet access, sending mail, external requests, and a background trigger.
- `welcome.html` is the reviewable source of the email; its identical string is bundled into `Code.gs` for the standalone Apps Script editor.

## Delivery behavior

D1 records remain pending until Google acknowledges both sends. Sheet email keys prevent duplicate rows; separate send checkpoints avoid repeating a completed admin/welcome step after an ordinary failure. Apps Script locking prevents overlapping runs. Google mail quota exhaustion keeps entries pending for later retries. A crash between provider acceptance and saving its checkpoint can still resend an email; MailApp has no transactional idempotency key. These are transactional receipt messages, not a marketing campaign service.

The sheet is private to its creating account. No Gmail inbox access or public Apps Script web app is required. Secrets never appear in browser bundle code. The API returns only waitlist data, not health records.

## Recovery

Inspect Apps Script executions and the sheet's status columns. Run `syncThreefig()` to retry. For an interrupted acknowledgement, completed rows are acknowledged on the next execution without sending again. Do not delete sent-status cells or duplicate the automation project. Revoke access by deleting the trigger and rotating/removing the Sites sync token.

## Sources

- https://developers.google.com/apps-script/reference/mail/mail-app
- https://developers.google.com/apps-script/guides/triggers/installable
- https://developers.google.com/apps-script/reference/lock/lock-service

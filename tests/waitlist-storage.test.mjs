import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveWaitlistSignup, getUndeliveredWaitlist, markWaitlistDelivered } from '../lib/threefig/firestore-waitlist.ts';

test('Waitlist storage properly stores and retrieves test signup', async () => {
  const testEmail = `qa-verification-test-${Date.now()}@threefig-test.internal`;

  // Step 1: Save the test signup
  const saveResult = await saveWaitlistSignup(testEmail, 'landing', '2026-09-10');
  assert.equal(saveResult.success, true, 'Signup should succeed');
  assert.equal(saveResult.alreadyExisted, false, 'Should be a new record');
  console.log(`[TEST RESULT] Successfully stored test signup to: ${saveResult.storage}`);

  // Step 2: Retrieve undelivered waitlist records
  const undelivered = await getUndeliveredWaitlist(100);
  const found = undelivered.find((r) => r.email === testEmail);
  assert.ok(found, `Record for ${testEmail} must exist in storage`);
  assert.equal(found.email, testEmail);
  assert.equal(found.source, 'landing');
  assert.equal(found.consent_version, '2026-09-10');
  assert.equal(found.delivered_at, null);
  assert.ok(found.created_at, 'created_at must be populated');
  console.log(`[TEST RESULT] Successfully retrieved record from storage:`, JSON.stringify(found));

  // Step 3: Idempotent duplicate check
  const duplicateResult = await saveWaitlistSignup(testEmail, 'landing', '2026-09-10');
  assert.equal(duplicateResult.success, true);
  assert.equal(duplicateResult.alreadyExisted, true, 'Duplicate signup should be recognized');

  // Step 4: Mark as delivered
  const acknowledgedCount = await markWaitlistDelivered([testEmail]);
  assert.ok(acknowledgedCount >= 1, 'Should acknowledge at least 1 record');

  // Step 5: Verify it is no longer in undelivered list
  const undeliveredAfter = await getUndeliveredWaitlist(100);
  const foundAfter = undeliveredAfter.find((r) => r.email === testEmail);
  assert.equal(foundAfter, undefined, 'Delivered record should not appear in undelivered list');
  console.log(`[TEST RESULT] Verified delivery state transition for ${testEmail}`);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const code = readFileSync(new URL('../integrations/google-apps-script/Code.gs', import.meta.url), 'utf8');
function harness(status = ['대기', '대기'], quota = 10) {
  const sent = [], cells = {5: status[0], 6: status[1]};
  const sheet = { getRange: (_row, col) => ({ getDisplayValues: () => [[cells[5], cells[6]]], setValue: value => {cells[col] = value;}, clearContent: () => {delete cells[col];} }) };
  const context = vm.createContext({ Date, console, SpreadsheetApp: {flush() {}}, Utilities: {formatDate: () => '2026-09-11 09:00:00'}, MailApp: {getRemainingDailyQuota: () => quota - sent.length, sendEmail: message => sent.push(message)} });
  vm.runInContext(code, context);
  return {context,sheet,sent,cells};
}
const record = {email:'subscriber@example.com',source:'landing',consent_version:'2026-09-10',created_at:'2026-09-11T00:00:00.000Z'};
test('sends admin and welcome to their intended recipients and stores checkpoints', () => {
  const h = harness();
  assert.equal(h.context.deliverRecord_(h.sheet,2,record,'https://docs.google.com/spreadsheets/d/test'),true);
  assert.deepEqual(h.sent.map(x=>x.to),['insung.han@ubeeslab.com','subscriber@example.com']);
  assert.equal(h.sent[1].replyTo,'insung.han@ubeeslab.com');
  assert.match(h.sent[1].htmlBody,/Your early-access request has been received/);
  assert.match(h.sent[1].htmlBody,/max-width:600px/);
  assert.equal(h.cells[5],'발송 완료'); assert.equal(h.cells[6],'발송 완료');
  assert.equal(h.context.deliverRecord_(h.sheet,2,record,'sheet'),true);
  assert.equal(h.sent.length,2);
});
test('retries only the unfinished welcome after partial failure', () => {
  const h = harness(['발송 완료','대기']);
  assert.equal(h.context.deliverRecord_(h.sheet,2,record,'sheet'),true);
  assert.equal(h.sent.length,1); assert.equal(h.sent[0].to,record.email);
});
test('quota exhaustion leaves the record pending for a later run', () => {
  const h = harness(['대기','대기'],1);
  assert.equal(h.context.deliverRecord_(h.sheet,2,record,'sheet'),false);
  assert.equal(h.sent.length,1); assert.equal(h.cells[6],'대기');
  assert.match(h.cells[8],/한도/);
});
test('escapes spreadsheet formulas in submitted addresses', () => {
  const h=harness();
  assert.equal(h.context.safeCell_('=formula@example.com'),"'=formula@example.com");
  assert.equal(h.context.safeCell_('person@example.com'),'person@example.com');
});

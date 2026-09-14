/** 3FIG waitlist: private Google Sheet + admin notification + welcome email. */
var SITE_URL = 'https://threefig-wellness.insunghan.chatgpt.site';
var ADMIN_EMAIL = 'insung.han@ubeeslab.com';
var HEADERS = ['접수 일시', '이메일', '유입 경로', '동의 버전', '운영자 알림', '웰컴메일', '처리 완료 일시', '처리 메모'];

function setupThreefig() {
  var properties = PropertiesService.getScriptProperties();
  requireToken_();
  fetchPending_();
  var id = properties.getProperty('SPREADSHEET_ID');
  var book = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('3FIG 사전신청 명단');
  properties.setProperty('SPREADSHEET_ID', book.getId());
  book.setSpreadsheetTimeZone('Asia/Seoul');
  var sheet = book.getSheetByName('접수 명단') || book.getSheets()[0];
  sheet.setName('접수 명단');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setBackground('#482b48').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 40);
    sheet.setColumnWidth(1, 175);
    sheet.setColumnWidth(2, 270);
    sheet.setColumnWidths(3, 2, 115);
    sheet.setColumnWidths(5, 2, 120);
    sheet.setColumnWidth(7, 175);
    sheet.setColumnWidth(8, 310);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B:F').setNumberFormat('@');
    sheet.getRange('G:G').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('H:H').setNumberFormat('@');
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setVerticalAlignment('middle').setWrap(true);
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter();
  }
  var installed = ScriptApp.getProjectTriggers().some(function(trigger) {
    return trigger.getHandlerFunction() === 'syncThreefig';
  });
  if (!installed) ScriptApp.newTrigger('syncThreefig').timeBased().everyMinutes(1).create();
  syncThreefig();
  console.log('접수 명단: ' + book.getUrl());
}

function syncThreefig() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) throw new Error('먼저 setupThreefig를 실행하세요.');
    var book = SpreadsheetApp.openById(id);
    var sheet = book.getSheetByName('접수 명단');
    var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getDisplayValues() : [];
    var emailRows = {};
    rows.forEach(function(row, index) { emailRows[row[1]] = index + 2; });
    var started = Date.now();
    for (var batch = 0; batch < 4 && Date.now() - started < 240000; batch++) {
      var records = fetchPending_();
      if (!records.length) break;
      var complete = [];
      for (var i = 0; i < records.length && Date.now() - started < 240000; i++) {
        var record = records[i];
        var row = emailRows[record.email];
        if (!row) {
          row = sheet.getLastRow() + 1;
          if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
          sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
            new Date(record.created_at), safeCell_(record.email), safeCell_(record.source),
            safeCell_(record.consent_version), '대기', '대기', '', ''
          ]]);
          sheet.getRange(row, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
          sheet.getRange(row, 7).setNumberFormat('yyyy-mm-dd hh:mm:ss');
          emailRows[record.email] = row;
        }
        try {
          if (deliverRecord_(sheet, row, record, book.getUrl())) complete.push(record.email);
        } catch (error) {
          // Store a bounded operational error, never message bodies or credentials.
          sheet.getRange(row, 8).setValue('일시적 전송 오류. 다음 실행에서 재시도합니다.');
        }
      }
      SpreadsheetApp.flush();
      if (complete.length) acknowledge_(complete);
      if (complete.length < records.length) break;
    }
  } finally { lock.releaseLock(); }
}

function deliverRecord_(sheet, row, record, sheetUrl) {
  var status = sheet.getRange(row, 5, 1, 2).getDisplayValues()[0];
  if (status[0] !== '발송 완료') {
    if (MailApp.getRemainingDailyQuota() < 1) return deferQuota_(sheet, row);
    MailApp.sendEmail({
      to: ADMIN_EMAIL, name: '3FIG 접수 알림',
      subject: '[3FIG] 새로운 사전신청이 접수되었습니다',
      body: '3FIG 사전신청이 접수되었습니다.\n\n이메일: ' + record.email +
        '\n접수 일시: ' + Utilities.formatDate(new Date(record.created_at), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss') +
        ' (KST)\n유입 경로: ' + record.source + '\n\n전체 접수 명단: ' + sheetUrl
    });
    sheet.getRange(row, 5).setValue('발송 완료');
    SpreadsheetApp.flush();
  }
  if (status[1] !== '발송 완료') {
    if (MailApp.getRemainingDailyQuota() < 1) return deferQuota_(sheet, row);
    MailApp.sendEmail({
      to: record.email, replyTo: ADMIN_EMAIL, name: '3FIG',
      subject: 'You’re on the list. Welcome to 3FIG.',
      body: 'Welcome to 3FIG.\n\nYour early-access request has been received. You’re on the list.\n\nWe’ll be in touch with launch updates and early-access details. Until then, a little closer to your everyday.\n\nVisit 3FIG: ' + SITE_URL + '\nQuestions? Reply to this email.\n\nYou received this confirmation because you joined the 3FIG launch list.',
      htmlBody: welcomeHtml_()
    });
    sheet.getRange(row, 6).setValue('발송 완료');
    SpreadsheetApp.flush();
  }
  sheet.getRange(row, 7).setValue(new Date());
  sheet.getRange(row, 8).clearContent();
  return true;
}

function deferQuota_(sheet, row) {
  sheet.getRange(row, 8).setValue('Google 일일 발송 한도: 한도 회복 후 자동 재시도');
  return false;
}
function safeCell_(value) {
  var text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
function requireToken_() {
  var token = PropertiesService.getScriptProperties().getProperty('SYNC_TOKEN');
  if (!token || token.length < 32) throw new Error('프로젝트 설정에 SYNC_TOKEN을 등록하세요.');
  return token;
}
function fetchPending_() {
  var response = UrlFetchApp.fetch(SITE_URL + '/api/waitlist/sync', {
    headers: { Authorization: 'Bearer ' + requireToken_() }, muteHttpExceptions: true, followRedirects: false
  });
  if (response.getResponseCode() !== 200) throw new Error('3FIG 연결 실패: HTTP ' + response.getResponseCode());
  var data = JSON.parse(response.getContentText());
  if (!Array.isArray(data.records) || data.records.length > 25) throw new Error('잘못된 접수 응답');
  return data.records;
}
function acknowledge_(emails) {
  var response = UrlFetchApp.fetch(SITE_URL + '/api/waitlist/sync', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify({ emails: emails }),
    headers: { Authorization: 'Bearer ' + requireToken_() }, muteHttpExceptions: true, followRedirects: false
  });
  if (response.getResponseCode() !== 200) throw new Error('처리 확인 실패: 다음 실행에서 안전하게 재시도');
}
function sendWelcomePreview() {
  MailApp.sendEmail({to: ADMIN_EMAIL, name: '3FIG', replyTo: ADMIN_EMAIL,
    subject: '[디자인 확인] You’re on the list. Welcome to 3FIG.',
    body: '3FIG 웰컴메일 디자인 확인용입니다. 실제 사전신청으로 등록되지 않습니다.', htmlBody: welcomeHtml_()});
}

function welcomeHtml_() {
  return WELCOME_HTML;
}

var WELCOME_HTML = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Welcome to 3FIG</title></head>\n<body style=\"margin:0;padding:0;background:#f8f7f8;color:#302b34;text-align:center;\">\n<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">Your early-access request has been received. A little closer to your everyday.</div>\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background:#f8f7f8;\"><tr><td align=\"center\" style=\"text-align:center;padding:32px 16px;\">\n<table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"width:100%;max-width:600px;\"><tr><td align=\"center\" style=\"text-align:center;padding:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:30px;letter-spacing:-2px;font-weight:600;color:#44384b;\">3FIG<span style=\"color:#b976a2;\">·</span></td></tr>\n<tr><td bgcolor=\"#65446f\" align=\"center\" style=\"text-align:center;background-color:#65446f;background-image:radial-gradient(ellipse at 0% 20%,rgba(190,73,125,.65),transparent 65%),radial-gradient(ellipse at 100% 10%,rgba(140,117,202,.66),transparent 62%),radial-gradient(ellipse at 65% 120%,rgba(231,139,108,.7),transparent 65%),linear-gradient(140deg,#452741,#65446f 62%,#8a4c64);border-radius:36px;padding:48px 28px;color:#ffffff;\">\n<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td align=\"center\" style=\"text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;font-weight:600;letter-spacing:2px;color:#f2deed;\">YOUR NEXT CHAPTER, WITH 3FIG</td></tr>\n<tr><td align=\"center\" style=\"text-align:center;padding-top:24px;font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.15;font-weight:400;text-align:center;color:#ffffff;\"><span style=\"color:#ffffff;\">You’re on the list.</span><br><span style=\"font-style:italic;color:#f0dfef;\">A little closer.</span></td></tr>\n<tr><td align=\"center\" style=\"text-align:center;padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#f2e8f0;\">Your early-access request has been received.<br>Thank you for joining the 3FIG launch list.</td></tr>\n<tr><td style=\"padding-top:32px;\"><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td bgcolor=\"#805780\" align=\"center\" style=\"text-align:center;background-color:#805780;background-color:rgba(255,255,255,.12);border:1px solid #aa86a6;border-radius:26px;padding:24px;text-align:center;\">\n<p style=\"margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;letter-spacing:1.6px;font-weight:600;color:#f0ddeb;text-align:center;\">WHAT HAPPENS NEXT</p>\n<p style=\"margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.85;letter-spacing:0.3px;word-spacing:0.5px;text-align:center;color:#ffffff;\">We’ll be in touch with launch updates and early-access details.<br>There’s nothing else you need to do right now.</p>\n</td></tr></table></td></tr>\n<tr><td align=\"center\" style=\"text-align:center;padding-top:32px;\"><a href=\"https://threefig-wellness.insunghan.chatgpt.site/\" style=\"display:inline-block;background:#f8f1f7;border:1px solid #f8f1f7;border-radius:999px;padding:16px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:500;line-height:1.4;color:#44384b;text-decoration:none;\">Explore 3FIG&nbsp; ↗</a></td></tr>\n<tr><td align=\"center\" style=\"text-align:center;padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#eee1eb;\">A little closer. To your everyday.</td></tr></table>\n</td></tr>\n<tr><td align=\"center\" style=\"text-align:center;padding:24px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.8;color:#78707e;\">You received this confirmation because you joined the 3FIG launch list.<br>Questions? Just reply to this email.<br>© 2026 3FIG</td></tr></table>\n</td></tr></table></body></html>\n";

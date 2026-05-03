var SHEET_NAME = 'Rezervacie';

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();

    var now  = new Date();
    var date = Utilities.formatDate(now, 'Europe/Bratislava', 'dd.MM.yyyy');
    var time = Utilities.formatDate(now, 'Europe/Bratislava', 'HH:mm');

    var firstName = (e.parameter.firstName || '').trim();
    var lastName  = (e.parameter.lastName  || '').trim();
    var meno      = (firstName + ' ' + lastName).trim();
    var email     = (e.parameter.email   || '').trim();
    var phone     = (e.parameter.phone   || '').trim();
    var company   = (e.parameter.company || '').trim();
    var message   = (e.parameter.message || '').trim();

    sheet.appendRow([date, time, meno, email, phone, company, message]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('OSVENA rezervacny system je aktivny.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Datum', 'Cas', 'Meno', 'Email', 'Telefon', 'Spolocnost', 'Predmet / Sprava']);
    try {
      var header = sheet.getRange(1, 1, 1, 7);
      header.setFontWeight('bold');
      header.setBackground('#1a1a2e');
      header.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, 7, 160);
    } catch (styleErr) {
      Logger.log('Style warning: ' + styleErr.toString());
    }
  }

  return sheet;
}

function testWrite() {
  var sheet = getOrCreateSheet();
  var now   = new Date();
  var date  = Utilities.formatDate(now, 'Europe/Bratislava', 'dd.MM.yyyy');
  var time  = Utilities.formatDate(now, 'Europe/Bratislava', 'HH:mm');
  sheet.appendRow([date, time, 'Test User', 'test@osvena.com', '+421900000000', 'OSVENA Test', 'Testovacia rezervacia']);
  Logger.log('Zapis uspesny!');
}
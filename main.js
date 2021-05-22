/**
 *
 * @param {object} e
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile("index").evaluate().addMetaTag("viewport", "width=device-width, initial-scale=1, shrink-to-fit=no");
}

/**
 *
 */
function load() {
  function getLast(sheet) {
    return sheet.getDataRange().getValues()[sheet.getLastRow() - 1][0];
  }
  let dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA");
  let last = getLast(dataSheet);
  let required = new Date();
  required.setDate(required.getDate() - 2);
  while (last.getTime() < required.getTime()) {
    last.setDate(last.getDate() + 1);
    dataSheet.appendRow([last]);
    last = getLast(dataSheet);
  }
}

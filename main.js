const transpose = (a) => a[0].map((_, c) => a.map((r) => r[c]));

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
  required.setDate(required.getDate() - 1);
  while (last.getTime() < required.getTime()) {
    last.setDate(last.getDate() + 1);
    dataSheet.appendRow([last]);
    last = getLast(dataSheet);
  }
}

function getRecords(spreadsheet1) {
  let spreadsheet = spreadsheet1 || SpreadsheetApp.getActiveSpreadsheet();
  let values = transpose(spreadsheet.getSheetByName("DATA").getDataRange().getDisplayValues());
  let header = values.splice(0, 1)[0];
  let data = {};
  for (let i = 0; i < values.length; i++) {
    data[values[i][0]] = {};
    for (let j = 1; j < values[i].length; j++) {
      data[values[i][0]][header[j]] = values[i][j];
    }
  }
  let userData = getUserData(spreadsheet);
  for (let kind of Object.keys(userData)) {
    let groups = userData[kind];
    for (let groupName of Object.keys(groups)) {
      let group = groups[groupName];
      for (let email of group.users) {
        let duration = data[email];
        for (let dateKey of Object.keys(duration)) {
          let newKey = dateKey.replace(/\//g, "-");
          if (!group.total[newKey]) {
            group.total[newKey] = 0;
          }
          group.total[newKey] = Math.round((group.total[newKey] + Number(duration[dateKey]) / group.users.length) * 10) / 10;
        }
      }
    }
  }
  return userData;
}

function getUserData(spreadsheet) {
  let values = (spreadsheet || SpreadsheetApp.getActiveSpreadsheet()).getSheetByName("GROUPS").getDataRange().getDisplayValues();
  let header = values.splice(0, 1)[0];
  let result = {};
  for (let label of header.slice(1)) {
    result[label] = {};
  }
  for (let i = 0; i < values.length; i++) {
    for (let j = 1; j < values[i].length; j++) {
      if (!result[header[j]]) {
        result[header[j]] = {};
      }
      if (!result[header[j]][values[i][j]]) {
        result[header[j]][values[i][j]] = { users: [], total: {} };
      }
      result[header[j]][values[i][j]].users.push(values[i][0]);
    }
  }
  return result;
}

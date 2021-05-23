function commit(preDate, record) {
  let date = new Date(preDate);
  let row = (date.getTime() - new Date(requestUser().start).getTime()) / 24 / 60 / 60 / 1000 + 2;
  let column = requestUser().user.number + 1;
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA");
  if (sheet.getLastRow() < row) {
    throw "まだ入力できない日付です";
  }
  sheet.getRange(row, column).setValue(record);
}

/**
 *
 */
function requestUser() {
  let cache = CacheService.getUserCache();
  let current = cache.get("user");
  let result = {
    user: {},
  };
  if (current) {
    result = JSON.parse(current);
  } else {
    let values = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("USERS").getDataRange().getValues();
    let header = values.splice(0, 1)[0];
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] == Session.getActiveUser().getEmail()) {
        for (let j = 0; j < values[i].length; j++) {
          result.user[header[j]] = values[i][j];
        }
      }
    }
    result.start = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA").getRange(2, 1).getValue().toString();
    cache.put("user", JSON.stringify(result));
  }
  return result;
}

function getOverview() {
  let values = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA").getDataRange().getDisplayValues();
  let column = requestUser().user.number;
  let empties = [];
  let temp = {};
  for (let i = 1; i < values.length; i++) {
    let cell = values[i][column];
    if (!cell) {
      empties.push(values[i][0]);
    }
    temp[cell] = (temp[cell] || 0) + 1;
  }
  let mode = [];
  for (let key of Object.keys(temp)) {
    mode.push([key, temp[key]]);
  }
  mode = mode
    .sort(function (a, b) {
      return b[1] - a[1];
    })
    .map(function (value) {
      return value[0];
    });
  return {
    empties: empties,
    mode: mode,
  };
}

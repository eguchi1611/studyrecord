function commit(dateStr, duration, guest, dateList) {
  let row = (new Date(dateStr).getTime() - new Date(dateList[0]).getTime()) / 24 / 60 / 60 / 1000 + 2;
  let column = guest.number + 1;
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA");
  if (sheet.getLastRow() >= row) {
    sheet.getRange(row, column).setValue(duration);
  }
}

function getOverview() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let VALUES_DATA = spreadsheet.getSheetByName("DATA").getDataRange().getValues();
  let VALUES_USERS = spreadsheet.getSheetByName("USERS").getDataRange().getValues();

  let email = Session.getActiveUser().getEmail();

  // ユーザー情報の取得
  let userList = {};
  for (let y = 1; y < VALUES_USERS.length; y++) {
    userList[VALUES_USERS[y][0]] = {};
    for (let x = 0; x < VALUES_USERS[y].length; x++) {
      userList[VALUES_USERS[y][0]][VALUES_USERS[0][x]] = VALUES_USERS[y][x];
    }
  }

  // 入力されてない日付を取得
  let emptyDateList = {};
  for (let x = 1; x < VALUES_DATA[0].length; x++) {
    emptyDateList[VALUES_DATA[0][x]] = [];
  }
  for (let y = 1; y < VALUES_DATA.length; y++) {
    for (let x = 1; x < VALUES_DATA[y].length; x++) {
      if (VALUES_DATA[y][x] === "") {
        emptyDateList[VALUES_DATA[0][x]].push(formatDate(VALUES_DATA[y][0]));
      }
    }
  }

  // 一番入力されている日付を取得
  let count = {};
  for (let y = 1; y < VALUES_DATA.length; y++) {
    let cell = VALUES_DATA[y][userList[email].number];
    count[cell] = (count[cell] || 0) + 1;
  }
  let suggestedElapsedTimeList = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map((v) => v[0])
    .filter((v) => v)
    .map((v) => ({
      hour: Math.floor(v),
      minute: Math.round((v - Math.floor(v)) * 60),
    }));

  // 日付リストを取得
  let dateList = [];
  for (let y = 1; y < VALUES_DATA.length; y++) {
    dateList.push(formatDate(VALUES_DATA[y][0]));
  }

  return { emptyDateList: emptyDateList, suggestedElapsedTimeList: suggestedElapsedTimeList, userList: userList, dateList: dateList, email: email };
}

function getRecords() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let VALUES_DATA = transpose(spreadsheet.getSheetByName("DATA").getDataRange().getValues());
  let VALUES_GROUPS = spreadsheet.getSheetByName("GROUPS").getDataRange().getDisplayValues();

  // グループに対応するユーザーを振り分ける
  let scores = {};
  for (let x = 1; x < VALUES_GROUPS[0].length; x++) {
    scores[VALUES_GROUPS[0][x]] = {};
  }
  for (let i = 1; i < VALUES_GROUPS.length; i++) {
    for (let j = 1; j < VALUES_GROUPS[i].length; j++) {
      if (!scores[VALUES_GROUPS[0][j]]) {
        scores[VALUES_GROUPS[0][j]] = {};
      }
      if (!scores[VALUES_GROUPS[0][j]][VALUES_GROUPS[i][j]]) {
        scores[VALUES_GROUPS[0][j]][VALUES_GROUPS[i][j]] = { users: [], total: {} };
      }
      scores[VALUES_GROUPS[0][j]][VALUES_GROUPS[i][j]].users.push(VALUES_GROUPS[i][0]);
    }
  }

  // ユーザー、日付ごとにデータを格納
  let userScore = {};
  for (let y = 1; y < VALUES_DATA.length; y++) {
    userScore[VALUES_DATA[y][0]] = {};
    for (let x = 1; x < VALUES_DATA[y].length; x++) {
      userScore[VALUES_DATA[y][0]][formatDate(VALUES_DATA[0][x])] = VALUES_DATA[y][x];
    }
  }

  // ユーザーのscoreを代入して平均を格納
  for (let className of Object.keys(scores)) {
    let clazz = scores[className];
    for (let groupName of Object.keys(clazz)) {
      let group = clazz[groupName];
      for (let email of group.users) {
        let duration = userScore[email];
        for (let dateKey of Object.keys(duration)) {
          if (!group.total[dateKey]) {
            group.total[dateKey] = 0;
          }
          group.total[dateKey] = Math.round((group.total[dateKey] + Number(duration[dateKey]) / group.users.length) * 10) / 10;
        }
      }
    }
  }

  return scores;
}

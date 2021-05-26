function formatDate(request) {
  let d = new Date();
  d.setDate(d.getDate() - 1);
  let date = request || d;
  return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
}

const transpose = (a) => a[0].map((_, c) => a.map((r) => r[c]));

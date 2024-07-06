function getWeekNumber(date) {
  var onejan = new Date(date.getFullYear(), 0, 1);
  var millisecsInDay = 86400000;
  return Math.ceil( // @ts-ignore
  ((date - onejan) / millisecsInDay + onejan.getDay() + 1) / 7);
}
function getWeekStart(start = new Date()) {
  const diff = start.getDate() - start.getDay() + (start.getDay() === 0 ? -7 : 0);
  start.setDate(diff);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  start.setMilliseconds(0);
  return start;
}
function subtractWeeks(date, weeks) {
  return new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
}

export { getWeekNumber, getWeekStart, subtractWeeks };

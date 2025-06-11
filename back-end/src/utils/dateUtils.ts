export function normalizeToDayTimestamp(unixTimestamp: number): number {
  const date = new Date(unixTimestamp * 1000);
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

export function getYesterdayTimestamp(): number {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const beforeYesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
  return Math.floor(beforeYesterday.getTime() / 1000);
}

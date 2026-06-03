// Dates helper

export function isDaysPassed(date: Date | string, days: number) {
  const now = new Date();
  const targetDate = new Date(date);
  const timePassed = now.getTime() - targetDate.getTime();

  return timePassed > days * 24 * 60 * 60 * 1000;
}

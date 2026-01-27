export function formatSleepHour(value: number): string {
  const normalized = value >= 24 ? value - 24 : value;
  const hour = normalized % 24;

  if (hour === 0) {
    return '밤 12시';
  }
  if (hour >= 1 && hour <= 5) {
    return `새벽 ${hour}시`;
  }
  if (hour >= 6 && hour <= 11) {
    return `아침 ${hour}시`;
  }
  if (hour >= 12 && hour <= 17) {
    return `오후 ${hour === 12 ? 12 : hour - 12}시`;
  }
  return `밤 ${hour - 12}시`;
}

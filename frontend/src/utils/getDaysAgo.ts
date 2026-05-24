export function getDaysAgo(dateString: string | undefined): number {
  if (!dateString) return 0;
  const inputDate = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - inputDate.getTime();

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

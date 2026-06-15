export const getTimeAgo = (date: string) => {
  const now = new Date().getTime();
  const posted = new Date(date).getTime();

  const diff = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Posted today";
  if (diff === 1) return "Posted 1 day ago";
  return `Posted ${diff} days ago`;
};

export const formatDateTimeLocal = (
  value: string | Date | null | undefined,
): string => {
  if (!value) return "";

  const date = new Date(value);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
};

export const formatDisplayDateTime = (
  value: string | Date | null | undefined,
): string => {
  if (!value) return "";

  const date = new Date(value);

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${datePart} • ${timePart}`;
};

export const formatSalary = (
  salaryMin: string,
  salaryMax: string
): string => {
  const formatNumber = (value: number): string => {
    if (value >= 1_000_000) {
      const num = value / 1_000_000;
      return `$${Number(num.toFixed(1))}m`;
    }

    if (value >= 1_000) {
      const num = value / 1_000;
      return `$${Number(num.toFixed(1))}k`;
    }

    return `$${value}`;
  };

  const min = Number(salaryMin);
  const max = Number(salaryMax);

  if (isNaN(min) || isNaN(max)) {
    return "";
  }

  return `${formatNumber(min)} - ${formatNumber(max)}`;
};
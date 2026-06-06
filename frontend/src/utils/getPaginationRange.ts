export const getPagination = (current: number, total: number) => {
    const delta = 2;

    const range: number[] = [];
    const rangeWithDots: number[] = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };
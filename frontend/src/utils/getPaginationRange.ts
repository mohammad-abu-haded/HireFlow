export const getPagination = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): number[] => {
  const totalPageNumbers = siblingCount + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages
  );

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => i + 1
    );

    return [...leftRange, -1, lastPage];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - (2 + 2 * siblingCount) + i
    );

    return [firstPage, -1, ...rightRange];
  }

  if (showLeftDots && showRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );

    return [
      firstPage,
      -1,
      ...middleRange,
      -1,
      lastPage,
    ];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
};
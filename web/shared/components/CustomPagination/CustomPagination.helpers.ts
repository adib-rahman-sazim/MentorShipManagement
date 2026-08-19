export const calculateStartPage = (
  currentPage: number,
  half: number,
  totalPages: number,
  totalPagesToDisplay: number,
) => {
  let start = currentPage - half;
  if (start < 1) {
    start = 1;
  }
  if (currentPage + half > totalPages) {
    start = totalPages - totalPagesToDisplay + 1;
  }
  return start;
};

export const createDisplayedPages = (start: number, total: number) =>
  Array.from({ length: total }, (_, i) => i + start);

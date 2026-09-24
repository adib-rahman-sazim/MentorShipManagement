import { describe, expect, it } from "vitest";

import { transformPaginationMeta } from "@/shared/redux/rtk-apis/users/users.helpers";

const LIMIT = 10;
const TOTAL = 25;
const TOTAL_PAGES = 3;

describe("transformPaginationMeta", () => {
  it("maps the API fields to the table's pagination shape", () => {
    expect(
      transformPaginationMeta({ page: 2, limit: LIMIT, total: TOTAL, totalPages: TOTAL_PAGES }),
    ).toEqual({
      currentPage: 2,
      itemsPerPage: LIMIT,
      totalItems: TOTAL,
      totalPages: TOTAL_PAGES,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it.each([
    { page: 1, totalPages: TOTAL_PAGES, hasNextPage: true, hasPreviousPage: false },
    { page: TOTAL_PAGES, totalPages: TOTAL_PAGES, hasNextPage: false, hasPreviousPage: true },
    { page: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    { page: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
  ])("on page $page of $totalPages sets next=$hasNextPage and previous=$hasPreviousPage", ({
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  }) => {
    expect(transformPaginationMeta({ page, limit: LIMIT, total: TOTAL, totalPages })).toEqual(
      expect.objectContaining({ hasNextPage, hasPreviousPage }),
    );
  });
});

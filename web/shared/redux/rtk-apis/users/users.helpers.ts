import { IPaginationMetaResponse, TPaginationMetadata } from "@/shared/typedefs";

export function transformPaginationMeta(meta: IPaginationMetaResponse): TPaginationMetadata {
  return {
    currentPage: meta.page,
    itemsPerPage: meta.limit,
    totalItems: meta.total,
    totalPages: meta.totalPages,
    hasNextPage: meta.page < meta.totalPages,
    hasPreviousPage: meta.page > 1,
  };
}
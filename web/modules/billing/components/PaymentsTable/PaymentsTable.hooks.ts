import { useMemo, useState } from "react";

import { useTranslation } from "next-i18next";

import { paymentsTableColumns } from "@/modules/billing/components/PaymentsTable/PaymentsTable.columns";
import { PAYMENTS_TABLE_PAGE_SIZE } from "@/modules/billing/components/PaymentsTable/PaymentsTable.constants";
import { getPaymentTableRows } from "@/modules/billing/components/PaymentsTable/PaymentsTable.helpers";
import type { IPaginationMetadata } from "@/shared/components/DataTableShell/components/DataTableContent";
import { useGetPaymentsListQuery } from "@/shared/redux/rtk-apis/payments/payments.api";

export const usePaymentsTable = () => {
  const { i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAYMENTS_TABLE_PAGE_SIZE);
  const {
    data: paymentsListResponse,
    isError,
    isFetching,
    isLoading: isDataLoading,
  } = useGetPaymentsListQuery({
    page,
    limit: pageSize,
  });
  const paymentRows = useMemo(
    () => getPaymentTableRows(paymentsListResponse?.data ?? [], i18n.language),
    [paymentsListResponse?.data, i18n.language],
  );

  const paginationMetadata: IPaginationMetadata = paymentsListResponse?.meta ?? {
    currentPage: page,
    itemsPerPage: pageSize,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return {
    columns: paymentsTableColumns,
    rows: paymentRows,
    isError,
    isDataLoading: isDataLoading || isFetching,
    isEmpty: paymentsListResponse?.meta.totalItems === 0,
    pageSize,
    onPageSizeChange: handlePageSizeChange,
    paginationMetadata,
    onPageChange: setPage,
  };
};

import { ColumnDef } from "@tanstack/react-table";

import { getPaymentStatusBadgeVariant } from "@/modules/billing/components/PaymentsTable/PaymentsTable.helpers";
import { IPaymentTableRow } from "@/modules/billing/components/PaymentsTable/PaymentsTable.interfaces";
import { Badge } from "@/shared/components/shadui/badge";

export const paymentsTableColumns: ColumnDef<IPaymentTableRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.shortId}</div>,
  },
  {
    accessorKey: "formattedAmount",
    header: "Amount",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getPaymentStatusBadgeVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "typeLabel",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.original.typeLabel}</Badge>,
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "formattedDate",
    header: "Date",
  },
];

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { parseAsInteger, useQueryStates } from "nuqs";

import { DataTableShell } from "@/shared/components/DataTableShell";
import { Button } from "@/shared/components/shadui/button";
import { ORGANIZATIONS_ROUTE } from "@/shared/constants/routes.constants";
import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";
import { useGetOrganizationsQuery } from "@/shared/redux/rtk-apis/organizations/organizations.api";
import { IOrganizationResponse } from "@/shared/redux/rtk-apis/organizations/organizations.interfaces";
import { EPermission, EResource } from "@/shared/typedefs";

import CreateOrganizationDialog from "../../components/CreateOrganizationDialog";
import OrganizationsTable from "../../components/OrganizationsTable";
import { ORGANIZATIONS_PAGE_SIZE_OPTIONS } from "./OrganizationsContainer.constants";

const OrganizationsContainer = () => {
  const router = useRouter();
  const [{ page, limit }, setQueryStates] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });
  const { data: organizations, isLoading } = useGetOrganizationsQuery({ page, limit });
  const { isAllowed: canCreateOrganization } = useCan(EPermission.CREATE, EResource.ORGANIZATION);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const organizationsTableColumns: ColumnDef<IOrganizationResponse>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`${ORGANIZATIONS_ROUTE}/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => row.original.slug,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => format(parseISO(row.original.createdAt), "P"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`${ORGANIZATIONS_ROUTE}/${row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (!isLoading && !organizations) {
    return null;
  }

  return (
    <div className="container py-4">
      <CreateOrganizationDialog isOpen={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      <div className="mb-4 flex flex-row items-center justify-between">
        <h3 className="text text-primary text-4xl font-bold">Organizations</h3>
        {canCreateOrganization ? (
          <Button onClick={() => setIsCreateDialogOpen(true)}>Create Organization</Button>
        ) : null}
      </div>

      <DataTableShell
        showSearch={false}
        searchValue=""
        pageSize={limit}
        onPageSizeChange={(nextLimit) => {
          setQueryStates({ limit: nextLimit, page: 1 });
        }}
        pageSizeOptions={ORGANIZATIONS_PAGE_SIZE_OPTIONS}
        paginationMetadata={
          organizations?.meta ?? {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        }
        onPageChange={(nextPage) => {
          setQueryStates({ page: nextPage });
        }}
        isLoading={isLoading}
      >
        <OrganizationsTable data={organizations?.data ?? []} columns={organizationsTableColumns} />
      </DataTableShell>
    </div>
  );
};

export default OrganizationsContainer;

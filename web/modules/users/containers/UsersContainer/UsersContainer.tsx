import React, { useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryStates } from "nuqs";

import ChangeUserRoleDialog from "@/modules/users/components/ChangeUserRoleDialog";
import CreateUserDialog from "@/modules/users/components/CreateUserDialog";
import ToggleUserStateDialog from "@/modules/users/components/ToggleUserStateDialog";
import UsersTable from "@/modules/users/components/UsersTable";
import { USER_ROLE_LABELS, USER_STATE_LABELS } from "@/modules/users/users.constants";
import { isAssignableUserRole } from "@/modules/users/users.helpers";
import { DataTableShell } from "@/shared/components/DataTableShell";
import { Button } from "@/shared/components/shadui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/shadui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";
import TableCheckBox from "@/shared/components/Table/TableCheckbox";
import { useGetUsersQuery } from "@/shared/redux/rtk-apis/users/users.api";
import { EUserState, IUserResponse } from "@/shared/typedefs";

import { USERS_PAGE_SIZE_OPTIONS } from "./UsersContainer.constants";

const UsersContainer = () => {
  const [{ page, limit, userState }, setQueryStates] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    userState: parseAsStringEnum<EUserState>(Object.values(EUserState)),
  });
  const { data: users, isLoading: isUsersLoading } = useGetUsersQuery({
    limit,
    page,
    state: userState ?? undefined,
  });

  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isToggleStateDialogOpen, setIsToggleStateDialogOpen] = useState(false);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserResponse | null>(null);

  const handleToggleStateClick = (user: IUserResponse) => {
    setSelectedUser(user);
    setIsToggleStateDialogOpen(true);
  };

  const handleChangeRoleClick = (user: IUserResponse) => {
    setSelectedUser(user);
    setIsChangeRoleDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedUser(null);
  };

  const usersTableColumns: ColumnDef<IUserResponse>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <TableCheckBox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <TableCheckBox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => USER_ROLE_LABELS[row.original.role],
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => USER_STATE_LABELS[row.original.state],
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        isAssignableUserRole(row.original.role) ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleChangeRoleClick(row.original)}>
                Change Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleStateClick(row.original)}>
                {row.original.state === EUserState.ACTIVE ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    },
  ];

  if (!isUsersLoading && !users) {
    return null;
  }

  const userStateFilter = (
    <Select
      value={userState?.toString() ?? undefined}
      onValueChange={(value: string | null) => {
        setQueryStates({ userState: value as EUserState, page: 1 });
      }}
    >
      <SelectTrigger className="w-[11.25rem]">
        <SelectValue
          placeholder="Filter by"
          renderValue={(value) => {
            if (value === EUserState.ACTIVE) {
              return "Active";
            }
            if (value === EUserState.INACTIVE) {
              return "Inactive";
            }
            return String(value);
          }}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem key={EUserState.ACTIVE} value={EUserState.ACTIVE}>
          Active
        </SelectItem>
        <SelectItem key={EUserState.INACTIVE} value={EUserState.INACTIVE}>
          Inactive
        </SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="container py-4">
      <CreateUserDialog isOpen={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen} />
      <ToggleUserStateDialog
        user={selectedUser}
        isOpen={isToggleStateDialogOpen}
        onOpenChange={setIsToggleStateDialogOpen}
        onCancel={handleDialogClose}
      />
      <ChangeUserRoleDialog
        user={selectedUser}
        isOpen={isChangeRoleDialogOpen}
        onOpenChange={setIsChangeRoleDialogOpen}
        onCancel={handleDialogClose}
      />

      <div className="mb-4 flex flex-row items-center justify-between">
        <h3 className="text text-primary text-4xl font-bold">Users</h3>
        <Button onClick={() => setIsCreateUserDialogOpen(true)}>Create User</Button>
      </div>

      <DataTableShell
        showSearch={false}
        searchValue=""
        filters={userStateFilter}
        pageSize={limit}
        onPageSizeChange={(nextLimit) => {
          setQueryStates({ limit: nextLimit, page: 1 });
        }}
        pageSizeOptions={USERS_PAGE_SIZE_OPTIONS}
        paginationMetadata={
          users?.meta ?? {
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
        isLoading={isUsersLoading}
      >
        <UsersTable data={users?.data ?? []} columns={usersTableColumns} />
      </DataTableShell>
    </div>
  );
};

export default UsersContainer;
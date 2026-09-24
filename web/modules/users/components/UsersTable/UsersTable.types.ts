import { IUserResponse } from "@/shared/typedefs";
import { TDataTableProps } from "@/shared/typedefs";

export type TUsersTableProps = TDataTableProps<IUserResponse, unknown> & {
  test?: string;
};

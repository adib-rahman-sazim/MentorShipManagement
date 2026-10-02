import { IUserResponse, TDataTableProps } from "@/shared/typedefs";

export type TUsersTableProps = TDataTableProps<IUserResponse, unknown> & {
  test?: string;
};

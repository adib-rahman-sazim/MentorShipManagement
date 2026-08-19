import { IUserResponse } from "@/shared/redux/rtk-apis/users/users.interfaces";
import { TDataTableProps } from "@/shared/typedefs";

export type TUsersTableProps = TDataTableProps<IUserResponse, unknown> & {
  test?: string;
};

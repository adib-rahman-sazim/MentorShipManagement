import { createApi } from "@reduxjs/toolkit/query/react";

import baseQuery from "@/shared/redux/rtk-apis/baseQuery";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery,
  tagTypes: [
    "UserProfile",
    "User",
    "Users",
    "Roles",
    "Payments",
    "Prices",
    "Subscriptions",
    "Permissions",
    "Invitations",
    "Organizations",
    "OrganizationMembers",
  ],
  endpoints: () => ({}),
});

export default projectApi;

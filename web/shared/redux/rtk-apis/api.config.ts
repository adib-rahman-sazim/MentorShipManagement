import { createApi } from "@reduxjs/toolkit/query/react";

import baseQuery from "@/shared/redux/rtk-apis/baseQuery";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery,
  tagTypes: [
    "UserProfile",
    "User",
    "Users",
    "Permissions",
    "UserPermissions",
    "MyMentorship",
    "MentorshipGraph",
  ],
  endpoints: () => ({}),
});

export default projectApi;

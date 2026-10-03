import { PropsWithChildren } from "react";

import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout";

const MentorshipGraphLayout = ({ children }: PropsWithChildren) => (
  <AuthenticatedLayout showSidebarTrigger={false}>{children}</AuthenticatedLayout>
);

export default MentorshipGraphLayout;

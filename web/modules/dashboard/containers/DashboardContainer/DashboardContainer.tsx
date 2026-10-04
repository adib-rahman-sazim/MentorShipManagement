import { ReactNode } from "react";

import MentorshipSectionCard from "@/modules/dashboard/components/MentorshipSectionCard";
import MyMentorshipEmptyState from "@/modules/dashboard/components/MyMentorshipEmptyState";
import MyMentorshipLoadError from "@/modules/dashboard/components/MyMentorshipLoadError";
import MyMentorshipSkeleton from "@/modules/dashboard/components/MyMentorshipSkeleton";
import QuickActions from "@/modules/dashboard/components/QuickActions";
import MentorshipChain from "@/modules/mentorships/components/MentorshipChain";
import MentorshipTeam from "@/modules/mentorships/components/MentorshipTeam";
import { useCan } from "@/shared/providers/AbilityProvider";
import { EPermission, EResource } from "@/shared/typedefs";

import {
  CURRENT_USER_LABEL,
  DASHBOARD_DESCRIPTION,
  DASHBOARD_TITLE,
  MY_TEAM_DESCRIPTION,
  MY_TEAM_TITLE,
  REPORTS_TO_DESCRIPTION,
  REPORTS_TO_TITLE,
} from "./DashboardContainer.constants";
import { isMentorshipEmpty } from "./DashboardContainer.helpers";
import { useMyMentorship } from "./DashboardContainer.hooks";

const DashboardContainer = () => {
  const { isAllowed: canManageUsers } = useCan(EPermission.PAGE_VIEW, EResource.USER);
  const { mentorship, isLoading, errorMessage, refetch } = useMyMentorship(canManageUsers);

  if (canManageUsers) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-8">
        <QuickActions />
      </div>
    );
  }

  let content: ReactNode;

  if (isLoading) {
    content = <MyMentorshipSkeleton />;
  } else if (!mentorship) {
    content = <MyMentorshipLoadError message={errorMessage} onRetry={refetch} />;
  } else if (isMentorshipEmpty(mentorship)) {
    content = <MyMentorshipEmptyState />;
  } else {
    content = (
      <div className="flex flex-col gap-6 lg:flex-row">
        {mentorship.supervisors.length > 0 ? (
          <MentorshipSectionCard title={REPORTS_TO_TITLE} description={REPORTS_TO_DESCRIPTION}>
            <MentorshipChain
              supervisors={mentorship.supervisors}
              subjectLabel={CURRENT_USER_LABEL}
            />
          </MentorshipSectionCard>
        ) : null}
        {mentorship.team.length > 0 ? (
          <MentorshipSectionCard title={MY_TEAM_TITLE} description={MY_TEAM_DESCRIPTION}>
            <MentorshipTeam team={mentorship.team} />
          </MentorshipSectionCard>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{DASHBOARD_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{DASHBOARD_DESCRIPTION}</p>
      </header>
      {content}
      <QuickActions />
    </div>
  );
};

export default DashboardContainer;

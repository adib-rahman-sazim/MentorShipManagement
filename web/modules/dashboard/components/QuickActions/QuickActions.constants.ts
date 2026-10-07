import { DRAFT_QUERY_KEY, NEW_DRAFT_ID } from "@/modules/graph/draft.constants";
import { MENTORSHIP_GRAPH_ROUTE } from "@/shared/constants/routes.constants";

export const QUICK_ACTIONS_TITLE = "Quick actions";
export const CREATE_USER_LABEL = "Create user";
export const CREATE_USER_DESCRIPTION = "Add a Sensei, Mentor or Mentee to the programme.";
export const NEW_DRAFT_LABEL = "New mentorship draft";
export const NEW_DRAFT_DESCRIPTION = "Propose mentorship changes on the graph for review.";
export const MANAGE_USERS_LABEL = "Manage users & permissions";
export const MANAGE_USERS_DESCRIPTION = "Change roles, deactivate accounts and adjust permissions.";
export const NEW_DRAFT_HREF = `${MENTORSHIP_GRAPH_ROUTE}?${DRAFT_QUERY_KEY}=${NEW_DRAFT_ID}`;
export const QUICK_ACTION_TILE_CLASS =
  "h-auto flex-col items-start justify-start gap-2 whitespace-normal p-5 text-left";

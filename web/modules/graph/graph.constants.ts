import { EUserRole } from "@/shared/typedefs";

export const PERSON_NODE_WIDTH = 160;
export const PERSON_NODE_HEIGHT = 56;

export const GRAPH_LAYOUT_DIRECTION = "TB";
export const GRAPH_RANK_SEPARATION = 120;
export const GRAPH_NODE_SEPARATION = 16;
export const GRAPH_ROOT_ID = "mentorship-graph-root";
export const GRAPH_EDGE_TYPE = "smoothstep";

export const TIER_LABEL_ID_PREFIX = "tier-label-";
export const TIER_LABEL_OFFSET_Y = 24;

export const ROLE_TIER: Record<EUserRole, number> = {
  [EUserRole.SUPERADMIN]: 0,
  [EUserRole.SENSEI]: 1,
  [EUserRole.MENTOR]: 2,
  [EUserRole.MENTEE]: 3,
};

export const GRAPH_TIER_ROLES: readonly EUserRole[] = [
  EUserRole.SENSEI,
  EUserRole.MENTOR,
  EUserRole.MENTEE,
];

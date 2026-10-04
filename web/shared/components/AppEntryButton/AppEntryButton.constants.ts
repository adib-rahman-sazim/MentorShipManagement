import { DASHBOARD_ROUTE, SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";

export const SIGNED_OUT_ENTRY = { label: "Sign in", href: SIGN_IN_ROUTE } as const;
export const SIGNED_IN_ENTRY = { label: "Open dashboard", href: DASHBOARD_ROUTE } as const;

export const APP_ENTRY_PRESS_CLASS = "group/entry active:scale-[0.97]";
export const APP_ENTRY_SKELETON_CLASS = "h-9 w-32";
export const APP_ENTRY_LARGE_SKELETON_CLASS = "h-10 w-36";

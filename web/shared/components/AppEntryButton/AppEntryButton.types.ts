import type { ComponentProps } from "react";

import type { Button } from "@/shared/components/shadui/button";

export type TAppEntryButtonProps = Pick<
  ComponentProps<typeof Button>,
  "className" | "size" | "variant"
>;

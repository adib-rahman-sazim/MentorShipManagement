import type { ComponentProps } from "react";

export type ICustomTextAreaProps = ComponentProps<"textarea"> & {
  isError?: boolean;
};

import type { ComponentProps } from "react";

export type ICustomInputProps = ComponentProps<"input"> & {
  isError?: boolean;
};

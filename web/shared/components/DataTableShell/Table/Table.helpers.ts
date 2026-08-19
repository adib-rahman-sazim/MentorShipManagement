import type { ColumnDefBase } from "@tanstack/react-table";

import { ETextAlign } from "./Table.enums";

export const getColumnAlign = <TData, TValue>(
  columnDef: ColumnDefBase<TData, TValue>,
): ETextAlign | undefined => {
  const meta = columnDef.meta;
  if (meta && typeof meta === "object" && "align" in meta) {
    return meta.align as ETextAlign;
  }
  return undefined;
};

export const getAlignmentClass = (align?: ETextAlign): string => {
  switch (align) {
    case ETextAlign.LEFT:
      return "text-left";
    case ETextAlign.RIGHT:
      return "text-right";
    default:
      return "text-center";
  }
};

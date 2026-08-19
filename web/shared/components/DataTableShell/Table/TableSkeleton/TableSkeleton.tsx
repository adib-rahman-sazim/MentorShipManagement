import {
  SKELETON_BASE_WIDTH_PERCENT,
  SKELETON_COL_OFFSET_PERCENT,
  SKELETON_MODULUS_PERCENT,
} from "./TableSkeleton.constants";
import type { ITableSkeletonProps } from "./TableSkeleton.interfaces";

export const TableSkeleton = ({ rows = 5, columns = 4 }: ITableSkeletonProps) => {
  const rowKeys = Array.from({ length: rows }, (_, index) => `row-${index + 1}`);
  const columnIndexes = Array.from({ length: columns }, (_, index) => index);

  return (
    <tbody className="divide-y divide-slate-100">
      {rowKeys.map((rowKey) => (
        <tr key={rowKey} className="border-b border-slate-100">
          {columnIndexes.map((columnIndex) => (
            <td key={`${rowKey}-column-${columnIndex + 1}`} className="px-4 py-3">
              <div
                className="h-4 rounded bg-slate-200 animate-pulse"
                style={{
                  width: `${SKELETON_BASE_WIDTH_PERCENT + ((columnIndex * SKELETON_COL_OFFSET_PERCENT) % SKELETON_MODULUS_PERCENT)}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

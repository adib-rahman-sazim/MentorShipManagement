import * as mockDate from "mockdate";
import * as timezonedDate from "timezoned-date";

import type { IMockDateSetup } from "./mock-date.interfaces";

const originalDate = Date;

export function setupMockDate(): IMockDateSetup {
  function reset() {
    // biome-ignore lint/suspicious/noGlobalAssign: Tests intentionally restore the global Date constructor.
    Date = originalDate;
  }

  function set({ isoDate, offset }: { offset?: number; isoDate?: string }) {
    if (offset !== undefined) {
      // biome-ignore lint/suspicious/noGlobalAssign: Tests intentionally replace the global Date constructor.
      Date = timezonedDate.makeConstructor(offset);
    }

    if (isoDate !== undefined) {
      mockDate.set(isoDate);
    }
  }

  return { reset, set };
}

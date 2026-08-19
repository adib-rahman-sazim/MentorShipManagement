import type { ReactNode } from "react";

import type { Matcher } from "react-day-picker";

export interface IProjectDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label: ReactNode;
  placeholder?: string;
  error?: string;
  disableBefore?: Date;
  disabled?: Matcher | Matcher[];
  onAfterSelect?: () => void;
  id?: string;
}

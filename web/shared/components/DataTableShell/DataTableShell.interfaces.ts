import type { IDataTableContentProps } from "./components/DataTableContent/DataTableContent.interfaces";

export interface IDataTableTab {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IDataTableShellProps extends IDataTableContentProps {
  tabs?: IDataTableTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

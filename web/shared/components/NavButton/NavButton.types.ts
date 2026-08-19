import { ICustomButtonProps } from "@/shared/components/Form/CustomButton/CustomButton.types";

export type INavButtonProps = ICustomButtonProps & {
  badgeValue?: string | number;
  icon?: React.ReactNode;
  active: boolean;
  className?: string;
  isNested?: boolean;
  children?: React.ReactNode;
};

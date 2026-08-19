export type TCustomCheckboxDropdownOptions = {
  label: string;
  checked: boolean;
  onSelect: () => void;
};

export type TCustomCheckboxDropdownProps = {
  placeholder: React.ReactNode;
  options: TCustomCheckboxDropdownOptions[];
  dropdownPosition?: "start" | "center" | "end";
};

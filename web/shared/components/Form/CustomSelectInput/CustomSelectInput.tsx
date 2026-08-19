import { ChevronsDownUp } from "lucide-react";

import CustomComboBox from "../../CustomComboBox";
import { TCustomSelectInputProps } from "./CustomSelectInput.types";

const CustomSelectInput: React.FC<TCustomSelectInputProps> = ({
  options,
  isError,
  value,
  onChange,
  buttonClassname,
  dropdownClassname,
  placeholder,
}) => {
  const textStyles = value ? "text-foreground" : "text-background-secondary-foreground/50";
  const borderStyles = isError ? "border-destructive" : "";

  const buttonClassnames = `px-2 bg-inherit focus-visible:ring-1 ${textStyles} ${borderStyles} w-full rounded-md border border-input bg-background placeholder:text-muted-foreground ${buttonClassname}`;

  const handleChange = (value: string) => {
    onChange(value);
  };

  return (
    <CustomComboBox
      placeholder={placeholder}
      onChange={handleChange}
      buttonClassname={buttonClassnames}
      dropdownClassname={dropdownClassname}
      dropdownPosition="center"
      dropdownOffset={5}
      buttonVariant="outline"
      triggerRightIcon={<ChevronsDownUp className="h-4 w-4 opacity-50" />}
      options={options}
    />
  );
};

export default CustomSelectInput;

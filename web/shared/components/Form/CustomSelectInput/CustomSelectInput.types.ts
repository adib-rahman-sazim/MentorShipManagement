export type TCustomSelectInputProps = {
  options: { label: string; value: string }[];
  isError?: boolean;
  value: string;
  onChange: (value: string) => void;
  buttonClassname?: string;
  dropdownClassname?: string;
  placeholder?: string;
};

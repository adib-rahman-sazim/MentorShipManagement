export interface IChatSmartInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onStop: () => void;
  placeholder?: string;
}

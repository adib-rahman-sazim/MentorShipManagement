import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/shared/components/shadui/input";

import type { ISearchInputProps } from "./SearchInput.interfaces";

export const SearchInput = ({ value, onChange, placeholder, className }: ISearchInputProps) => (
  <div className={cn("relative w-full md:w-auto", className)}>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-auto w-full rounded-md border border-input bg-background py-3 text-sm font-medium shadow-sm outline-none transition-all placeholder:text-muted-foreground hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 md:w-[20rem] md:py-[0.875rem] ltr:pl-12 ltr:pr-6 rtl:pr-12 rtl:pl-6",
      )}
    />
    <Search
      size={16}
      className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ltr:left-5 rtl:right-5"
    />
  </div>
);

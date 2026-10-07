import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/shared/components/shadui/input";

import type { ISearchInputProps } from "./SearchInput.interfaces";

export const SearchInput = ({ value, onChange, placeholder, className }: ISearchInputProps) => (
  <div className={cn("relative w-full md:w-[16rem]", className)}>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="ltr:pl-8 rtl:pr-8"
    />
    <Search
      size={16}
      className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ltr:left-2.5 rtl:right-2.5"
    />
  </div>
);

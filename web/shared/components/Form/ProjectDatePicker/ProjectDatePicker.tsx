import { useState } from "react";

import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/shared/components/shadui/calendar";
import { Label } from "@/shared/components/shadui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/shadui/popover";

import { IProjectDatePickerProps } from "./ProjectDatePicker.interfaces";

const getCalendarDisabled = (
  disableBefore: Date | undefined,
  disabled: IProjectDatePickerProps["disabled"],
): IProjectDatePickerProps["disabled"] => {
  if (disableBefore === undefined) {
    return disabled;
  }

  if (disabled) {
    return [{ before: disableBefore }, ...(Array.isArray(disabled) ? disabled : [disabled])];
  }

  return { before: disableBefore };
};

const ProjectDatePicker = ({
  value,
  onChange,
  label,
  placeholder = "mm/dd/yyyy",
  error,
  disableBefore,
  disabled,
  onAfterSelect,
  id,
}: IProjectDatePickerProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const fieldId =
    id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : "date-field");

  const calendarDisabled = getCalendarDisabled(disableBefore, disabled);

  return (
    <div>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </Label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger
          id={fieldId}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1.5",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{value ? dayjs(value).format("MM/DD/YYYY") : placeholder}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              onChange(date ?? null);
              setCalendarOpen(false);
              onAfterSelect?.();
            }}
            disabled={calendarDisabled}
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-red-500 mt-1">{error}</p> : null}
    </div>
  );
};

export default ProjectDatePicker;

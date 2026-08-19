import { useCallback, useMemo, useState } from "react";

import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../shadui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../shadui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../shadui/popover";
import { TComboBoxProps } from "./CustomComboBox.types";

const CustomComboBox: React.FC<TComboBoxProps> = ({
  options,
  placeholder = "Select",
  triggerLeftIcon,
  triggerRightIcon = <ChevronDown className="h-4 w-4 stroke-2 ml-4" />,
  buttonSize = "default",
  buttonVariant = "default",
  buttonClassname,
  dropdownClassname,
  dropdownOffset,
  dropdownPosition = "center",
  disabled = false,
  isActionButton = false,
  popoverSameAsTriggerWidth = true,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchable, setSearchable] = useState("");
  const selectedOption = useMemo(() => {
    if (!searchable) {
      return;
    }

    return options.find((element) => element.value === searchable);
  }, [searchable, options]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      if (currentValue === searchable) {
        setSearchable("");
        onChange("");
      } else {
        setSearchable(currentValue);
        onChange(currentValue);
      }

      if (isActionButton) {
        setSearchable("");
      }

      setOpen(false);
    },
    [searchable, onChange, isActionButton],
  );

  const renderTriggerLeftIcon =
    searchable && selectedOption ? selectedOption.icon : (triggerLeftIcon ?? null);
  const renderTriggerPlaceholder =
    searchable && selectedOption ? selectedOption.label : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          role="combobox"
          aria-expanded={open}
          className={cn("flex justify-between bg-muted rounded-sm", buttonClassname)}
          disabled={disabled}
        >
          {isActionButton ? triggerLeftIcon : renderTriggerLeftIcon}
          <div className="ml-1">{isActionButton ? placeholder : renderTriggerPlaceholder}</div>
          {triggerRightIcon === "none" ? null : triggerRightIcon}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "p-0 rounded-md border border-border bg-background-secondary",
          popoverSameAsTriggerWidth ? "w-(--radix-popover-trigger-width)" : null,
          dropdownClassname,
        )}
        align={dropdownPosition}
        sideOffset={dropdownOffset}
      >
        <Command className="bg-background-secondary">
          <CommandList className="grid gap-5">
            <CommandGroup>
              <CommandEmpty className="p-2 text-sm">No value found.</CommandEmpty>
              {options.length > 0
                ? options.map((element) => (
                    <CommandItem
                      key={element.value}
                      value={element.value}
                      onSelect={handleSelect}
                      className="aria-selected:bg-muted aria-selected:text-background-foreground rounded-md"
                    >
                      <div className="flex w-full justify-between items-center">
                        <div className="flex gap-3 justify-center items-center">
                          {element.icon ? element.icon : null}
                          {element.label}
                        </div>
                        {isActionButton ? null : (
                          <Check
                            className={cn(
                              "mr-2 h-3 w-3 stroke-2",
                              searchable === element.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                        )}
                      </div>
                    </CommandItem>
                  ))
                : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomComboBox;

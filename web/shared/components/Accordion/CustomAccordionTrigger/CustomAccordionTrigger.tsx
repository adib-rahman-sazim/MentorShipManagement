import React from "react";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { MdArrowDropDown } from "react-icons/md";

import { cn } from "@/lib/utils";

import { ICustomAccordionTriggerProps } from "./CustomAccordionTrigger.types";

const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  ICustomAccordionTriggerProps
>(
  (
    {
      className,
      children,
      openIcon,
      closedIcon,
      rotatableIcon = <MdArrowDropDown className="h-4 w-4" />,
      ...props
    },
    ref,
  ) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex gap-2 items-center justify-between py-4 font-medium transition-all text-sm leading-5 group relative",
          className,
        )}
        {...props}
      >
        {children}
        {!openIcon && !closedIcon ? (
          <div className="shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180 absolute right-2">
            {rotatableIcon}
          </div>
        ) : (
          <>
            <div className="shrink-0 group-aria-expanded:hidden absolute right-2">{openIcon}</div>
            <div className="shrink-0 group-aria-expanded:flex hidden absolute right-2">
              {closedIcon}
            </div>
          </>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  ),
);
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

export default CustomAccordionTrigger;

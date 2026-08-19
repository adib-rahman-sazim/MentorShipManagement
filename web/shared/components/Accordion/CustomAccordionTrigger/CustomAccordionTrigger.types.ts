import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

export type ICustomAccordionTriggerProps = AccordionPrimitive.Trigger.Props & {
  openIcon?: React.ReactNode;
  closedIcon?: React.ReactNode;
  rotatableIcon?: React.ReactNode;
};

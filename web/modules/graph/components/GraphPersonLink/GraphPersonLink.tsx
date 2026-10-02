import { Button } from "@/shared/components/shadui/button";

import { IGraphPersonLinkProps } from "./GraphPersonLink.interfaces";

const GraphPersonLink = ({ person, onSelect }: IGraphPersonLinkProps) => (
  <Button
    variant="link"
    className="h-auto max-w-full justify-start truncate p-0 text-sm leading-5 font-normal text-foreground"
    onClick={() => onSelect(person.id)}
  >
    {person.name}
  </Button>
);

export default GraphPersonLink;

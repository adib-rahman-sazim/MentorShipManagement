import { getInitials } from "@/shared/utils/string";

import { IGraphPersonButtonProps } from "./GraphPersonButton.interfaces";

const GraphPersonButton = ({ person, onSelect }: IGraphPersonButtonProps) => (
  <button
    type="button"
    className="flex w-full min-w-0 items-center gap-2 rounded-md py-1.5 text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
    onClick={() => onSelect(person.id)}
  >
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[0.625rem] font-medium">
      {getInitials(person.name)}
    </span>
    <span className="truncate text-sm">{person.name}</span>
  </button>
);

export default GraphPersonButton;

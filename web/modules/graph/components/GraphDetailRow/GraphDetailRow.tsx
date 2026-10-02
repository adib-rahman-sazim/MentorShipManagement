import { IGraphDetailRowProps } from "./GraphDetailRow.interfaces";

const GraphDetailRow = ({ label, children }: IGraphDetailRowProps) => (
  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 border-b py-2.5">
    <dt className="text-[0.8125rem] leading-5 text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-sm leading-5">{children}</dd>
  </div>
);

export default GraphDetailRow;

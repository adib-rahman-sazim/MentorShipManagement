import GraphDetailRow from "@/modules/graph/components/GraphDetailRow";
import GraphPersonLink from "@/modules/graph/components/GraphPersonLink";
import { USER_ROLE_LABELS } from "@/modules/users/users.constants";

import { SUPERVISOR_LABEL } from "./LinkDetails.constants";
import { getLinkKind, getLinkSentence, getLinkSince } from "./LinkDetails.helpers";
import { ILinkDetailsProps } from "./LinkDetails.interfaces";

const LinkDetails = ({ details, onSelectPerson }: ILinkDetailsProps) => (
  <div className="flex flex-col gap-5 p-5">
    <div className="flex flex-col gap-1 pr-8">
      <span className="text-xs text-muted-foreground">{getLinkKind(details)}</span>
      <h2 className="text-base font-semibold">{getLinkSentence(details)}</h2>
      <span className="text-xs text-muted-foreground">{getLinkSince(details)}</span>
    </div>
    <dl className="flex flex-col border-t">
      <GraphDetailRow label={SUPERVISOR_LABEL}>
        <GraphPersonLink person={details.supervisor} onSelect={onSelectPerson} />
      </GraphDetailRow>
      <GraphDetailRow label={USER_ROLE_LABELS[details.subordinate.role]}>
        <GraphPersonLink person={details.subordinate} onSelect={onSelectPerson} />
      </GraphDetailRow>
    </dl>
  </div>
);

export default LinkDetails;

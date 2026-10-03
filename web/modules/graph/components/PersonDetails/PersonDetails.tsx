import pluralize from "pluralize";

import GraphDetailRow from "@/modules/graph/components/GraphDetailRow";
import GraphPersonButton from "@/modules/graph/components/GraphPersonButton";
import GraphPersonLink from "@/modules/graph/components/GraphPersonLink";
import { USER_ROLE_LABELS, USER_STATE_LABELS } from "@/modules/users/users.constants";
import { getInitials } from "@/shared/utils/string";

import {
  NO_SUBORDINATES_LABEL,
  NO_SUPERVISOR_LABEL,
  STATUS_LABEL,
} from "./PersonDetails.constants";
import { getPersonSubtitle } from "./PersonDetails.helpers";
import { IPersonDetailsProps } from "./PersonDetails.interfaces";

const PersonDetails = ({ details, onSelectPerson }: IPersonDetailsProps) => {
  const { person, supervisor, supervisorRole, subordinateRole, subordinates } = details;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-3 pr-8">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-[0.8125rem] font-medium">
          {getInitials(person.name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-base font-semibold" title={person.name}>
            {person.name}
          </h2>
          <span className="text-xs text-muted-foreground">{getPersonSubtitle(person)}</span>
        </div>
      </div>
      <dl className="flex flex-col border-t">
        {supervisorRole ? (
          <GraphDetailRow label={USER_ROLE_LABELS[supervisorRole]}>
            {supervisor ? (
              <GraphPersonLink person={supervisor} onSelect={onSelectPerson} />
            ) : (
              NO_SUPERVISOR_LABEL
            )}
          </GraphDetailRow>
        ) : null}
        <GraphDetailRow label={STATUS_LABEL}>{USER_STATE_LABELS[person.state]}</GraphDetailRow>
      </dl>
      {subordinateRole ? (
        <section>
          <div className="mb-1 flex items-baseline gap-2">
            <h3 className="text-sm font-medium">{pluralize(USER_ROLE_LABELS[subordinateRole])}</h3>
            <span className="font-mono text-xs text-muted-foreground">{subordinates.length}</span>
          </div>
          {subordinates.length > 0 ? (
            <ul>
              {subordinates.map((subordinate) => (
                <li key={subordinate.id}>
                  <GraphPersonButton person={subordinate} onSelect={onSelectPerson} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.8125rem] text-muted-foreground">{NO_SUBORDINATES_LABEL}</p>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default PersonDetails;

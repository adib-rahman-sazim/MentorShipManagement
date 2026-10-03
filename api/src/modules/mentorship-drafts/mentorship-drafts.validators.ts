import { isUUID, registerDecorator, type ValidationArguments } from "class-validator";

import { EMentorshipDraftOperation } from "@/common/enums/mentorships.enums";

import { MENTORSHIP_DRAFT_ERROR_MESSAGES } from "./mentorship-drafts.constants";
import type { MentorshipDraftItemDto } from "./mentorship-drafts.dtos";

export function MatchesDraftOperation() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "matchesDraftOperation",
      target: object.constructor,
      propertyName,
      options: { message: MENTORSHIP_DRAFT_ERROR_MESSAGES.PROPOSED_SUPERVISOR_MISMATCH },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { operation } = args.object as MentorshipDraftItemDto;

          if (operation === EMentorshipDraftOperation.UNASSIGN) {
            return value === undefined || value === null;
          }

          return typeof value === "string" && isUUID(value);
        },
      },
    });
  };
}

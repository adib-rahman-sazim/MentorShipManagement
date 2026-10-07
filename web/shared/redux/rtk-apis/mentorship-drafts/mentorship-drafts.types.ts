import {
  IApproveDraftParams,
  IDecideMentorshipDraftDto,
  IUpdateDraftParams,
  IUpdateMentorshipDraftDto,
} from "@/shared/typedefs";

export type TUpdateMentorshipDraftArgs = IUpdateMentorshipDraftDto & IUpdateDraftParams;

export type TDecideMentorshipDraftArgs = IDecideMentorshipDraftDto & IApproveDraftParams;

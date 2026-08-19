import { ISystemInvitationValidationResponse } from "@/shared/redux/rtk-apis/invitations/invitations.interfaces";

export interface IAcceptSystemInvitationHookResult {
  token: string;
  invitation: ISystemInvitationValidationResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  handleEmailSignUp: () => void;
}

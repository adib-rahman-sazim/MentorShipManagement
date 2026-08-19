import { IOrganizationInvitationValidationResponse } from "@/shared/redux/rtk-apis/invitations/invitations.interfaces";

export interface IAcceptInvitationHookResult {
  token: string;
  invitation: IOrganizationInvitationValidationResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  isAccepting: boolean;
  isAccepted: boolean;
  error: string | null;
  handleAcceptInvitation: () => Promise<void>;
  handleEmailSignUp: () => void;
  handleSignIn: () => void;
}

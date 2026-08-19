import { ESignOutReason } from "@/shared/utils/signOut";

export interface ISignOutArgs {
  reason?: ESignOutReason;
  redirectRoute?: string;
  shouldEmitSignOutEvent?: boolean;
  shouldRedirect?: boolean;
}

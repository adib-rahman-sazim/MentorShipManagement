import {
  TOAST_MESSAGE_ACCOUNT_DEACTIVATED,
  TOAST_MESSAGE_ACCOUNT_NOT_FOUND,
} from "@/shared/constants/toastMessages.constants";
import { EAuthErrorCode } from "@/shared/typedefs";

export const AUTH_ERROR_CODE_TOAST_MESSAGES: Record<EAuthErrorCode, string> = {
  [EAuthErrorCode.ACCOUNT_DEACTIVATED]: TOAST_MESSAGE_ACCOUNT_DEACTIVATED,
  [EAuthErrorCode.ACCOUNT_NOT_FOUND]: TOAST_MESSAGE_ACCOUNT_NOT_FOUND,
};

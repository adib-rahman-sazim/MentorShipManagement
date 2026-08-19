import { useCallback, useRef } from "react";

import { toast } from "sonner";

const onCopySuccessDefault = (_inputValue: string) => {
  toast("Text copied to clipboard");
};

const onCopyErrorDefault = () => {
  toast("Failed to copy text");
};

export const useCopyInputToClipboard = ({
  onCopySuccess = onCopySuccessDefault,
  onCopyError = onCopyErrorDefault,
}: {
  onCopySuccess?: (inputValue: string) => void;
  onCopyError?: () => void;
} = {}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = useCallback(async () => {
    if (inputRef.current) {
      const inputValue = inputRef.current.value;

      try {
        await navigator.clipboard.writeText(inputValue);

        if (onCopySuccess) {
          onCopySuccess(inputValue);
        }
      } catch (_errorMessage) {
        if (onCopyError) {
          onCopyError();
        }
      }
    }
  }, [onCopyError, onCopySuccess]);

  return { inputRef, copyToClipboard };
};

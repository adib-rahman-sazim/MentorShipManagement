import { EMessagePartType, EMessageRole } from "@/modules/ai-sdk/ai-sdk.enums";

export const buildChatRequest = (overrides?: object) => ({
  messages: [
    {
      id: "msg-1",
      role: EMessageRole.USER,
      parts: [{ type: EMessagePartType.TEXT, text: "Hello" }],
    },
  ],
  ...overrides,
});

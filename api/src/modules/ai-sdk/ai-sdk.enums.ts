export enum EAiProvider {
  AI_GATEWAY = "ai-gateway",
  GOOGLE = "google",
  CEREBRAS = "cerebras",
}

export enum EAiModel {
  GPT_4O = "openai/gpt-4o",
  GPT_4O_MINI = "openai/gpt-4o-mini",
  GEMINI_2_5_FLASH = "gemini-2.5-flash",
  CEREBRAS_LLAMA = "llama3.1-8b",
}

export enum EMessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

export enum EMessagePartType {
  TEXT = "text",
  REASONING = "reasoning",
  SOURCE_URL = "source-url",
  SOURCE_DOCUMENT = "source-document",
  FILE = "file",
  STEP_START = "step-start",
  STEP_FINISH = "step-finish",
}

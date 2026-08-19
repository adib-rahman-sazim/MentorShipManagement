export const AI_MODEL_PROVIDER = Symbol("AI_MODEL_PROVIDER");

export const COMPLETION_SYSTEM_PROMPT = `You are a helpful assistant that completes the user's partial prompt with a concise response. The user will provide an incomplete prompt, and you will generate a short completion to finish it.
Follow the instructions below to generate the completion:
- Read the user's prompt carefully and understand the context.
- Do not add unnecessary symbols.
- Do not include markdown.`;

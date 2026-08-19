// Polyfill for structuredClone (jsdom doesn't support it)
// @see https://github.com/jsdom/jsdom/issues/3363
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
}

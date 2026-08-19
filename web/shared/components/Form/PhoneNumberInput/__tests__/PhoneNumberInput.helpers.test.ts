import { describe, expect, it } from "vitest";

import {
  findCountryByIso,
  formatE164,
  isValidPhoneNumber,
  parsePhoneNumber,
  sanitizeNationalDigits,
} from "../PhoneNumberInput.helpers";

describe("PhoneNumberInput.helpers", () => {
  describe("sanitizeNationalDigits", () => {
    it("strips non-digit characters", () => {
      expect(sanitizeNationalDigits("(415) 555-1212")).toBe("4155551212");
    });
  });

  describe("findCountryByIso", () => {
    it("returns the country for a known ISO code", () => {
      expect(findCountryByIso("BD")?.dialCode).toBe("880");
    });

    it("returns undefined for an unknown ISO code", () => {
      expect(findCountryByIso("ZZ")).toBeUndefined();
    });
  });

  describe("parsePhoneNumber", () => {
    it("parses an E.164 number into country + national parts", () => {
      const result = parsePhoneNumber("+8801711223344");
      expect(result.iso).toBe("BD");
      expect(result.dialCode).toBe("880");
      expect(result.nationalNumber).toBe("1711223344");
    });

    it("prefers the longest matching dial code prefix", () => {
      const ukResult = parsePhoneNumber("+447911123456");
      expect(ukResult.iso).toBe("GB");
      expect(ukResult.nationalNumber).toBe("7911123456");

      const finlandResult = parsePhoneNumber("+358401234567");
      expect(finlandResult.iso).toBe("FI");
      expect(finlandResult.dialCode).toBe("358");
    });

    it("falls back to the provided ISO when value has no + prefix", () => {
      const result = parsePhoneNumber("4155551212", "US");
      expect(result.iso).toBe("US");
      expect(result.nationalNumber).toBe("4155551212");
    });

    it("handles empty input", () => {
      const result = parsePhoneNumber("", "US");
      expect(result.iso).toBe("US");
      expect(result.nationalNumber).toBe("");
    });
  });

  describe("formatE164", () => {
    it("concatenates + dial code and national digits", () => {
      expect(formatE164("880", "1711223344")).toBe("+8801711223344");
    });

    it("strips formatting from the national number", () => {
      expect(formatE164("1", "(415) 555-1212")).toBe("+14155551212");
    });

    it("returns empty string when no national digits", () => {
      expect(formatE164("1", "")).toBe("");
    });
  });

  describe("isValidPhoneNumber", () => {
    it("accepts a valid E.164 number", () => {
      expect(isValidPhoneNumber("+14155551212")).toBe(true);
    });

    it("rejects numbers shorter than the minimum national length", () => {
      expect(isValidPhoneNumber("+11234")).toBe(false);
    });

    it("rejects numbers without a + prefix", () => {
      expect(isValidPhoneNumber("4155551212")).toBe(false);
    });

    it("rejects empty input", () => {
      expect(isValidPhoneNumber("")).toBe(false);
    });
  });
});

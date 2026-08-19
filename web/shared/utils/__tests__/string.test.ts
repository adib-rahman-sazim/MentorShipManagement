import { capitalize, getInitials } from "../string";

describe("string", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should return an empty string when given an empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("if given a string with a capital letter as its first letter, should return the string unchanged", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });

    it("if given a string with multiple words, should only capitalize the first word", () => {
      expect(capitalize("hello world")).toBe("Hello world");
    });
  });

  describe("getInitials", () => {
    test("should return empty string for an empty name", () => {
      expect(getInitials("")).toBe("");
    });

    test("should return correct initials for a single-word name", () => {
      expect(getInitials("John")).toBe("J");
    });

    test("should return correct initials for a two-word name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    test("should return correct initials for a three-word name", () => {
      expect(getInitials("John Paul Doe")).toBe("JD");
    });

    test("should handle leading and trailing whitespaces", () => {
      expect(getInitials("   John   Doe   ")).toBe("JD");
    });

    test("should handle mixed cases in the name", () => {
      expect(getInitials("joHn dOe")).toBe("JD");
    });

    test("should handle names with special characters", () => {
      expect(getInitials("A. B. Smith")).toBe("AS");
      expect(getInitials("Mary-Anne Johnson")).toBe("MJ");
      expect(getInitials("John O'Connor")).toBe("JO");
    });
  });
});

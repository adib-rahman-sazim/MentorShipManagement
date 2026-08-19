import { decodeBase64ToObject, encodeObjectToBase64 } from "../base64";

describe("base64", () => {
  describe("encodeObjectToBase64", () => {
    it("should correctly encode an object to a base64 string", () => {
      const data = { key: "value" };
      const encoded = encodeObjectToBase64(data);
      expect(encoded).toBe(Buffer.from(JSON.stringify(data)).toString("base64"));
    });
  });

  describe("decodeBase64ToObject", () => {
    it("should correctly decode a base64 string to an object", () => {
      const data = { key: "value" };
      const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
      const decoded = decodeBase64ToObject(encoded);
      expect(decoded).toEqual(data);
    });

    it("should throw an error when given invalid base64 data", () => {
      const invalidData = "invalid base64 data";
      expect(() => decodeBase64ToObject(invalidData)).toThrow();
    });
  });
});

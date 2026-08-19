import {
  uploadDocumentFormInitialValues,
  uploadDocumentFormValidationSchema,
} from "../UploadDocumentForm.helpers";

describe("UploadDocumentForm.helpers", () => {
  describe("uploadDocumentFormInitialValues", () => {
    it("should have null file", () => {
      expect(uploadDocumentFormInitialValues.file).toBeUndefined();
    });
  });

  describe("uploadDocumentFormValidationSchema", () => {
    it("should reject when file is null", () => {
      const result = uploadDocumentFormValidationSchema.safeParse({
        file: null,
      });

      expect(result.success).toBe(false);
    });

    it("should reject empty file (File with size 0)", () => {
      const file = new File([], "test.pdf", { type: "application/pdf" });

      const result = uploadDocumentFormValidationSchema.safeParse({
        file,
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid file with content", () => {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });

      const result = uploadDocumentFormValidationSchema.safeParse({
        file,
      });

      expect(result.success).toBe(true);
    });
  });
});

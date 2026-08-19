import {
  QUERY_MAX_RESULTS_DEFAULT,
  QUERY_MAX_RESULTS_MAX,
  QUERY_MAX_RESULTS_MIN,
} from "../QueryDocumentForm.constants";
import {
  queryDocumentFormInitialValues,
  queryDocumentFormValidationSchema,
} from "../QueryDocumentForm.helpers";

describe("QueryDocumentForm.helpers", () => {
  describe("queryDocumentFormInitialValues", () => {
    it("should have empty query string", () => {
      expect(queryDocumentFormInitialValues.query).toBe("");
    });

    it("should have default maxResults", () => {
      expect(queryDocumentFormInitialValues.maxResults).toBe(QUERY_MAX_RESULTS_DEFAULT);
    });
  });

  describe("queryDocumentFormValidationSchema", () => {
    it("should reject empty query", () => {
      const result = queryDocumentFormValidationSchema.safeParse({
        query: "",
        maxResults: 5,
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid query and maxResults", () => {
      const result = queryDocumentFormValidationSchema.safeParse({
        query: "test query",
        maxResults: 5,
      });

      expect(result.success).toBe(true);
    });

    it("should reject maxResults below minimum", () => {
      const result = queryDocumentFormValidationSchema.safeParse({
        query: "test query",
        maxResults: QUERY_MAX_RESULTS_MIN - 1,
      });

      expect(result.success).toBe(false);
    });

    it("should reject maxResults above maximum", () => {
      const result = queryDocumentFormValidationSchema.safeParse({
        query: "test query",
        maxResults: QUERY_MAX_RESULTS_MAX + 1,
      });

      expect(result.success).toBe(false);
    });

    it("should accept min boundary for maxResults", () => {
      const result = queryDocumentFormValidationSchema.safeParse({
        query: "test query",
        maxResults: QUERY_MAX_RESULTS_MIN,
      });

      expect(result.success).toBe(true);
    });

    it("should accept max boundary for maxResults", () => {
      const result = queryDocumentFormValidationSchema.safeParse({
        query: "test query",
        maxResults: QUERY_MAX_RESULTS_MAX,
      });

      expect(result.success).toBe(true);
    });
  });
});

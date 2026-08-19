import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  QUERY_MAX_RESULTS_DEFAULT,
  QUERY_MAX_RESULTS_MAX,
  QUERY_MAX_RESULTS_MIN,
} from "./QueryDocumentForm.constants";
import { TQueryDocumentFormFields } from "./QueryDocumentForm.types";

export const queryDocumentFormInitialValues: TQueryDocumentFormFields = {
  query: "",
  maxResults: QUERY_MAX_RESULTS_DEFAULT,
};

export const queryDocumentFormValidationSchema = z.object({
  query: z.string().min(1, "Please enter a search query"),
  maxResults: z
    .number()
    .int()
    .min(QUERY_MAX_RESULTS_MIN, `Minimum is ${QUERY_MAX_RESULTS_MIN}`)
    .max(QUERY_MAX_RESULTS_MAX, `Maximum is ${QUERY_MAX_RESULTS_MAX}`),
});

export const queryDocumentFormResolver = zodResolver(queryDocumentFormValidationSchema);

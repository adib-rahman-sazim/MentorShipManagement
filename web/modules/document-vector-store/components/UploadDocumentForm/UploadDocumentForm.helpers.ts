import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { EAllowedMimeTypes } from "@/shared/typedefs/api";

import { VECTOR_DB_ALLOWED_MIME_TYPES } from "./UploadDocumentForm.constants";

export const uploadDocumentFormInitialValues = {
  file: undefined,
};

export const uploadDocumentFormValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine((val) => val.size > 0, "File cannot be empty")
    .refine(
      (val) => VECTOR_DB_ALLOWED_MIME_TYPES.includes(val.type as EAllowedMimeTypes),
      "Only PDF files are allowed",
    ),
});

export const uploadDocumentFormResolver = zodResolver(uploadDocumentFormValidationSchema);

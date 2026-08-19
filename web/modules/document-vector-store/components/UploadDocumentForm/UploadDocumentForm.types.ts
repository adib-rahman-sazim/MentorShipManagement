import { z } from "zod";

import type { uploadDocumentFormValidationSchema } from "./UploadDocumentForm.helpers";

export type TUploadDocumentFormFields = {
  file: File;
};

export type TUploadDocumentFormSchema = z.infer<typeof uploadDocumentFormValidationSchema>;

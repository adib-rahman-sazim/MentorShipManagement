import type { EPdfFieldType } from "./pdf-generation.enums";
import type {
  ICheckboxMapper,
  IDropdownMapper,
  IRadioButtonMapper,
  ITextFieldMapper,
} from "./pdf-generation.interfaces";

export type TPdfGenerationResponse = {
  message: string;
  pdfBuffer: Uint8Array;
};

export type TPdfFillMapperObject =
  | ITextFieldMapper
  | IRadioButtonMapper
  | ICheckboxMapper
  | IDropdownMapper;

type TDataTypeForPdfMapping = string | number | boolean | Date | undefined;
export type TDataDictionary = Record<string, TDataTypeForPdfMapping>;

export type TPdfFillMapper = {
  label: string;
  data: TDataTypeForPdfMapping;
  type: EPdfFieldType;
};

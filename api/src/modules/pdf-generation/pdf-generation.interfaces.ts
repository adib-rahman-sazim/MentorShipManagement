import type { EPdfFieldType } from "./pdf-generation.enums";

export interface IPdfDataField<T, U extends EPdfFieldType> {
  label: string;
  data: T;
  type: U;
}

export interface ITextFieldMapper extends IPdfDataField<string, EPdfFieldType.TEXTFIELD> {}
export interface IRadioButtonMapper extends IPdfDataField<string, EPdfFieldType.RADIOBUTTON> {}
export interface ICheckboxMapper extends IPdfDataField<boolean, EPdfFieldType.CHECKBOX> {}
export interface IDropdownMapper extends IPdfDataField<string[] | string, EPdfFieldType.DROPDOWN> {}

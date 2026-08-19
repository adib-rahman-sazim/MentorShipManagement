import { IQueryDocumentResultDto } from "@/shared/typedefs/api";

export type TQueryDocumentFormFields = {
  query: string;
  maxResults: number;
};

export type TUseQueryDocumentFormOptions = {
  onResults?: (results: IQueryDocumentResultDto[]) => void;
};

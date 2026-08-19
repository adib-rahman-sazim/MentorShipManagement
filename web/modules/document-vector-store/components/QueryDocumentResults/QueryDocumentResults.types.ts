import { IQueryDocumentResultDto } from "@/shared/typedefs/api";

export type TQueryDocumentResultsProps = {
  results: IQueryDocumentResultDto[];
  isLoading: boolean;
  hasSearched: boolean;
};

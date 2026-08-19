import { TApiResponse } from "@/shared/typedefs";
import {
  IQueryDocumentRequestDto,
  IQueryDocumentResponseDto,
  IUploadDocumentRequestDto,
  IUploadDocumentResponseDto,
} from "@/shared/typedefs/api";

import projectApi from "../api.config";

const documentVectorStoreApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<IUploadDocumentResponseDto, IUploadDocumentRequestDto>({
      query: (dto) => ({
        url: "document-vector-store/upload",
        method: "POST",
        body: dto,
      }),
      transformResponse: (response: TApiResponse<IUploadDocumentResponseDto>) => response.data,
    }),

    queryDocument: builder.mutation<IQueryDocumentResponseDto, IQueryDocumentRequestDto>({
      query: (dto) => ({
        url: "document-vector-store/query",
        method: "POST",
        body: dto,
      }),
      transformResponse: (response: TApiResponse<IQueryDocumentResponseDto>) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useUploadDocumentMutation, useQueryDocumentMutation } = documentVectorStoreApi;

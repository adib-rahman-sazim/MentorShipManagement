import { TApiResponse } from "@/shared/typedefs";
import { IPresignedUrlFileDto, IPresignedUrlResponse } from "@/shared/typedefs/api";

import projectApi from "../api.config";

const fileUploadApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresignedUrl: builder.mutation<IPresignedUrlResponse[], IPresignedUrlFileDto>({
      query: (files) => ({
        url: `file-uploads`,
        method: "POST",
        body: files,
      }),
      transformResponse: (response: TApiResponse<IPresignedUrlResponse[]>) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetPresignedUrlMutation } = fileUploadApi;

import { useGetMyMentorshipQuery } from "@/shared/redux/rtk-apis/mentorships/mentorships.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const useMyMentorship = (skip: boolean) => {
  const { data, error, isLoading, isFetching, refetch } = useGetMyMentorshipQuery(undefined, {
    skip,
  });

  return {
    mentorship: data,
    isLoading: isLoading || (!data && isFetching),
    errorMessage: parseApiErrorMessage(error),
    refetch,
  };
};

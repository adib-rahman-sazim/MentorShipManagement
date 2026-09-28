import { useGetMyMentorshipQuery } from "@/shared/redux/rtk-apis/mentorships/mentorships.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const useMyMentorship = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMyMentorshipQuery();

  return {
    mentorship: data,
    isLoading: isLoading || (!data && isFetching),
    errorMessage: parseApiErrorMessage(error),
    refetch,
  };
};

import { useMemo } from "react";

import { layoutGraph } from "@/modules/graph/graph.helpers";
import { useGetMentorshipGraphQuery } from "@/shared/redux/rtk-apis/mentorships/mentorships.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const useMentorshipGraph = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMentorshipGraphQuery();

  const layout = useMemo(() => (data ? layoutGraph(data.nodes, data.edges) : undefined), [data]);

  return {
    graph: data,
    layout,
    isLoading: isLoading || (!data && isFetching),
    errorMessage: parseApiErrorMessage(error),
    refetch,
  };
};

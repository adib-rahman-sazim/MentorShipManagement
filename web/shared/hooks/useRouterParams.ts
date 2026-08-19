import { useMemo } from "react";

import { useRouter } from "next/router";

const useRouterParams = () => {
  const router = useRouter();

  const params = useMemo(
    () => new URLSearchParams(router.query as Record<string, string>),
    [router.query],
  );

  return params;
};

export default useRouterParams;

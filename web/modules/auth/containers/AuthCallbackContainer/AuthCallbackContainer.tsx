import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import AuthCallbackPageSkeleton from "@/shared/components/skeletons/AuthCallbackPageSkeleton";
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import { SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";
import { getSession } from "@/shared/lib/auth-client";
import { resolvePostAuthDestinationFromSession } from "@/shared/utils/postAuthDestination";
import { consumePostAuthRedirect } from "@/shared/utils/postAuthRedirect";

const AuthCallbackContainer = () => {
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!router.isReady || hasChecked) {
      return;
    }

    const handleCallback = async () => {
      setHasChecked(true);
      const token = router.query["token"] as string | undefined;

      if (token) {
        localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, token);
      }

      const sessionResult = await getSession();

      if (!sessionResult.data?.session) {
        router.replace(SIGN_IN_ROUTE);
        return;
      }

      const nextPath = await resolvePostAuthDestinationFromSession({
        storedRedirect: consumePostAuthRedirect(),
        activeOrganizationId: sessionResult.data.session.activeOrganizationId,
      });
      router.replace(nextPath);
    };

    void handleCallback();
  }, [router.isReady, router, hasChecked]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthCallbackPageSkeleton />
    </div>
  );
};

export default AuthCallbackContainer;

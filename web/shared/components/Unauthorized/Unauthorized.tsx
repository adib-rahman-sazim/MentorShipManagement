import { useRouter } from "next/router";

import { ArrowLeft, LogOut} from "lucide-react";

import { Button } from "@/shared/components/shadui/button";

import { useSignOut } from "@/shared/hooks/useSignOut";
import { useAbilityContext } from "@/shared/providers/AbilityProvider";




import {
  
  UNAUTHORIZED_DESCRIPTION,
  UNAUTHORIZED_GO_BACK_LABEL,
  UNAUTHORIZED_HEADING,
  UNAUTHORIZED_SIGN_OUT_LABEL,
  UNAUTHORIZED_STATUS_CODE,
} from "./Unauthorized.constants";
import { getDefaultAuthorizedRoute } from "./Unauthorized.helpers";

const Unauthorized = () => {
  const router = useRouter();
  const { ability } = useAbilityContext();
  const { signOut } = useSignOut();
  
  

  const handleGoBack = () => {
    router.push(getDefaultAuthorizedRoute((action, resource) => ability.can(action, resource)));
  };

  const handleSignOut = () => {
    void signOut();
  };

  

  

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_0.0625rem,transparent_0.0625rem),linear-gradient(to_bottom,var(--border)_0.0625rem,transparent_0.0625rem)] bg-size-[3rem_3rem] opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-[28rem] rounded-full bg-destructive/10 blur-3xl animate-unauthorized-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-muted/60 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col justify-between gap-12 px-6 py-10 md:px-12 md:py-16 lg:flex-row lg:items-end lg:gap-20">
        <div className="flex flex-col gap-6 lg:max-w-xl">
          <h1 className="text-5xl font-bold tracking-tight text-foreground opacity-0 animate-unauthorized-fade-up [animation-delay:150ms] md:text-6xl">
            {UNAUTHORIZED_HEADING}
          </h1>

          <div
            className="h-px w-24 bg-destructive opacity-0 animate-unauthorized-fade-up [animation-delay:250ms]"
            aria-hidden
          />

          <p className="max-w-md text-base leading-relaxed text-muted-foreground opacity-0 animate-unauthorized-fade-up [animation-delay:350ms] md:text-lg">
            {UNAUTHORIZED_DESCRIPTION}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 opacity-0 animate-unauthorized-fade-up [animation-delay:450ms]">
            <Button size="lg" onClick={handleGoBack}>
              <ArrowLeft data-icon="inline-start" />
            {UNAUTHORIZED_GO_BACK_LABEL}
              </Button>
              <Button size="lg" variant="destructive" onClick={handleSignOut}>
              {UNAUTHORIZED_SIGN_OUT_LABEL}
                <LogOut data-icon="inline-end" />
              </Button>
          </div>
        </div>

        <div
          className="select-none self-start border-t border-border pt-6 opacity-0 animate-unauthorized-fade-up [animation-delay:200ms] lg:self-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12"
          aria-hidden
        >
          <span className="block font-mono text-[clamp(6rem,18vw,12rem)] leading-none font-bold tracking-tighter text-foreground/10">
            {UNAUTHORIZED_STATUS_CODE}
          </span>
        </div>
      </div>
    </main>
  );
};

export default Unauthorized;

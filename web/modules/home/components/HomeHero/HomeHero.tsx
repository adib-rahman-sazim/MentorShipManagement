import { cn } from "@/lib/utils";
import MentorshipTreePreview from "@/modules/home/components/MentorshipTreePreview";
import AppEntryButton from "@/shared/components/AppEntryButton";
import { buttonVariants } from "@/shared/components/shadui/button";
import { PUBLIC_PAGE_CONTAINER_CLASS } from "@/shared/layouts/GeneralLayout/GeneralLayout.constants";

import {
  HERO_DESCRIPTION,
  HERO_HEADING,
  HERO_SECONDARY_HREF,
  HERO_SECONDARY_LABEL,
} from "./HomeHero.constants";

const HomeHero = () => (
  <section
    className={cn(
      PUBLIC_PAGE_CONTAINER_CLASS,
      "grid grid-cols-1 items-center gap-12 pt-10 pb-16 md:pt-16 md:pb-24 xl:grid-cols-2 xl:gap-16 2xl:gap-24",
    )}
  >
    <div className="flex flex-col items-start">
      <h1 className="max-w-[20ch] text-4xl leading-[1.1] font-semibold tracking-tight text-balance motion-safe:animate-home-rise sm:text-5xl sm:leading-[1.05] xl:text-[3.25rem] 2xl:text-6xl">
        {HERO_HEADING}
      </h1>
      <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-pretty text-muted-foreground motion-safe:animate-home-rise [animation-delay:80ms] md:text-lg 2xl:text-xl">
        {HERO_DESCRIPTION}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3 motion-safe:animate-home-rise [animation-delay:160ms]">
        <AppEntryButton size="lg" className="px-4" />
        <a
          href={HERO_SECONDARY_HREF}
          className={cn(
            buttonVariants({ size: "lg", variant: "ghost" }),
            "px-4 active:scale-[0.97]",
          )}
        >
          {HERO_SECONDARY_LABEL}
        </a>
      </div>
    </div>
    <MentorshipTreePreview />
  </section>
);

export default HomeHero;

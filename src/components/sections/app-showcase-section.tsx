import Image from "next/image";

import { Container } from "@/components/ui/container";

const showcaseScreens = [
  {
    src: "/images/app/showcase/coach-chat.png",
    alt: "Écran BeFood conversation avec le coach nutrition",
  },
  {
    src: "/images/app/showcase/social-feed.png",
    alt: "Écran BeFood fil social avec publication d'un petit-déjeuner",
  },
  {
    src: "/images/app/showcase/camera-scan.png",
    alt: "Écran BeFood de scan caméra d'un repas",
  },
  {
    src: "/images/app/showcase/analysis-result.png",
    alt: "Écran BeFood résultat d'analyse automatique d'un repas",
  },
  {
    src: "/images/app/showcase/progress-dashboard.png",
    alt: "Écran BeFood progression nutritionnelle",
  },
];

const screenTuning = {
  mobile: {
    gapPx: 6,
    scale: 1.12,
  },
  desktop: {
    widthPx: 192,
    gapPx: 24,
  },
};

export function AppShowcaseSection() {
  const mobileWidth = `calc((100% - ${(showcaseScreens.length - 1) * screenTuning.mobile.gapPx}px) / ${showcaseScreens.length})`;

  return (
    <section className="bg-[var(--color-background)] pb-12 pt-10 sm:pb-16 sm:pt-14">
      <Container>
        <div className="pb-3 lg:hidden">
          <div className="mx-auto w-full max-w-[430px] overflow-visible px-2">
            <div
              className="flex items-end justify-center"
              style={{ gap: `${screenTuning.mobile.gapPx}px` }}
            >
              {showcaseScreens.map((screen) => {
                return (
                <figure
                  key={`${screen.src}-mobile`}
                  className="relative shrink-0 overflow-visible"
                  style={{
                    width: mobileWidth,
                    transform: `scale(${screenTuning.mobile.scale})`,
                    transformOrigin: "bottom center",
                  }}
                >
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={1419}
                    height={2796}
                    className="relative h-auto w-full object-contain"
                    priority
                  />
                </figure>
                );
              })}
            </div>
          </div>
        </div>

        <div className="hidden pb-3 lg:block">
          <div className="mx-auto w-full max-w-[1120px] overflow-visible px-6">
            <div
              className="flex items-end justify-center"
              style={{ gap: `${screenTuning.desktop.gapPx}px` }}
            >
              {showcaseScreens.map((screen) => {
                return (
                <figure
                  key={screen.src}
                  className="relative shrink-0 overflow-visible"
                  style={{
                    width: `${screenTuning.desktop.widthPx}px`,
                  }}
                >
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={1419}
                    height={2796}
                    className="relative h-auto w-full object-contain"
                    priority
                  />
                </figure>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

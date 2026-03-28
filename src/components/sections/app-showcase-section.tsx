import Image from "next/image";
import type { CSSProperties } from "react";

import { Container } from "@/components/ui/container";

const appScreens = [
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
    src: "/images/app/showcase/progress-mascot-original-v3.png",
    alt: "Écran BeFood des progrès avec mascotte intégrée",
  },
];

// Reglages manuels du 5e visuel (telephone + mascotte)
// Ajuste simplement ces valeurs pour deplacer/agrandir rapidement.
const fifthScreenTuning = {
  widthPx: 640,
  offsetXPx: 18,
  offsetYPx: 0,
  scale: 1.08,
};

export function AppShowcaseSection() {
  return (
    <section className="bg-[var(--color-background)] pb-12 sm:pb-16">
      <Container>
        <div className="overflow-x-auto overflow-y-visible pb-3 lg:overflow-visible">
          <div className="flex min-w-max items-end gap-4">
            {appScreens.map((screen, index) => {
              const isFifth = index === 4;
              const fifthFigureStyle: CSSProperties | undefined = isFifth
                ? { width: `${fifthScreenTuning.widthPx}px` }
                : undefined;
              const fifthImageStyle: CSSProperties | undefined = isFifth
                ? {
                    transform: `translate(${fifthScreenTuning.offsetXPx}px, ${fifthScreenTuning.offsetYPx}px) scale(${fifthScreenTuning.scale})`,
                    transformOrigin: "bottom right",
                  }
                : undefined;

              return (
              <figure
                key={screen.src}
                style={fifthFigureStyle}
                className={[
                  "relative shrink-0 overflow-visible",
                  index === 2 ? "lg:-mt-6" : "",
                  isFifth ? "ml-2" : "w-[168px] sm:w-[176px] lg:w-[184px]",
                ].join(" ")}
              >
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={index === 4 ? 2752 : 1419}
                  height={index === 4 ? 1536 : 2796}
                  style={fifthImageStyle}
                  className={[
                    "relative z-10 h-auto w-full object-contain",
                    isFifth ? "max-w-none" : "",
                  ].join(" ")}
                  priority={index < 2}
                />
              </figure>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

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
    mobileSrc: "/images/app/showcase/progress-mascot-final.png",
    alt: "Écran BeFood des progrès avec mascotte intégrée",
  },
];

// Reglages manuels du 5e visuel (telephone + mascotte)
// Ajuste simplement ces valeurs pour deplacer/agrandir rapidement.
const fifthScreenTuning = {
  widthPx: 730,
  offsetXPx: -222,
  offsetYPx: 15,
  scale: 1.28
};

const regularScreenScale = 1.33;
// Decalage horizontal des 4 premiers telephones uniquement.
// Valeur negative = deplacer vers la gauche.
const firstFourScreensOffsetXPx: number = -70;

// Reglage manuel de la rangee complete (les 5 ecrans d'un coup)
// Augmente cette valeur pour deplacer a droite, diminue pour deplacer a gauche.
const screensRowOffsetXPx = 58;
const screensRowOffsetYPx = 46;

export function AppShowcaseSection() {
  return (
    <section className="bg-[var(--color-background)] pb-12 pt-10 sm:pb-16 sm:pt-14">
      <Container>
        <div className="overflow-x-auto overflow-y-visible pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          <div className="flex min-w-max snap-x snap-mandatory items-end gap-4 px-4">
            {appScreens.map((screen, index) => {
              const mobileSrc = index === 4 ? (screen.mobileSrc ?? screen.src) : screen.src;

              return (
                <figure key={`${screen.src}-mobile`} className="relative w-[72vw] max-w-[280px] shrink-0 snap-center overflow-visible">
                  <Image
                    src={mobileSrc}
                    alt={screen.alt}
                    width={1419}
                    height={2796}
                    className="relative z-10 h-auto w-full object-contain"
                    priority
                  />
                </figure>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible pb-3 max-lg:hidden lg:overflow-visible">
          <div
            style={{ transform: `translate(${screensRowOffsetXPx}px, ${screensRowOffsetYPx}px)` }}
            className="flex min-w-max items-end gap-11 sm:gap-12"
          >
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
              const regularImageStyle: CSSProperties | undefined = !isFifth
                ? {
                    transform: `scale(${regularScreenScale})`,
                    transformOrigin: "bottom center",
                  }
                : undefined;
              const regularFigureStyle: CSSProperties | undefined = !isFifth && firstFourScreensOffsetXPx !== 0
                ? {
                    transform: `translateX(${firstFourScreensOffsetXPx}px)`,
                  }
                : undefined;

              return (
                <figure
                  key={screen.src}
                  style={isFifth ? fifthFigureStyle : regularFigureStyle}
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
                    style={isFifth ? fifthImageStyle : regularImageStyle}
                    className={[
                      "relative z-10 h-auto w-full object-contain",
                      isFifth ? "max-w-none" : "",
                    ].join(" ")}
                    priority
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

import Image from "next/image";

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
    src: "/images/app/showcase/analysis-result.png",
    alt: "Écran BeFood résultat d'analyse automatique d'un repas",
  },
  {
    src: "/images/app/showcase/camera-scan.png",
    alt: "Écran BeFood de scan caméra d'un repas",
  },
  {
    src: "/images/app/showcase/progress-dashboard.png",
    alt: "Écran BeFood des progrès avec mascotte intégrée",
    mascotSrc: "/images/app/showcase/progress-mascot-side.png",
    mascotAlt: "Mascotte BeFood autour de l'écran des progrès",
  },
];

export function AppShowcaseSection() {
  return (
    <section className="bg-[var(--color-background)] pb-12 sm:pb-16">
      <Container>
        <div className="overflow-x-auto pb-3">
          <div className="grid min-w-[980px] grid-cols-5 items-end gap-4 lg:min-w-0">
            {appScreens.map((screen, index) => (
              <figure key={screen.src} className={`relative ${index === 2 ? "lg:-mt-6" : ""}`}>
                {screen.mascotSrc ? (
                  <Image
                    src={screen.mascotSrc}
                    alt={screen.mascotAlt ?? ""}
                    width={540}
                    height={1380}
                    className="pointer-events-none absolute bottom-[2%] right-[1%] z-0 h-auto w-[42%]"
                  />
                ) : null}
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={1419}
                  height={2796}
                  className="relative z-10 h-auto w-full object-contain"
                  priority={index < 2}
                />
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

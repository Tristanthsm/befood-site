import Image from "next/image";
import type { CSSProperties } from "react";

import { Container } from "@/components/ui/container";

const howItWorksGallery = [
  {
    src: "/images/how-it-works/meal-salmon.jpg",
    alt: "Assiette equilibree avec saumon, riz et legumes",
  },
  {
    src: "/images/how-it-works/chef-woman-tomatoes.jpg",
    alt: "Coach nutrition en cuisine avec des tomates fraiches",
  },
  {
    src: "/images/how-it-works/meal-avocado-toast-berries.jpg",
    alt: "Petit-dejeuner sante avec toast avocat, oeufs et fruits",
  },
  {
    src: "/images/how-it-works/chef-man-ginger.jpg",
    alt: "Coach nutrition en cuisine tenant du gingembre",
  },
  {
    src: "/images/how-it-works/meal-fish-salad-potatoes.jpg",
    alt: "Repas maison avec poisson, pommes de terre et salade",
  },
  {
    src: "/images/how-it-works/meal-rice-veggies-bowl.jpg",
    alt: "Bol nutritif avec riz, legumes et proteines",
  },
  {
    src: "/images/how-it-works/meal-toast-eggs-fruits.jpg",
    alt: "Assiette petit-dejeuner avec oeufs, toast et fruits",
  },
  {
    src: "/images/how-it-works/meal-beef-sweetpotato-bowl.jpg",
    alt: "Bol complet avec avocat, proteines et patate douce",
  },
];

const howItWorksHighlights = [
  {
    title: "Comprenez ce que vos repas disent vraiment",
    description:
      "Prenez un repas en photo et obtenez des repères utiles, sans journal complexe.",
  },
  {
    title: "Retrouvez les coachs, pros et créateurs que vous appréciez",
    description:
      "Suivez des profils que vous aimez déjà et avancez avec un accompagnement plus incarné, plus proche de vos objectifs.",
  },
  {
    title: "Progressez avec une vraie dynamique de communauté",
    description:
      "Restez motivé dans la durée grâce aux échanges, au partage de repas et à une communauté qui aide à garder le cap.",
  },
];

const scrollMaskStyle: CSSProperties = {
  maskImage: "linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%)",
};

export function HowItWorksSection() {
  const duplicatedGallery = [...howItWorksGallery, ...howItWorksGallery];

  return (
    <section id="comment-ca-marche" className="py-16 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(140deg,#081122,#112744)] p-7 text-white sm:p-10">
          <header className="max-w-5xl">
            <h2 className="text-balance text-4xl font-black leading-[0.98] sm:text-5xl lg:text-6xl">
              Comprenez votre alimentation. Construisez des habitudes qui durent.
            </h2>
          </header>

          <div className="mt-10 space-y-6">
            <div className="rounded-3xl border border-white/14 bg-white/[0.045] p-4 sm:p-5">
              <div style={scrollMaskStyle} className="overflow-hidden">
                <ul className="how-it-works-marquee flex w-max gap-4 sm:gap-5">
                  {duplicatedGallery.map((image, index) => (
                    <li
                      key={`${image.src}-${index}`}
                      className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-[#14253a] shadow-[0_16px_30px_-22px_rgba(0,0,0,0.8)] sm:h-48 sm:w-48 lg:h-56 lg:w-56"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 224px"
                        className="object-cover transition duration-300 ease-out group-hover:scale-[1.04] group-hover:brightness-110"
                        loading={index < 2 ? "eager" : "lazy"}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ol className="grid gap-3 text-sm text-white/82 sm:grid-cols-3">
              {howItWorksHighlights.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-white/14 bg-white/8 px-4 py-3">
                  <p className="font-semibold text-white">{index + 1}. {step.title}</p>
                  <p className="mt-1 leading-6 text-white/75">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}

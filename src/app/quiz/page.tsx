import { QuizSection } from "@/components/sections/quiz-section";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Diagnostic nutrition rapide",
  description:
    "Commencez le diagnostic BeFood en quelques questions pour identifier votre frein principal et obtenir un plan de départ concret.",
  path: "/quiz",
  keywords: ["diagnostic nutrition", "quiz alimentaire", "habitudes alimentaires", "accompagnement nutrition"],
});

export default function QuizPage() {
  return <QuizSection />;
}

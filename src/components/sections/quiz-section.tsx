"use client";

import { useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StoreButtons } from "@/components/ui/store-buttons";
import { content } from "@/content";
import type { QuizProfile } from "@/lib/types";

const profilePriority: QuizProfile[] = ["cadre", "relance", "emotion", "temps"];

export function QuizSection() {
  const { badge, title, description, questions, results, disclaimer } = content.quizContent;
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const currentQuestionIndex = answers.findIndex((answer) => answer < 0);
  const answeredCount = answers.filter((value) => value >= 0).length;
  const isComplete = currentQuestionIndex === -1;

  const activeProfile = useMemo<QuizProfile | null>(() => {
    if (!isComplete) {
      return null;
    }

    const scores: Record<QuizProfile, number> = {
      relance: 0,
      cadre: 0,
      emotion: 0,
      temps: 0,
    };

    questions.forEach((question, questionIndex) => {
      const selectedOption = question.options[answers[questionIndex]];
      if (selectedOption) {
        scores[selectedOption.profile] += 1;
      }
    });

    return profilePriority.reduce((bestProfile, currentProfile) => {
      if (scores[currentProfile] > scores[bestProfile]) {
        return currentProfile;
      }
      return bestProfile;
    }, profilePriority[0]);
  }, [answers, isComplete, questions]);

  const activeResult = results.find((result) => result.profile === activeProfile) ?? null;

  function handleSelect(questionIndex: number, optionIndex: number) {
    setAnswers((previous) => {
      const next = [...previous];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function handleReset() {
    setStarted(false);
    setAnswers(questions.map(() => -1));
  }

  return (
    <section id="quiz" className="py-12 sm:py-16">
      <Container>
        <div className="section-shell p-6 sm:p-8">
          <header className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">{badge}</p>
            <h1 className="text-3xl font-extrabold leading-tight text-[var(--color-ink)] sm:text-4xl">{title}</h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">{description}</p>
          </header>

          {!started ? (
            <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                Un départ simple, puis un diagnostic rapide et personnalisé.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink)]">
                <li>6 questions courtes</li>
                <li>moins de 2 minutes</li>
                <li>plan de départ concret à la fin</li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-medium text-white shadow-[var(--shadow-soft)] hover:bg-[var(--color-accent-strong)]"
                >
                  Démarrer gratuitement
                </button>
                <ButtonLink href="/" variant="ghost" size="md">
                  Retour à l&apos;accueil
                </ButtonLink>
              </div>
            </div>
          ) : null}

          {started && !isComplete ? (
            <>
              <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </p>

              <fieldset className="mt-6 rounded-3xl border border-[var(--color-border)] bg-white p-5 sm:p-6">
                <legend className="px-1 text-base font-semibold text-[var(--color-ink)]">
                  {questions[currentQuestionIndex].title}
                </legend>
                <div className="mt-4 grid gap-2">
                  {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleSelect(currentQuestionIndex, optionIndex)}
                      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-left text-sm text-[var(--color-ink)] hover:border-[var(--color-border-strong)]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-medium text-[var(--color-muted)] underline-offset-4 hover:underline"
                >
                  Réinitialiser
                </button>
              </div>
            </>
          ) : null}

          {started && isComplete ? (
            <div className="mt-8 rounded-3xl border border-[color:rgb(11_34_52_/18%)] bg-[linear-gradient(145deg,#0d1c31,#173554)] p-6 text-white sm:p-8">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-soft)]">Votre profil prioritaire</p>
                <h3 className="text-2xl font-bold leading-tight">{activeResult?.title}</h3>
                <p className="text-sm leading-7 text-white/85 sm:text-base">{activeResult?.description}</p>
                <p className="rounded-2xl border border-white/20 bg-white/8 px-4 py-3 text-sm text-white/90">{activeResult?.nextStep}</p>
                <StoreButtons className="[&_[data-store-placeholder]]:!border-white/30 [&_[data-store-placeholder]]:!bg-white/10 [&_[data-store-placeholder]]:!text-white/80" />
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {started ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              >
                Recommencer le diagnostic
              </button>
            ) : null}
            <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

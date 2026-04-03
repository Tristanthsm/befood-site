"use client";

import { useMemo, useRef, useState } from "react";

interface ContractSignatureFormProps {
  canSign: boolean;
  signed: boolean;
  errorCode: string | null;
  contractVersion: string;
  contractContentHash: string;
}

function resolveErrorMessage(code: string | null): string | null {
  if (!code) {
    return null;
  }
  if (code === "consent_required") {
    return "Vous devez confirmer votre consentement avant de signer.";
  }
  if (code === "signature_required" || code === "invalid_signature_type" || code === "invalid_drawn_signature") {
    return "Signature invalide. Vérifiez votre saisie puis réessayez.";
  }
  if (code === "invalid_transition") {
    return "Le contrat n'est pas encore prêt à être signé.";
  }
  if (code === "contract_not_prepared") {
    return "Le contrat n'est pas finalisé côté BeFood. Merci de revenir plus tard.";
  }
  if (code === "unresolved_placeholders") {
    return "Le contrat contient des placeholders non résolus. Signature indisponible.";
  }
  if (code === "contract_hash_mismatch") {
    return "Le contrat est momentanément indisponible (contrôle d'intégrité).";
  }
  if (code === "update_failed") {
    return "La signature n'a pas pu être enregistrée. Réessayez.";
  }
  if (code === "not_found") {
    return "Aucun contrat actif trouvé pour ce compte.";
  }
  return "Une erreur est survenue. Réessayez.";
}

export function ContractSignatureForm({
  canSign,
  signed,
  errorCode,
  contractVersion,
  contractContentHash,
}: ContractSignatureFormProps) {
  const [signatureType, setSignatureType] = useState<"typed" | "drawn">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const [consent, setConsent] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const isReadyToSubmit = useMemo(() => {
    if (!canSign || !consent) {
      return false;
    }
    if (signatureType === "typed") {
      return typedSignature.trim().length >= 3;
    }
    return drawnSignature.startsWith("data:image/");
  }, [canSign, consent, signatureType, typedSignature, drawnSignature]);

  const errorMessage = resolveErrorMessage(errorCode);

  function getCanvasContext() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0f172a";

    return { canvas, context };
  }

  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const data = getCanvasContext();
    if (!data) {
      return;
    }
    const { canvas, context } = data;
    const point = pointerPosition(event, canvas);

    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }
    const data = getCanvasContext();
    if (!data) {
      return;
    }
    const { canvas, context } = data;
    const point = pointerPosition(event, canvas);

    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function endDrawing() {
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    setDrawnSignature(canvas.toDataURL("image/png"));
  }

  function clearDrawing() {
    const data = getCanvasContext();
    if (!data) {
      return;
    }
    data.context.clearRect(0, 0, data.canvas.width, data.canvas.height);
    setDrawnSignature("");
  }

  return (
    <div className="space-y-4">
      {signed ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Signature enregistrée. Votre contrat est en attente de vérification BeFood.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-xs text-[var(--color-muted)]">
        Version: <span className="font-semibold text-[var(--color-ink)]">{contractVersion}</span>
        <br />
        Hash contenu (SHA-256): <span className="font-mono text-[11px] text-[var(--color-ink)]">{contractContentHash}</span>
      </div>

      {canSign ? (
        <form method="post" action="/api/coach-contract/sign" className="space-y-4">
          <input type="hidden" name="redirectTo" value="/espace-coach/contrat" />
          <input type="hidden" name="signature_type" value={signatureType} />
          <input type="hidden" name="signature_drawn" value={drawnSignature} />

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Type de signature</legend>
            <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
              <input
                type="radio"
                name="signatureTypeChoice"
                checked={signatureType === "typed"}
                onChange={() => setSignatureType("typed")}
              />
              Signature tapée
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
              <input
                type="radio"
                name="signatureTypeChoice"
                checked={signatureType === "drawn"}
                onChange={() => setSignatureType("drawn")}
              />
              Signature dessinée
            </label>
          </fieldset>

          {signatureType === "typed" ? (
            <label className="block space-y-2 text-sm font-medium text-[var(--color-ink)]">
              Nom de signature
              <input
                type="text"
                name="signature_typed"
                value={typedSignature}
                onChange={(event) => setTypedSignature(event.target.value)}
                maxLength={180}
                placeholder="Prénom Nom"
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
            </label>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--color-ink)]">Dessinez votre signature</p>
              <canvas
                ref={canvasRef}
                width={560}
                height={160}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrawing}
                onPointerLeave={endDrawing}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white touch-none"
              />
              <button
                type="button"
                onClick={clearDrawing}
                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              >
                Effacer la signature
              </button>
            </div>
          )}

          <label className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-ink)]">
            <input
              type="checkbox"
              name="contract_consent"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5"
            />
            Je confirme avoir lu et accepté le contrat, et je signe électroniquement ce document.
          </label>

          <button
            type="submit"
            disabled={!isReadyToSubmit}
            className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Signer le contrat
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-muted)]">
          Le contrat n&apos;est pas encore disponible à la signature. BeFood vous notifiera dès l&apos;envoi.
        </div>
      )}
    </div>
  );
}

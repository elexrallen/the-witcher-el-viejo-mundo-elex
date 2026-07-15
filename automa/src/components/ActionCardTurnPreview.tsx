import { useEffect, useRef } from "react";
import { ActionCard } from "../types";
import { assetUrl } from "../utils/assets";
import { formatDestination, formatMovementGuide } from "../utils/actionCard";
import CardImagePreview from "./CardImagePreview";
import WitcherCard from "./WitcherCard";
import { WitcherIcon } from "./WitcherIcon";

type ActionCardTurnPreviewProps = {
  card: ActionCard;
};

export default function ActionCardTurnPreview({ card }: ActionCardTurnPreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    return () => {
      dialogRef.current?.close();
    };
  }, []);
  const label = `Carta de acción ${card.cardNumber ?? card.id}`;

  const openReference = () => {
    dialogRef.current?.showModal();
  };

  const closeReference = () => {
    dialogRef.current?.close();
  };

  return (
    <section className="action-card-turn-preview w-full max-w-md mx-auto space-y-3" aria-label={label}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
          Carta de acción activa
        </h3>
        <button
          type="button"
          className="btn btn--secondary text-xs min-h-[var(--touch-min)] px-3 py-2 inline-flex items-center gap-1.5"
          onClick={openReference}
        >
          <WitcherIcon name="search" size={14} />
          Ver carta completa
        </button>
      </div>

      {card.imagePath ? (
        <CardImagePreview
          src={assetUrl(card.imagePath)}
          alt={label}
          className="w-full rounded-xl border border-zinc-800 object-contain max-h-56 sm:max-h-80 bg-zinc-950/50"
          buttonClassName=""
        />
      ) : (
        <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-4 text-sm text-zinc-400 text-center">
          Sin imagen escaneada para esta carta.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-2">
          <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block">Destino</span>
          <span className="text-zinc-200 font-display font-bold">{formatDestination(card)}</span>
        </div>
        <div className="bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-2">
          <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block">Movimiento</span>
          <span className="text-zinc-200 font-mono font-bold">{formatMovementGuide(card.movement)}</span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500 text-center">
        Toca la imagen o <strong className="text-zinc-400">Ver carta completa</strong> para consultar la carta escaneada y todos los detalles.
      </p>

      <dialog
        ref={dialogRef}
        className="automa-card-lightbox automa-school-card-lightbox automa-action-card-lightbox"
        aria-label={label}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeReference();
          }
        }}
      >
        <div className="automa-card-lightbox__panel">
          <header className="automa-card-lightbox__header">
            <p className="automa-card-lightbox__title">{label}</p>
            <button
              type="button"
              className="automa-card-lightbox__close"
              onClick={closeReference}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </header>
          <div className="automa-school-card-lightbox__body">
            {card.imagePath && (
              <div className="automa-school-card-lightbox__scan">
                <img
                  src={assetUrl(card.imagePath)}
                  alt={`Carta escaneada — ${label}`}
                  className="automa-card-lightbox__img"
                  draggable={false}
                />
              </div>
            )}
            <div className="automa-school-card-lightbox__reference">
              <WitcherCard card={card} type="action" hideImage />
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}

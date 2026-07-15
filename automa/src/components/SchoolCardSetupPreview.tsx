import { useEffect, useRef } from "react";
import { WitcherSchool } from "../types";
import { assetUrl } from "../utils/assets";
import CardImagePreview from "./CardImagePreview";
import SpecialSchoolCardComponent from "./SpecialSchoolCardComponent";
import { WitcherIcon } from "./WitcherIcon";

type SchoolCardSetupPreviewProps = {
  school: WitcherSchool;
};

export default function SchoolCardSetupPreview({ school }: SchoolCardSetupPreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    return () => {
      dialogRef.current?.close();
    };
  }, []);
  const imagePath = school.specialCardImagePath ?? school.specialCard?.imagePath;

  const openReference = () => {
    dialogRef.current?.showModal();
  };

  const closeReference = () => {
    dialogRef.current?.close();
  };

  return (
    <section className="school-setup-preview space-y-3" aria-label="Carta de habilidad de la escuela">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-mono font-bold">
          Carta de habilidad especial
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

      {imagePath ? (
        <CardImagePreview
          src={assetUrl(imagePath)}
          alt={`Carta de habilidades — ${school.name}`}
          className="w-full rounded-xl border border-zinc-800 object-contain max-h-56 sm:max-h-72 bg-zinc-950/40"
          buttonClassName=""
        />
      ) : (
        <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-4 text-sm text-zinc-400 text-center">
          Sin imagen de carta para esta escuela.
        </div>
      )}

      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Toca la imagen o pulsa <strong className="text-zinc-400">Ver carta completa</strong> para consultar
        la carta escaneada y la referencia de habilidades antes de empezar.
      </p>

      <dialog
        ref={dialogRef}
        className="automa-card-lightbox automa-school-card-lightbox"
        aria-label={`Referencia de habilidades — ${school.name}`}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeReference();
          }
        }}
      >
        <div className="automa-card-lightbox__panel">
          <header className="automa-card-lightbox__header">
            <p className="automa-card-lightbox__title">Carta de habilidad — {school.name}</p>
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
            {imagePath && (
              <div className="automa-school-card-lightbox__scan">
                <img
                  src={assetUrl(imagePath)}
                  alt={`Carta escaneada — ${school.name}`}
                  className="automa-card-lightbox__img"
                  draggable={false}
                />
              </div>
            )}
            <div className="automa-school-card-lightbox__reference">
              <SpecialSchoolCardComponent school={school} hideImage />
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { WitcherIcon } from "./WitcherIcon";

type CardImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
  buttonClassName?: string;
};

export default function CardImagePreview({
  src,
  alt,
  className = "w-full rounded-lg border border-zinc-800 object-contain max-h-40",
  buttonClassName = "mb-3",
}: CardImagePreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    return () => {
      dialogRef.current?.close();
    };
  }, []);

  const openLightbox = () => {
    dialogRef.current?.showModal();
  };

  const closeLightbox = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <button
        type="button"
        className={`automa-card-image-preview ${buttonClassName}`}
        onClick={openLightbox}
        aria-label={`Ampliar carta: ${alt}`}
      >
        <img src={src} alt={alt} className={className} draggable={false} />
        <span className="automa-card-image-preview__badge">
          <WitcherIcon name="search" size={14} />
          Ampliar
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="automa-card-lightbox"
        aria-label={alt}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeLightbox();
          }
        }}
      >
        <div className="automa-card-lightbox__panel">
          <header className="automa-card-lightbox__header">
            <p className="automa-card-lightbox__title">{alt}</p>
            <button
              type="button"
              className="automa-card-lightbox__close"
              onClick={closeLightbox}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </header>
          <div className="automa-card-lightbox__viewport">
            <img src={src} alt={alt} className="automa-card-lightbox__img" draggable={false} />
          </div>
        </div>
      </dialog>
    </>
  );
}

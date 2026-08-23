"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect } from "react";

type BeachPhotoViewerProps = {
  beachName: string;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
};

export function BeachPhotoViewer({ beachName, imageSrc, imageAlt, onClose }: BeachPhotoViewerProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto di ${beachName}`}
      className="detail-reel-dialog fixed inset-0 z-[100] grid place-items-center bg-[#061a20] p-4 text-white sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent px-4 pb-12 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi foto"
          className="detail-press pointer-events-auto grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md"
        >
          <X aria-hidden="true" size={20} />
        </button>
        <strong className="text-sm">{beachName}</strong>
        <span aria-hidden="true" className="size-11" />
      </div>

      <div className="relative h-[min(88dvh,52rem)] w-full max-w-[92rem]">
        <Image src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-contain" loading="eager" />
      </div>
    </div>
  );
}

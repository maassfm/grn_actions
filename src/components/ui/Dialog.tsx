"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Dialog({ open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/50 bg-white rounded-xl shadow-xl p-0 max-w-lg w-full mx-4"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-bold text-xl uppercase text-tanne">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Schließen"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

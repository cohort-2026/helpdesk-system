import React, { useEffect, useRef } from 'react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, footer, className = '' }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (isOpen) {
      if (!dialogNode.open) {
        dialogNode.showModal();
      }
    } else {
      if (dialogNode.open) {
        dialogNode.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialogNode.addEventListener('cancel', handleCancel);
    return () => dialogNode.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={`backdrop:bg-black/50 p-0 rounded-xl shadow-2xl border-0 m-auto fixed inset-0 w-full max-w-lg bg-background overflow-hidden transition-opacity ${!isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className={`flex flex-col max-h-[85vh] relative ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-secondary/20 pr-12 bg-background">
            <h3 className="text-xl font-semibold text-body-text">{title}</h3>
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto bg-background">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-secondary/20 bg-accent/10 flex justify-end gap-3">
            {footer}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-body-text/50 hover:text-body-text hover:bg-accent/20 focus:outline-none rounded-full p-1.5 focus:ring-2 focus:ring-secondary transition-all"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
};

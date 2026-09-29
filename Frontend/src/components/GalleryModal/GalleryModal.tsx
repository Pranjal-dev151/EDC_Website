import { useEffect, useRef } from 'react';
import type { GalleryItem } from '../../types';
import styles from './GalleryModal.module.css';

export default function GalleryModal({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    else if (!item && dialog.open) dialog.close();
  }, [item]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-label={item?.title ?? 'Gallery dialog'} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {item && (
        <div className={styles.content}>
          <img src={item.image.src} srcSet={item.image.srcSet} sizes="90vw" alt={item.image.alt} width={item.image.width} height={item.image.height} />
          <div className={styles.meta}>
            <p className="eyebrow">{item.category} · {item.capturedAt} · {item.location}</p>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <button type="button" className={styles.close} onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </dialog>
  );
}

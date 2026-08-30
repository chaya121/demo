import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Full-screen click-to-zoom viewer for a single product image thumbnail.
// Renders nothing when src is falsy.
export default function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [src, onClose]);

  if (!src) return null;

  return createPortal(
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="ปิด">✕</button>
      <img className="lightbox-img" src={src} alt="ดูรูปขนาดใหญ่" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
}

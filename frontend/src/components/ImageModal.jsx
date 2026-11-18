import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        title="Close Preview"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
        {/* Full Image */}
        <img
          src={imageUrl}
          alt={title || "Property capture"}
          className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
        />

        {/* Caption */}
        {title && (
          <div className="mt-4 px-4 py-2 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-md flex items-center gap-3">
            <span>{title}</span>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1"
            >
              Open Original
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

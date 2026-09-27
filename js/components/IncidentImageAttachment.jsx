import React, { useState, useRef } from 'react';
import { Icon } from './Icons.jsx';

/**
 * Resizes and compresses an image file in browser canvas to keep payload fast and light.
 */
export function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', quality),
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024)
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Image Upload Dropzone Component with live preview and removal.
 */
export function ImageUploadZone({
  imageData,
  onImageSelected,
  onImageRemoved,
  label = "Attach Photo / Evidence",
  hint = "Upload a photo of the garment, stain spot, care label, or packaging."
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setErrorMsg('');
    setProcessing(true);
    try {
      const result = await compressImageFile(file);
      onImageSelected(result.dataUrl, result.fileName);
    } catch (err) {
      setErrorMsg(err.message || 'Error processing image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Icon name="camera" className="w-3.5 h-3.5 text-sky-600" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">(Optional, recommended)</span>
        </label>
        {imageData && (
          <button
            type="button"
            onClick={onImageRemoved}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5"
          >
            <Icon name="trash" className="w-3 h-3" />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {imageData ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-sky-300 bg-slate-900 shadow-sm flex items-center justify-center max-h-64">
          <img
            src={imageData}
            alt="Incident photo preview"
            className="w-full max-h-64 object-contain bg-slate-950/60"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 hover:bg-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <Icon name="refresh" className="w-3.5 h-3.5 text-sky-600" />
              <span>Change Photo</span>
            </button>
            <button
              type="button"
              onClick={onImageRemoved}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <Icon name="trash" className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-medium flex items-center gap-1">
            <Icon name="check" className="w-2.5 h-2.5 text-emerald-400" />
            <span>Photo Attached</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-sky-500 bg-sky-50/80 shadow-md ring-4 ring-sky-100'
              : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50/30 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {processing ? (
            <div className="flex flex-col items-center justify-center py-2 text-sky-700">
              <span className="w-5 h-5 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-2" />
              <span className="text-xs font-bold">Optimizing photo quality...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-sky-600 mb-2">
                <Icon name="camera" className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                <span>Click to Upload or Drag Photo Here</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                {hint}
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">JPG, PNG, WEBP</span>
                <span>• Auto-resized for fast upload</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * High-Resolution Lightbox Modal to inspect incident photo evidence.
 */
export function IncidentImageLightbox({
  isOpen,
  onClose,
  imageUrl,
  title = "Incident Photo Attachment",
  caption = ""
}) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Icon name="image" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{title}</h3>
              {caption && <p className="text-xs text-slate-400 mt-0.5">{caption}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              download="incident-photo.jpg"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
              title="Open full image in new tab or download"
            >
              <Icon name="externalLink" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Full Size</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center gap-1"
              title="Close (Esc)"
            >
              <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-700 text-slate-300">ESC</span>
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 bg-black flex items-center justify-center p-2 sm:p-4 overflow-auto min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg select-none"
          />
        </div>

        {/* Footer info */}
        <div className="p-3 px-6 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Customer photo evidence stored in Bangkok Operations Archive</span>
          <span>Click anywhere outside or press ESC to close</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Copy, Check, FileText, Sparkles, Tag, TrendingUp } from 'lucide-react';

export default function ActionListingModal({ result, onClose }) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  if (!result) return null;

  const title = result.listingTitle || `${result.name} (${result.condition}) - Impecable`;
  
  const description = result.listingDescription || `En venta ${result.name} en estado ${result.condition.toLowerCase()}.
  
- Probado y 100% operativo.
- Incluye ${result.accessories ? result.accessories.join(', ') : 'cableado original'}.
- Se entrega limpio y bien empaquetado.
- Trato en mano o envío súper rápido bien protegido.`;

  const tags = result.tags || [result.name.toLowerCase().replace(/\s+/g, ''), "segundamano", "wallapop"];

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyDesc = () => {
    const fullContent = `${title}\n\n${description}\n\n${tags.map(t => `#${t}`).join(' ')}`;
    navigator.clipboard.writeText(fullContent);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-500/30 relative max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">✍️ Generador de Anuncio para Revender</h3>
              <p className="text-xs text-slate-600">Optimizando conversión para Wallapop y Vinted</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Strategy Banner */}
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-600 uppercase block">Precio de salida recomendado</span>
            <span className="text-base font-bold text-emerald-700">{result.probableResellMax || result.marketRangeMax} €</span>
          </div>
          <div>
            <span className="text-slate-600 uppercase block">Precio mínimo aceptable</span>
            <span className="text-base font-bold text-slate-900">{result.probableResellMin || result.marketRangeMin} €</span>
          </div>
        </div>

        {/* Title Generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase">
              Título Optimizado para SEO:
            </label>
            <button
              onClick={handleCopyTitle}
              className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
            >
              {copiedTitle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTitle ? 'Copiado' : 'Copiar título'}</span>
            </button>
          </div>
          <input
            type="text"
            readOnly
            value={title}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-bold text-slate-900 focus:outline-none"
          />
        </div>

        {/* Description Generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase">
              Descripción detallada de venta:
            </label>
            <button
              onClick={handleCopyDesc}
              className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              {copiedDesc ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDesc ? 'Todo copiado!' : 'Copiar anuncio completo'}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={7}
            value={description}
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs font-sans text-slate-800 focus:outline-none leading-relaxed resize-none"
          />
        </div>

        {/* SEO Tags */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-700 uppercase block">
            Etiquetas / Hashtags recomendados:
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t, idx) => (
              <span key={idx} className="rounded-lg bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs text-slate-700 font-mono">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-6 py-2 text-xs font-bold text-slate-900"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

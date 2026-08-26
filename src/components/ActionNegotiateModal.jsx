import React, { useState } from 'react';
import { X, Copy, Check, MessageSquareText, Sparkles, DollarSign } from 'lucide-react';

export default function ActionNegotiateModal({ result, onClose }) {
  if (!result) return null;

  const defaultOffer = result.maxRecommendedBuy || Math.round(result.inputPrice * 0.88);
  const [offerPrice, setOfferPrice] = useState(defaultOffer);
  const [style, setStyle] = useState('direct'); // direct | polite | cash
  const [copied, setCopied] = useState(false);

  // Generate tactical negotiation text based on style & offer price
  const getNegotiationText = () => {
    const diff = result.inputPrice - offerPrice;
    
    if (style === 'cash') {
      return `¡Buenas! Me interesa ${result.name}. Te ofrezco ${offerPrice} € en mano y me desplazo hoy mismo a buscarlo donde me digas para cerrarlo ya. ¿Te encaja?`;
    }
    
    if (style === 'polite') {
      return `Hola! Estaba viendo tu anuncio de ${result.name}. Está muy bien cuidado, pero considerando el mercado actual mi presupuesto máximo es de ${offerPrice} €. Si te parece bien te confirmo la compra ahora. Un saludo!`;
    }

    // Default Direct
    return `Hola! Me interesa ${result.name}. ¿Lo dejarías en ${offerPrice} €? Si aceptas me lo quedo ahora mismo sin marear.`;
  };

  const textToCopy = getNegotiationText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">■ Generador de Mensaje de Negociación</h3>
              <p className="text-xs text-gray-400">Consigue comprar por debajo del precio anunciado</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offer adjustment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-gray-300 uppercase">
              Tu oferta propuesta (€):
            </label>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Descuento: -{result.inputPrice - offerPrice} € ({Math.round(((result.inputPrice - offerPrice)/result.inputPrice)*100)}%)
            </span>
          </div>

          <div className="flex items-center gap-4 bg-[#090A0F] p-3 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400">Anunciado: <strong className="text-white font-mono">{result.inputPrice} €</strong></span>
            <input
              type="range"
              min={Math.round(result.inputPrice * 0.70)}
              max={result.inputPrice}
              value={offerPrice}
              onChange={(e) => setOfferPrice(parseInt(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <span className="text-base font-black text-amber-400 font-mono">{offerPrice} €</span>
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-gray-300 uppercase">Estilo de mensaje:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStyle('direct')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  style === 'direct' ? 'bg-amber-500 text-black border-amber-500 font-mono' : 'bg-[#090A0F] text-gray-400 border-gray-800'
                }`}
              >
                Directo Rápido
              </button>
              <button
                type="button"
                onClick={() => setStyle('cash')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  style === 'cash' ? 'bg-amber-500 text-black border-amber-500 font-mono' : 'bg-[#090A0F] text-gray-400 border-gray-800'
                }`}
              >
                En Mano / Hoy
              </button>
              <button
                type="button"
                onClick={() => setStyle('polite')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  style === 'polite' ? 'bg-amber-500 text-black border-amber-500 font-mono' : 'bg-[#090A0F] text-gray-400 border-gray-800'
                }`}
              >
                Educado
              </button>
            </div>
          </div>

          {/* Generated Text Box */}
          <div className="relative">
            <textarea
              readOnly
              rows={4}
              value={textToCopy}
              className="w-full rounded-2xl bg-[#090A0F] border border-gray-800 p-4 text-xs font-sans text-gray-200 focus:outline-none resize-none leading-relaxed"
            />
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-800 pt-4">
          <span>Listo para pegar en Wallapop o Vinted</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

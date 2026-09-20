import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Video, MessageSquare, Flame, Download, RefreshCw } from 'lucide-react';
import { VOTE_DEALS } from '../data/voteDeals';

export default function ContentEngineModal({ onClose, defaultDeal = null }) {
  const [selectedDeal, setSelectedDeal] = useState(defaultDeal || VOTE_DEALS[0]);
  const [activeTab, setActiveTab] = useState('tiktok'); // tiktok | twitter | whatsapp
  const [copied, setCopied] = useState(false);

  // Generador de guión para TikTok / Instagram Reels
  const generateTikTokScript = () => {
    return `🔥 ¿CHOLLO O ESTAFA EN WALLAPOP? EPISODIO #${Math.floor(Math.random() * 80 + 10)}

📱 Producto: ${selectedDeal.title}
💰 Precio anunciado: ${selectedDeal.price} €

🎙️ [GANCHO - 0 a 3 seg]:
"He encontrado este ${selectedDeal.title} por solo ${selectedDeal.price} euros en ${selectedDeal.marketplace}. ¿Tú lo comprarías o pasarías?"

📊 [ANÁLISIS DE MERCADO - 3 a 12 seg]:
"Lo metemos en FliprScore para ver el valor real.
- Valor medio de mercado: ${selectedDeal.marketAvg} €
- Rango de reventa: ${selectedDeal.resellRange}
- Veredicto de la IA: ${selectedDeal.verdict} (Score ${selectedDeal.score}/100)"

💡 [POR QUÉ]:
"${selectedDeal.summary}"

🤑 [BENEFICIO NETO]:
"Beneficio neto libre tras comisiones: ${selectedDeal.potentialProfit}"

👉 [CTA FINAL]:
"¿Tú qué habrías hecho? Pon a prueba cualquier anuncio gratis en fliprscore.com (link en bio)."`;
  };

  // Generador de hilo para X / Twitter
  const generateTwitterPost = () => {
    return `¿Comprarías este ${selectedDeal.title} por ${selectedDeal.price}€? 🧵👇

Lo hemos analizado con @FliprScore y este es el veredicto matemático:

1️⃣ Valor de mercado real: ${selectedDeal.marketAvg}€ (se vende entre ${selectedDeal.resellRange})
2️⃣ Margen neto proyectado: ${selectedDeal.potentialProfit}
3️⃣ Veredicto de la IA: ■ ${selectedDeal.verdict} (Score: ${selectedDeal.score}/100)

💡 El motivo clave:
${selectedDeal.summary}

Comprueba cualquier anuncio antes de comprar en https://fliprscore.com/?vote=${selectedDeal.id} #Wallapop #Flipping #SegundaMano`;
  };

  // Generador para WhatsApp / Telegram / Foros
  const generateForumPost = () => {
    return `🔥 *ANÁLISIS DE OPORTUNIDAD FLIPR* 🔥

📦 *${selectedDeal.title}*
💵 *Precio oferta:* ${selectedDeal.price} € (${selectedDeal.marketplace})
📈 *Valor medio:* ${selectedDeal.marketAvg} €
💰 *Beneficio estimado:* ${selectedDeal.potentialProfit}
🎯 *Veredicto:* *${selectedDeal.verdict}* (FLIP SCORE: ${selectedDeal.score}/100)

📝 *Diagnóstico:*
${selectedDeal.summary}

Comprueba tus propios anuncios gratis en 👉 https://fliprscore.com/?vote=${selectedDeal.id}`;
  };

  const getContent = () => {
    if (activeTab === 'tiktok') return generateTikTokScript();
    if (activeTab === 'twitter') return generateTwitterPost();
    return generateForumPost();
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(getContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-500/30 bg-[#0d0f17]/95 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        
        {/* Glow ambient */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-black flex items-center justify-center font-black">
              <Flame className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Generador de Contenido Viral</h3>
              <p className="text-xs text-gray-400">Crea posts para TikTok, Instagram Reels, X y foros en 1 segundo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Producto / Oportunidad */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-gray-300 uppercase">
            Seleccionar oportunidad a promocionar
          </label>
          <select
            value={selectedDeal.id}
            onChange={(e) => {
              const d = VOTE_DEALS.find((item) => item.id === e.target.value);
              if (d) setSelectedDeal(d);
            }}
            className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-sans"
          >
            {VOTE_DEALS.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title} — {deal.price} € ({deal.verdict} · {deal.potentialProfit})
              </option>
            ))}
          </select>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex items-center gap-2 bg-[#090A0F] p-1.5 rounded-2xl border border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('tiktok')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tiktok'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>TikTok / Reels</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('twitter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'twitter'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (Twitter)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp / Foros</span>
          </button>
        </div>

        {/* Output Text Area */}
        <div className="relative">
          <textarea
            readOnly
            rows={10}
            value={getContent()}
            className="w-full rounded-2xl bg-[#090A0F] border border-gray-800 p-4 text-xs text-gray-200 font-mono focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-gray-500 font-mono">
            Optimizado con estructura de alta retención
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 py-3 px-6 font-bold text-black shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto completo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

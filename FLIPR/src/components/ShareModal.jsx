import React, { useState, useEffect } from 'react';
import { 
  X, Share2, Copy, Check, MessageCircle, Send, 
  Sparkles, ExternalLink, Link2, FileText, Smartphone
} from 'lucide-react';
import { 
  createShareLink, 
  formatShareSummary, 
  formatTweetText, 
  getWhatsAppShareUrl, 
  getTelegramShareUrl, 
  getTwitterShareUrl 
} from '../utils/share';
import { trackEvent } from '../utils/analytics';

export default function ShareModal({ result, onClose }) {
  const [shareUrl, setShareUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingUrl(true);
      try {
        const url = await createShareLink(result);
        if (active) setShareUrl(url);
      } catch (_) {
        if (active) setShareUrl(window.location.origin);
      } finally {
        if (active) setLoadingUrl(false);
      }
    })();
    return () => { active = false; };
  }, [result]);

  if (!result) return null;

  const isBuy = result.verdict === 'COMPRALO';
  const isNegotiate = result.verdict === 'NEGOCIA';
  const isPass = result.verdict === 'PASA';

  const verdictBadgeColor = isBuy 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : isNegotiate 
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
    : 'bg-red-500/20 text-red-400 border-red-500/30';

  const currentUrl = shareUrl || window.location.origin;
  const shareText = formatShareSummary(result, currentUrl);
  const tweetText = formatTweetText(result, currentUrl);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        trackEvent('share_action', { type: 'copy_link', verdict: result.verdict });
      }
    } catch (_) {}
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2500);
        trackEvent('share_action', { type: 'copy_summary', verdict: result.verdict });
      }
    } catch (_) {}
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: `FLIPR — ${result.name}`,
        text: `Veredicto ${result.verdict} (Score ${result.flipScore}/100) en FLIPR`,
        url: currentUrl,
      });
      trackEvent('share_action', { type: 'native_share', verdict: result.verdict });
    } catch (_) {}
  };

  const handleOpenSocial = (platform, url) => {
    trackEvent('share_action', { type: platform, verdict: result.verdict });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-6 border border-gray-800 bg-[#0d0f17]/95 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        
        {/* Glow ambient */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBuy ? 'bg-emerald-500' : isNegotiate ? 'bg-amber-500' : 'bg-red-500'
        }`} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Compartir oportunidad</h3>
              <p className="text-xs text-gray-400">Muestra la valoración a amigos o compradores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl bg-[#12151F] border border-gray-800/80 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                {result.marketplace || 'Segunda mano'}
              </span>
              <h4 className="text-sm font-bold text-white line-clamp-1">{result.name}</h4>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${verdictBadgeColor}`}>
              {result.verdict}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/60 text-center">
            <div className="bg-[#090A0F] rounded-xl p-2 border border-gray-800/40">
              <div className="text-[9px] uppercase font-mono text-gray-400">SCORE</div>
              <div className="text-sm font-black font-mono text-emerald-400">{result.flipScore}/100</div>
            </div>
            <div className="bg-[#090A0F] rounded-xl p-2 border border-gray-800/40">
              <div className="text-[9px] uppercase font-mono text-gray-400">PRECIO</div>
              <div className="text-sm font-black font-mono text-white">{result.inputPrice || '-'}€</div>
            </div>
            <div className="bg-[#090A0F] rounded-xl p-2 border border-gray-800/40">
              <div className="text-[9px] uppercase font-mono text-gray-400">BENEFICIO</div>
              <div className="text-sm font-black font-mono text-emerald-400">
                {result.estimatedProfitMin !== undefined ? `+${result.estimatedProfitMin}€` : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Share buttons grid */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
            Canales directos
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={() => handleOpenSocial('whatsapp', getWhatsAppShareUrl(shareText))}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleOpenSocial('telegram', getTelegramShareUrl(currentUrl, `Análisis FLIPR: ${result.name} — ${result.verdict}`))}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-[#0088cc] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Telegram</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={() => handleOpenSocial('twitter', getTwitterShareUrl(tweetText))}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 col-span-2 sm:col-span-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (Twitter)</span>
            </button>
          </div>

          {/* Mobile Native Share */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Compartir con aplicaciones de tu móvil</span>
            </button>
          )}
        </div>

        {/* Copy Link & Summary section */}
        <div className="space-y-2 pt-2 border-t border-gray-800/80">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-[#090A0F] border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-400 truncate">
              <Link2 className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
              <span className="truncate">{loadingUrl ? 'Generando enlace público...' : currentUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              disabled={loadingUrl}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#12151F] hover:bg-gray-800/80 border border-gray-800 text-gray-300 hover:text-white font-medium text-xs transition-all"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-gray-400" />}
            <span>{copiedText ? '¡Ficha de texto copiada al portapapeles!' : 'Copiar resumen completo para chat / Wallapop'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

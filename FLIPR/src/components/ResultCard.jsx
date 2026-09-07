import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, ArrowLeft, MessageSquareText, 
  FileText, Bell, Bookmark, Share2, Sparkles, TrendingUp, ShieldCheck, 
  Clock, DollarSign, Zap, HelpCircle, Copy, Check, Columns3 
} from 'lucide-react';
import FlipScoreGauge from './FlipScoreGauge';
import ShareModal from './ShareModal';
import { computeFlipFactors } from '../utils/flipCalculator';
import { trackEvent } from '../utils/analytics';
import { createShareLink } from '../utils/share';

// Clasifica cada razón con un tono visual (verde/ámbar/rojo) según su contenido
function reasonTone(text) {
  const t = String(text || '').toLowerCase();
  if (/(riesgo|réplica|falsificaci|devaluaci|no se recomienda|insuficiente|difícil)/.test(t)) return 'bad';
  if (/(margen|beneficio|regateo|negocia|estado|comisiones|franja|estimación)/.test(t)) return 'warn';
  return 'good';
}

export default function ResultCard({ 
  result, 
  onBack, 
  onOpenNegotiate, 
  onOpenListing, 
  isFavorite = false, 
  onToggleFavorite,
  isFollowed = false,
  onToggleFollow,
  isCompared = false,
  onToggleCompare
}) {
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  if (!result) return null;

  // Desglose del FLIP SCORE en 5 factores (para presets antiguos sin factors, se calcula aquí)
  const factors = result.factors || computeFlipFactors({
    price: result.inputPrice,
    marketAvg: (result.marketRangeMin + result.marketRangeMax) / 2,
    marginMin: result.marginMin,
    marginMax: result.marginMax,
    demand: result.demand,
    risk: result.risk,
    liquidity: result.liquidity,
  }).factors;

  // Beneficio si se compra al precio objetivo (para presets antiguos sin estos campos)
  const avgResell = (result.probableResellMin + result.probableResellMax) / 2;
  const feesAtTarget = avgResell * 0.05 + 4.5;
  const profitAtTargetMin = result.profitAtTargetMin ?? Math.max(0, Math.round(result.probableResellMin - result.maxRecommendedBuy - feesAtTarget));
  const profitAtTargetMax = result.profitAtTargetMax ?? Math.max(0, Math.round(result.probableResellMax - result.maxRecommendedBuy - feesAtTarget));
  const targetOfferMin = result.targetOfferMin ?? Math.max(1, Math.round(result.maxRecommendedBuy * 0.9));

  const handleCopyMessage = () => {
    if (navigator.clipboard && result.negociarTemplate) {
      navigator.clipboard.writeText(result.negociarTemplate);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    }
  };

  // Color mapping based on Master Brief
  const isBuy = result.verdict === "COMPRALO";
  const isNegotiate = result.verdict === "NEGOCIA";
  const isPass = result.verdict === "PASA";

  let mainBg = "from-emerald-950/40 via-[#12151F] to-[#090A0F] border-emerald-500/40";
  let verdictColor = "bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-emerald-500/25";
  let verdictText = "■ CÓMPRALO";
  let verdictDesc = "Excelente oportunidad de compra. El margen y la demanda justifican la inversión.";

  if (isNegotiate) {
    mainBg = "from-amber-950/40 via-[#12151F] to-[#090A0F] border-amber-500/40";
    verdictColor = "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-amber-500/25";
    verdictText = "■ NEGOCIA";
    verdictDesc = "El precio anunciado deja poco colchón. Intenta conseguir una rebaja antes de comprar.";
  } else if (isPass) {
    mainBg = "from-red-950/40 via-[#12151F] to-[#090A0F] border-red-500/40";
    verdictColor = "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-500/25";
    verdictText = "■ PASA";
    verdictDesc = "Riesgo alto o beneficio insuficiente. No se recomienda adquirir este producto a este precio.";
  }

  const handleShare = () => {
    trackEvent('share_clicked', { verdict: result.verdict, score: result.flipScore, name: result.name });
    setShareModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-8">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-[#12151F] border border-gray-800 px-4 py-2 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Realizar otro análisis</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(result)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              isFavorite
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-[#12151F] border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isFavorite ? 'Guardado' : 'Guardar'}</span>
          </button>

          <button
            onClick={() => onToggleCompare(result)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              isCompared
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-[#12151F] border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Columns3 className={`w-4 h-4 ${isCompared ? 'text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{isCompared ? 'En comparador' : 'Comparar'}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#12151F] border border-gray-800 px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
            title="Compartir en WhatsApp, Telegram, X o copiar enlace"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      {/* Main Verdict & FLIP SCORE Banner */}
      <div className={`rounded-3xl border bg-gradient-to-b ${mainBg} p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8`}>
        
        {/* Title & Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-mono text-gray-300">
                {result.marketplace || 'Wallapop'}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Estado: <strong className="text-white">{result.condition}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {result.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="rounded-xl bg-[#090A0F]/80 border border-gray-800 px-4 py-2.5 text-right font-mono">
              <span className="text-[10px] text-gray-400 uppercase block">Precio anunciado</span>
              <span className="text-xl font-black text-white">{result.inputPrice} €</span>
            </div>
          </div>
        </div>

        {/* Heart of Product: Verdict Badge + FLIP SCORE Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Verdict Banner */}
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            <div className="inline-block">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block mb-2">
                VEREDICTO PRINCIPAL
              </span>
              <div className={`rounded-2xl px-8 py-3.5 text-2xl sm:text-3xl font-black tracking-wider uppercase shadow-xl font-mono inline-flex items-center gap-3 ${verdictColor}`}>
                {verdictText}
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl font-medium leading-relaxed">
              {verdictDesc}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] font-mono text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Valoración contrastada con histórico de mercado · Algoritmo neutral</span>
            </div>

            {/* Confidence indicator according to Section 6 of brief */}
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#090A0F]/60 border border-gray-800 px-3 py-1.5 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Confianza del análisis: <strong className="text-white font-mono">{result.confidence || 94}%</strong></span>
              <span className="text-[10px] text-gray-400">{result.usedMarketData ? "(Datos reales de mercado)" : "(Estimación)"}</span>
            </div>
          </div>

          {/* Right: Signature FLIP SCORE Gauge */}
          <div className="md:col-span-5 flex justify-center bg-[#090A0F]/40 p-6 rounded-2xl border border-gray-800/60">
            <FlipScoreGauge score={result.flipScore} verdict={result.verdict} size="normal" />
          </div>

        </div>

        {/* 🎯 ZONA DE ACCIÓN: cuánto ofrecer y cuánto ganar */}
        <div className="space-y-3">
          {/* Precio actual vs TU PRECIO MÁXIMO vs venta probable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#090A0F]/70 border border-gray-800 p-4">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Precio actual</span>
              <span className="text-2xl font-black text-white font-mono">{result.inputPrice} €</span>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/40 p-4">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">🎯 Tu precio máximo</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{result.maxRecommendedBuy} €</span>
              <span className="text-[10px] text-emerald-200/70 block mt-0.5">A partir de aquí la oportunidad deja de ser atractiva.</span>
            </div>
            <div className="rounded-2xl bg-[#090A0F]/70 border border-gray-800 p-4">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">Venta probable</span>
              <span className="text-2xl font-black text-white font-mono">{result.probableResellMin}–{result.probableResellMax} €</span>
            </div>
          </div>

          {/* Beneficio según el precio de compra */}
          <div className="rounded-2xl bg-[#090A0F]/60 border border-gray-800/70 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-gray-400 uppercase">Beneficio a {result.inputPrice} €</span>
              <span className="text-sm font-bold text-white font-mono">+{result.estimatedProfitMin} – +{result.estimatedProfitMax} €</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-emerald-400 uppercase">Beneficio a {result.maxRecommendedBuy} €</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">+{profitAtTargetMin} – +{profitAtTargetMax} € 💥</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              {result.verdict === 'PASA' || result.verdict === 'NEGOCIA'
                ? `A ${result.inputPrice} € no compensa. A ${result.maxRecommendedBuy} € la jugada cambia por completo.`
                : `A ${result.inputPrice} € ya compensa; si logras bajar a ${result.maxRecommendedBuy} €, el beneficio se dispara.`}
            </p>
          </div>

          {/* PRECIO OBJETIVO + mensaje para el vendedor */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">🎯 Precio objetivo</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{result.maxRecommendedBuy} €</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-200/80">
                Intenta cerrar entre {targetOfferMin}–{result.maxRecommendedBuy} €
              </span>
            </div>
            {result.negociarTemplate && (
              <button
                onClick={handleCopyMessage}
                className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                {copiedMsg ? (
                  <><Check className="w-4 h-4" /> ¡Mensaje copiado!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copiar mensaje para el vendedor</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Detalles del anuncio (descripción del vendedor) */}
        {result.description && (
          <div className="rounded-2xl bg-[#090A0F]/50 border border-gray-800/70 p-4">
            <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1.5">📋 Detalles del anuncio</span>
            <p className="text-sm text-gray-300 leading-relaxed">{result.description}</p>
          </div>
        )}

        {/* FLIP SCORE desglosado: 5 factores */}
        <div className="rounded-2xl bg-[#090A0F]/40 border border-gray-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Basado en 5 factores
            </span>
            <button
              onClick={() => setShowScoreDetail((v) => !v)}
              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline whitespace-nowrap"
            >
              {showScoreDetail ? 'Ocultar detalle ▲' : '¿Cómo calculamos tu score? ▼'}
            </button>
          </div>

          <div className="space-y-3">
            {factors.map((f) => (
              <div key={f.id}>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-gray-300 font-semibold">{f.label}</span>
                  <span className="text-gray-400">{f.score}<span className="text-gray-600">/100</span></span>
                </div>
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {showScoreDetail && (
            <div className="space-y-2 border-t border-gray-800 pt-3 text-[11px] text-gray-400 font-mono">
              <p>
                El <strong className="text-white">FLIP SCORE {result.flipScore}/100</strong> es la media
                ponderada de los 5 factores:
              </p>
              {factors.map((f) => (
                <p key={f.id}>
                  <strong className="text-white">{f.label} · {f.weight}%</strong> — {f.hint}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Master Financial Breakdown Grid (Section 6 Example) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-gray-800/80">
          
          <div className="rounded-2xl bg-[#090A0F]/90 p-4 border border-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Valor de Mercado</span>
            <span className="text-lg font-black text-white font-mono">{result.marketRangeMin} – {result.marketRangeMax} €</span>
            <span className="text-[10px] text-gray-400 block">Rango estimado</span>
          </div>

          <div className="rounded-2xl bg-[#090A0F]/90 p-4 border border-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Compra Máxima</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{result.maxRecommendedBuy} €</span>
            <span className="text-[10px] text-gray-400 block">Precio límite ideal</span>
          </div>

          <div className="rounded-2xl bg-[#090A0F]/90 p-4 border border-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Venta Probable</span>
            <span className="text-lg font-black text-white font-mono">{result.probableResellMin} – {result.probableResellMax} €</span>
            <span className="text-[10px] text-gray-400 block">Precio de salida</span>
          </div>

          <div className="rounded-2xl bg-[#090A0F]/90 p-4 border border-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Beneficio a {result.inputPrice} €</span>
            <span className="text-lg font-black text-emerald-400 font-mono">+{result.estimatedProfitMin} – +{result.estimatedProfitMax} €</span>
            <span className="text-[10px] text-gray-400 block">Neto tras gastos</span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#090A0F]/90 p-4 border border-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Margen Neto</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{result.marginMin}% – {result.marginMax}%</span>
            <span className="text-[10px] text-gray-400 block">Retorno de inversión</span>
          </div>

        </div>

      </div>

      {/* Market Indicators Bar (Demanda, Riesgo, Facilidad, Tiempo) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Demanda</span>
            <span className="text-sm font-bold text-white">{result.demand}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
            result.risk === 'BAJO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            result.risk === 'MEDIO' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Riesgo</span>
            <span className="text-sm font-bold text-white">{result.risk}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Facilidad</span>
            <span className="text-sm font-bold text-white">{result.liquidity}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Tiempo Estimado</span>
            <span className="text-sm font-bold text-white font-mono">{result.timeToSell}</span>
          </div>
        </div>

      </div>

      {/* Explanation & Reasoning Block (Section 7 of Brief) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>¿Por qué {result.verdict}?</span>
        </h3>

        <div className="space-y-3">
          {result.reasons && result.reasons.map((reason, idx) => {
            const tone = reasonTone(reason);
            const Icon = tone === 'bad' ? XCircle : tone === 'warn' ? AlertTriangle : CheckCircle2;
            const color = tone === 'bad' ? 'text-red-400' : tone === 'warn' ? 'text-amber-400' : 'text-emerald-400';
            return (
              <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                <span>{reason}</span>
              </div>
            );
          })}
        </div>

        {/* Negotiation Angle Box */}
        {result.negotiationTip && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase block">
              💡 Consejo táctico de negociación:
            </span>
            <p className="text-sm text-amber-200/90 font-medium">
              {result.negotiationTip}
            </p>
          </div>
        )}
      </div>

      {/* Core Operational Actions Grid (Section 7 Requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Action 1: 💬 NEGOCIAR */}
        <button
          onClick={() => onOpenNegotiate(result)}
          className="glass-panel-interactive rounded-2xl p-5 text-left space-y-3 group border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-[#12151F]"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>■ NEGOCIAR</span>
              <span className="text-xs font-mono text-amber-400">Generar →</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Crea un mensaje redactado para intentar comprar más barato al vendedor.
            </p>
          </div>
        </button>

        {/* Action 2: ✍️ CREAR ANUNCIO */}
        <button
          onClick={() => onOpenListing(result)}
          className="glass-panel-interactive rounded-2xl p-5 text-left space-y-3 group border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-[#12151F]"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>✍️ CREAR ANUNCIO</span>
              <span className="text-xs font-mono text-emerald-400">Generar →</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Genera título optimizado, descripción y etiquetas para revender con éxito.
            </p>
          </div>
        </button>

        {/* Action 3: 🔔 SEGUIR PRECIO */}
        <button
          onClick={() => onToggleFollow && onToggleFollow(result)}
          className={`glass-panel-interactive rounded-2xl p-5 text-left space-y-3 group border ${
            isFollowed ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-800'
          }`}
        >
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
            isFollowed ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300'
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>■ SEGUIR PRECIO</span>
              <span className="text-xs font-mono text-gray-400">
                {isFollowed ? 'Siguiendo ✓' : 'Activar'}
              </span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {isFollowed
                ? 'Guardado en tu panel. Las alertas automáticas llegan próximamente.'
                : 'Guárdalo en tu panel con su precio objetivo y beneficio estimado.'}
            </p>
            {!isFollowed && (
              <span className="inline-block text-[10px] font-mono bg-gray-800/80 text-gray-500 rounded px-1.5 py-0.5 mt-0.5">
                Alertas push · Próximamente
              </span>
            )}
          </div>
        </button>

      </div>

      {shareModalOpen && (
        <ShareModal 
          result={result} 
          onClose={() => setShareModalOpen(false)} 
        />
      )}

    </div>
  );
}

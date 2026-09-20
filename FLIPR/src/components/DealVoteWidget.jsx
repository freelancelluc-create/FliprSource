import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Share2, Sparkles, Trophy, RotateCcw, ChevronRight, Check } from 'lucide-react';
import { VOTE_DEALS } from '../data/voteDeals';

export default function DealVoteWidget({ initialDealId = null, onInspectPreset, onStartAnalyze }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialDealId) return 0;
    const found = VOTE_DEALS.findIndex((d) => d.id === initialDealId);
    return found !== -1 ? found : 0;
  });
  const [userVotes, setUserVotes] = useState({}); // { [dealId]: 'COMPRAR' | 'PASAR' }
  const [copiedShare, setCopiedShare] = useState(false);

  const deal = VOTE_DEALS[currentIndex] || VOTE_DEALS[0];
  const userVote = userVotes[deal.id];
  const hasVoted = Boolean(userVote);

  // Gamification: Aciertos del usuario contra la recomendación de Flipr
  const totalVotesCount = Object.keys(userVotes).length;
  const correctVotesCount = Object.entries(userVotes).filter(([id, vote]) => {
    const d = VOTE_DEALS.find((item) => item.id === id);
    if (!d) return false;
    const isGood = d.verdict === 'COMPRALO';
    return (vote === 'COMPRAR' && isGood) || (vote === 'PASAR' && !isGood);
  }).length;

  const handleVote = (voteType) => {
    if (hasVoted) return;
    setUserVotes((prev) => ({ ...prev, [deal.id]: voteType }));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % VOTE_DEALS.length);
  };

  const handleShareChallenge = () => {
    const challengeUrl = `${window.location.origin}/?vote=${encodeURIComponent(deal.id)}`;
    const text = `¿Tú pagarías ${deal.price} € por "${deal.title}"? Vota en Flipr y descubre si es un chollo o una mala compra: ${challengeUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const isUserCorrect = hasVoted && (
    (userVote === 'COMPRAR' && deal.verdict === 'COMPRALO') ||
    (userVote === 'PASAR' && deal.verdict !== 'COMPRALO')
  );

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-gray-800 bg-gradient-to-b from-[#12151F] to-[#090A0F] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              ¿Comprarías esto? — Reto Flipper
            </h3>
            <p className="text-[11px] text-gray-400">
              Pon a prueba tu ojo de comprador antes de ver la tasación oficial de la IA
            </p>
          </div>
        </div>

        {/* Gamification Score Counter */}
        {totalVotesCount > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Aciertos: {correctVotesCount}/{totalVotesCount}</span>
          </div>
        )}
      </div>

      {/* Main Challenge Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Product Image & Details */}
        <div className="md:col-span-5 relative group">
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#090A0F] aspect-[4/3] flex items-center justify-center">
            <img
              src={deal.imageUrl}
              alt={deal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            
            {/* Marketplace Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 px-2 py-1 text-[10px] font-mono text-gray-200">
              <span>{deal.marketplace}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{deal.condition}</span>
            </div>

            {/* Price Tag Highlight */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="text-xs font-mono text-gray-300">Precio anunciado:</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{deal.price} €</span>
            </div>
          </div>
          <p className="text-xs font-bold text-white mt-2.5 truncate">{deal.title}</p>
        </div>

        {/* Right: Voting & Reveal Area */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-4">
          
          {!hasVoted ? (
            /* Voting State */
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Pregunta de decisión
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  ¿Comprarías este anuncio por {deal.price} €?
                </h4>
                <p className="text-xs text-gray-400">
                  Vota para revelar el valor de mercado real, el FLIP SCORE™ y el beneficio neto estimado.
                </p>
              </div>

              {/* Action Voting Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleVote('COMPRAR')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black py-4 px-4 font-bold text-base shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5 fill-black text-emerald-400 stroke-[2.5]" />
                  <span>COMPRAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote('PASAR')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white py-4 px-4 font-bold text-base shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <XCircle className="w-5 h-5 text-white stroke-[2.5]" />
                  <span>PASAR</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 font-mono">
                <span>Producto {currentIndex + 1} de {VOTE_DEALS.length}</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Saltar este producto</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* Reveal State after Voting */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              
              {/* Verdict Header & User Success Alert */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono border ${deal.verdictColor}`}>
                    ■ {deal.verdict}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-gray-800/80 px-2.5 py-1 rounded-xl border border-gray-700">
                    FLIP SCORE: <b className="text-emerald-400">{deal.score}/100</b>
                  </span>
                </div>

                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                  isUserCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isUserCorrect ? '✓ ¡Acertaste!' : '✗ La IA discrepa'}
                </span>
              </div>

              {/* Explanation Summary */}
              <div className="rounded-2xl bg-[#090A0F] border border-gray-800 p-4 space-y-2">
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                  {deal.summary}
                </p>

                {/* Financial Snapshot */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/80 text-[11px] font-mono">
                  <div>
                    <span className="text-gray-500 block">Mercado</span>
                    <span className="text-gray-200 font-bold">{deal.marketAvg} €</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Reventa</span>
                    <span className="text-gray-200 font-bold">{deal.resellRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Beneficio neto</span>
                    <span className={`font-bold ${deal.potentialProfit.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {deal.potentialProfit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Community Poll Consensus */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-gray-400">
                  <span>Opinión de la comunidad:</span>
                  <span className="font-bold text-emerald-400">{deal.communityBuyPct}% COMPRAR · {100 - deal.communityBuyPct}% PASAR</span>
                </div>
                <div className="h-2 w-full rounded-full bg-red-500/30 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${deal.communityBuyPct}%` }}
                  />
                </div>
              </div>

              {/* Post-Vote Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {deal.presetId && onInspectPreset && (
                  <button
                    type="button"
                    onClick={() => onInspectPreset(deal.presetId)}
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15"
                  >
                    <span>Ver análisis completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border border-gray-700"
                >
                  <span>Siguiente reto</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={handleShareChallenge}
                  title="Compartir reto con amigos"
                  className="rounded-xl bg-[#090A0F] hover:bg-gray-800 text-gray-300 hover:text-white px-3 py-2.5 text-xs font-bold border border-gray-800 flex items-center gap-1.5"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedShare ? '¡Copiado!' : 'Compartir'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

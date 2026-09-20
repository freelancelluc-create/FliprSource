import React, { useState } from 'react';
import { Calculator, Sparkles, TrendingUp, AlertCircle, ArrowRight, ShieldCheck, DollarSign, RefreshCw, Zap } from 'lucide-react';
import { estimateResale } from '../utils/priceEstimator';
import { trackEvent } from '../utils/analytics';

const CONDITIONS = [
  'Nuevo',
  'Como nuevo',
  'Muy buen estado',
  'Buen estado',
  'Aceptable',
  'A reparar',
];

const TRENDING_EXAMPLES = [
  { name: 'PlayStation 5 Slim', price: '280' },
  { name: 'iPhone 15 Pro', price: '650' },
  { name: 'MacBook Air M2', price: '680' },
  { name: 'Nintendo Switch OLED', price: '180' },
  { name: 'Dyson Airwrap', price: '290' },
  { name: 'Sony WH-1000XM5', price: '190' },
  { name: 'Fujifilm X100V', price: '1100' }
];

const PLATFORMS = [
  { id: 'direct', name: 'En mano / Sin comisión', feePct: 0, fixedFee: 0 },
  { id: 'wallapop', name: 'Wallapop Envíos (~5%)', feePct: 0.05, fixedFee: 1.5 },
  { id: 'vinted', name: 'Vinted Protección (~5% + 0.70€)', feePct: 0.05, fixedFee: 0.7 },
  { id: 'ebay', name: 'eBay / Otras (~10%)', feePct: 0.10, fixedFee: 0.35 }
];

export default function PriceCalculator({ onAnalyzeProduct }) {
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('Muy buen estado');
  const [price, setPrice] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('wallapop');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateWithParams = (prodName, prodCondition, prodPrice) => {
    setError('');
    if (!prodName.trim() && !prodPrice) {
      setError('Introduce el nombre del producto o un precio para empezar.');
      return;
    }
    const r = estimateResale({ productName: prodName.trim(), condition: prodCondition, purchasePrice: prodPrice });
    setResult(r);
    trackEvent('calculator_used', { found: r.found, hasPrice: Number(prodPrice) > 0, platform: selectedPlatform });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateWithParams(name, condition, price);
  };

  const handleSelectTrending = (item) => {
    setName(item.name);
    setPrice(item.price);
    calculateWithParams(item.name, condition, item.price);
  };

  // Fees and net margins
  const activePlatformData = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];
  const purchaseNum = parseFloat(price) || 0;
  const avgResale = result && result.min !== null ? Math.round((result.min + result.max) / 2) : 0;
  const estimatedPlatformFee = avgResale > 0 ? Math.round((avgResale * activePlatformData.feePct) + activePlatformData.fixedFee) : 0;
  const estimatedNetProfit = avgResale > 0 && purchaseNum > 0 ? Math.max(0, avgResale - purchaseNum - estimatedPlatformFee) : 0;
  const estimatedRoi = purchaseNum > 0 ? Math.round((estimatedNetProfit / purchaseNum) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="glass-panel rounded-3xl border border-gray-800 p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Calculator className="w-3.5 h-3.5" />
            Simulador de Margen & Valor de Mercado
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Calcula tu beneficio real antes de comprar
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Compara precios de mercado en Wallapop, Vinted y Milanuncios, descuenta comisiones de envío y descubre tu ROI neto estimado al instante.
          </p>

          {/* Quick trending pills */}
          <div className="pt-2">
            <p className="text-[11px] font-mono text-gray-400 mb-2 uppercase tracking-wider">🔥 Pruebas rápidas populares:</p>
            <div className="flex flex-wrap gap-2">
              {TRENDING_EXAMPLES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectTrending(item)}
                  className="rounded-lg bg-gray-900/90 border border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 px-3 py-1.5 text-xs text-gray-300 hover:text-emerald-300 font-mono transition-all flex items-center gap-1.5"
                >
                  <span>{item.name}</span>
                  <span className="text-emerald-400 font-bold">({item.price}€)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Producto / modelo
              </label>
              <input
                type="text"
                placeholder="Ej: PlayStation 5 Slim, iPhone 15 Pro, MacBook Air M2..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Estado del artículo
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Precio de compra ofertado (€)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-emerald-400 font-bold font-mono">€</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="250"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-8 pr-4 py-3 text-sm text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Canal de venta / Plataforma
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 font-bold text-black shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm hover:scale-[1.005] active:scale-[0.99] transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Calcular Tasación & Margen Neto
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs font-mono text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {result && (
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#12151F] to-[#161B29] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
              <div>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Rango estimado de reventa en mercado</p>
                {result.found && (
                  <p className="text-xs text-emerald-400 font-mono font-semibold mt-1">
                    ✓ {result.productName} · Datos de mercado contrastados
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-mono ${
                estimatedRoi >= 30 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                estimatedRoi >= 15 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-gray-800 text-gray-400'
              }`}>
                <Zap className="w-3 h-3" />
                {estimatedRoi >= 30 ? 'ALTO POTENCIAL' : estimatedRoi >= 15 ? 'MARGEN MODERADO' : 'MARGEN AJUSTADO'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <span className="text-xs text-gray-500 font-mono block mb-1">Precio objetivo de venta:</span>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                  {result.min !== null ? `${result.min} – ${result.max} €` : '—'}
                </div>
              </div>

              {avgResale > 0 && purchaseNum > 0 && (
                <div className="text-left sm:text-right">
                  <span className="text-xs text-gray-500 font-mono block mb-1">ROI neto estimado:</span>
                  <div className={`text-3xl sm:text-4xl font-black font-mono ${
                    estimatedRoi >= 25 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    +{estimatedRoi}%
                  </div>
                </div>
              )}
            </div>

            {/* Financial breakdown */}
            {avgResale > 0 && purchaseNum > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl bg-[#090A0F]/80 border border-gray-800 p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Compra</span>
                  <span className="text-base font-bold text-white font-mono">{purchaseNum} €</span>
                </div>
                <div className="rounded-xl bg-[#090A0F]/80 border border-gray-800 p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Venta media</span>
                  <span className="text-base font-bold text-gray-200 font-mono">{avgResale} €</span>
                </div>
                <div className="rounded-xl bg-[#090A0F]/80 border border-gray-800 p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Comisión {activePlatformData.name.split(' ')[0]}</span>
                  <span className="text-base font-bold text-gray-400 font-mono">-{estimatedPlatformFee} €</span>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase block font-semibold">Beneficio Neto</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">+{estimatedNetProfit} €</span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 font-mono leading-relaxed bg-black/30 p-3 rounded-xl border border-gray-800">
              💡 {result.note}
            </p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (onAnalyzeProduct) {
                    onAnalyzeProduct({
                      name: name.trim() || result.productName,
                      inputPrice: price,
                      condition: condition
                    });
                  } else {
                    window.location.href = `/?go=analizar&title=${encodeURIComponent(name || result.productName || '')}&price=${price || ''}`;
                  }
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-4 font-bold text-black shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-black" />
                Obtener Análisis Completo con IA (Veredicto + Negociación)
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-[11px] text-gray-500 font-mono">
                Calcula riesgo de estafa, tiempo de venta y genera mensajes de contraoferta automáticos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


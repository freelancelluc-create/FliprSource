import React, { useState } from 'react';
import { Calculator, Sparkles, Zap, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
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

export default function PriceCalculator() {
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('Muy buen estado');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() && !price) {
      setError('Introduce el nombre del producto o un precio para empezar.');
      return;
    }
    const r = estimateResale({ productName: name.trim(), condition, purchasePrice: price });
    setResult(r);
    trackEvent('calculator_used', { found: r.found, hasPrice: Number(price) > 0 });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="glass-panel rounded-3xl border border-gray-800 p-6 sm:p-10 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Calculator className="w-3.5 h-3.5" />
            Herramienta gratuita
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Calcula cuánto vale tu producto
          </h1>
          <p className="text-gray-400">
            Introduce el producto y te decimos el rango de precio por el que podrías revenderlo. Sin registro, sin créditos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Producto / modelo
              </label>
              <input
                type="text"
                placeholder="Ej: PlayStation 5 Slim, iPhone 13, MacBook Air M1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Estado
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Precio de compra (€, opcional)
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
            <button
              type="submit"
              className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 font-bold text-black shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm hover:scale-[1.01] transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              Calcular valor de reventa
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-[11px] font-mono text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {result && (
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#12151F] to-[#161B29] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Tu producto podría venderse por</p>
                {result.found && (
                  <p className="text-[11px] text-emerald-400 font-mono mt-1">{result.productName} · datos de mercado</p>
                )}
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400 font-mono">
                {result.found ? '✓ Datos reales' : 'estimate'}
              </span>
            </div>

            <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
              {result.min !== null ? `${result.min} – ${result.max} €` : '—'}
            </div>

            {result.estimatedProfitMin !== null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#090A0F]/80 border border-gray-800 p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Compra a</span>
                  <span className="text-sm font-bold text-white font-mono">{result.purchasePrice} €</span>
                </div>
                <div className="rounded-xl bg-[#090A0F]/80 border border-gray-800 p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Beneficio estimado</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">+{result.estimatedProfitMin} – +{result.estimatedProfitMax} €</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-500 font-mono">{result.note}</p>

            <a
              href="/?go=analizar"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-4 font-bold text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm hover:scale-[1.01] transition-all"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              Analiza el producto completo con FLIPR
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-center text-[10px] text-gray-500 font-mono">
              Veredicto CÓMPRALO / NEGOCIA / PASA, margen y precio máximo de compra en 5 segundos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

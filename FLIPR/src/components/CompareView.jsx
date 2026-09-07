import React from 'react';
import { Columns3, X, ArrowRight, Sparkles, Trophy } from 'lucide-react';

const VERDICT_STYLE = {
  COMPRALO: 'bg-emerald-500/15 text-emerald-400',
  NEGOCIA: 'bg-amber-500/15 text-amber-400',
  PASA: 'bg-red-500/15 text-red-400',
};

function riskTone(risk) {
  if (risk === 'BAJO') return 'text-emerald-400';
  if (risk === 'MEDIO') return 'text-amber-400';
  return 'text-red-400';
}

export default function CompareView({ items = [], onRemove, onSelectResult, onAnalyze }) {
  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Columns3 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Compara oportunidades</h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Analiza varios productos y compáralos lado a lado para elegir el mejor chollo.
        </p>
        <button
          onClick={onAnalyze}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          Analizar un producto
        </button>
        <p className="text-[11px] text-gray-500 font-mono">Consejo: cuando veas un resultado, pulsa «Añadir a comparar».</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => (b.flipScore || 0) - (a.flipScore || 0));
  const best = sorted[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Comparador de oportunidades</h1>
        <p className="text-sm text-gray-400">{items.length} producto{items.length !== 1 && 's'} · ordenado por FLIP SCORE</p>
      </div>

      {best && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-gray-200">
            <span className="text-white font-bold">Mejor oportunidad:</span> {best.name} ·{' '}
            <span className="font-mono text-emerald-400 font-bold">{best.flipScore}/100</span>
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#12151F]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0A0D14]/80 text-[11px] uppercase tracking-wider text-gray-400 font-mono">
              <th className="px-4 py-3">Producto</th>
              <th className="px-3 py-3">Precio</th>
              <th className="px-3 py-3">Score</th>
              <th className="px-3 py-3">Beneficio</th>
              <th className="px-3 py-3">Riesgo</th>
              <th className="px-3 py-3 text-right">Veredicto</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className="border-b border-gray-800/60 last:border-none">
                <td className="px-4 py-3">
                  <button onClick={() => onSelectResult(item)} className="text-left font-semibold text-white hover:text-emerald-400">
                    {item.name || 'Producto'}
                  </button>
                </td>
                <td className="px-3 py-3 font-mono text-white">{item.inputPrice} €</td>
                <td className="px-3 py-3 font-mono font-bold text-emerald-400">{item.flipScore}<span className="text-gray-600">/100</span></td>
                <td className="px-3 py-3 font-mono text-emerald-400">+{item.estimatedProfitMin} – +{item.estimatedProfitMax} €</td>
                <td className={`px-3 py-3 font-mono ${riskTone(item.risk)}`}>{item.risk || '—'}</td>
                <td className="px-3 py-3 text-right">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${VERDICT_STYLE[item.verdict] || 'bg-gray-800 text-gray-300'}`}>
                    {item.verdict || '—'}
                  </span>
                </td>
                <td className="px-2 py-3 text-right">
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label="Quitar de la comparación"
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onAnalyze}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          Analizar otro producto
        </button>
        <span className="text-xs text-gray-500 font-mono">¿Cuál comprarías tú?</span>
      </div>
    </div>
  );
}

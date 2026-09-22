import React from 'react';
import { Columns3, X, ArrowRight, Sparkles, Trophy } from 'lucide-react';

const VERDICT_STYLE = {
  COMPRALO: 'bg-emerald-500/15 text-emerald-700',
  NEGOCIA: 'bg-amber-500/15 text-amber-700',
  PASA: 'bg-red-500/15 text-red-600',
};

function riskTone(risk) {
  if (risk === 'BAJO') return 'text-emerald-700';
  if (risk === 'MEDIO') return 'text-amber-700';
  return 'text-red-600';
}

export default function CompareView({ items = [], onRemove, onSelectResult, onAnalyze }) {
  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
          <Columns3 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Compara oportunidades</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Analiza varios productos y compáralos lado a lado para elegir el mejor chollo.
        </p>
        <button
          onClick={onAnalyze}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          Analizar un producto
        </button>
        <p className="text-[11px] text-slate-500 font-mono">Consejo: cuando veas un resultado, pulsa «Añadir a comparar».</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => (b.flipScore || 0) - (a.flipScore || 0));
  const best = sorted[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Comparador de oportunidades</h1>
        <p className="text-sm text-slate-600">{items.length} producto{items.length !== 1 && 's'} · ordenado por FLIP SCORE</p>
      </div>

      {best && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <Trophy className="w-5 h-5 text-emerald-700 shrink-0" />
          <p className="text-sm text-slate-800">
            <span className="text-slate-900 font-bold">Mejor oportunidad:</span> {best.name} ·{' '}
            <span className="font-mono text-emerald-700 font-bold">{best.flipScore}/100</span>
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-600 font-mono">
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
              <tr key={item.id} className="border-b border-slate-200 last:border-none">
                <td className="px-4 py-3">
                  <button onClick={() => onSelectResult(item)} className="text-left font-semibold text-slate-900 hover:text-emerald-700">
                    {item.name || 'Producto'}
                  </button>
                </td>
                <td className="px-3 py-3 font-mono text-slate-900">{item.inputPrice} €</td>
                <td className="px-3 py-3 font-mono font-bold text-emerald-700">{item.flipScore}<span className="text-slate-500">/100</span></td>
                <td className="px-3 py-3 font-mono text-emerald-700">+{item.estimatedProfitMin} – +{item.estimatedProfitMax} €</td>
                <td className={`px-3 py-3 font-mono ${riskTone(item.risk)}`}>{item.risk || '—'}</td>
                <td className="px-3 py-3 text-right">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${VERDICT_STYLE[item.verdict] || 'bg-slate-100 text-slate-700'}`}>
                    {item.verdict || '—'}
                  </span>
                </td>
                <td className="px-2 py-3 text-right">
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label="Quitar de la comparación"
                    className="text-slate-500 hover:text-red-600 transition-colors"
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
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          Analizar otro producto
        </button>
        <span className="text-xs text-slate-500 font-mono">¿Cuál comprarías tú?</span>
      </div>
    </div>
  );
}

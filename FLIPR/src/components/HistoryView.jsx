import React, { useState } from 'react';
import { History, Bookmark, Trash2, ArrowRight, TrendingUp, Zap, Sparkles, Filter } from 'lucide-react';
import FlipScoreGauge from './FlipScoreGauge';

export default function HistoryView({ items = [], mode = "history", onSelectResult, onDeleteItem }) {
  const [filter, setFilter] = useState("ALL"); // ALL | COMPRALO | NEGOCIA | PASA

  const title = mode === "history" ? "Historial de análisis" : "Productos guardados";
  const icon = mode === "history" ? <History className="w-6 h-6 text-emerald-400" /> : <Bookmark className="w-6 h-6 text-amber-400" />;

  const filteredItems = items.filter(item => {
    if (filter === "ALL") return true;
    return item.verdict === filter;
  });

  // Calculate cumulative profit potential
  const totalPotentialProfit = items.reduce((acc, item) => {
    return acc + (item.estimatedProfitMax || 0);
  }, 0);

  const buyCount = items.filter(i => i.verdict === "COMPRALO").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      
      {/* Header & Cumulative Stats */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-gray-400">
                {mode === "history" 
                  ? "Registro de oportunidades analizadas en esta sesión"
                  : "Lista de productos guardados para seguimiento"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="rounded-2xl bg-[#090A0F] border border-gray-800 p-3 text-right">
              <span className="text-[10px] text-gray-400 uppercase block">Oportunidades CÓMPRALO</span>
              <span className="text-lg font-black text-emerald-400">{buyCount} oport.</span>
            </div>

            <div className="rounded-2xl bg-[#090A0F] border border-gray-800 p-3 text-right">
              <span className="text-[10px] text-gray-400 uppercase block">Beneficio Potencial</span>
              <span className="text-lg font-black text-emerald-400">+{totalPotentialProfit} €</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-400">Filtrar:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#090A0F] p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === "ALL" ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setFilter("COMPRALO")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === "COMPRALO" ? 'bg-emerald-500 text-black' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              CÓMPRALO
            </button>
            <button
              onClick={() => setFilter("NEGOCIA")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === "NEGOCIA" ? 'bg-amber-500 text-black' : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              NEGOCIA
            </button>
            <button
              onClick={() => setFilter("PASA")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === "PASA" ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              PASA
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-gray-800">
          <Zap className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No hay análisis registrados</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Utiliza el analizador de productos para evaluar chollos de Wallapop o Vinted y aparecerán guardados aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel-interactive rounded-2xl p-5 border border-gray-800 space-y-4 relative group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-700"
                    />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                    <span className="text-xs text-gray-400 font-mono">
                      Compra: <strong className="text-white">{item.inputPrice} €</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="text-gray-500 hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Eliminar del historial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Score & Verdict row */}
              <div className="flex items-center justify-between border-t border-gray-800/80 pt-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black ${
                  item.verdict === 'COMPRALO' ? 'bg-emerald-500 text-black' :
                  item.verdict === 'NEGOCIA' ? 'bg-amber-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  ■ {item.verdict}
                </span>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-gray-400">FLIP SCORE:</span>
                  <span className="font-bold text-emerald-400">{item.flipScore}/100</span>
                </div>
              </div>

              {/* Profit & Action button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Beneficio est: +{item.estimatedProfitMin || 20}–{item.estimatedProfitMax || 50} €
                </span>

                <button
                  onClick={() => onSelectResult(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span>Ver detalle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

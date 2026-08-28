import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Zap, Clock, Copy, Check, Trash2, Users, Gift, Target, CheckCircle2, XCircle, AlertTriangle, BarChart3, Bell, PencilLine, X } from 'lucide-react';

function VerdictBadge({ verdict }) {
  const map = {
    COMPRALO: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    NEGOCIA: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    PASA: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15' },
  };
  const m = map[verdict] || map.NEGOCIA;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${m.bg} ${m.color}`}>
      <Icon className="w-3 h-3" /> {verdict}
    </span>
  );
}

export default function DashboardView({
  historyList = [],
  watchlist = [],
  onToggleFollow,
  user,
  onSelectResult,
  onOpenAuth,
}) {
  const [copied, setCopied] = useState(false);
  // Notas locales por item de watchlist (id → texto)
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flipr_watchlist_notes') || '{}'); } catch { return {}; }
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  const saveNote = (id) => {
    const next = { ...notes, [id]: noteInput.trim() };
    setNotes(next);
    try { localStorage.setItem('flipr_watchlist_notes', JSON.stringify(next)); } catch {}
    setEditingNoteId(null);
  };

  const deleteNote = (id) => {
    const next = { ...notes };
    delete next[id];
    setNotes(next);
    try { localStorage.setItem('flipr_watchlist_notes', JSON.stringify(next)); } catch {}
  };

  const total = historyList.length;
  const buyCount = historyList.filter((h) => h.verdict === 'COMPRALO').length;
  const negCount = historyList.filter((h) => h.verdict === 'NEGOCIA').length;
  const passCount = historyList.filter((h) => h.verdict === 'PASA').length;
  const totalProfit = historyList.reduce((s, h) => s + (h.estimatedProfitMin || 0), 0);

  const referralLink = user ? `${window.location.origin}/?ref=${encodeURIComponent(user.email)}` : '';
  const copyReferral = () => {
    if (navigator.clipboard && referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" /> Mi panel
        </h1>
        {user ? (
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono text-emerald-400">
            👤 {user.name}
          </span>
        ) : null}
      </div>

      {/* Estadísticas */}
      <section className="space-y-3">
        <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Tus análisis
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-[#12151F]/80 border border-gray-800 p-4">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Análisis</span>
            <span className="text-2xl font-black text-white">{total}</span>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4">
            <span className="text-[10px] font-mono text-emerald-300 uppercase block">🟢 CÓMPRALO</span>
            <span className="text-2xl font-black text-emerald-400">{buyCount}</span>
          </div>
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4">
            <span className="text-[10px] font-mono text-amber-300 uppercase block">🟡 NEGOCIA</span>
            <span className="text-2xl font-black text-amber-400">{negCount}</span>
          </div>
          <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-4">
            <span className="text-[10px] font-mono text-red-300 uppercase block">🔴 PASA</span>
            <span className="text-2xl font-black text-red-400">{passCount}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-[#12151F]/80 border border-gray-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Beneficio total estimado</span>
            <span className="text-xl font-black text-emerald-400 font-mono">+{totalProfit} €</span>
          </div>
        </div>
      </section>

      {/* Seguimiento / Watchlist */}
      <section className="space-y-3">
        <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-400" /> En seguimiento ({watchlist.length})
        </h2>
        {/* Aviso honesto: las alertas automáticas aún no están activas */}
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[11px] text-amber-300 font-mono">
          <Bell className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Alertas automáticas de precio · Próximamente.</strong>{' '}
            Por ahora guarda aquí tus productos favoritos con su precio objetivo y beneficio estimado para no perderlos de vista.
          </span>
        </div>
        {watchlist.length === 0 ? (
          <p className="text-sm text-gray-400">
            No sigues ningún producto todavía. En un análisis, pulsa <strong className="text-white">"■ SEGUIR PRECIO"</strong> para guardarlo aquí con su precio objetivo.
          </p>
        ) : (
          <div className="space-y-2">
            {watchlist.map((item) => (
              <div key={item.id} className="rounded-2xl bg-[#12151F]/80 border border-gray-800 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <button onClick={() => onSelectResult(item)} className="text-left flex-1 min-w-0">
                    <span className="block font-bold text-white truncate">{item.name}</span>
                    <span className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                      <VerdictBadge verdict={item.verdict} />
                      <span>🎯 {item.maxRecommendedBuy} €</span>
                      <span className="text-emerald-400">+{item.profitAtTargetMin ?? item.estimatedProfitMin} €</span>
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingNoteId(editingNoteId === item.id ? null : item.id);
                        setNoteInput(notes[item.id] || '');
                      }}
                      title="Añadir nota"
                      className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all ${
                        notes[item.id]
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleFollow(item)}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Quitar
                    </button>
                  </div>
                </div>

                {/* Nota inline */}
                {editingNoteId === item.id ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      autoFocus
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveNote(item.id); if (e.key === 'Escape') setEditingNoteId(null); }}
                      placeholder="Ej: vendedor pendiente de responder, precio negociado a 280 €..."
                      className="flex-1 rounded-xl bg-[#090A0F] border border-gray-700 focus:border-emerald-500 px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button onClick={() => saveNote(item.id)} className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingNoteId(null)} className="rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 text-xs">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : notes[item.id] ? (
                  <div className="flex items-start gap-2 pt-1">
                    <p className="flex-1 text-[11px] text-gray-400 font-mono italic">{notes[item.id]}</p>
                    <button onClick={() => deleteNote(item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Referidos */}
      <section className="space-y-3">
        <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-emerald-400" /> Invita a tus amigos
        </h2>
        {user ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 space-y-3">
            <p className="text-sm text-emerald-100/90">
              Comparte tu enlace. Cuando un amigo se registre con él, <strong className="text-white">te llevas +5 créditos gratis</strong>.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 rounded-xl bg-[#090A0F] border border-gray-800 px-3 py-2.5 text-xs text-white font-mono min-w-0"
              />
              <button
                onClick={copyReferral}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#12151F]/80 border border-gray-800 p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              <Users className="w-4 h-4 inline text-emerald-400 mr-1" />
              Inicia sesión para tener tu enlace de invitación y ganar créditos.
            </p>
            <button
              onClick={onOpenAuth}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 text-xs font-bold"
            >
              Entrar
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

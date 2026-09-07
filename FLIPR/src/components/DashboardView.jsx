import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Zap, Clock, Copy, Check, Trash2, Users, Gift, Target, CheckCircle2, XCircle, AlertTriangle, BarChart3, Bell, BellOff, PencilLine, X, Mail, Loader2 } from 'lucide-react';

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

  // ── Alertas ──────────────────────────────────────────────────────────────
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertEmailInput, setAlertEmailInput] = useState('');
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsSaved, setAlertsSaved] = useState(false);
  const [alertsError, setAlertsError] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Cargar prefs de alertas al montar si hay sesión
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = localStorage.getItem('flipr_token');
        if (!token) return;
        const resp = await fetch('/api/alert-prefs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        setAlertsEnabled(!!data.enabled);
        setAlertEmail(data.notifyEmail || user.email || '');
        setAlertEmailInput(data.notifyEmail || user.email || '');
      } catch (_) {}
    })();
  }, [user]);

  const saveAlertPrefs = async (enabled, email) => {
    setAlertsLoading(true);
    setAlertsError('');
    try {
      const token = localStorage.getItem('flipr_token');
      if (!token) throw new Error('no-session');
      const resp = await fetch('/api/alert-prefs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled, notifyEmail: email }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.error || 'error');
      setAlertsEnabled(enabled);
      setAlertEmail(email);
      setAlertsSaved(true);
      setShowEmailInput(false);
      setTimeout(() => setAlertsSaved(false), 2500);
    } catch (e) {
      setAlertsError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleToggleAlerts = () => {
    if (!user) { onOpenAuth('login'); return; }
    if (!alertsEnabled) {
      // Activar: mostrar input de email para confirmar
      setShowEmailInput(true);
    } else {
      // Desactivar directamente
      saveAlertPrefs(false, alertEmail);
    }
  };

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

        {/* Panel de alertas automáticas */}
        <div className={`rounded-xl border px-4 py-3 space-y-3 transition-colors ${alertsEnabled ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-[#12151F]/80 border-gray-800'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {alertsEnabled
                ? <Bell className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <BellOff className="w-4 h-4 text-gray-500 flex-shrink-0" />
              }
              <div>
                <p className={`text-xs font-bold ${alertsEnabled ? 'text-emerald-300' : 'text-gray-300'}`}>
                  Alertas automáticas de precio
                </p>
                {alertsEnabled
                  ? <p className="text-[11px] text-emerald-400/80 font-mono">Activas · Notificando a {alertEmail}</p>
                  : <p className="text-[11px] text-gray-500 font-mono">Recibe un email cuando el precio baje de tu objetivo</p>
                }
              </div>
            </div>
            <button
              onClick={handleToggleAlerts}
              disabled={alertsLoading}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
                alertsEnabled ? 'bg-emerald-500' : 'bg-gray-700'
              } ${alertsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={alertsEnabled ? 'Desactivar alertas' : 'Activar alertas'}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${alertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Input de email al activar */}
          {showEmailInput && (
            <div className="flex gap-2 pt-1">
              <div className="flex-1 flex items-center gap-2 rounded-xl bg-[#090A0F] border border-gray-700 focus-within:border-emerald-500 px-3 py-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <input
                  autoFocus
                  type="email"
                  value={alertEmailInput}
                  onChange={(e) => setAlertEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveAlertPrefs(true, alertEmailInput);
                    if (e.key === 'Escape') setShowEmailInput(false);
                  }}
                  placeholder="tu@email.com"
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
              <button
                onClick={() => saveAlertPrefs(true, alertEmailInput)}
                disabled={alertsLoading || !alertEmailInput.includes('@')}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-3 py-1.5 text-xs font-bold flex items-center gap-1"
              >
                {alertsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Activar
              </button>
              <button onClick={() => setShowEmailInput(false)} className="rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 px-2.5 py-1.5 text-xs">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {alertsSaved && (
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> Guardado correctamente
            </p>
          )}
          {alertsError && (
            <p className="text-[11px] text-red-400 font-mono">{alertsError}</p>
          )}
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

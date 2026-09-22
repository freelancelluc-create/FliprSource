import React, { useState } from 'react';
import { X, Zap, Check, CreditCard, Sparkles, Lock, AlertCircle, FlaskConical } from 'lucide-react';
import { PLANS } from '../data/plans';
import { PAYMENTS_ENABLED } from '../config';
import { trackEvent } from '../utils/analytics';

export default function UpsellModal({ credits = 0, onClose, onBuy }) {
  const [buying, setBuying] = useState(null); // id del plan en proceso
  const [error, setError] = useState('');

  const handleBuy = async (plan) => {
    setBuying(plan.id);
    setError('');

    // MODO PRUEBAS: añadir créditos gratis sin cobrar
    if (!PAYMENTS_ENABLED) {
      await new Promise((r) => setTimeout(r, 500));
      if (onBuy) onBuy(plan);
      setBuying(null);
      return;
    }

    // PAGO REAL: Stripe Checkout (Google Pay / Apple Pay según dispositivo)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s límite
    try {
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
        signal: controller.signal,
      });
      const data = await resp.json().catch(() => null);
      if (data && data.url) {
        trackEvent('checkout_started', { planId: plan.id });
        window.location.href = data.url;
        return;
      }
      if (data && data.error === 'no-stripe') {
        setError('El pago aún no está configurado en el servidor (falta STRIPE_SECRET_KEY en Vercel).');
      } else {
        setError('No se pudo iniciar el pago. ' + ((data && data.detail) || 'Yendo a Stripe falló. Inténtalo de nuevo.'));
      }
    } catch (e) {
      console.error(e);
      setError(
        e && e.name === 'AbortError'
          ? 'El servidor de pagos tardó demasiado en responder. Comprueba que STRIPE_SECRET_KEY está configurada en Vercel.'
          : 'Error de conexión al iniciar el pago. Inténtalo de nuevo.'
      );
    } finally {
      clearTimeout(timeout);
      setBuying(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-500/30 relative overflow-hidden animate-in fade-in zoom-in-95">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Se te acabaron los créditos
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Te quedan <strong className="text-emerald-700 font-mono">{credits}</strong> de tus análisis gratis.
            Consigue más créditos para seguir descifrando si algo es un chollo o un mal negocio.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isBuying = buying === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-4 flex flex-col space-y-3 ${
                  plan.featured
                    ? 'border-emerald-600 bg-gradient-to-b from-emerald-500/15 to-white shadow-xl shadow-emerald-500/10'
                    : 'border-slate-200 bg-slate-50/80'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 uppercase">
                    Mejor valor
                  </span>
                )}
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">{plan.label}</span>
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    {plan.credits}
                    <span className="text-sm text-slate-600 font-sans font-medium"> créditos</span>
                  </div>
                  <span className="text-[11px] text-slate-600">≈ {plan.perCredit} / análisis</span>
                </div>

                <button
                  onClick={() => handleBuy(plan)}
                  disabled={isBuying}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white hover:scale-[1.02]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                  }`}
                >
                  {isBuying ? (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5" />
                  )}
                  {plan.price.toFixed(2).replace('.', ',')} €
                </button>
              </div>
            );
          })}
        </div>

        {/* Error de pago */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[11px] font-mono text-red-700">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Modo pruebas */}
        {!PAYMENTS_ENABLED && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-[11px] font-mono text-emerald-800">
            <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Modo pruebas:</strong> los créditos se añaden gratis sin cobrar. Cuando actives los pagos en
              <code className="text-emerald-700"> src/config.js </code>, se cobrarán con Stripe (Google Pay / Apple Pay).
            </span>
          </div>
        )}

        {/* Trust / note */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 font-mono">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Pago seguro</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-700" /> Créditos al instante</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-700" /> Sin suscripción</span>
        </div>

        <p className="text-center text-[10px] text-slate-500 font-mono">
          {PAYMENTS_ENABLED
            ? 'Pagos procesados por Stripe. Google Pay y Apple Pay disponibles según tu dispositivo.'
            : 'Fase de pruebas: compra simulada para probar el flujo completo.'}
        </p>
      </div>
    </div>
  );
}

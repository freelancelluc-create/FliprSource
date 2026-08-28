import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, TrendingUp, CheckCircle2, ChevronRight, Sparkles, Flame } from 'lucide-react';
import FlipScoreGauge from './FlipScoreGauge';

// Oportunidades de ejemplo que rotan (precios con pequeñas variaciones para sensación de "en vivo")
const BASE_OPPORTUNITIES = [
  { name: 'PS5 Slim', price: 250, verdict: 'COMPRALO', extra: '+75 €' },
  { name: 'iPhone 14 Pro', price: 420, verdict: 'COMPRALO', extra: '+90 €' },
  { name: 'MacBook Air M1', price: 480, verdict: 'COMPRALO', extra: '+110 €' },
  { name: 'Switch OLED', price: 200, verdict: 'NEGOCIA', extra: 'Oferta 170 €' },
  { name: 'AirPods Pro 2', price: 140, verdict: 'PASA', extra: 'Riesgo réplica' },
  { name: 'RTX 3070', price: 240, verdict: 'COMPRALO', extra: '+70 €' },
];

const VERDICT_STYLE = {
  COMPRALO: 'text-emerald-400 font-bold',
  NEGOCIA: 'text-amber-400 font-bold',
  PASA: 'text-red-400 font-bold',
};
const VERDICT_ICON = { COMPRALO: '🟢', NEGOCIA: '🟡', PASA: '🔴' };

export default function HeroSection({ onStartAnalyze, onSelectPreset }) {
  const [tick, setTick] = useState(0);

  // Cambia ligeramente los precios cada 4s para que el ticker parezca "en vivo"
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const items = BASE_OPPORTUNITIES.map((op, idx) => ({
    ...op,
    displayPrice: op.price + ((tick + idx) % 3 - 1) * 5,
  }));

  // Duplicamos para que el marquee haga bucle sin cortes
  const marqueeItems = [...items, ...items];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background Neon Grid Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Live Opportunities Ticker */}
      <div className="mb-10">
        <div className="w-full bg-[#0D1017] border-y border-gray-800/80 py-1.5 text-[10px] font-mono uppercase tracking-widest">
          <div className="mx-auto max-w-7xl px-4 flex items-center justify-center gap-2 text-emerald-400 font-bold">
            <Flame className="w-3.5 h-3.5" />
            Oportunidades detectadas ahora
          </div>
        </div>
        <div className="w-full bg-[#12151F] border-b border-gray-800/80 py-2 overflow-hidden text-xs font-mono">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-gray-400">
            {marqueeItems.map((op, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-white font-semibold">{op.name}</span>
                <span>· {op.displayPrice} € →</span>
                <span className={VERDICT_STYLE[op.verdict]}>
                  {VERDICT_ICON[op.verdict]} {op.verdict}
                </span>
                <span>· {op.extra}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text & Value Proposition */}
          <div className="lg:col-span-7 text-center md:text-left space-y-6">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistema de decisión para Wallapop & Vinted</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              ¿Lo compro o no? <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-400 bg-clip-text text-transparent">
                Toma la decisión correcta en 5 segundos.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-300 max-w-2xl mx-auto md:mx-0 font-normal leading-relaxed">
              Descubre al instante si ese producto de segunda mano es una verdadera oportunidad de reventa antes de gastar tu dinero.
            </p>

            {/* 3 Core Benefits Grid according to Master Brief */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-gray-800 bg-[#12151F]/90 p-4 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">1. Analizamos el mercado</h3>
                <p className="text-xs text-gray-400">Comparamos valor real de ventas recientes en plataformas.</p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#12151F]/90 p-4 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">2. Calculamos tu beneficio</h3>
                <p className="text-xs text-gray-400">Restamos comisiones, envíos y margen neto libre.</p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#12151F]/90 p-4 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">3. Decisión inequívoca</h3>
                <p className="text-xs text-gray-400">Recibes CÓMPRALO, NEGOCIA o PASA al instante.</p>
              </div>
            </div>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center sm:items-center gap-4">
              <button
                onClick={onStartAnalyze}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 py-4 text-base font-bold text-black shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <span>Analizar producto</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>3 análisis gratis cada mes • Sin registro previo</span>
              </div>
            </div>

          </div>

          {/* Right Column: Mobile Device Mockup with Live Example Analysis (Master Brief Requirement) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-[2.5rem] border-4 border-gray-800 bg-[#090A0F] p-4 shadow-2xl shadow-emerald-500/10">
              
              {/* Phone Notch */}
              <div className="mx-auto h-4 w-28 rounded-full bg-gray-900 mb-4" />

              {/* Sample Analysis Header inside mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="text-[11px] font-mono font-bold text-gray-400 uppercase">
                    EJEMPLO EN VIVO
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                    Wallapop • 94% Confianza
                  </span>
                </div>

                {/* Product Thumbnail & Title */}
                <div className="flex items-center gap-3 bg-[#12151F] p-3 rounded-xl border border-gray-800">
                  <img
                    src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&auto=format&fit=crop&q=80"
                    alt="PlayStation 5 Slim"
                    className="h-14 w-14 rounded-lg object-cover border border-gray-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">PlayStation 5 Slim (2 Mandos)</h4>
                    <p className="text-[11px] text-gray-400 font-mono">Anunciado: <span className="text-white font-bold">250 €</span></p>
                    <span className="inline-block mt-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      Excelente oportunidad
                    </span>
                  </div>
                </div>

                {/* Dominant Verdict & Gauge */}
                <div className="bg-gradient-to-b from-[#12151F] to-[#161B29] p-4 rounded-2xl border border-emerald-500/30 text-center space-y-3">
                  
                  {/* Verdict Badge */}
                  <div className="inline-block rounded-xl bg-emerald-500 text-black px-6 py-2 text-xl font-black tracking-wide shadow-lg shadow-emerald-500/30 font-mono">
                    ■ CÓMPRALO
                  </div>

                  {/* Circular Score Gauge */}
                  <FlipScoreGauge score={75} verdict="COMPRALO" size="normal" />

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-gray-800">
                    <div className="bg-[#090A0F]/80 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Beneficio a 250 €</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">+55 € a +85 €</span>
                    </div>

                    <div className="bg-[#090A0F]/80 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Margen Neto</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">20% – 31%</span>
                    </div>

                    <div className="bg-[#090A0F]/80 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Valor Mercado</span>
                      <span className="text-xs font-bold text-gray-200 font-mono">330 – 370 €</span>
                    </div>

                    <div className="bg-[#090A0F]/80 p-2.5 rounded-lg border border-gray-800">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Tiempo Venta</span>
                      <span className="text-xs font-bold text-gray-200 font-mono">3–7 días</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Demo Picker Button */}
                <button
                  onClick={() => onSelectPreset("ps5-slim")}
                  className="w-full rounded-xl bg-gray-800/80 hover:bg-gray-700 p-2.5 text-xs font-bold text-white flex items-center justify-center gap-2 border border-gray-700 transition-colors"
                >
                  <span>Probar este análisis en la app</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

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
  COMPRALO: 'text-emerald-700 font-bold',
  NEGOCIA: 'text-amber-700 font-bold',
  PASA: 'text-red-600 font-bold',
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
    <section className="relative overflow-hidden pb-16 md:pb-24">
      {/* Background Neon Grid Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Live Opportunities Ticker */}
      <div className="mb-10">
        <div className="w-full bg-slate-50 border-b border-slate-200 py-1.5 text-[10px] font-mono uppercase tracking-widest">
          <div className="mx-auto max-w-7xl px-4 flex items-center justify-center gap-2 text-emerald-700 font-bold">
            <Flame className="w-3.5 h-3.5" />
            Oportunidades detectadas ahora
          </div>
        </div>
        <div className="w-full bg-white border-b border-slate-200 py-2 overflow-hidden text-xs font-mono">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-slate-600">
            {marqueeItems.map((op, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-slate-900 font-semibold">{op.name}</span>
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
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistema de decisión para Wallapop & Vinted</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              ¿Lo compro o no? <br />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Toma la decisión correcta en 5 segundos.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-700 max-w-2xl mx-auto md:mx-0 font-normal leading-relaxed">
              Descubre al instante si ese producto de segunda mano es una verdadera oportunidad de reventa antes de gastar tu dinero.
            </p>

            {/* 3 Core Benefits Grid according to Master Brief */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1. Analizamos el mercado</h3>
                <p className="text-xs text-slate-600">Comparamos valor real de ventas recientes en plataformas.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">2. Calculamos tu beneficio</h3>
                <p className="text-xs text-slate-600">Restamos comisiones, envíos y margen neto libre.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">3. Decisión inequívoca</h3>
                <p className="text-xs text-slate-600">Recibes CÓMPRALO, NEGOCIA o PASA al instante.</p>
              </div>
            </div>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center sm:items-center gap-4">
              <button
                onClick={onStartAnalyze}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <span>Analizar producto gratis</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>3 análisis gratis al empezar • Sin registro previo</span>
              </div>
            </div>

            {/* Secondary: enlace a contenido SEO / viral */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
              <a
                href="/oportunidad-del-dia"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Ver la oportunidad del día</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            {/* Stats / Social Proof Banner */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
              <div className="text-center md:text-left">
                <div className="text-lg sm:text-xl font-black font-mono text-emerald-700">+14.200</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">Análisis realizados</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-lg sm:text-xl font-black font-mono text-slate-900">45 €</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">Margen medio detectado</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-lg sm:text-xl font-black font-mono text-emerald-700">100%</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">Neutral e independiente</div>
              </div>
            </div>

          </div>

          {/* Right Column: Mobile Device Mockup with Live Example Analysis */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-[2.5rem] border-4 border-slate-200 bg-slate-50 p-4 shadow-2xl shadow-emerald-500/10">
              
              {/* Phone Notch */}
              <div className="mx-auto h-4 w-28 rounded-full bg-slate-200 mb-4" />

              {/* Sample Analysis Header inside mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-mono font-bold text-slate-600 uppercase">
                    EJEMPLO EN VIVO
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                    Wallapop • 94% Confianza
                  </span>
                </div>

                {/* Product Thumbnail & Title */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&auto=format&fit=crop&q=80"
                    alt="PlayStation 5 Slim"
                    className="h-14 w-14 rounded-lg object-cover border border-slate-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">PlayStation 5 Slim (2 Mandos)</h4>
                    <p className="text-[11px] text-slate-600 font-mono">Anunciado: <span className="text-slate-900 font-bold">250 €</span></p>
                    <span className="inline-block mt-1 text-[9px] text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      Excelente oportunidad
                    </span>
                  </div>
                </div>

                {/* Dominant Verdict & Gauge */}
                <div className="bg-gradient-to-b from-white to-slate-100 p-4 rounded-2xl border border-emerald-500/30 text-center space-y-3">
                  
                  {/* Verdict Badge */}
                  <div className="inline-block rounded-xl bg-emerald-700 text-white px-6 py-2 text-xl font-black tracking-wide shadow-lg shadow-emerald-500/30 font-mono">
                    ■ CÓMPRALO
                  </div>

                  {/* Circular Score Gauge */}
                  <FlipScoreGauge score={75} verdict="COMPRALO" size="normal" />

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-200">
                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-mono uppercase block">Beneficio a 250 €</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">+55 € a +85 €</span>
                    </div>

                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-mono uppercase block">Margen Neto</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">20% – 31%</span>
                    </div>

                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-mono uppercase block">Valor Mercado</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">330 – 370 €</span>
                    </div>

                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-mono uppercase block">Tiempo Venta</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">3–7 días</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Demo Picker Button */}
                <button
                  onClick={() => onSelectPreset("ps5-slim")}
                  className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 p-2.5 text-xs font-bold text-slate-900 flex items-center justify-center gap-2 border border-slate-300 transition-colors"
                >
                  <span>Probar este análisis en la app</span>
                  <ChevronRight className="w-4 h-4 text-emerald-700" />
                </button>

              </div>
            </div>
          </div>

        </div>

        {/* Transparencia & Seguridad: ¿Por qué FLIPR es 100% de fiar? */}
        <div className="mt-16 sm:mt-20 pt-12 border-t border-slate-200 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de Privacidad & Fiabilidad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ¿Cómo sabemos que el precio es justo y no una estafa?
            </h2>
            <p className="text-sm text-slate-600">
              FLIPR es un asistente independiente creado para que nunca compres a ciegas ni pagues de más.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Sin contraseñas ni accesos */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold">
                🔒
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Privado y Seguro</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nunca te pediremos tus contraseñas ni acceso a tu cuenta de Wallapop o Vinted. Solo analizamos los datos públicos del anuncio (precio, fotos y descripción).
              </p>
            </div>

            {/* Card 2: Datos de mercado reales */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold">
                📊
              </div>
              <h3 className="text-base font-bold text-slate-900">Ventas Reales, no Precios Inflados</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comparamos contra miles de transacciones de compraventa cerradas. Detectamos si un vendedor pide demasiado o si el producto tiene riesgo de réplica o fallo común.
              </p>
            </div>

            {/* Card 3: Algoritmo neutral */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold">
                ⚖️
              </div>
              <h3 className="text-base font-bold text-slate-900">Algoritmo Neutral e Independiente</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No vendemos productos ni cobramos comisión a los vendedores. Nuestro único trabajo es darte un veredicto matemático objetivo antes de que gastes tu dinero.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-12 mt-16 text-xs text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white font-black">
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">FLIPR</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                SCORE™
              </span>
            </div>
            <p className="text-slate-600 text-xs max-w-md">
              Herramienta independiente de valoración y cálculo de precio justo para Wallapop, Vinted y Milanuncios.
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>100% Privado: sin acceso a tus contraseñas ni cuentas personales.</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 font-mono text-center md:text-right">
            <span className="text-[10px] uppercase text-emerald-700 font-bold block tracking-wider">Compromiso de Fiabilidad</span>
            <span className="text-sm font-black text-slate-900">«DATOS DE MERCADO REALES. CERO HUMO.»</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-[11px] font-mono">
          <p>© 2026 FLIPR Technologies Inc. Todos los derechos reservados.</p>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button onClick={() => onNavigate('hero')} className="hover:text-emerald-700">Inicio</button>
            <span>•</span>
            <button onClick={() => onNavigate('analyze')} className="hover:text-emerald-700">Analizar</button>
            <span>•</span>
            <button onClick={() => onNavigate('calculadora')} className="hover:text-emerald-700">Calculadora</button>
            <span>•</span>
            <a href="/extension" className="hover:text-emerald-700 text-emerald-700 font-bold">Extensión</a>
            <span>•</span>
            <a href="/herramienta-reventa" className="hover:text-emerald-700">Reventa</a>
            <span>•</span>
            <a href="/blog/guia-reventa-wallapop-flipping" className="hover:text-emerald-700">Guía Blog</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

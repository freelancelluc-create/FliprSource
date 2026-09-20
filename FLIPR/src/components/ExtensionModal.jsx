import React, { useState } from 'react';
import { X, Globe, Download, CheckCircle2, ArrowRight, Zap, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function ExtensionModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    trackEvent('extension_download_clicked', { source: 'in_app_modal' });
    window.open('/extension', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-[#0C0F17] p-6 sm:p-8 shadow-2xl space-y-6 text-white overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Globe className="w-3.5 h-3.5" />
              Extensión para Chrome, Brave & Edge
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tasa productos con 1 clic sin salir de Wallapop ni Vinted
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed">
          Navega por Wallapop y Vinted como siempre. Un botón flotante de <span className="text-emerald-400 font-semibold font-mono">FLIPR</span> aparecerá automáticamente en cada anuncio con la tasación de mercado, veredicto rápido y enlace directo a la IA.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#121622] border border-gray-800/80 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tasación In-Page</h4>
            <p className="text-xs text-gray-400">
              Muestra precio medio de mercado y veredicto sin cambiar de pestaña.
            </p>
          </div>

          <div className="rounded-2xl bg-[#121622] border border-gray-800/80 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🛡️
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Segura</h4>
            <p className="text-xs text-gray-400">
              No pide contraseñas, no accede a mensajes privados ni almacena datos personales.
            </p>
          </div>

          <div className="rounded-2xl bg-[#121622] border border-gray-800/80 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🚀
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Negociación IA</h4>
            <p className="text-xs text-gray-400">
              Pasa el anuncio a FLIPR en un clic para generar el mensaje de contraoferta.
            </p>
          </div>
        </div>

        {/* Step by step install guide */}
        <div className="rounded-2xl bg-[#080A10] border border-gray-800 p-4 space-y-3">
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
            📋 Instalación en 30 segundos (Modo Desarrollador):
          </span>
          <ol className="text-xs text-gray-300 space-y-2 font-mono list-decimal list-inside">
            <li>Abre <span className="text-white bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">chrome://extensions</span> en tu navegador.</li>
            <li>Activa el interruptor <strong className="text-emerald-400">«Modo de desarrollador»</strong> arriba a la derecha.</li>
            <li>Haz clic en <strong className="text-emerald-400">«Cargar descomprimida»</strong> y selecciona la carpeta <code className="text-white bg-gray-900 px-1 rounded">extension</code> de FLIPR.</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href="/extension"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownload}
            className="w-full sm:w-auto flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 px-6 font-bold text-black shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Download className="w-4 h-4" />
            Ir a la página de descarga y guía completa
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl border border-gray-800 bg-gray-900/60 px-6 py-3.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

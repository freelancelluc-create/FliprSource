import React from 'react';
import { TrendingUp, ShieldCheck, Zap, Bookmark, History, User, Search } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount = 0, favoritesCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#090A0F]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('hero')}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black font-black shadow-lg shadow-emerald-500/20">
            <Zap className="h-6 w-6 fill-black text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-white font-mono">
                FLIPR
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 font-mono">
                SCORE™
              </span>
            </div>
            <p className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">¿LO COMPRO O NO?</p>
          </div>
        </div>

        {/* Center Nav Links - Responsive */}
        <nav className="hidden md:flex items-center gap-1 bg-[#12151F] p-1.5 rounded-full border border-gray-800">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              activeTab === 'hero'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Inicio
          </button>
          
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'analyze' || activeTab === 'result'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Analizar producto
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial
            {historyCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-400 font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Favoritos
            {favoritesCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-400 font-bold">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side: Free Credits Indicator & CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[#12151F] border border-gray-800 px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-gray-300">Créditos:</span>
            <span className="font-bold text-emerald-400 font-mono">3/3 gratis</span>
          </div>

          <button
            onClick={() => setActiveTab('analyze')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="h-4 w-4 fill-black text-black" />
            <span className="hidden xs:inline">Analizar gratis</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="flex md:hidden border-t border-gray-800/80 bg-[#090A0F] py-2 px-3 justify-around items-center text-xs">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
            activeTab === 'hero' ? 'text-emerald-400 font-bold' : 'text-gray-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
            activeTab === 'analyze' || activeTab === 'result' ? 'text-emerald-400 font-bold' : 'text-gray-400'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Analizar</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
            activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-gray-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
            activeTab === 'favorites' ? 'text-emerald-400 font-bold' : 'text-gray-400'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Favoritos</span>
        </button>
      </div>
    </header>
  );
}

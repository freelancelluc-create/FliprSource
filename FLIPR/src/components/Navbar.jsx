import React from 'react';
import { TrendingUp, ShieldCheck, Zap, Bookmark, History, User, Search, Coins, LayoutDashboard } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount = 0, favoritesCount = 0, credits = 3, onOpenUpsell, user = null, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#090A0F]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 py-3 sm:px-6">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('hero')}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90 shrink-0"
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
            <p className="hidden lg:block text-[10px] font-medium text-gray-400 tracking-wide uppercase">¿LO COMPRO O NO?</p>
          </div>
        </div>

        {/* Center Nav Links - Responsive */}
        <nav className="hidden md:flex items-center gap-0.5 bg-[#12151F] p-1.5 rounded-full border border-gray-800">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'hero'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Inicio
          </button>
          
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
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

          <button
            onClick={() => setActiveTab('panel')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'panel'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Panel
          </button>
        </nav>

        {/* Right side: Auth + Free Credits Indicator & CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Auth */}
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[#12151F] border border-gray-800 px-2.5 py-1.5 text-xs" title={user.email}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                  {(user.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[90px] truncate font-bold text-white">{user.name}</span>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-400 font-mono px-0.5" title="Cerrar sesión">×</button>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-[#12151F] border border-gray-800 text-emerald-400"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-black">
                  {(user.name || '?').charAt(0).toUpperCase()}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#12151F] border border-gray-800 px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Entrar
              </button>
              <button
                onClick={onOpenAuth}
                title="Entrar / Crear cuenta"
                className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-[#12151F] border border-gray-800 text-gray-300 hover:text-white"
              >
                <User className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#12151F] border border-gray-800 px-2 sm:px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline font-medium text-gray-300">Créditos:</span>
            <span className={`font-bold font-mono ${credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{credits}</span>
            <button
              onClick={onOpenUpsell}
              aria-label="Comprar créditos"
              className="ml-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/25"
            >
              <span className="sm:hidden">+</span>
              <span className="hidden sm:inline">+ Comprar</span>
            </button>
          </div>

          <button
            onClick={() => (credits > 0 ? setActiveTab('analyze') : onOpenUpsell())}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 sm:px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/35"
          >
            <Zap className="h-4 w-4 fill-black text-black" />
            <span className="hidden sm:inline">{credits > 0 ? 'Analizar gratis' : 'Comprar créditos'}</span>
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

        <button
          onClick={() => setActiveTab('panel')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
            activeTab === 'panel' ? 'text-emerald-400 font-bold' : 'text-gray-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Panel</span>
        </button>

        <button
          onClick={onOpenUpsell}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-gray-400 hover:text-white"
        >
          <Coins className={`w-4 h-4 ${credits > 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="flex items-center gap-1">
            Créditos
            <b className={`font-mono ${credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{credits}</b>
          </span>
        </button>
      </div>
    </header>
  );
}

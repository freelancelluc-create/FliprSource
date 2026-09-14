import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Zap,
  Bookmark,
  History,
  User,
  Search,
  Coins,
  LayoutDashboard,
  Calculator,
  Columns3,
  ChevronDown,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  historyCount = 0,
  favoritesCount = 0,
  credits = 3,
  onOpenUpsell,
  user = null,
  onOpenAuth,
  onLogout
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isSecondaryActive = ['history', 'favorites', 'panel'].includes(activeTab);
  const hasSecondaryBadge = historyCount > 0 || favoritesCount > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#090A0F]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 sm:px-6 sm:py-3">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => { setActiveTab('hero'); setDropdownOpen(false); setMobileMenuOpen(false); }}
          className="flex cursor-pointer items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black font-black shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 fill-black text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono">
                FLIPR
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400 border border-emerald-500/20 font-mono">
                SCORE™
              </span>
            </div>
            <p className="hidden 2xl:block text-[10px] font-medium text-gray-400 tracking-wide uppercase">¿LO COMPRO O NO?</p>
          </div>
        </div>

        {/* Center Nav Links - Responsive Desktop & Laptop */}
        <nav className="hidden md:flex items-center gap-0.5 bg-[#12151F] p-1 rounded-full border border-gray-800 shrink-0">
          <button
            onClick={() => { setActiveTab('hero'); setDropdownOpen(false); }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'hero'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Inicio
          </button>
          
          <button
            onClick={() => { setActiveTab('analyze'); setDropdownOpen(false); }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'analyze' || activeTab === 'result'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Analizar</span>
            <span className="hidden 2xl:inline">producto</span>
          </button>

          <button
            onClick={() => { setActiveTab('calculadora'); setDropdownOpen(false); }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'calculadora'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora</span>
          </button>

          <button
            onClick={() => { setActiveTab('comparar'); setDropdownOpen(false); }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'comparar'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Comparar</span>
          </button>

          {/* Shown directly on xl+ (>=1280px), collapsed in dropdown on smaller laptop/tablet */}
          <button
            onClick={() => { setActiveTab('history'); setDropdownOpen(false); }}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial</span>
            {historyCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'history' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('favorites'); setDropdownOpen(false); }}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'favorites'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Favoritos</span>
            {favoritesCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'favorites' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Shown directly on 2xl+ (>=1536px), collapsed in dropdown on standard laptops */}
          <button
            onClick={() => { setActiveTab('panel'); setDropdownOpen(false); }}
            className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'panel'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Panel</span>
          </button>

          <a
            href="/extension"
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Extensión</span>
          </a>

          {/* Sleek "Más" dropdown on laptops and tablets */}
          <div className="relative 2xl:hidden" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSecondaryActive
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : dropdownOpen
                  ? 'text-white bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              aria-label="Más opciones"
              aria-expanded={dropdownOpen}
            >
              <span>Más</span>
              {hasSecondaryBadge && !isSecondaryActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl bg-[#12151F] border border-gray-800 shadow-2xl shadow-black/80 p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-0.5">
                {/* Historial (only in dropdown if < xl) */}
                <button
                  onClick={() => { setActiveTab('history'); setDropdownOpen(false); }}
                  className={`xl:hidden w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Historial
                  </span>
                  {historyCount > 0 && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-400 font-bold">
                      {historyCount}
                    </span>
                  )}
                </button>

                {/* Favoritos (only in dropdown if < xl) */}
                <button
                  onClick={() => { setActiveTab('favorites'); setDropdownOpen(false); }}
                  className={`xl:hidden w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'favorites' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    Favoritos
                  </span>
                  {favoritesCount > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-400 font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Panel */}
                <button
                  onClick={() => { setActiveTab('panel'); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'panel' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>Panel de control</span>
                </button>

                {/* Extensión */}
                <a
                  href="/extension"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/20 mt-1"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Extensión Chrome
                  </span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                    NUEVO
                  </span>
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Right side: Auth + Free Credits Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Auth Button */}
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#12151F] border border-gray-800 px-2.5 py-1.5 text-xs shrink-0" title={user.email}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                  {(user.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[85px] truncate font-bold text-white">{user.name}</span>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-400 font-mono px-0.5 ml-0.5" title="Cerrar sesión">×</button>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="sm:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-[#12151F] border border-gray-800 text-emerald-400 shrink-0"
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
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#12151F] border border-gray-800 px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-700 transition-colors shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
              <button
                onClick={onOpenAuth}
                title="Entrar / Crear cuenta"
                className="sm:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-[#12151F] border border-gray-800 text-gray-300 hover:text-white shrink-0"
              >
                <User className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Credits Indicator (Protected from clipping) */}
          <div 
            onClick={onOpenUpsell}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenUpsell(); }}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#12151F] border border-gray-800 hover:border-emerald-500/40 hover:bg-[#161a27] px-2 sm:px-2.5 py-1.5 text-xs transition-all cursor-pointer select-none group shrink-0 shadow-sm"
            title="Tus créditos disponibles — Haz clic para recargar o comprar más"
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${credits > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="hidden sm:inline font-medium text-gray-300 text-xs">Créditos:</span>
            <span className={`font-bold font-mono text-xs ${credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {credits}
            </span>
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 group-hover:bg-emerald-500/30 group-hover:text-emerald-300 transition-colors">
              <span className="sm:hidden">+</span>
              <span className="hidden sm:inline">+ Comprar</span>
            </span>
          </div>

          {/* Extra CTA: only on extra wide screens (2xl:flex) so it never pushes the credits off screen on laptops */}
          <button
            onClick={() => (credits > 0 ? setActiveTab('analyze') : onOpenUpsell())}
            className="hidden 2xl:flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-3.5 py-1.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Zap className="h-3.5 w-3.5 fill-black text-black" />
            <span>{credits > 0 ? 'Analizar gratis' : 'Comprar créditos'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation (< md) */}
      <div className="flex md:hidden border-t border-gray-800/80 bg-[#090A0F] py-1.5 px-2 justify-around items-center text-xs">
        <button
          onClick={() => { setActiveTab('hero'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'hero' ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          onClick={() => { setActiveTab('analyze'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'analyze' || activeTab === 'result' ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px]">Analizar</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors relative ${
            activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[10px]">Historial</span>
          {historyCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors relative ${
            activeTab === 'favorites' ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[10px]">Favoritos</span>
          {favoritesCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors relative ${
            mobileMenuOpen || ['calculadora', 'comparar', 'panel'].includes(activeTab)
              ? 'text-emerald-400 font-bold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Herramientas</span>
        </button>
      </div>

      {/* Mobile Drawer/Modal for Extra Tools */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div 
            ref={mobileMenuRef}
            className="w-full bg-[#12151F] border-t border-gray-800 rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Más herramientas y opciones
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white bg-gray-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { setActiveTab('calculadora'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  activeTab === 'calculadora'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-gray-800 bg-[#090A0F] text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">Calculadora</span>
                  <span className="text-[10px] text-gray-400">Precio de reventa</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('comparar'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  activeTab === 'comparar'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-gray-800 bg-[#090A0F] text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Columns3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">Comparador</span>
                  <span className="text-[10px] text-gray-400">Compara anuncios</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('panel'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  activeTab === 'panel'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-gray-800 bg-[#090A0F] text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">Panel flipper</span>
                  <span className="text-[10px] text-gray-400">Estadísticas y alertas</span>
                </div>
              </button>

              <a
                href="/extension"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-left hover:bg-emerald-500/10 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-400">Extensión</span>
                  <span className="text-[10px] text-gray-400">Wallapop & Vinted</span>
                </div>
              </a>
            </div>

            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-300">Tienes <strong className="text-white">{credits}</strong> créditos</span>
              </div>
              <button
                onClick={() => { onOpenUpsell(); setMobileMenuOpen(false); }}
                className="rounded-xl bg-emerald-500 text-black px-3.5 py-1.5 text-xs font-bold shadow-md hover:bg-emerald-400 transition-colors"
              >
                + Comprar créditos
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

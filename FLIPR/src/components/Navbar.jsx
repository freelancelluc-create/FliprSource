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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 sm:px-6 sm:py-3">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => { setActiveTab('hero'); setDropdownOpen(false); setMobileMenuOpen(false); }}
          className="flex cursor-pointer items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-black shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 fill-white text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
                FLIPR
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 border border-emerald-500/20 font-mono">
                SCORE™
              </span>
            </div>
            <p className="hidden 2xl:block text-[10px] font-medium text-slate-600 tracking-wide uppercase">¿LO COMPRO O NO?</p>
          </div>
        </div>

        {/* Center Nav Links - Responsive Desktop & Laptop */}
        <nav className="hidden md:flex items-center gap-0.5 bg-white p-1 rounded-full border border-slate-200 shrink-0">
          <button
            onClick={() => { setActiveTab('hero'); setDropdownOpen(false); }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'hero'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Inicio
          </button>
          
          <button
            onClick={() => { setActiveTab('analyze'); setDropdownOpen(false); }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'analyze' || activeTab === 'result'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Analizar</span>
            <span className="hidden 2xl:inline">producto</span>
          </button>

          {/* Shown on lg+ (>=1024px) */}
          <button
            onClick={() => { setActiveTab('calculadora'); setDropdownOpen(false); }}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'calculadora'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora</span>
          </button>

          <button
            onClick={() => { setActiveTab('comparar'); setDropdownOpen(false); }}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeTab === 'comparar'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Comparar</span>
          </button>

          {/* Shown on xl+ (>=1280px) */}
          {/* Historial, Favoritos y Panel viven solo en "Más": son herramientas de
              cuenta, no la acción principal, y no deben competir con Analizar. */}

          <a
            href="/extension"
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
          >
            <Zap className="w-3 h-3 text-emerald-700" />
            <span>Extensión</span>
          </a>

          {/* Sleek "Más" dropdown on screens below 2xl */}
          <div className="relative 2xl:hidden" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSecondaryActive
                  ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20'
                  : dropdownOpen
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Más opciones"
              aria-expanded={dropdownOpen}
            >
              <span>Más</span>
              {hasSecondaryBadge && !isSecondaryActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              )}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-0.5">
                {/* Calculadora (only in dropdown if < lg) */}
                <button
                  onClick={() => { setActiveTab('calculadora'); setDropdownOpen(false); }}
                  className={`lg:hidden w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'calculadora' ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  <span>Calculadora</span>
                </button>

                {/* Comparador (only in dropdown if < lg) */}
                <button
                  onClick={() => { setActiveTab('comparar'); setDropdownOpen(false); }}
                  className={`lg:hidden w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'comparar' ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Columns3 className="w-4 h-4 text-emerald-700" />
                  <span>Comparar</span>
                </button>

                {/* Historial (siempre en el menú "Más", ver nota arriba) */}
                <button
                  onClick={() => { setActiveTab('history'); setDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-700" />
                    Historial
                  </span>
                  {historyCount > 0 && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-700 font-bold">
                      {historyCount}
                    </span>
                  )}
                </button>

                {/* Favoritos (siempre en el menú "Más", ver nota arriba) */}
                <button
                  onClick={() => { setActiveTab('favorites'); setDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'favorites' ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-700" />
                    Favoritos
                  </span>
                  {favoritesCount > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-700 font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Panel */}
                <button
                  onClick={() => { setActiveTab('panel'); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'panel' ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  <span>Panel de control</span>
                </button>

                {/* Extensión */}
                <a
                  href="/extension"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-500/10 transition-all border border-emerald-500/20 mt-1"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-700" />
                    Extensión Chrome
                  </span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
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
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-xs shrink-0" title={user.email}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-black">
                  {(user.name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[70px] sm:max-w-[85px] truncate font-bold text-slate-900">{user.name}</span>
                <button onClick={onLogout} className="text-slate-600 hover:text-red-600 font-mono px-0.5 ml-0.5" title="Cerrar sesión">×</button>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="sm:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-emerald-700 shrink-0"
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
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
              <button
                onClick={onOpenAuth}
                title="Entrar / Crear cuenta"
                className="sm:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shrink-0"
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
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500/40 hover:bg-slate-100 px-2 sm:px-2.5 py-1.5 text-xs transition-all cursor-pointer select-none group shrink-0 shadow-sm"
            title="Tus créditos disponibles — Haz clic para recargar o comprar más"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="hidden lg:inline font-medium text-slate-700 text-xs">Créditos:</span>
            <span className={`font-bold font-mono text-xs ${credits > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {credits}
            </span>
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 group-hover:bg-emerald-500/30 group-hover:text-emerald-800 transition-colors">
              <span className="sm:hidden">+</span>
              <span className="hidden sm:inline">+ Comprar</span>
            </span>
          </div>

          {/* CTA principal: visible desde lg (portátil) para que siempre haya un
              botón de acción claro en el navbar, no solo en pantallas muy anchas */}
          <button
            onClick={() => (credits > 0 ? setActiveTab('analyze') : onOpenUpsell())}
            className="hidden lg:flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Zap className="h-3.5 w-3.5 fill-white text-white" />
            <span>{credits > 0 ? 'Analizar gratis' : 'Comprar créditos'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation (< md) */}
      <div className="flex md:hidden border-t border-slate-200 bg-slate-50 py-1.5 px-2 justify-around items-center text-xs">
        <button
          onClick={() => { setActiveTab('hero'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'hero' ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          onClick={() => { setActiveTab('analyze'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors ${
            activeTab === 'analyze' || activeTab === 'result' ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px]">Analizar</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors relative ${
            activeTab === 'history' ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[10px]">Historial</span>
          {historyCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-colors relative ${
            activeTab === 'favorites' ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-800'
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
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Herramientas</span>
        </button>
      </div>

      {/* Mobile Drawer/Modal for Extra Tools */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div 
            ref={mobileMenuRef}
            className="w-full bg-white border-t border-slate-200 rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Más herramientas y opciones
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { setActiveTab('calculadora'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  activeTab === 'calculadora'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Calculadora</span>
                  <span className="text-[10px] text-slate-600">Precio de reventa</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('comparar'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  activeTab === 'comparar'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 shrink-0">
                  <Columns3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Comparador</span>
                  <span className="text-[10px] text-slate-600">Compara anuncios</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('panel'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  activeTab === 'panel'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 shrink-0">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Panel flipper</span>
                  <span className="text-[10px] text-slate-600">Estadísticas y alertas</span>
                </div>
              </button>

              <a
                href="/extension"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-left hover:bg-emerald-500/10 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-700">Extensión</span>
                  <span className="text-[10px] text-slate-600">Wallapop & Vinted</span>
                </div>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-700" />
                <span className="text-xs text-slate-700">Tienes <strong className="text-slate-900">{credits}</strong> créditos</span>
              </div>
              <button
                onClick={() => { onOpenUpsell(); setMobileMenuOpen(false); }}
                className="rounded-xl bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-md hover:bg-emerald-800 transition-colors"
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

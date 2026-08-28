import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AnalyzeForm from './components/AnalyzeForm';
import ResultCard from './components/ResultCard';
import HistoryView from './components/HistoryView';
import ActionNegotiateModal from './components/ActionNegotiateModal';
import ActionListingModal from './components/ActionListingModal';
import Footer from './components/Footer';
import UpsellModal from './components/UpsellModal';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import { PRESET_PRODUCTS } from './data/presetProducts';
import { findMarketData } from './data/marketCatalog';
import { calculateFlipScore } from './utils/flipCalculator';
import { getCredits, spendCredit, hasCredits, addCredits, setCredits as persistCredits } from './utils/credits';
import { fetchMe, logout, loadUserData, saveUserData, getStoredUser } from './auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('hero'); // hero | analyze | result | history | favorites
  const [currentResult, setCurrentResult] = useState(PRESET_PRODUCTS[0]);
  const [initialPresetForForm, setInitialPresetForForm] = useState(null);

  // Cuenta de usuario
  const [user, setUser] = useState(() => getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Monetización: créditos
  const [credits, setCredits] = useState(getCredits());
  const [upsellOpen, setUpsellOpen] = useState(false);

  // Persistent History & Favorites state
  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('flipr_history');
      return saved ? JSON.parse(saved) : PRESET_PRODUCTS.slice(0, 3);
    } catch (e) {
      return PRESET_PRODUCTS.slice(0, 3);
    }
  });

  const [favoritesList, setFavoritesList] = useState(() => {
    try {
      const saved = localStorage.getItem('flipr_favorites');
      return saved ? JSON.parse(saved) : [PRESET_PRODUCTS[0]];
    } catch (e) {
      return [PRESET_PRODUCTS[0]];
    }
  });

  // Seguimiento / watchlist
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('flipr_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active Modals
  const [negotiateModalResult, setNegotiateModalResult] = useState(null);
  const [listingModalResult, setListingModalResult] = useState(null);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flipr_history', JSON.stringify(historyList));
    } catch (e) {}
  }, [historyList]);

  useEffect(() => {
    try {
      localStorage.setItem('flipr_favorites', JSON.stringify(favoritesList));
    } catch (e) {}
  }, [favoritesList]);

  useEffect(() => {
    try {
      localStorage.setItem('flipr_watchlist', JSON.stringify(watchlist));
    } catch (e) {}
  }, [watchlist]);

  // Comprobar sesión al cargar la app y cargar el saldo del servidor
  useEffect(() => {
    (async () => {
      const me = await fetchMe();
      if (me) setUser(me);
      // El saldo del servidor es la fuente estable: lo aplicamos (sin reducir
      // nunca el saldo local por debajo del que ya había en este dispositivo).
      try {
        const server = await loadUserData();
        if (server && Number.isFinite(Number(server.credits)) && Number(server.credits) >= 0) {
          const next = Math.max(Number(server.credits), getCredits());
          persistCredits(next);
          setCredits(getCredits());
        }
      } catch (e) {}
    })();
  }, []);

  // Tras iniciar sesión, cargar los datos del usuario desde el servidor
  const handleAuthSuccess = async (u) => {
    setUser(u);
    try {
      const server = await loadUserData();
      if (server) {
        if (Array.isArray(server.history) && server.history.length > 0) setHistoryList(server.history);
        if (Array.isArray(server.favorites) && server.favorites.length > 0) setFavoritesList(server.favorites);
        if (Array.isArray(server.watchlist)) setWatchlist(server.watchlist);
        if (Number.isFinite(Number(server.credits))) {
          persistCredits(Number(server.credits));
          setCredits(getCredits());
        }
      }
      // Si el servidor no tiene datos, el efecto de sync subirá los locales (migración)
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  // Sincronizar datos con el servidor (solo con sesión activa, con pequeño retardo)
  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      saveUserData(historyList, favoritesList, credits, watchlist).catch(() => {});
    }, 800);
    return () => clearTimeout(id);
  }, [user, historyList, favoritesList, credits, watchlist]);

  // Confirmar pago de Stripe al volver del checkout (?session_id=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;
    (async () => {
      try {
        const resp = await fetch('/api/confirm?session_id=' + encodeURIComponent(sessionId));
        const data = await resp.json().catch(() => null);
        if (data && data.ok && data.credits) {
          addCredits(data.credits);
          setCredits(getCredits());
        }
      } catch (e) {
        console.error(e);
      } finally {
        window.history.replaceState({}, '', window.location.pathname);
      }
    })();
  }, []);

  // Handler when user triggers an analysis
  const handleAnalyze = (inputData) => {
    // Gate de créditos: sin saldo no se analiza; se abre el upsell.
    if (!hasCredits()) {
      setUpsellOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    spendCredit();
    setCredits(getCredits());

    let resultObj;
    if (inputData.id) {
      // It's a full preset object
      resultObj = inputData;
    } else {
      // Custom user input calculation
      const marketData = findMarketData(inputData.customTitle);
      resultObj = calculateFlipScore({
        title: inputData.customTitle,
        buyPrice: inputData.price,
        condition: inputData.condition,
        marketplace: inputData.marketplace,
        category: "Tecnología",
        accessories: inputData.accessories,
        marketData,
        km: inputData.km,
        description: inputData.description || ""
      });
      resultObj.imageUrl = inputData.imageUrl;
      resultObj.marketDataSource = marketData ? 'catalog' : 'heuristic';
    }

    setCurrentResult(resultObj);
    
    // Add to history if not already top item
    if (!historyList.some(item => item.id === resultObj.id)) {
      setHistoryList([resultObj, ...historyList]);
    }
    
    setActiveTab('result');
  };

  // Handler when selecting demo preset from Hero
  const handleSelectPresetFromHero = (presetId) => {
    const preset = PRESET_PRODUCTS.find(p => p.id === presetId) || PRESET_PRODUCTS[0];
    setInitialPresetForForm(preset);
    setCurrentResult(preset);
    setActiveTab('result');
  };

  // Toggle Favorites
  const handleToggleFavorite = (item) => {
    const exists = favoritesList.some(f => f.id === item.id);
    if (exists) {
      setFavoritesList(favoritesList.filter(f => f.id !== item.id));
    } else {
      setFavoritesList([item, ...favoritesList]);
    }
  };

  // Seguir / dejar de seguir un producto (watchlist)
  const handleToggleFollow = (item) => {
    const exists = watchlist.some(f => f.id === item.id);
    if (exists) {
      setWatchlist(watchlist.filter(f => f.id !== item.id));
    } else {
      setWatchlist([item, ...watchlist]);
    }
  };

  const handleDeleteHistoryItem = (itemId) => {
    setHistoryList(historyList.filter(i => i.id !== itemId));
  };

  const handleDeleteFavoriteItem = (itemId) => {
    setFavoritesList(favoritesList.filter(i => i.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Analytics />
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        historyCount={historyList.length}
        favoritesCount={favoritesList.length}
        credits={credits}
        onOpenUpsell={() => setUpsellOpen(true)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'hero' && (
          <HeroSection
            onStartAnalyze={() => {
              setActiveTab('analyze');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectPreset={handleSelectPresetFromHero}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeForm
            initialPreset={initialPresetForForm}
            onAnalyze={handleAnalyze}
          />
        )}

        {activeTab === 'result' && (
          <ResultCard
            result={currentResult}
            onBack={() => setActiveTab('analyze')}
            onOpenNegotiate={(res) => setNegotiateModalResult(res)}
            onOpenListing={(res) => setListingModalResult(res)}
            isFavorite={favoritesList.some(f => f.id === currentResult?.id)}
            onToggleFavorite={handleToggleFavorite}
            isFollowed={watchlist.some(f => f.id === currentResult?.id)}
            onToggleFollow={handleToggleFollow}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            items={historyList}
            mode="history"
            onSelectResult={(res) => {
              setCurrentResult(res);
              setActiveTab('result');
            }}
            onDeleteItem={handleDeleteHistoryItem}
          />
        )}

        {activeTab === 'favorites' && (
          <HistoryView
            items={favoritesList}
            mode="favorites"
            onSelectResult={(res) => {
              setCurrentResult(res);
              setActiveTab('result');
            }}
            onDeleteItem={handleDeleteFavoriteItem}
          />
        )}

        {activeTab === 'panel' && (
          <DashboardView
            historyList={historyList}
            watchlist={watchlist}
            onToggleFollow={handleToggleFollow}
            user={user}
            onSelectResult={(res) => {
              setCurrentResult(res);
              setActiveTab('result');
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Action Modals */}
      {negotiateModalResult && (
        <ActionNegotiateModal
          result={negotiateModalResult}
          onClose={() => setNegotiateModalResult(null)}
        />
      )}

      {listingModalResult && (
        <ActionListingModal
          result={listingModalResult}
          onClose={() => setListingModalResult(null)}
        />
      )}

      {upsellOpen && (
        <UpsellModal
          credits={credits}
          onClose={() => setUpsellOpen(false)}
          onBuy={(plan) => {
            addCredits(plan.credits);
            setCredits(getCredits());
            setUpsellOpen(false);
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}

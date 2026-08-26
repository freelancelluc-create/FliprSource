import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AnalyzeForm from './components/AnalyzeForm';
import ResultCard from './components/ResultCard';
import HistoryView from './components/HistoryView';
import ActionNegotiateModal from './components/ActionNegotiateModal';
import ActionListingModal from './components/ActionListingModal';
import Footer from './components/Footer';
import { PRESET_PRODUCTS } from './data/presetProducts';
import { calculateFlipScore } from './utils/flipCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState('hero'); // hero | analyze | result | history | favorites
  const [currentResult, setCurrentResult] = useState(PRESET_PRODUCTS[0]);
  const [initialPresetForForm, setInitialPresetForForm] = useState(null);

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

  // Handler when user triggers an analysis
  const handleAnalyze = (inputData) => {
    let resultObj;
    if (inputData.id) {
      // It's a full preset object
      resultObj = inputData;
    } else {
      // Custom user input calculation
      resultObj = calculateFlipScore({
        title: inputData.customTitle,
        buyPrice: inputData.price,
        condition: inputData.condition,
        marketplace: inputData.marketplace,
        category: "Tecnología",
        accessories: inputData.accessories
      });
      resultObj.imageUrl = inputData.imageUrl;
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

  const handleDeleteHistoryItem = (itemId) => {
    setHistoryList(historyList.filter(i => i.id !== itemId));
  };

  const handleDeleteFavoriteItem = (itemId) => {
    setFavoritesList(favoritesList.filter(i => i.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        historyCount={historyList.length}
        favoritesCount={favoritesList.length}
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

    </div>
  );
}

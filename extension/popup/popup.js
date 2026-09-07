// FLIPR Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const detectedCard = document.getElementById('detected-card');
  const detectedTitle = document.getElementById('detected-title');
  const btnAnalyzeCurrent = document.getElementById('btn-analyze-current');
  const inputQuery = document.getElementById('input-query');
  const btnSearch = document.getElementById('btn-search');

  // Calculator elements
  const calcPlatform = document.getElementById('calc-platform');
  const calcBuy = document.getElementById('calc-buy');
  const calcSell = document.getElementById('calc-sell');
  const resProfit = document.getElementById('res-profit');
  const resRoi = document.getElementById('res-roi');

  let activeTabUrl = '';

  // 1. Detect Active Tab
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        activeTabUrl = tab.url;
        const isSupported = activeTabUrl.includes('wallapop.com/item/') || 
                            activeTabUrl.includes('vinted.') || 
                            activeTabUrl.includes('milanuncios.com/anuncios/');

        if (isSupported) {
          detectedCard.classList.remove('hidden');
          detectedTitle.textContent = tab.title ? tab.title.split(' - ')[0].trim() : 'Anuncio en tienda de segunda mano';
        }
      }
    }
  } catch (err) {
    console.error('Error detecting tab:', err);
  }

  // 2. Action: Analyze Current Item
  btnAnalyzeCurrent.addEventListener('click', () => {
    if (activeTabUrl) {
      const targetUrl = `https://www.fliprscore.com/?q=${encodeURIComponent(activeTabUrl)}`;
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: targetUrl });
      } else {
        window.open(targetUrl, '_blank');
      }
    }
  });

  // 3. Action: Manual Search / Paste
  function executeSearch() {
    const q = inputQuery.value.trim();
    if (!q) return;
    const targetUrl = `https://www.fliprscore.com/?q=${encodeURIComponent(q)}`;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank');
    }
  }

  btnSearch.addEventListener('click', executeSearch);
  inputQuery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });

  // 4. Live Calculator
  function updateCalc() {
    const buy = parseFloat(calcBuy.value) || 0;
    const sell = parseFloat(calcSell.value) || 0;
    const platform = calcPlatform.value;

    let fee = 0;
    if (platform === 'wallapop') {
      fee = sell * 0.05 + 2.5; // ~5% + seguro base
    } else if (platform === 'vinted') {
      fee = sell * 0.05 + 0.70; // 5% + 0.70€
    } else {
      fee = 0; // en mano
    }

    const netProfit = Math.round((sell - buy - fee) * 10) / 10;
    const roi = buy > 0 ? Math.round((netProfit / buy) * 100) : 0;

    if (netProfit >= 0) {
      resProfit.textContent = `+${netProfit} €`;
      resProfit.className = 'res-val green';
      resRoi.textContent = `+${roi}%`;
      resRoi.className = 'res-val green';
    } else {
      resProfit.textContent = `${netProfit} €`;
      resProfit.className = 'res-val red';
      resRoi.textContent = `${roi}%`;
      resRoi.className = 'res-val red';
    }
  }

  calcBuy.addEventListener('input', updateCalc);
  calcSell.addEventListener('input', updateCalc);
  calcPlatform.addEventListener('change', updateCalc);
  updateCalc();
});

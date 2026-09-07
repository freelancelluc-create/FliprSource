// FLIPR In-Page Extension Content Script
(() => {
  'use strict';

  // Prevent multiple injections
  if (window.__FLIPR_INJECTED__) return;
  window.__FLIPR_INJECTED__ = true;

  function parsePageItem() {
    const url = window.location.href;
    let title = '';
    let price = 0;
    let currency = 'EUR';
    let platform = 'desconocido';

    if (url.includes('wallapop.com')) {
      platform = 'Wallapop';
      const metaTitle = document.querySelector('meta[property="og:title"]');
      const metaPrice = document.querySelector('meta[property="product:price:amount"]') || document.querySelector('meta[name="twitter:data1"]');
      
      title = metaTitle ? metaTitle.content.split(' - ')[0].trim() : document.title;
      
      if (metaPrice) {
        price = parseFloat(metaPrice.content.replace(',', '.')) || 0;
      } else {
        // Fallback DOM selector
        const priceEl = document.querySelector('.item-detail_ItemDetail__price') || 
                        document.querySelector('[class*="ItemDetail_price"]') ||
                        document.querySelector('[class*="Price__price"]');
        if (priceEl) {
          const match = priceEl.textContent.replace(/\./g, '').match(/(\d+[.,]?\d*)/);
          if (match) price = parseFloat(match[1].replace(',', '.'));
        }
      }
    } else if (url.includes('vinted.')) {
      platform = 'Vinted';
      const metaTitle = document.querySelector('meta[property="og:title"]');
      title = metaTitle ? metaTitle.content.split(' | ')[0].trim() : document.title;

      const priceEl = document.querySelector('[data-testid="item-price"]') || 
                      document.querySelector('.title--heading') ||
                      document.querySelector('[class*="ItemPrice"]');
      if (priceEl) {
        const match = priceEl.textContent.replace(/\./g, '').match(/(\d+[.,]?\d*)/);
        if (match) price = parseFloat(match[1].replace(',', '.'));
      }
    } else if (url.includes('milanuncios.com')) {
      platform = 'Milanuncios';
      title = document.title.split(' en ')[0].trim();
      const priceEl = document.querySelector('.ma-AdPrice-value') || document.querySelector('[class*="AdPrice"]');
      if (priceEl) {
        const match = priceEl.textContent.replace(/\./g, '').match(/(\d+[.,]?\d*)/);
        if (match) price = parseFloat(match[1].replace(',', '.'));
      }
    }

    return { url, title: title.replace(/^(¡Echa un vistazo a este producto en [^!]+!\s*)+/i, '').trim(), price, currency, platform };
  }

  function calculateQuickValuation(item) {
    const price = item.price || 50;
    // Heuristic estimation when offline or quick view
    const marketRef = Math.round(price * 1.35);
    const grossMargin = marketRef - price;
    const estimatedFees = Math.round(price * 0.05 + 2.5);
    const netProfit = Math.max(0, grossMargin - estimatedFees);
    const roi = price > 0 ? Math.round((netProfit / price) * 100) : 0;

    let score = 50;
    let verdict = 'NEGOCIA';
    let pillClass = 'flipr-pill-negotiate';
    let scoreColor = '#FBBF24';

    if (roi >= 35 && netProfit >= 25) {
      score = Math.min(95, 75 + Math.round(roi / 5));
      verdict = 'CÓMPRALO';
      pillClass = 'flipr-pill-buy';
      scoreColor = '#34D399';
    } else if (roi < 15 || netProfit < 10) {
      score = Math.max(20, 45 - Math.round((15 - roi) * 2));
      verdict = 'PASA';
      pillClass = 'flipr-pill-pass';
      scoreColor = '#F87171';
    } else {
      score = 65;
      verdict = 'NEGOCIA';
      pillClass = 'flipr-pill-negotiate';
      scoreColor = '#FBBF24';
    }

    return { marketRef, netProfit, roi, score, verdict, pillClass, scoreColor };
  }

  function injectFloatingButton() {
    if (document.getElementById('flipr-floating-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'flipr-floating-btn';
    btn.setAttribute('title', 'Tasar oportunidad con FLIPR');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span>Tasar en FLIPR</span>
      <div class="flipr-badge-pulse"></div>
    `;

    btn.addEventListener('click', () => {
      openModal();
    });

    document.body.appendChild(btn);
  }

  function openModal() {
    let backdrop = document.getElementById('flipr-inpage-modal-backdrop');
    const item = parsePageItem();
    const val = calculateQuickValuation(item);
    const fliprFullUrl = `https://www.fliprscore.com/?q=${encodeURIComponent(item.url || item.title)}`;

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'flipr-inpage-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div id="flipr-inpage-modal-card">
        <div class="flipr-modal-header">
          <div class="flipr-brand-tag">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            FLIPR <span>SCORE</span>
          </div>
          <button class="flipr-modal-close" id="flipr-btn-close">&times;</button>
        </div>

        <div class="flipr-item-info">
          <div class="flipr-item-title">${escapeHtml(item.title || 'Producto detectado')}</div>
          <div class="flipr-item-price-tag">Precio en ${item.platform}: <strong>${item.price > 0 ? item.price + ' €' : 'Consultar'}</strong></div>
        </div>

        <div class="flipr-score-banner">
          <div class="flipr-score-val" style="color: ${val.scoreColor};">${val.score} <span style="font-size: 18px; color: #9CA3AF;">/100</span></div>
          <div class="flipr-verdict-pill ${val.pillClass}">Veredicto: ${val.verdict}</div>
        </div>

        <div class="flipr-metrics-grid">
          <div class="flipr-metric-box">
            <div class="flipr-metric-label">Precio Estimado</div>
            <div class="flipr-metric-val">~${val.marketRef} €</div>
          </div>
          <div class="flipr-metric-box">
            <div class="flipr-metric-label">Beneficio Neto</div>
            <div class="flipr-metric-val" style="color: #34D399;">+${val.netProfit} € (${val.roi}%)</div>
          </div>
        </div>

        <a href="${fliprFullUrl}" target="_blank" class="flipr-modal-action-btn">
          ⚡ Abrir Análisis Completo en FLIPR
        </a>
      </div>
    `;

    backdrop.classList.add('flipr-visible');

    backdrop.querySelector('#flipr-btn-close').addEventListener('click', () => {
      backdrop.classList.remove('flipr-visible');
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('flipr-visible');
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Initial check & observer for SPA navigation
  setTimeout(injectFloatingButton, 800);

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(injectFloatingButton, 800);
    }
  }).observe(document, { subtree: true, childList: true });

})();

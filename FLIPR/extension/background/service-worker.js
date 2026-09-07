// FLIPR Extension Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  // Create Context Menu
  chrome.contextMenus.create({
    id: 'flipr-analyze-selection',
    title: '⚡ Tasar "%s" en FLIPR',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'flipr-analyze-link',
    title: '⚡ Analizar este anuncio en FLIPR',
    contexts: ['link']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let query = '';
  if (info.menuItemId === 'flipr-analyze-selection' && info.selectionText) {
    query = info.selectionText.trim();
  } else if (info.menuItemId === 'flipr-analyze-link' && info.linkUrl) {
    query = info.linkUrl.trim();
  }

  if (query) {
    chrome.tabs.create({
      url: `https://www.fliprscore.com/?q=${encodeURIComponent(query)}`
    });
  }
});

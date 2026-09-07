import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('c:/Users/olive/OneDrive/Escritorio/FLIPR/FLIPR/public');

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Si ya tiene og:title, saltar
  if (content.includes('property="og:title"')) {
    console.log(`Skipping (already has OG): ${filePath}`);
    return;
  }

  // Extraer title, description, canonical
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);

  const title = titleMatch ? titleMatch[1] : 'FLIPR — ¿Lo compro o no?';
  const desc = descMatch ? descMatch[1] : 'Analiza cualquier anuncio de segunda mano en segundos con FLIPR.';
  const url = canonicalMatch ? canonicalMatch[1] : 'https://www.fliprscore.com/';
  const isArticle = filePath.includes('blog');

  const ogTags = `
    <!-- Open Graph (WhatsApp, Telegram, Facebook, LinkedIn) -->
    <meta property="og:type" content="${isArticle ? 'article' : 'website'}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="https://www.fliprscore.com/brand/og-image.png" />
    <meta property="og:site_name" content="FLIPR" />
    <meta property="og:locale" content="es_ES" />

    <!-- Twitter / X Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://www.fliprscore.com/brand/og-image.png" />`;

  if (content.includes('</head>')) {
    content = content.replace('</head>', `${ogTags}\n</head>`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated OG tags: ${filePath}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'brand') scanDir(full);
    } else if (f.endsWith('.html')) {
      processHtmlFile(full);
    }
  }
}

scanDir(publicDir);
console.log('Done scanning and updating HTML files.');

// ════════════════════════════════════════════════════════════════
// Worker principal de Folia (Cloudflare Workers)
//
// Ce Worker fait deux choses :
//   1. Si l'URL commence par /api/price  → il récupère le prix d'un ETF via
//      Yahoo Finance (rôle de l'ancienne fonction serveur).
//   2. Sinon → il laisse Cloudflare servir les fichiers statiques du site
//      (index.html, style.css, app.js) via le binding ASSETS.
//
// Tout est déployé en une seule unité : pas besoin de dossier "functions".
// ════════════════════════════════════════════════════════════════

// En-têtes "navigateur" pour que Yahoo ne bloque pas la requête
const YH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Suffixes des places européennes, par ordre de préférence (Paris d'abord)
const EURO_SUFFIXES = ['.PA', '.DE', '.AS', '.L', '.MI', '.BR', '.LS', '.MC'];

// ── Cache mémoire mutualisé entre tous les utilisateurs ──────────────
// Le Worker garde son isolat "chaud" entre les invocations : un cache en
// mémoire est donc partagé par les appels qui tombent sur le même isolat.
// Les cours Yahoo sont des clôtures quotidiennes : un cache de quelques heures
// ne fait perdre aucune fraîcheur réelle.
const _cache = {};            // { clé: { data, exp } }
const PRICE_TTL = 6 * 60 * 60 * 1000;   // prix : 6 h
const HISTORY_TTL = 24 * 60 * 60 * 1000; // historique (CAGR) : 24 h (change très peu)
function cacheGet(key) {
  const hit = _cache[key];
  if (hit && hit.exp > Date.now()) return hit.data;
  if (hit) delete _cache[key]; // expiré → on nettoie
  return null;
}
function cacheSet(key, data, ttl) {
  _cache[key] = { data, exp: Date.now() + ttl };
  // Garde-fou anti-fuite mémoire : si le cache grossit trop, on purge les plus vieux.
  const keys = Object.keys(_cache);
  if (keys.length > 500) {
    keys.sort((a, b) => _cache[a].exp - _cache[b].exp).slice(0, 100).forEach(k => delete _cache[k]);
  }
  return data;
}

// Récupère le prix d'un symbole Yahoo précis via l'endpoint v8/chart
async function fetchYahooPrice(symbol) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?interval=1d&range=5d';
  const r = await fetch(url, { headers: YH_HEADERS });
  if (!r.ok) return null;
  const d = await r.json();
  const res = d && d.chart && d.chart.result && d.chart.result[0];
  if (!res || !res.meta) return null;
  const meta = res.meta;
  const price = meta.regularMarketPrice != null ? meta.regularMarketPrice : meta.previousClose;
  if (price == null) return null;
  return {
    price: price,
    currency: meta.currency || '',
    symbol: meta.symbol || symbol,
    name: meta.shortName || meta.longName || null,
    source: 'Yahoo',
  };
}

// Récupère l'historique max (mensuel) d'un symbole et calcule le rendement
// annualisé (CAGR) sur toute la période disponible.
async function fetchYahooHistory(symbol) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?interval=1mo&range=max';
  const r = await fetch(url, { headers: YH_HEADERS });
  if (!r.ok) return null;
  const d = await r.json();
  const res = d && d.chart && d.chart.result && d.chart.result[0];
  if (!res || !res.timestamp || !res.indicators) return null;
  const adj = res.indicators.adjclose && res.indicators.adjclose[0] && res.indicators.adjclose[0].adjclose;
  const close = res.indicators.quote && res.indicators.quote[0] && res.indicators.quote[0].close;
  const prices = (adj || close || []).filter(p => p != null && p > 0);
  const ts = res.timestamp || [];
  if (prices.length < 13) return null; // moins d'un an de données → pas assez fiable
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const startTs = ts[0], endTs = ts[ts.length - 1];
  const years = (endTs - startTs) / (365.25 * 24 * 3600);
  if (years < 1 || startPrice <= 0) return null;
  const cagr = (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100;
  return {
    cagr: Math.round(cagr * 100) / 100,
    years: Math.round(years * 10) / 10,
    symbol: (res.meta && res.meta.symbol) || symbol,
    usedAdjusted: !!adj,
  };
}

// Résout un ISIN en symbole Yahoo via l'outil de recherche de Yahoo.
async function resolveIsin(isin) {
  const url = 'https://query1.finance.yahoo.com/v1/finance/search?q=' + encodeURIComponent(isin) + '&quotesCount=10&newsCount=0';
  const r = await fetch(url, { headers: YH_HEADERS });
  if (!r.ok) return null;
  const d = await r.json();
  const quotes = (d && d.quotes) || [];
  if (!quotes.length) return null;
  for (const suf of EURO_SUFFIXES) {
    const hit = quotes.find(q => q.symbol && q.symbol.endsWith(suf));
    if (hit) return hit.symbol;
  }
  const etf = quotes.find(q => q.symbol && (q.quoteType === 'ETF' || q.quoteType === 'EQUITY'));
  if (etf) return etf.symbol;
  return quotes[0].symbol || null;
}

function jsonResponse(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

// Logique de l'API prix (identique à l'ancienne fonction)
async function handlePrice(url) {
  const params = url.searchParams;
  const isin = (params.get('isin') || '').trim().toUpperCase();
  let ticker = (params.get('ticker') || '').trim().toUpperCase();
  const historyParam = params.get('history');
  const wantHistory = historyParam === '1' || historyParam === 'true';

  if (!isin && !ticker) return jsonResponse({ error: 'Aucun ISIN ni ticker fourni' });

  const cacheKey = (wantHistory ? 'h:' : 'p:') + (isin || '') + '|' + (ticker || '');
  const cached = cacheGet(cacheKey);
  if (cached) return jsonResponse({ ...cached, cached: true });

  const candidates = [];
  if (ticker) {
    if (/\.[A-Z]+$/.test(ticker)) {
      candidates.push(ticker);
    } else {
      candidates.push(ticker + '.PA');
      candidates.push(ticker + '.DE');
      candidates.push(ticker + '.AS');
      candidates.push(ticker);
    }
  }

  if (wantHistory) {
    let symbol = null;
    for (const sym of candidates) {
      const info = await fetchYahooPrice(sym);
      if (info && info.price) { symbol = info.symbol; break; }
    }
    if (!symbol && isin) symbol = await resolveIsin(isin);
    if (!symbol) return jsonResponse({ error: 'Symbole introuvable pour l\'historique' });
    const hist = await fetchYahooHistory(symbol);
    if (!hist) return jsonResponse({ error: 'Historique insuffisant', symbol });
    cacheSet(cacheKey, hist, HISTORY_TTL);
    return jsonResponse(hist);
  }

  for (const sym of candidates) {
    const info = await fetchYahooPrice(sym);
    if (info && info.price) {
      cacheSet(cacheKey, info, PRICE_TTL);
      return jsonResponse(info);
    }
  }

  if (isin) {
    const sym = await resolveIsin(isin);
    if (sym) {
      const info = await fetchYahooPrice(sym);
      if (info && info.price) {
        cacheSet(cacheKey, info, PRICE_TTL);
        return jsonResponse(info);
      }
    }
    return jsonResponse({ error: 'ISIN ' + isin + ' introuvable sur Yahoo Finance' });
  }

  return jsonResponse({ error: 'Symbole introuvable : ' + (ticker || isin) });
}

// ════════════════════════════════════════════════════════════════
// SYNCHRONISATION PAR CODE (mobile ↔ PC, sans compte)
//
// Principe : un appareil envoie ses données → le Worker les range dans le
// stockage KV sous un code court aléatoire → l'autre appareil entre ce code
// pour récupérer les données. Le code expire automatiquement après 30 jours.
//
// ⚠ Nécessite un "espace KV" (Cloudflare KV) relié au Worker sous le nom
//   FOLIA_KV (voir le guide de déploiement). Sans lui, la synchro renvoie une
//   erreur claire, mais le reste du site (prix inclus) fonctionne normalement.
// ════════════════════════════════════════════════════════════════

const SYNC_TTL = 30 * 24 * 60 * 60;          // durée de vie d'un code : 30 jours (en secondes)
const SYNC_MAX_BYTES = 2 * 1024 * 1024;      // taille max acceptée : 2 Mo (large)
// Alphabet sans caractères ambigus (pas de 0/O, 1/I/L) pour faciliter la saisie.
const SYNC_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Génère un code aléatoire de 6 caractères (~887 millions de combinaisons).
function makeSyncCode() {
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  let s = '';
  for (let i = 0; i < 6; i++) s += SYNC_ALPHABET[arr[i] % SYNC_ALPHABET.length];
  return s;
}

// Sauvegarde : reçoit les données (POST), renvoie un code.
async function handleSyncSave(request, env) {
  if (!env.FOLIA_KV) {
    return jsonResponse({ error: 'La synchronisation n\'est pas encore configurée (espace KV manquant).' });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Méthode non autorisée' });
  }
  const body = await request.text();
  if (!body || body.length > SYNC_MAX_BYTES) {
    return jsonResponse({ error: 'Données vides ou trop volumineuses' });
  }
  // Vérifie que c'est bien du JSON (sécurité minimale)
  try { JSON.parse(body); } catch (e) { return jsonResponse({ error: 'Données invalides' }); }

  // Trouve un code libre (quelques tentatives en cas de collision improbable)
  let code = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = makeSyncCode();
    const existing = await env.FOLIA_KV.get(candidate);
    if (!existing) { code = candidate; break; }
  }
  if (!code) return jsonResponse({ error: 'Impossible de générer un code, réessaie' });

  await env.FOLIA_KV.put(code, body, { expirationTtl: SYNC_TTL });
  const expiresAt = new Date(Date.now() + SYNC_TTL * 1000).toISOString();
  return jsonResponse({ code: code, expiresAt: expiresAt });
}

// Récupération : reçoit un code (GET ?code=XXX), renvoie les données.
async function handleSyncLoad(url, env) {
  if (!env.FOLIA_KV) {
    return jsonResponse({ error: 'La synchronisation n\'est pas encore configurée (espace KV manquant).' });
  }
  const code = (url.searchParams.get('code') || '').trim().toUpperCase();
  if (!code || code.length < 4) return jsonResponse({ error: 'Code manquant ou invalide' });
  const data = await env.FOLIA_KV.get(code);
  if (data == null) {
    return jsonResponse({ error: 'Code introuvable ou expiré' });
  }
  // On renvoie les données telles quelles (déjà du JSON)
  return new Response(data, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// Point d'entrée du Worker.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 1) Route API : /api/price
    if (url.pathname === '/api/price' || url.pathname.startsWith('/api/price')) {
      try {
        return await handlePrice(url);
      } catch (e) {
        return jsonResponse({ error: 'Erreur serveur : ' + (e.message || String(e)) });
      }
    }
    // 2) Synchro : sauvegarder (POST) / récupérer (GET)
    if (url.pathname === '/api/sync/save') {
      try { return await handleSyncSave(request, env); }
      catch (e) { return jsonResponse({ error: 'Erreur synchro : ' + (e.message || String(e)) }); }
    }
    if (url.pathname === '/api/sync/load') {
      try { return await handleSyncLoad(url, env); }
      catch (e) { return jsonResponse({ error: 'Erreur synchro : ' + (e.message || String(e)) }); }
    }
    // 3) Tout le reste → fichiers statiques du site (servis depuis public/)
    return env.ASSETS.fetch(request);
  },
};

// Fonction serveur Netlify — récupère le prix d'un ETF via Yahoo Finance.
// Tourne côté serveur (pas dans le navigateur), donc PAS de blocage CORS.
//
// Appel depuis l'app :  /.netlify/functions/price?isin=FR0011550185
//                   ou  /.netlify/functions/price?ticker=ESE.PA
//
// Réponse JSON : { price: 26.5, currency: "EUR", symbol: "ESE.PA", name: "...", source: "Yahoo" }
//          ou   { error: "raison" }

// En-têtes "navigateur" pour que Yahoo ne bloque pas la requête
const YH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Suffixes des places européennes, par ordre de préférence (Paris d'abord)
const EURO_SUFFIXES = ['.PA', '.DE', '.AS', '.L', '.MI', '.BR', '.LS', '.MC'];

// ── Cache mémoire mutualisé entre tous les utilisateurs ──────────────
// La fonction serverless garde son conteneur "chaud" entre les invocations :
// un cache en mémoire est donc partagé par tous les appels qui tombent sur le
// même conteneur. Comme tout le monde suit les mêmes grands ETF (World, S&P 500…),
// ça évite de rappeler Yahoo pour un prix déjà connu — on économise les ressources.
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
// Retourne { cagr, years, symbol, startPrice, endPrice } ou null.
async function fetchYahooHistory(symbol) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?interval=1mo&range=max';
  const r = await fetch(url, { headers: YH_HEADERS });
  if (!r.ok) return null;
  const d = await r.json();
  const res = d && d.chart && d.chart.result && d.chart.result[0];
  if (!res || !res.timestamp || !res.indicators) return null;
  // Prix de clôture ajustés si dispo (tiennent compte des dividendes/splits), sinon close brut
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
  // CAGR = (valeur finale / valeur initiale)^(1/années) − 1
  const cagr = (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100;
  return {
    cagr: Math.round(cagr * 100) / 100,
    years: Math.round(years * 10) / 10,
    symbol: (res.meta && res.meta.symbol) || symbol,
    usedAdjusted: !!adj,
  };
}

// Résout un ISIN en symbole Yahoo via l'outil de recherche de Yahoo.
// Privilégie une cotation européenne pour éviter les homonymes US.
async function resolveIsin(isin) {
  const url = 'https://query1.finance.yahoo.com/v1/finance/search?q=' + encodeURIComponent(isin) + '&quotesCount=10&newsCount=0';
  const r = await fetch(url, { headers: YH_HEADERS });
  if (!r.ok) return null;
  const d = await r.json();
  const quotes = (d && d.quotes) || [];
  if (!quotes.length) return null;
  // 1) priorité à un symbole se terminant par un suffixe européen
  for (const suf of EURO_SUFFIXES) {
    const hit = quotes.find(q => q.symbol && q.symbol.endsWith(suf));
    if (hit) return hit.symbol;
  }
  // 2) sinon, premier résultat de type ETF/equity
  const etf = quotes.find(q => q.symbol && (q.quoteType === 'ETF' || q.quoteType === 'EQUITY'));
  if (etf) return etf.symbol;
  // 3) sinon, tout premier résultat
  return quotes[0].symbol || null;
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // cache 5 min
  };
  try {
    const params = (event && event.queryStringParameters) || {};
    const isin = (params.isin || '').trim().toUpperCase();
    let ticker = (params.ticker || '').trim().toUpperCase();
    const wantHistory = params.history === '1' || params.history === 'true';

    if (!isin && !ticker) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'Aucun ISIN ni ticker fourni' }) };
    }

    // Clé de cache : identifiant + type de requête (prix vs historique)
    const cacheKey = (wantHistory ? 'h:' : 'p:') + (isin || '') + '|' + (ticker || '');
    const cached = cacheGet(cacheKey);
    if (cached) {
      // Servi depuis le cache mutualisé — aucun appel à Yahoo
      return { statusCode: 200, headers, body: JSON.stringify({ ...cached, cached: true }) };
    }

    // ── Construire la liste des symboles à essayer, dans l'ordre ──
    const candidates = [];

    // Si on a un ticker, on le tente tel quel, et avec .PA s'il n'a pas de suffixe
    if (ticker) {
      if (/\.[A-Z]+$/.test(ticker)) {
        candidates.push(ticker); // déjà un suffixe (ex: ESE.PA)
      } else {
        candidates.push(ticker + '.PA'); // Paris d'abord (tes ETF y sont)
        candidates.push(ticker + '.DE');
        candidates.push(ticker + '.AS');
        candidates.push(ticker);
      }
    }

    // ── Mode HISTORIQUE : renvoyer le rendement annualisé (CAGR) ──
    if (wantHistory) {
      // Trouver d'abord un symbole valide (via ticker puis ISIN)
      let symbol = null;
      for (const sym of candidates) {
        const info = await fetchYahooPrice(sym);
        if (info && info.price) { symbol = info.symbol; break; }
      }
      if (!symbol && isin) symbol = await resolveIsin(isin);
      if (!symbol) {
        return { statusCode: 200, headers, body: JSON.stringify({ error: 'Symbole introuvable pour l\'historique' }) };
      }
      const hist = await fetchYahooHistory(symbol);
      if (!hist) {
        return { statusCode: 200, headers, body: JSON.stringify({ error: 'Historique insuffisant', symbol }) };
      }
      cacheSet(cacheKey, hist, HISTORY_TTL);
      return { statusCode: 200, headers, body: JSON.stringify(hist) };
    }

    // Essayer les candidats ticker
    for (const sym of candidates) {
      const info = await fetchYahooPrice(sym);
      if (info && info.price) {
        cacheSet(cacheKey, info, PRICE_TTL);
        return { statusCode: 200, headers, body: JSON.stringify(info) };
      }
    }

    // Sinon, résoudre via l'ISIN
    if (isin) {
      const sym = await resolveIsin(isin);
      if (sym) {
        const info = await fetchYahooPrice(sym);
        if (info && info.price) {
          cacheSet(cacheKey, info, PRICE_TTL);
          return { statusCode: 200, headers, body: JSON.stringify(info) };
        }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'ISIN ' + isin + ' introuvable sur Yahoo Finance' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ error: 'Symbole introuvable : ' + (ticker || isin) }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'Erreur serveur : ' + (e.message || String(e)) }) };
  }
};

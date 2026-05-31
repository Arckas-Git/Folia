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

    if (!isin && !ticker) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'Aucun ISIN ni ticker fourni' }) };
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

    // Essayer les candidats ticker
    for (const sym of candidates) {
      const info = await fetchYahooPrice(sym);
      if (info && info.price) {
        return { statusCode: 200, headers, body: JSON.stringify(info) };
      }
    }

    // Sinon, résoudre via l'ISIN
    if (isin) {
      const sym = await resolveIsin(isin);
      if (sym) {
        const info = await fetchYahooPrice(sym);
        if (info && info.price) {
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

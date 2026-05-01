/**
 * priceService.js
 * Fetches real Sri Lanka crop market prices from the WFP VAM Data Bridges API.
 * Falls back to updated 2024 hardcoded market averages when the API is unavailable
 * or a crop is not covered.
 *
 * WFP API docs: https://api.wfp.org/vam-data-bridges/5.0.0/ui/
 * Free API key: https://developers.wfp.org/
 */

const axios = require('axios');

const WFP_API_BASE = 'https://api.wfp.org/vam-data-bridges/5.0.0';
const WFP_API_KEY = process.env.WFP_API_KEY;

// ─── WFP Commodity Name Mapping ────────────────────────────────────────────
// Maps our internal crop keys → WFP commodity names used for Sri Lanka (LKA).
// A null value means WFP doesn't carry that commodity for SL; fallback is used.
const WFP_COMMODITY_MAP = {
  paddy:    'Rice (paddy)',
  tomato:   'Tomatoes',
  chili:    'Chillies (red)',
  potato:   'Potatoes (Irish)',
  carrot:   'Carrots',
  cabbage:  'Cabbages',
  beans:    'Beans (green)',
  mango:    'Mangoes',
  banana:   'Bananas',
  coconut:  'Coconuts',
  pepper:   'Pepper (black)',
  ginger:   'Ginger',
  // WFP does not typically publish farmgate prices for tea, cinnamon, turmeric in LKA
  tea:       null,
  cinnamon:  null,
  turmeric:  null,
};

// ─── Unit conversion to per-KG ─────────────────────────────────────────────
// WFP stores prices with different unit strings; we normalise to LKR/kg.
const UNIT_TO_KG_FACTOR = {
  'KG':     1,
  'G':      0.001,
  '100 G':  0.01,
  'MT':     0.001,
  'LB':     0.453592,
  // coconuts are priced per unit; average coconut ~0.5 kg
  'UNIT':   2,   // invert: price per unit → multiply by 2 to get per-kg equivalent
};

// ─── Fallback Prices (LKR/kg, 2024–2025 SL market averages) ───────────────
// Sources: HARTI weekly bulletins, CBSL statistical surveys, DOA reports.
const FALLBACK_PRICES = {
  tea:      { low: 120,  high: 220  },  // farmgate green leaf
  paddy:    { low: 90,   high: 140  },  // farmgate paddy
  tomato:   { low: 120,  high: 500  },  // retail, highly seasonal
  chili:    { low: 280,  high: 950  },  // green chili, seasonal
  potato:   { low: 180,  high: 400  },
  carrot:   { low: 180,  high: 450  },
  cabbage:  { low: 70,   high: 250  },
  beans:    { low: 280,  high: 540  },
  mango:    { low: 180,  high: 520  },
  banana:   { low: 110,  high: 280  },  // per kg
  coconut:  { low: 85,   high: 160  },  // per nut
  cinnamon: { low: 1800, high: 4500 },
  pepper:   { low: 2000, high: 4200 },
  ginger:   { low: 420,  high: 1300 },
  turmeric: { low: 350,  high: 850  },
};

// ─── Season Multipliers ────────────────────────────────────────────────────
// Maha (Oct–Mar): peak harvest → higher supply → slightly lower retail price.
// Yala (Apr–Sep): secondary season → lower supply → slightly higher price.
const SEASON_MULTIPLIER = {
  Maha: 0.94,
  Yala: 1.08,
};

// ─── District Price Indices ────────────────────────────────────────────────
// Reflects transport costs and demand concentration relative to national average.
const DISTRICT_PRICE_INDEX = {
  Colombo:       1.12,
  Gampaha:       1.09,
  Kalutara:      1.06,
  Kandy:         1.03,
  Matale:        0.98,
  'Nuwara Eliya': 1.01,
  Galle:         1.06,
  Matara:        1.04,
  Hambantota:    0.97,
  Jaffna:        1.13,
  Kilinochchi:   1.16,
  Mannar:        1.19,
  Vavuniya:      1.13,
  Mullaitivu:    1.22,
  Batticaloa:    1.09,
  Ampara:        1.03,
  Trincomalee:   1.06,
  Kurunegala:    0.96,
  Puttalam:      0.97,
  Anuradhapura:  0.94,
  Polonnaruwa:   0.93,
  Badulla:       0.99,
  Moneragala:    0.91,
  Ratnapura:     0.98,
  Kegalle:       1.01,
};

// ─── In-Memory Cache ───────────────────────────────────────────────────────
// Keyed by cropKey; value: { prices, timestamp }
const priceCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // refresh every 6 hours

/**
 * Fetch latest weekly prices from the WFP VAM API for a given crop.
 * Returns { low, high, avg, source, fetchedAt } or null on failure.
 */
async function fetchWFPPrice(cropKey) {
  const wfpCommodity = WFP_COMMODITY_MAP[cropKey];
  if (!wfpCommodity || !WFP_API_KEY) return null;

  // Serve from cache if fresh
  const cached = priceCache.get(cropKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.prices;
  }

  try {
    const endDate   = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const response = await axios.get(`${WFP_API_BASE}/MarketPrices/PriceWeekly`, {
      headers:  { Authorization: `Bearer ${WFP_API_KEY}` },
      params:   {
        CountryCode:   'LKA',
        CommodityName: wfpCommodity,
        startDate,
        endDate,
        format:        'json',
        pageSize:       200,
      },
      timeout: 10000,
    });

    const items = response.data?.items ?? response.data?.data ?? [];
    if (!items.length) return null;

    // Normalise prices to LKR/kg
    const prices = items.reduce((acc, item) => {
      const rawPrice = item.mp_price ?? item.price ?? 0;
      if (rawPrice <= 0) return acc;

      const unitKey = (item.un ?? item.unit ?? 'KG').toUpperCase();
      const factor  = UNIT_TO_KG_FACTOR[unitKey] ?? 1;
      const pricePerKg = rawPrice * factor;
      // Sanity check: ignore obviously wrong values
      if (pricePerKg > 0 && pricePerKg < 50000) acc.push(pricePerKg);
      return acc;
    }, []);

    if (!prices.length) return null;

    prices.sort((a, b) => a - b);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;

    const result = {
      low:       Math.round(prices[0]),
      high:      Math.round(prices[prices.length - 1]),
      avg:       Math.round(avg),
      source:    'WFP VAM',
      fetchedAt: new Date().toISOString(),
    };

    priceCache.set(cropKey, { prices: result, timestamp: Date.now() });
    console.log(`[priceService] WFP price fetched for "${cropKey}": ${JSON.stringify(result)}`);
    return result;

  } catch (err) {
    if (err.response?.status === 401) {
      console.error('[priceService] WFP API: invalid or expired API key.');
    } else {
      console.error(`[priceService] WFP API fetch failed for "${cropKey}": ${err.message}`);
    }
    return null;
  }
}

/**
 * Get the estimated price range for a crop, incorporating:
 *  - Live WFP market data (when API key is configured)
 *  - District-level price index
 *  - Season (Maha / Yala) multiplier
 *  - Small stochastic variance (±5 %) to reflect day-to-day fluctuation
 *
 * Returns { priceLow, priceHigh, dataSource, fetchedAt }
 */
async function getCurrentPrices(cropKey, district, season) {
  const key = (cropKey || '').toLowerCase();

  // 1. Try live API
  const liveData = await fetchWFPPrice(key);

  // 2. Select base range
  const fallback = FALLBACK_PRICES[key] ?? { low: 100, high: 200 };
  let baseLow  = liveData ? liveData.low  : fallback.low;
  let baseHigh = liveData ? liveData.high : fallback.high;

  // If we have a live average, anchor the range symmetrically around it
  if (liveData?.avg) {
    const halfSpread = Math.round((fallback.high - fallback.low) * 0.35);
    baseLow  = Math.max(liveData.avg - halfSpread, 1);
    baseHigh = liveData.avg + halfSpread;
  }

  // 3. Apply multipliers
  const seasonMult  = season   ? (SEASON_MULTIPLIER[season]         ?? 1) : 1;
  const districtIdx = district ? (DISTRICT_PRICE_INDEX[district]    ?? 1) : 1;

  // 4. Small variance (±5 %)
  const jitter = () => 0.95 + Math.random() * 0.10;

  let priceLow  = Math.round(baseLow  * seasonMult * districtIdx * jitter());
  let priceHigh = Math.round(baseHigh * seasonMult * districtIdx * jitter());

  // Ensure ordering
  if (priceLow > priceHigh) [priceLow, priceHigh] = [priceHigh, priceLow];

  return {
    priceLow,
    priceHigh,
    dataSource: liveData ? 'WFP Market Data (Sri Lanka)' : 'HARTI/DOA Historical Average',
    fetchedAt:  liveData?.fetchedAt ?? new Date().toISOString(),
  };
}

module.exports = { getCurrentPrices };

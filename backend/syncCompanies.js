import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import yahoo from 'yahoo-finance2';
import pLimit from 'p-limit';

// ENV vars
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  // Adjust auth and fetch settings if needed
  auth: { persistSession: false },
});

// Adjust concurrency depending on your environment
const CONCURRENCY = Number(process.env.CONCURRENCY) || 5;
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 10000; // 10s

// Table and column names (change if your schema differs)
const COMPANIES_TABLE = 'companies_data';
const METRICS_TABLE = 'company_metrics';

async function getSymbolsFromSupabase() {
  // Pull companies where symbol exists and symbol is not empty
  const { data, error } = await supabase
    .from(COMPANIES_TABLE)
    .select('company_id, name, symbol')
    .neq('symbol', null)
    .neq('symbol', '');

  if (error) throw error;
  return data;
}

function normalizeSymbol(sym) {
  if (!sym) return null;
  const s = sym.trim().toUpperCase();
  return s.endsWith('.NS') ? s : s + '.NS';
}

async function fetchYahooForSymbol(symbol) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const q = await yahoo.quote(symbol, { signal: controller.signal });
    clearTimeout(id);

    const price = q?.regularMarketPrice ?? q?.price?.regularMarketPrice?.raw ?? null;
    const marketCap = q?.marketCap ?? q?.price?.marketCap ?? q?.price?.marketCap?.raw ?? null;
    const currency = q?.currency ?? q?.price?.currency ?? null;

    return { price: price ?? null, marketCap: marketCap ?? null, currency };
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error(`Request for symbol ${symbol} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw new Error(`Failed to fetch data for symbol ${symbol}: ${err.message}`);
  }
}

async function upsertMetric(row) {
  // row: { name, symbol, price, market_cap, currency }
  const payload = {
    name: row.name,
    symbol: row.symbol,
    share_price: row.price,
    market_cap: row.market_cap,
    date: new Date().toISOString(),
  };

  // If you want one metric per company per timestamp, insert. If you'd prefer to upsert
  // use an upsert where conflict target is something like (company_id, fetched_at) —
  // for simplicity we'll just insert. You can change to upsert with .upsert()

  const { data, error } = await supabase.from(METRICS_TABLE).insert(payload).select();
  if (error) throw error;
  return data;
}

async function processCompany(company) {
  try {
    const normalized = normalizeSymbol(company.symbol);
    if (!normalized) throw new Error('Empty symbol');

    // Fetch from Yahoo
    const y = await fetchYahooForSymbol(normalized);

    const insertRow = {
      name: company.name,
      symbol: normalized,
      price: y.price,
      market_cap: y.marketCap ?? null,
    };

    await upsertMetric(insertRow);
    console.log(`OK: ${company.name || company.company_id} (${normalized}) -> price=${y.price} marketCap=${y.marketCap}`);
    return { ok: true, company: company.company_id };
  } catch (err) {
    console.warn(`ERR for company id=${company.company_id} symbol=${company.symbol}:`, err?.message ?? err);
    return { ok: false, company: company.company_id, error: (err && err.message) || String(err) };
  }
}

async function main() {
  console.log('Fetching companies from Supabase...');
  const companies = await getSymbolsFromSupabase();
  console.log(`Found ${companies.length} companies with symbols.`);

  const limit = pLimit(CONCURRENCY);

  const tasks = companies.map((c) => limit(() => processCompany(c)));

  const results = await Promise.all(tasks);
  const failed = results.filter((r) => !r.ok);
  if (failed.length) console.table(failed.slice(0, 10));
}

// Run when called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('syncCompanies.js')) {
  main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
}
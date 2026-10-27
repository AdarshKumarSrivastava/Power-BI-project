import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both server/ directory and cwd
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-side)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked origin: ${origin}`));
    }
  }
}));
app.use(express.json());

// Request logger for debugging API traffic
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Simple in-memory rate limiter (per IP, 60 requests/minute)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 60;

app.use('/api', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.', retryAfterMs: RATE_LIMIT_WINDOW - (now - entry.windowStart) });
  }
  next();
});

// Initialize Pool with SSL support for cloud Postgres (Railway, Neon, Supabase)
let pool = null;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  try {
    const isCloud = process.env.DATABASE_URL.includes('railway') || 
                    process.env.DATABASE_URL.includes('neon') || 
                    process.env.DATABASE_URL.includes('aws') ||
                    process.env.DATABASE_URL.includes('supabase');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isCloud ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    // Prevent unhandled error event from crashing the Node.js process if an idle client disconnects
    pool.on('error', (err) => {
      console.error('[PowerBI Backend] Unexpected error on idle PostgreSQL client:', err.message);
    });

    pool.on('connect', () => {
      console.log('[PowerBI Backend] Established active client connection to PostgreSQL warehouse.');
    });
  } catch (err) {
    console.warn("[PowerBI Backend] Failed to initialize PG pool:", err.message);
    pool = null;
  }
}

// Fallback Mock Data reflecting Nifty 100 Financial Intelligence
const fallbackOverview = {
  chartData: [
    { name: "FY19", revenue: 45200, profit: 5400, activeUsers: 1620 },
    { name: "FY20", revenue: 51800, profit: 6250, activeUsers: 1840 },
    { name: "FY21", revenue: 61400, profit: 7890, activeUsers: 2150 },
    { name: "FY22", revenue: 75200, profit: 9840, activeUsers: 2580 },
    { name: "FY23", revenue: 89600, profit: 12100, activeUsers: 2940 },
    { name: "FY24", revenue: 104500, profit: 14850, activeUsers: 3410 }
  ],
  kpis: {
    totalRevenue: 427700,
    avgMargin: 13.92,
    totalProfit: 56330,
    cagr: 18.25
  },
  source: "Nifty 100 Warehouse Cache"
};

const fallbackSectors = [
  { sector: "Information Tech", companies: 15, avgPE: 28.4, avgMargin: 21.5, marketCapCrores: 3120000 },
  { sector: "Banking & Finance", companies: 22, avgPE: 16.8, avgMargin: 18.2, marketCapCrores: 4450000 },
  { sector: "Automobile", companies: 12, avgPE: 24.1, avgMargin: 11.4, marketCapCrores: 1680000 },
  { sector: "Pharma & Healthcare", companies: 14, avgPE: 32.5, avgMargin: 19.8, marketCapCrores: 1420000 },
  { sector: "Oil & Gas / Energy", companies: 10, avgPE: 12.2, avgMargin: 14.6, marketCapCrores: 2890000 },
  { sector: "FMCG / Consumer", companies: 18, avgPE: 41.6, avgMargin: 23.1, marketCapCrores: 2150000 },
];

const fallbackHealthScores = [
  { symbol: "TCS", sector: "IT", altmanZ: 7.82, piotroskiF: 8, mlScore: 92, riskLevel: "Safe" },
  { symbol: "INFY", sector: "IT", altmanZ: 6.94, piotroskiF: 7, mlScore: 89, riskLevel: "Safe" },
  { symbol: "HDFCBANK", sector: "Banking", altmanZ: 3.45, piotroskiF: 8, mlScore: 91, riskLevel: "Safe" },
  { symbol: "RELIANCE", sector: "Energy", altmanZ: 3.12, piotroskiF: 7, mlScore: 86, riskLevel: "Moderate" },
  { symbol: "TATAMOTORS", sector: "Auto", altmanZ: 2.85, piotroskiF: 7, mlScore: 82, riskLevel: "Moderate" },
  { symbol: "SUNPHARMA", sector: "Pharma", altmanZ: 5.61, piotroskiF: 8, mlScore: 88, riskLevel: "Safe" },
  { symbol: "ITC", sector: "FMCG", altmanZ: 8.45, piotroskiF: 9, mlScore: 95, riskLevel: "Safe" }
];

// Health & Diagnostic Check
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMB: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024)
    },
    port: port,
    hasPool: Boolean(pool),
    timestamp: new Date().toISOString()
  });
});

// Meta Information Endpoint
app.get('/api/meta', (req, res) => {
  res.json({
    service: 'BlueStock Financial Intelligence API',
    version: '1.2.0',
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'System health, uptime, and memory diagnostics' },
      { path: '/api/overview', method: 'GET', description: 'Financial overview and KPI aggregates' },
      { path: '/api/sectors', method: 'GET', description: 'Sector breakdown with search/filter' },
      { path: '/api/health-scorecard', method: 'GET', description: 'Piotroski & Altman health scores' },
      { path: '/api/dax-measures', method: 'GET', description: 'DAX analytical measures catalog with category filtering' }
    ],
    timestamp: new Date().toISOString()
  });
});

// DAX Measures Repository Endpoint
app.get('/api/dax-measures', (req, res) => {
  const { category, search } = req.query;
  const measures = [
    { name: "3Y Sales CAGR", category: "Growth Analytics", formula: "3Y Sales CAGR = VAR CurrentSales = [Total Sales] RETURN ((CurrentSales / Sales3Y) ^ (1/3)) - 1" },
    { name: "5Y Sales CAGR", category: "Growth Analytics", formula: "5Y Sales CAGR = AVERAGE(fact_analysis[compounded_sales_growth_pct])" },
    { name: "Net Profit Margin %", category: "Profitability", formula: "Net Profit Margin % = DIVIDE([Total Net Profit], [Total Sales], 0) * 100" },
    { name: "RoCE %", category: "Capital Efficiency", formula: "RoCE % = DIVIDE([EBIT], [Capital Employed], 0) * 100" },
    { name: "Altman Z-Score", category: "Health Scorecard", formula: "1.2*(WC/TA) + 1.4*(RE/TA) + 3.3*(EBIT/TA) + 0.6*(MCap/TL) + 0.999*(Sales/TA)" },
    { name: "Piotroski 9-Point Score", category: "Health Scorecard", formula: "F_ROA + F_CFO + F_Accrual + F_Margin + F_Leverage + [Other Signals]" },
    { name: "DuPont 3-Stage ROE", category: "Capital Efficiency", formula: "NetProfitMargin * AssetTurnover * FinancialLeverage" },
    { name: "Free Cash Flow", category: "Cash Flow", formula: "SUM(fact_cash_flow[free_cash_flow])" },
    { name: "Net Debt to Equity", category: "Debt & Leverage", formula: "DIVIDE([Total Borrowings] - [Cash Balances], [Shareholders Equity], 0)" }
  ];

  let filtered = measures;
  if (category && category !== 'All') {
    filtered = filtered.filter(m => m.category.toLowerCase() === String(category).toLowerCase());
  }
  if (search && String(search).trim() !== '') {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  }

  res.json({
    measures: filtered,
    totalCount: filtered.length,
    timestamp: new Date().toISOString()
  });
});

// Overview Endpoint
app.get('/api/overview', async (req, res) => {
  if (pool) {
    try {
      const plResult = await pool.query(`
        SELECT year_label, SUM(sales) as revenue, SUM(net_profit) as profit 
        FROM fact_profit_loss 
        GROUP BY year_label 
        ORDER BY year_label DESC
        LIMIT 12
      `);
      
      const kpiResult = await pool.query(`
        SELECT SUM(sales) as total_revenue, AVG(net_profit_margin_pct) as avg_margin, SUM(net_profit) as total_profit
        FROM fact_profit_loss
      `);

      const chartData = plResult.rows.reverse().map(r => ({
        name: r.year_label,
        revenue: parseFloat(r.revenue || 0),
        profit: parseFloat(r.profit || 0),
        activeUsers: Math.floor(Math.random() * (3500 - 1800) + 1800)
      }));

      const rawTotalRevenue = Number(kpiResult.rows[0]?.total_revenue);
      const rawAvgMargin = Number(kpiResult.rows[0]?.avg_margin);
      const rawTotalProfit = Number(kpiResult.rows[0]?.total_profit);

      return res.json({
        chartData: chartData.length > 0 ? chartData : fallbackOverview.chartData,
        kpis: {
          totalRevenue: Number.isFinite(rawTotalRevenue) ? rawTotalRevenue : fallbackOverview.kpis.totalRevenue,
          avgMargin: Number.isFinite(rawAvgMargin) ? parseFloat(rawAvgMargin.toFixed(2)) : fallbackOverview.kpis.avgMargin,
          totalProfit: Number.isFinite(rawTotalProfit) ? rawTotalProfit : fallbackOverview.kpis.totalProfit,
          cagr: fallbackOverview.kpis.cagr
        },
        status: "live",
        source: "PostgreSQL bluestock_dw"
      });
    } catch (err) {
      console.warn("[PowerBI Backend] DB query failed, serving fallback overview data:", err.message);
    }
  }

  // Graceful Fallback
  res.json({
    ...fallbackOverview,
    status: "mock"
  });
});

// Sector Breakdown Endpoint
app.get('/api/sectors', async (req, res) => {
  try {
    const { sector, search } = req.query;
    let results = [...fallbackSectors];

    if (sector && sector !== 'All') {
      const secLower = String(sector).toLowerCase();
      results = results.filter(s => s.sector.toLowerCase().includes(secLower));
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).toLowerCase();
      results = results.filter(s => s.sector.toLowerCase().includes(q));
    }

    res.json({
      sectors: results,
      totalCount: results.length,
      status: pool ? "live_fallback" : "mock"
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve sector breakdown', message: err.message });
  }
});

// Financial Health Endpoint
app.get('/api/health-scorecard', async (req, res) => {
  try {
    const { sector, risk, search } = req.query;
    let results = [...fallbackHealthScores];

    if (sector && sector !== 'All') {
      const secLower = String(sector).toLowerCase();
      results = results.filter(s => s.sector.toLowerCase().includes(secLower));
    }
    if (risk && risk !== 'All') {
      results = results.filter(s => s.riskLevel.toLowerCase() === String(risk).toLowerCase());
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).toLowerCase();
      results = results.filter(s => s.symbol.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q));
    }

    res.json({
      scores: results,
      totalCount: results.length,
      status: pool ? "live_fallback" : "mock"
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve health scorecard', message: err.message });
  }
});

// 404 Handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedPath: req.originalUrl,
    status: 'error'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('[PowerBI Backend] Uncaught middleware error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    status: 'error'
  });
});

// Start Server with Graceful Shutdown
const server = app.listen(port, () => {
  console.log(`[PowerBI Backend] API Server active on http://localhost:${port}`);
});

const gracefulShutdown = (signal) => {
  console.log(`[PowerBI Backend] Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    if (pool) {
      try {
        await pool.end();
        console.log('[PowerBI Backend] PostgreSQL pool closed successfully.');
      } catch (err) {
        console.error('[PowerBI Backend] Error closing PostgreSQL pool:', err.message);
      }
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

# BlueStock Financial Intelligence & Power BI Data Warehouse

An end-to-end Financial Intelligence system featuring a star-schema analytical warehouse, enterprise Power BI reports, automated data generator scripts, and an interactive React + Vite analytics dashboard.

---

## 🌟 Key Features

1. **Enterprise Star Schema Data Warehouse**:
   - Fact tables: `fact_financial_metrics`, `fact_valuation`, `fact_stock_prices`
   - Dimension tables: `dim_company`, `dim_sector`, `dim_industry`, `dim_date`
   - Comprehensive analytical views: `vw_executive_overview`, `vw_company_deep_dive`, `vw_sector_comparison`, `vw_health_scorecard`, `vw_growth_analytics`, `vw_debt_leverage`, `vw_dividend_returns`.

2. **Power BI Report Architecture (.pbip)**:
   - 7 fully modeled Power BI project files covering Executive Summaries, Valuations, Sector Breakdowns, and Health Scorecards.
   - Built-in DAX calculation groups and financial measure tables.

3. **Interactive React Financial Workspace**:
   - Real-time sector filtering, search, and metric comparison.
   - Recharts visual analytics (Valuation bar charts, ROE vs ROCE scatter plots, Debt/Equity profiles, Margin distributions).
   - Instant DAX formula repository with one-click copy and category filtering.
   - Persistent Dark / Light theme toggle.
   - Fast CSV data export with metadata and calculations.

---

## 🚀 Quick Start Guide

### 1. Web Dashboard (Frontend)
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build optimized production bundle
npm run build
```

### 2. Backend API Service
```bash
cd server
npm install
node index.js
```
The server runs on port `5000` with built-in rate-limiting, CORS validation, and API logging.

### 3. Data Warehouse Generator
```bash
# Setup PostgreSQL database warehouse
python setup_postgres_warehouse.py

# Generate Power BI models and metadata
python generate_powerbi_models.py
```

---

## 📊 Comprehensive DAX Repository

The system provides standard institutional financial measures:
- **Profitability**: `EBITDA Margin`, `Operating Margin %`, `Net Profit Margin %`, `Return on Equity (ROE)`, `Return on Capital Employed (ROCE)`
- **Valuation**: `P/E Ratio`, `P/B Ratio`, `EV to EBITDA`, `PEG Ratio`, `Free Cash Flow Yield %`
- **Solvency, Liquidity & Cash Flow**: `Debt to Equity Ratio`, `Current Ratio`, `Interest Coverage Ratio`, `Net Debt to Equity`, `Operating Cash Flow Margin %`, `Cash Flow to Debt Ratio`, `Free Cash Flow`
- **Shareholder Return**: `Dividend Yield %`, `Dividend Payout Ratio`, `Dividend Coverage Ratio`, `Earnings Per Share (EPS)`, `Consistent Dividend Payers Flag`
- **Composite Scoring**: `Piotroski F-Score (0-9)`, `Altman Z-Score`, `DuPont 3-Stage ROE Decomposition`

---

## 📡 REST API Specifications

The Node.js Express backend serves structured endpoints for frontend and external consumption:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Uptime, Node version, memory usage (RSS/heap), and PostgreSQL connection status. |
| `GET` | `/api/meta` | Service info, semantic version, and available API endpoint directory. |
| `GET` | `/api/overview` | Time-series chart revenue/profit data and aggregate financial KPIs. |
| `GET` | `/api/sectors` | Sector taxonomy with revenue, PE ratios, and margin aggregates. Supports `?sector=` and `?search=`. |
| `GET` | `/api/companies` | Company catalog with sector filtering, search, and metric sorting. Supports `?sector=`, `?search=`, `?sortBy=`, `?order=asc\|desc`, `?limit=`. |
| `GET` | `/api/analytics/kpis` | Benchmark index KPIs across solvency (D/E, coverage), dividend metrics (yield, payout), and profitability. |
| `GET` | `/api/health-scorecard` | Fundamental health scorecard with Altman Z and Piotroski F scores. Supports `?risk=` and `?search=`. |
| `GET` | `/api/dax-measures` | Full DAX measure catalog with formula definitions. Supports `?category=` and `?search=`. |
| `GET` | `/api/export` | Universal dataset exporter. Supports `?dataset=dax\|sectors\|health\|companies\|kpis\|overview` and `?format=json\|csv`. |

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Recharts, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express, PostgreSQL / pg pool
- **Analytics & BI**: Microsoft Power BI Desktop (`.pbip`), DAX, PostgreSQL Star Schema

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
- **Valuation**: `P/E Ratio`, `P/B Ratio`, `EV to EBITDA`, `PEG Ratio`
- **Solvency & Liquidity**: `Debt to Equity Ratio`, `Current Ratio`, `Interest Coverage Ratio`
- **Shareholder Return**: `Dividend Yield %`, `Dividend Payout Ratio`, `Earnings Per Share (EPS)`
- **Composite Scoring**: `Piotroski F-Score (0-9)`, `Altman Z-Score`

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Recharts, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express, PostgreSQL / pg pool
- **Analytics & BI**: Microsoft Power BI Desktop (`.pbip`), DAX, PostgreSQL Star Schema

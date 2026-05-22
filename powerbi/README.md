# 📊 Nifty 100 Financial Intelligence: Power BI Project

This directory contains the fully configured data modeling, PostgreSQL connection, relationships, report page names, and DAX measures for all **7 Power BI Dashboards**. 

Every dashboard has been programmatically generated as an industry-standard **Power BI Developer Project (`.pbip`)** to allow direct integration with Git version control.

---

## 📂 Folder Content
- `01_executive_overview.pbip` (Executive Market Overview entrypoint)
- `02_company_deep_dive.pbip` (Company Deep Dive entrypoint)
- `03_sector_comparison.pbip` (Sector Comparison Analyzer entrypoint)
- `04_health_scorecard.pbip` (Financial Health Scorecard entrypoint)
- `05_growth_analytics.pbip` (Growth & Valuation Analytics entrypoint)
- `06_debt_leverage.pbip` (Debt & Leverage Monitor entrypoint)
- `07_dividend_returns.pbip` (Dividend & Shareholder Returns entrypoint)
- `bluestock_dw_seed.sql` (Complete PostgreSQL 15 Database Seed Script - 1.3 MB)

---

## ⚡ Deployment Instructions

### 1. PostgreSQL Database Setup
Ensure PostgreSQL is running locally on port `5432` with a database named `bluestock_dw` (user: `postgres`, password: `postgres`).
- **Easy Mode:** Run the database migrator from the root folder:
  ```bash
  python setup_postgres_warehouse.py
  ```
- **Manual Mode:** Execute the generated seed script on your PostgreSQL database:
  ```sql
  -- Run this SQL dump inside your bluestock_dw database
  powerbi/bluestock_dw_seed.sql
  ```

### 2. Save as `.pbix` Files
1. Open **Power BI Desktop**.
2. Click **File -> Open** -> **Browse** and navigate to this folder.
3. Select any `.pbip` file (e.g. `01_executive_overview.pbip`).
4. Power BI Desktop will automatically connect to your PostgreSQL database, load all tables, configure the **10 Many-to-One Relationships**, pre-build all requested pages, and load all **33 DAX Measures** in the fields list under the `_KeyMeasures` table!
5. Select **File -> Save As** and change the format to **Power BI Desktop file (*.pbix)**. Save it here in the `powerbi/` folder.
6. Repeat for all 7 dashboards!

---

## 📐 Relationships Mapped Programmatically
- `fact_profit_loss[symbol]` ➡️ `dim_company[symbol]` (Many-to-One)
- `fact_profit_loss[year_label]` ➡️ `dim_year[year_label]` (Many-to-One)
- `fact_balance_sheet[symbol]` ➡️ `dim_company[symbol]` (Many-to-One)
- `fact_balance_sheet[year_label]` ➡️ `dim_year[year_label]` (Many-to-One)
- `fact_cash_flow[symbol]` ➡️ `dim_company[symbol]` (Many-to-One)
- `fact_cash_flow[year_label]` ➡️ `dim_year[year_label]` (Many-to-One)
- `fact_analysis[symbol]` ➡️ `dim_company[symbol]` (Many-to-One)
- `fact_ml_scores[symbol]` ➡️ `dim_company[symbol]` (Many-to-One)
- `fact_pros_cons[symbol]` ➡️ `dim_company[symbol]` (Many-to-One)
- `dim_company[sector]` ➡️ `dim_sector[sector_name]` (Many-to-One)

---

## 🧮 Pre-Programmed DAX Measures
All 33 mandatory measures (including CAGR, Return metrics, Debt metrics, YoY calculations, and custom flags like **Consistent Growers Flag** and **Consistent Dividend Payers Flag**) are pre-packaged inside the model under a dedicated table called `_KeyMeasures`!

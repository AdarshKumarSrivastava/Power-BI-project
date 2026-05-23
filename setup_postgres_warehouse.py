import sqlite3
import pandas as pd
from sqlalchemy import create_engine, text
import os
import sys

def run_migration():
    print("Starting Star Schema Warehouse Setup...")

    # Paths
    sqlite_db_path = '../DATA ENGINEERING FOUNDATION/db.sqlite3'
    csv_clean_dir = '../DATA ENGINEERING FOUNDATION/data/clean'

    # Check database paths
    if not os.path.exists(sqlite_db_path):
        print(f"Error: SQLite database not found at {sqlite_db_path}")
        sys.exit(1)

    print("Reading from SQLite and CSV sources...")
    sqlite_conn = sqlite3.connect(sqlite_db_path)

    # 1. Connect to PostgreSQL
    # Using the connection details requested in Section 4.1
    # Standard local server port 5432, database bluestock_dw
    # The script first connects to 'postgres' database to create 'bluestock_dw' if missing
    pg_admin_url = "postgresql://postgres:postgres@localhost:5432/postgres"
    pg_warehouse_url = "postgresql://postgres:postgres@localhost:5432/bluestock_dw"

    try:
        engine = create_engine(pg_admin_url, isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            # Check if bluestock_dw exists
            db_exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='bluestock_dw'")).scalar()
            if not db_exists:
                conn.execute(text("CREATE DATABASE bluestock_dw"))
                print("Created database 'bluestock_dw'.")
            else:
                print("Database 'bluestock_dw' already exists.")
    except Exception as e:
        print(f"Warning: Could not connect to PostgreSQL admin database to verify/create 'bluestock_dw'.")
        print(f"Error detail: {e}")
        print("We will attempt to connect directly to 'bluestock_dw'. Please make sure it is created.")

    # 2. Connect to the warehouse database
    try:
        pg_engine = create_engine(pg_warehouse_url)
        with pg_engine.connect() as pg_conn:
            print("Successfully connected to PostgreSQL warehouse 'bluestock_dw'.")
    except Exception as e:
        print(f"\n[ERROR] Connection failed to PostgreSQL server at localhost:5432.")
        print(f"Make sure your PostgreSQL server is running and the user 'postgres' has password 'postgres'.")
        print(f"Connection error: {e}")
        print("\nNote: We will generate the local migration dump so you can import it easily once your server is ready.")
        pg_engine = None

    # Load SQLite data into memory DataFrames
    dim_company = pd.read_sql_query("SELECT * FROM dim_company", sqlite_conn)
    fact_profit_loss = pd.read_sql_query("SELECT * FROM fact_profit_loss", sqlite_conn)
    fact_balance_sheet = pd.read_sql_query("SELECT * FROM fact_balance_sheet", sqlite_conn)
    fact_cash_flow = pd.read_sql_query("SELECT * FROM fact_cash_flow", sqlite_conn)
    fact_analysis = pd.read_sql_query("SELECT * FROM fact_analysis", sqlite_conn)
    fact_ml_scores = pd.read_sql_query("SELECT * FROM fact_ml_scores", sqlite_conn)

    # Load facts/dimensions that are empty in sqlite but present in clean CSVs
    fact_pros_cons = pd.DataFrame()
    prosandcons_csv = os.path.join(csv_clean_dir, 'prosandcons.csv')
    if os.path.exists(prosandcons_csv):
        fact_pros_cons = pd.read_csv(prosandcons_csv)
        print(f"Loaded pros/cons from CSV: {len(fact_pros_cons)} rows.")

    # Standardize column mappings (Django uses company_id, PostgreSQL schema uses symbol)
    for df in [fact_profit_loss, fact_balance_sheet, fact_cash_flow, fact_analysis, fact_ml_scores, fact_pros_cons]:
        if df is not None and not df.empty:
            if 'company_id' in df.columns:
                df.rename(columns={'company_id': 'symbol'}, inplace=True)

    # 3. Create dim_year by extracting from financial fact tables
    print("Generating dim_year table...")
    years_data = set()
    for df in [fact_profit_loss, fact_balance_sheet, fact_cash_flow]:
        if 'year_label' in df.columns:
            for _, row in df[['year_label']].drop_duplicates().iterrows():
                label = row['year_label']
                if pd.isna(label) or not label:
                    continue
                # Parse year label, e.g., "Mar 2021" -> 2021, is_ttm=False
                parts = str(label).split()
                fiscal_year = None
                is_ttm = False
                quarter = None
                
                if len(parts) == 2:
                    month, yr_str = parts[0], parts[1]
                    try:
                        fiscal_year = int(yr_str)
                    except ValueError:
                        pass
                elif "TTM" in str(label).upper():
                    is_ttm = True
                    fiscal_year = 2024 # default or latest
                
                # Assign sort order
                sort_order = fiscal_year if fiscal_year else 9999
                if is_ttm:
                    sort_order = 99999

                years_data.add((label, fiscal_year, quarter, is_ttm, False, sort_order))

    # Sort to ensure deterministic ordering of years
    sorted_years_data = sorted(list(years_data), key=lambda x: (x[5] if x[5] is not None else 9999, x[0]))
    dim_year = pd.DataFrame(sorted_years_data, columns=['year_label', 'fiscal_year', 'quarter', 'is_ttm', 'is_half_year', 'sort_order'])
    dim_year.reset_index(inplace=True)
    dim_year.rename(columns={'index': 'year_id'}, inplace=True)
    dim_year['year_id'] = dim_year['year_id'] + 1

    # 4. Generate dim_sector
    print("Generating dim_sector table...")
    sectors = sorted(dim_company['sector'].dropna().unique())
    dim_sector = pd.DataFrame({'sector_name': sectors})
    dim_sector.reset_index(inplace=True)
    dim_sector.rename(columns={'index': 'sector_id'}, inplace=True)
    dim_sector['sector_id'] = dim_sector['sector_id'] + 1
    dim_sector['sector_code'] = dim_sector['sector_name'].apply(lambda x: str(x)[:3].upper())
    dim_sector['description'] = dim_sector['sector_name'] + " companies"

    # 5. Generate dim_health_label
    print("Generating dim_health_label table...")
    health_labels_data = [
        (1, 'EXCELLENT', 85, 100, '#00C853'),
        (2, 'GOOD', 70, 84, '#64DD17'),
        (3, 'AVERAGE', 50, 69, '#FFD600'),
        (4, 'WEAK', 35, 49, '#FF6D00'),
        (5, 'POOR', 0, 34, '#D50000')
    ]
    dim_health_label = pd.DataFrame(health_labels_data, columns=['label_id', 'label_name', 'min_score', 'max_score', 'color_hex'])

    # Standardize fact_ml_scores health labels to match the dimension names
    if 'health_label' in fact_ml_scores.columns:
        fact_ml_scores['health_label'] = fact_ml_scores['health_label'].str.upper()

    print(f"Extracted dimensions:")
    print(f" - dim_company: {len(dim_company)} rows")
    print(f" - dim_year: {len(dim_year)} rows")
    print(f" - dim_sector: {len(dim_sector)} rows")
    print(f" - dim_health_label: {len(dim_health_label)} rows")

    # If Postgres engine is connected, load the data!
    if pg_engine is not None:
        try:
            # Create schema by executing schema.sql DDL
            schema_sql_path = '../DATA ENGINEERING FOUNDATION/sql/schema.sql'
            if os.path.exists(schema_sql_path):
                with open(schema_sql_path, 'r') as f:
                    schema_ddl = f.read()
                
                with pg_engine.connect() as conn:
                    # Clean existing tables first to avoid conflict on schema recreate
                    tables_to_drop = [
                        'fact_profit_loss', 'fact_balance_sheet', 'fact_cash_flow',
                        'fact_analysis', 'fact_ml_scores', 'fact_pros_cons',
                        'dim_company', 'dim_year', 'dim_sector', 'dim_health_label'
                    ]
                    for table in tables_to_drop:
                        conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                    
                    print("Executing DDL Schema script...")
                    # Execute queries split by semicolon (simple parsing)
                    for statement in schema_ddl.split(';'):
                        if statement.strip():
                            conn.execute(text(statement))
                    conn.commit()
                print("Database schema recreated successfully.")

            # Load into Postgres in order
            with pg_engine.connect() as conn:
                print("Loading dimensions...")
                dim_company.to_sql('dim_company', pg_engine, if_exists='append', index=False)
                dim_year.to_sql('dim_year', pg_engine, if_exists='append', index=False)
                dim_sector.to_sql('dim_sector', pg_engine, if_exists='append', index=False)
                dim_health_label.to_sql('dim_health_label', pg_engine, if_exists='append', index=False)

                print("Loading facts...")
                
                # Filter to schema columns
                pl_cols = ['symbol', 'year_label', 'sales', 'expenses', 'operating_profit', 'opm_pct', 
                           'other_income', 'interest', 'depreciation', 'profit_before_tax', 'tax_pct', 
                           'net_profit', 'eps', 'dividend_payout_pct', 'net_profit_margin_pct', 
                           'expense_ratio_pct', 'interest_coverage']
                
                bs_cols = ['symbol', 'year_label', 'equity_capital', 'reserves', 'borrowings', 
                           'other_liabilities', 'total_liabilities', 'fixed_assets', 'cwip', 'investments', 
                           'other_assets', 'total_assets', 'debt_to_equity', 'equity_ratio']
                
                cf_cols = ['symbol', 'year_label', 'operating_activity', 'investing_activity', 
                           'financing_activity', 'net_cash_flow', 'free_cash_flow']
                
                an_cols = ['symbol', 'period_label', 'compounded_sales_growth_pct', 
                           'compounded_profit_growth_pct', 'stock_price_cagr_pct', 'roe_pct']
                
                ml_cols = ['symbol', 'computed_at', 'overall_score', 'profitability_score', 
                           'growth_score', 'leverage_score', 'cashflow_score', 'trend_score', 'health_label']
                
                pc_cols = ['symbol', 'is_pro', 'category', 'text', 'confidence']

                # Load fact tables
                fact_profit_loss[pl_cols].to_sql('fact_profit_loss', pg_engine, if_exists='append', index=False)
                fact_balance_sheet[bs_cols].to_sql('fact_balance_sheet', pg_engine, if_exists='append', index=False)
                fact_cash_flow[cf_cols].to_sql('fact_cash_flow', pg_engine, if_exists='append', index=False)
                fact_analysis[an_cols].to_sql('fact_analysis', pg_engine, if_exists='append', index=False)
                fact_ml_scores[ml_cols].to_sql('fact_ml_scores', pg_engine, if_exists='append', index=False)
                
                if not fact_pros_cons.empty:
                    fact_pros_cons[pc_cols].to_sql('fact_pros_cons', pg_engine, if_exists='append', index=False)

                print("Data warehouse migration completed successfully!")
                
        except Exception as e:
            print(f"Error loading data to PostgreSQL: {e}")
            sys.exit(1)
    else:
        # If Postgres is not running, generate SQL inserts dump so they can import it easily
        print("\nSince PostgreSQL is not currently running locally, generating a complete SQL seed dump:")
        dump_path = 'powerbi/bluestock_dw_seed.sql'
        print(f"Saving SQL seed script to {dump_path}...")
        
        with open(dump_path, 'w', encoding='utf-8') as f:
            f.write("-- Nifty 100 Data Warehouse Seed File\n")
            f.write("-- Connect to bluestock_dw and execute this file\n\n")
            
            # Recreate tables DDL
            schema_sql_path = '../DATA ENGINEERING FOUNDATION/sql/schema.sql'
            if os.path.exists(schema_sql_path):
                with open(schema_sql_path, 'r') as s_f:
                    f.write(s_f.read())
                    f.write("\n\n")

            # Seed dim_health_label
            f.write("-- Seed dim_health_label\n")
            for _, r in dim_health_label.iterrows():
                f.write(f"INSERT INTO dim_health_label (label_id, label_name, min_score, max_score, color_hex) VALUES ({r.label_id}, '{r.label_name}', {r.min_score}, {r.max_score}, '{r.color_hex}') ON CONFLICT DO NOTHING;\n")
            f.write("\n")

            # Seed dim_sector
            f.write("-- Seed dim_sector\n")
            for _, r in dim_sector.iterrows():
                desc = str(r.description).replace("'", "''")
                f.write(f"INSERT INTO dim_sector (sector_id, sector_name, sector_code, description) VALUES ({r.sector_id}, '{r.sector_name}', '{r.sector_code}', '{desc}') ON CONFLICT DO NOTHING;\n")
            f.write("\n")

            # Seed dim_company
            f.write("-- Seed dim_company\n")
            for _, r in dim_company.iterrows():
                about = str(r.about_company).replace("'", "''") if r.about_company else ""
                logo = str(r.company_logo) if r.company_logo else ""
                name = str(r.company_name).replace("'", "''")
                f.write(f"INSERT INTO dim_company (symbol, company_name, sector, sub_sector, company_logo, website, nse_url, bse_url, face_value, book_value, about_company) VALUES ('{r.symbol}', '{name}', '{r.sector}', '{r.sub_sector}', '{logo}', '{r.website}', '{r.nse_url}', '{r.bse_url}', {r.face_value if r.face_value else 'NULL'}, {r.book_value if r.book_value else 'NULL'}, '{about}') ON CONFLICT DO NOTHING;\n")
            f.write("\n")

            # Seed dim_year
            f.write("-- Seed dim_year\n")
            for _, r in dim_year.iterrows():
                f.write(f"INSERT INTO dim_year (year_id, year_label, fiscal_year, quarter, is_ttm, is_half_year, sort_order) VALUES ({r.year_id}, '{r.year_label}', {r.fiscal_year if pd.notna(r.fiscal_year) else 'NULL'}, NULL, {'TRUE' if r.is_ttm else 'FALSE'}, {'TRUE' if r.is_half_year else 'FALSE'}, {r.sort_order}) ON CONFLICT DO NOTHING;\n")
            f.write("\n")

            # Seed fact_profit_loss
            f.write("-- Seed fact_profit_loss\n")
            for _, r in fact_profit_loss.iterrows():
                f.write(f"INSERT INTO fact_profit_loss (symbol, year_label, sales, expenses, operating_profit, opm_pct, other_income, interest, depreciation, profit_before_tax, tax_pct, net_profit, eps, dividend_payout_pct, net_profit_margin_pct, expense_ratio_pct, interest_coverage) VALUES ('{r.symbol}', '{r.year_label}', {r.sales if pd.notna(r.sales) else 'NULL'}, {r.expenses if pd.notna(r.expenses) else 'NULL'}, {r.operating_profit if pd.notna(r.operating_profit) else 'NULL'}, {r.opm_pct if pd.notna(r.opm_pct) else 'NULL'}, {r.other_income if pd.notna(r.other_income) else 'NULL'}, {r.interest if pd.notna(r.interest) else 'NULL'}, {r.depreciation if pd.notna(r.depreciation) else 'NULL'}, {r.profit_before_tax if pd.notna(r.profit_before_tax) else 'NULL'}, {r.tax_pct if pd.notna(r.tax_pct) else 'NULL'}, {r.net_profit if pd.notna(r.net_profit) else 'NULL'}, {r.eps if pd.notna(r.eps) else 'NULL'}, {r.dividend_payout_pct if pd.notna(r.dividend_payout_pct) else 'NULL'}, {r.net_profit_margin_pct if pd.notna(r.net_profit_margin_pct) else 'NULL'}, {r.expense_ratio_pct if pd.notna(r.expense_ratio_pct) else 'NULL'}, {r.interest_coverage if pd.notna(r.interest_coverage) else 'NULL'}) ON CONFLICT (symbol, year_label) DO NOTHING;\n")
            f.write("\n")

            # Seed fact_balance_sheet
            f.write("-- Seed fact_balance_sheet\n")
            for _, r in fact_balance_sheet.iterrows():
                f.write(f"INSERT INTO fact_balance_sheet (symbol, year_label, equity_capital, reserves, borrowings, other_liabilities, total_liabilities, fixed_assets, cwip, investments, other_assets, total_assets, debt_to_equity, equity_ratio) VALUES ('{r.symbol}', '{r.year_label}', {r.equity_capital if pd.notna(r.equity_capital) else 'NULL'}, {r.reserves if pd.notna(r.reserves) else 'NULL'}, {r.borrowings if pd.notna(r.borrowings) else 'NULL'}, {r.other_liabilities if pd.notna(r.other_liabilities) else 'NULL'}, {r.total_liabilities if pd.notna(r.total_liabilities) else 'NULL'}, {r.fixed_assets if pd.notna(r.fixed_assets) else 'NULL'}, {r.cwip if pd.notna(r.cwip) else 'NULL'}, {r.investments if pd.notna(r.investments) else 'NULL'}, {r.other_assets if pd.notna(r.other_assets) else 'NULL'}, {r.total_assets if pd.notna(r.total_assets) else 'NULL'}, {r.debt_to_equity if pd.notna(r.debt_to_equity) else 'NULL'}, {r.equity_ratio if pd.notna(r.equity_ratio) else 'NULL'}) ON CONFLICT (symbol, year_label) DO NOTHING;\n")
            f.write("\n")

            # Seed fact_cash_flow
            f.write("-- Seed fact_cash_flow\n")
            for _, r in fact_cash_flow.iterrows():
                f.write(f"INSERT INTO fact_cash_flow (symbol, year_label, operating_activity, investing_activity, financing_activity, net_cash_flow, free_cash_flow) VALUES ('{r.symbol}', '{r.year_label}', {r.operating_activity if pd.notna(r.operating_activity) else 'NULL'}, {r.investing_activity if pd.notna(r.investing_activity) else 'NULL'}, {r.financing_activity if pd.notna(r.financing_activity) else 'NULL'}, {r.net_cash_flow if pd.notna(r.net_cash_flow) else 'NULL'}, {r.free_cash_flow if pd.notna(r.free_cash_flow) else 'NULL'}) ON CONFLICT (symbol, year_label) DO NOTHING;\n")
            f.write("\n")

            # Seed fact_analysis
            f.write("-- Seed fact_analysis\n")
            for _, r in fact_analysis.iterrows():
                f.write(f"INSERT INTO fact_analysis (symbol, period_label, compounded_sales_growth_pct, compounded_profit_growth_pct, stock_price_cagr_pct, roe_pct) VALUES ('{r.symbol}', '{r.period_label}', {r.compounded_sales_growth_pct if pd.notna(r.compounded_sales_growth_pct) else 'NULL'}, {r.compounded_profit_growth_pct if pd.notna(r.compounded_profit_growth_pct) else 'NULL'}, {r.stock_price_cagr_pct if pd.notna(r.stock_price_cagr_pct) else 'NULL'}, {r.roe_pct if pd.notna(r.roe_pct) else 'NULL'}) ON CONFLICT (symbol, period_label) DO NOTHING;\n")
            f.write("\n")

            # Seed fact_ml_scores
            f.write("-- Seed fact_ml_scores\n")
            for _, r in fact_ml_scores.iterrows():
                f.write(f"INSERT INTO fact_ml_scores (symbol, computed_at, overall_score, profitability_score, growth_score, leverage_score, cashflow_score, trend_score, health_label) VALUES ('{r.symbol}', '{r.computed_at}', {r.overall_score}, {r.profitability_score}, {r.growth_score}, {r.leverage_score}, {r.cashflow_score}, {r.trend_score}, '{r.health_label}') ON CONFLICT DO NOTHING;\n")
            f.write("\n")

            # Seed fact_pros_cons
            f.write("-- Seed fact_pros_cons\n")
            if not fact_pros_cons.empty:
                for _, r in fact_pros_cons.iterrows():
                    txt = str(r['text']).replace("'", "''") if pd.notna(r.get('text')) else ""
                    is_pro_val = 'TRUE' if r.get('is_pro') == True or str(r.get('is_pro')).lower() in ['true', '1'] else 'FALSE'
                    cat = str(r['category']).replace("'", "''") if 'category' in r and pd.notna(r['category']) else 'General'
                    conf = r['confidence'] if 'confidence' in r and pd.notna(r['confidence']) else 'NULL'
                    f.write(f"INSERT INTO fact_pros_cons (symbol, is_pro, category, text, confidence) VALUES ('{r['symbol']}', {is_pro_val}, '{cat}', '{txt}', {conf}) ON CONFLICT DO NOTHING;\n")
            
        print(f"Generated SQL seed dump successfully. You can import this into PostgreSQL to set up everything automatically!")

if __name__ == "__main__":
    run_migration()

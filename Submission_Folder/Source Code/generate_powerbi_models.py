import os
import json

def generate_dashboards():
    print("Starting Power BI Project (PBIP) Generator...")

    # Folder names and configurations
    dashboards = {
        "01_executive_overview": {
            "name": "Dashboard 1 - Executive Market Overview",
            "pages": [
                {"name": "Page 1.1 — Market Snapshot", "displayName": "Page 1.1 — Market Snapshot"},
                {"name": "Page 1.2 — Sector Performance", "displayName": "Page 1.2 — Sector Performance"},
                {"name": "Page 1.3 — YoY Growth Tracker", "displayName": "Page 1.3 — YoY Growth Tracker"}
            ]
        },
        "02_company_deep_dive": {
            "name": "Dashboard 2 - Company Deep Dive",
            "pages": [
                {"name": "Page 2.1 — Financial Summary", "displayName": "Page 2.1 — Financial Summary"},
                {"name": "Page 2.2 — Balance Sheet Health", "displayName": "Page 2.2 — Balance Sheet Health"},
                {"name": "Page 2.3 — Cash Flow Analysis", "displayName": "Page 2.3 — Cash Flow Analysis"},
                {"name": "Page 2.4 — Growth & Returns Analysis", "displayName": "Page 2.4 — Growth & Returns Analysis"}
            ]
        },
        "03_sector_comparison": {
            "name": "Dashboard 3 - Sector Comparison Analyzer",
            "pages": [
                {"name": "Page 3.1 — Sector vs Sector", "displayName": "Page 3.1 — Sector vs Sector"},
                {"name": "Page 3.2 — Companies Within a Sector", "displayName": "Page 3.2 — Companies Within a Sector"},
                {"name": "Page 3.3 — Sector Trends Over Time", "displayName": "Page 3.3 — Sector Trends Over Time"}
            ]
        },
        "04_health_scorecard": {
            "name": "Dashboard 4 - Financial Health Scorecard",
            "pages": [
                {"name": "Page 4.1 — Health Score Leaderboard", "displayName": "Page 4.1 — Health Score Leaderboard"},
                {"name": "Page 4.2 — Scorecard Breakdown", "displayName": "Page 4.2 — Scorecard Breakdown"}
            ]
        },
        "05_growth_analytics": {
            "name": "Dashboard 5 - Growth & Valuation Analytics",
            "pages": [
                {"name": "Page 5.1 — Revenue & Profit Growth", "displayName": "Page 5.1 — Revenue & Profit Growth"},
                {"name": "Page 5.2 — Margin Evolution", "displayName": "Page 5.2 — Margin Evolution"},
                {"name": "Page 5.3 — EPS & Earnings Quality", "displayName": "Page 5.3 — EPS & Earnings Quality"}
            ]
        },
        "06_debt_leverage": {
            "name": "Dashboard 6 - Debt & Leverage Monitor",
            "pages": [
                {"name": "Page 6.1 — Leverage Snapshot", "displayName": "Page 6.1 — Leverage Snapshot"},
                {"name": "Page 6.2 — Debt Trajectory", "displayName": "Page 6.2 — Debt Trajectory"}
            ]
        },
        "07_dividend_returns": {
            "name": "Dashboard 7 - Dividend & Shareholder Returns",
            "pages": [
                {"name": "Page 7.1 — Dividend Analysis", "displayName": "Page 7.1 — Dividend Analysis"},
                {"name": "Page 7.2 — Shareholder Value", "displayName": "Page 7.2 — Shareholder Value"}
            ]
        }
    }

    # Define standard tables in the data warehouse
    tables_definition = [
        {
            "name": "dim_company",
            "columns": [
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "company_name", "dataType": "string", "sourceColumn": "company_name"},
                {"name": "sector", "dataType": "string", "sourceColumn": "sector"},
                {"name": "sub_sector", "dataType": "string", "sourceColumn": "sub_sector"},
                {"name": "company_logo", "dataType": "string", "sourceColumn": "company_logo"},
                {"name": "website", "dataType": "string", "sourceColumn": "website"},
                {"name": "nse_url", "dataType": "string", "sourceColumn": "nse_url"},
                {"name": "bse_url", "dataType": "string", "sourceColumn": "bse_url"},
                {"name": "face_value", "dataType": "double", "sourceColumn": "face_value"},
                {"name": "book_value", "dataType": "double", "sourceColumn": "book_value"},
                {"name": "about_company", "dataType": "string", "sourceColumn": "about_company"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_dim_company = Source{[Schema=\"public\",Item=\"dim_company\"]}[Data]\nin\n    public_dim_company"
        },
        {
            "name": "dim_year",
            "columns": [
                {"name": "year_id", "dataType": "int64", "sourceColumn": "year_id"},
                {"name": "year_label", "dataType": "string", "sourceColumn": "year_label"},
                {"name": "fiscal_year", "dataType": "int64", "sourceColumn": "fiscal_year"},
                {"name": "quarter", "dataType": "string", "sourceColumn": "quarter"},
                {"name": "is_ttm", "dataType": "boolean", "sourceColumn": "is_ttm"},
                {"name": "is_half_year", "dataType": "boolean", "sourceColumn": "is_half_year"},
                {"name": "sort_order", "dataType": "int64", "sourceColumn": "sort_order"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_dim_year = Source{[Schema=\"public\",Item=\"dim_year\"]}[Data]\nin\n    public_dim_year"
        },
        {
            "name": "dim_sector",
            "columns": [
                {"name": "sector_id", "dataType": "int64", "sourceColumn": "sector_id"},
                {"name": "sector_name", "dataType": "string", "sourceColumn": "sector_name"},
                {"name": "sector_code", "dataType": "string", "sourceColumn": "sector_code"},
                {"name": "description", "dataType": "string", "sourceColumn": "description"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_dim_sector = Source{[Schema=\"public\",Item=\"dim_sector\"]}[Data]\nin\n    public_dim_sector"
        },
        {
            "name": "dim_health_label",
            "columns": [
                {"name": "label_id", "dataType": "int64", "sourceColumn": "label_id"},
                {"name": "label_name", "dataType": "string", "sourceColumn": "label_name"},
                {"name": "min_score", "dataType": "int64", "sourceColumn": "min_score"},
                {"name": "max_score", "dataType": "int64", "sourceColumn": "max_score"},
                {"name": "color_hex", "dataType": "string", "sourceColumn": "color_hex"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_dim_health_label = Source{[Schema=\"public\",Item=\"dim_health_label\"]}[Data]\nin\n    public_dim_health_label"
        },
        {
            "name": "fact_profit_loss",
            "columns": [
                {"name": "id", "dataType": "int64", "sourceColumn": "id"},
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "year_label", "dataType": "string", "sourceColumn": "year_label"},
                {"name": "sales", "dataType": "double", "sourceColumn": "sales"},
                {"name": "expenses", "dataType": "double", "sourceColumn": "expenses"},
                {"name": "operating_profit", "dataType": "double", "sourceColumn": "operating_profit"},
                {"name": "opm_pct", "dataType": "double", "sourceColumn": "opm_pct"},
                {"name": "other_income", "dataType": "double", "sourceColumn": "other_income"},
                {"name": "interest", "dataType": "double", "sourceColumn": "interest"},
                {"name": "depreciation", "dataType": "double", "sourceColumn": "depreciation"},
                {"name": "profit_before_tax", "dataType": "double", "sourceColumn": "profit_before_tax"},
                {"name": "tax_pct", "dataType": "double", "sourceColumn": "tax_pct"},
                {"name": "net_profit", "dataType": "double", "sourceColumn": "net_profit"},
                {"name": "eps", "dataType": "double", "sourceColumn": "eps"},
                {"name": "dividend_payout_pct", "dataType": "double", "sourceColumn": "dividend_payout_pct"},
                {"name": "net_profit_margin_pct", "dataType": "double", "sourceColumn": "net_profit_margin_pct"},
                {"name": "expense_ratio_pct", "dataType": "double", "sourceColumn": "expense_ratio_pct"},
                {"name": "interest_coverage", "dataType": "double", "sourceColumn": "interest_coverage"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_fact_profit_loss = Source{[Schema=\"public\",Item=\"fact_profit_loss\"]}[Data]\nin\n    public_fact_profit_loss"
        },
        {
            "name": "fact_balance_sheet",
            "columns": [
                {"name": "id", "dataType": "int64", "sourceColumn": "id"},
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "year_label", "dataType": "string", "sourceColumn": "year_label"},
                {"name": "equity_capital", "dataType": "double", "sourceColumn": "equity_capital"},
                {"name": "reserves", "dataType": "double", "sourceColumn": "reserves"},
                {"name": "borrowings", "dataType": "double", "sourceColumn": "borrowings"},
                {"name": "other_liabilities", "dataType": "double", "sourceColumn": "other_liabilities"},
                {"name": "total_liabilities", "dataType": "double", "sourceColumn": "total_liabilities"},
                {"name": "fixed_assets", "dataType": "double", "sourceColumn": "fixed_assets"},
                {"name": "cwip", "dataType": "double", "sourceColumn": "cwip"},
                {"name": "investments", "dataType": "double", "sourceColumn": "investments"},
                {"name": "other_assets", "dataType": "double", "sourceColumn": "other_assets"},
                {"name": "total_assets", "dataType": "double", "sourceColumn": "total_assets"},
                {"name": "debt_to_equity", "dataType": "double", "sourceColumn": "debt_to_equity"},
                {"name": "equity_ratio", "dataType": "double", "sourceColumn": "equity_ratio"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_fact_balance_sheet = Source{[Schema=\"public\",Item=\"fact_balance_sheet\"]}[Data]\nin\n    public_fact_balance_sheet"
        },
        {
            "name": "fact_cash_flow",
            "columns": [
                {"name": "id", "dataType": "int64", "sourceColumn": "id"},
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "year_label", "dataType": "string", "sourceColumn": "year_label"},
                {"name": "operating_activity", "dataType": "double", "sourceColumn": "operating_activity"},
                {"name": "investing_activity", "dataType": "double", "sourceColumn": "investing_activity"},
                {"name": "financing_activity", "dataType": "double", "sourceColumn": "financing_activity"},
                {"name": "net_cash_flow", "dataType": "double", "sourceColumn": "net_cash_flow"},
                {"name": "free_cash_flow", "dataType": "double", "sourceColumn": "free_cash_flow"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_fact_cash_flow = Source{[Schema=\"public\",Item=\"fact_cash_flow\"]}[Data]\nin\n    public_fact_cash_flow"
        },
        {
            "name": "fact_analysis",
            "columns": [
                {"name": "id", "dataType": "int64", "sourceColumn": "id"},
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "period_label", "dataType": "string", "sourceColumn": "period_label"},
                {"name": "compounded_sales_growth_pct", "dataType": "double", "sourceColumn": "compounded_sales_growth_pct"},
                {"name": "compounded_profit_growth_pct", "dataType": "double", "sourceColumn": "compounded_profit_growth_pct"},
                {"name": "stock_price_cagr_pct", "dataType": "double", "sourceColumn": "stock_price_cagr_pct"},
                {"name": "roe_pct", "dataType": "double", "sourceColumn": "roe_pct"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_fact_analysis = Source{[Schema=\"public\",Item=\"fact_analysis\"]}[Data]\nin\n    public_fact_analysis"
        },
        {
            "name": "fact_ml_scores",
            "columns": [
                {"name": "id", "dataType": "int64", "sourceColumn": "id"},
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "computed_at", "dataType": "dateTime", "sourceColumn": "computed_at"},
                {"name": "overall_score", "dataType": "int64", "sourceColumn": "overall_score"},
                {"name": "profitability_score", "dataType": "int64", "sourceColumn": "profitability_score"},
                {"name": "growth_score", "dataType": "int64", "sourceColumn": "growth_score"},
                {"name": "leverage_score", "dataType": "int64", "sourceColumn": "leverage_score"},
                {"name": "cashflow_score", "dataType": "int64", "sourceColumn": "cashflow_score"},
                {"name": "trend_score", "dataType": "int64", "sourceColumn": "trend_score"},
                {"name": "health_label", "dataType": "string", "sourceColumn": "health_label"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_fact_ml_scores = Source{[Schema=\"public\",Item=\"fact_ml_scores\"]}[Data]\nin\n    public_fact_ml_scores"
        },
        {
            "name": "fact_pros_cons",
            "columns": [
                {"name": "id", "dataType": "int64", "sourceColumn": "id"},
                {"name": "symbol", "dataType": "string", "sourceColumn": "symbol"},
                {"name": "is_pro", "dataType": "boolean", "sourceColumn": "is_pro"},
                {"name": "category", "dataType": "string", "sourceColumn": "category"},
                {"name": "text", "dataType": "string", "sourceColumn": "text"},
                {"name": "confidence", "dataType": "double", "sourceColumn": "confidence"}
            ],
            "expression": "let\n    Source = PostgreSQL.Database(\"localhost:5432\", \"bluestock_dw\"),\n    public_fact_pros_cons = Source{[Schema=\"public\",Item=\"fact_pros_cons\"]}[Data]\nin\n    public_fact_pros_cons"
        }
    ]

    # Define all mandatory relationships requested in Section 4.2
    relationships = [
        {"fromTable": "fact_profit_loss", "fromColumn": "symbol", "toTable": "dim_company", "toColumn": "symbol"},
        {"fromTable": "fact_profit_loss", "fromColumn": "year_label", "toTable": "dim_year", "toColumn": "year_label"},
        {"fromTable": "fact_balance_sheet", "fromColumn": "symbol", "toTable": "dim_company", "toColumn": "symbol"},
        {"fromTable": "fact_balance_sheet", "fromColumn": "year_label", "toTable": "dim_year", "toColumn": "year_label"},
        {"fromTable": "fact_cash_flow", "fromColumn": "symbol", "toTable": "dim_company", "toColumn": "symbol"},
        {"fromTable": "fact_cash_flow", "fromColumn": "year_label", "toTable": "dim_year", "toColumn": "year_label"},
        {"fromTable": "fact_analysis", "fromColumn": "symbol", "toTable": "dim_company", "toColumn": "symbol"},
        {"fromTable": "fact_ml_scores", "fromColumn": "symbol", "toTable": "dim_company", "toColumn": "symbol"},
        {"fromTable": "fact_pros_cons", "fromColumn": "symbol", "toTable": "dim_company", "toColumn": "symbol"},
        {"fromTable": "dim_company", "fromColumn": "sector", "toTable": "dim_sector", "toColumn": "sector_name"}
    ]

    # Define all standard measures for the dashboards
    # Attached to the centralized '_KeyMeasures' table
    measures = [
        {"name": "Total Companies", "expression": "COUNT(dim_company[symbol])", "formatString": "#,0"},
        {"name": "Average ROE", "expression": "AVERAGE(fact_analysis[roe_pct])", "formatString": "0.00%"},
        {"name": "Companies with Excellent Health", "expression": "CALCULATE(COUNT(dim_company[symbol]), fact_ml_scores[overall_score] >= 85)", "formatString": "#,0"},
        {"name": "Companies with Weak/Poor Health", "expression": "CALCULATE(COUNT(dim_company[symbol]), fact_ml_scores[overall_score] < 50)", "formatString": "#,0"},
        {"name": "3Y Sales CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_sales_growth_pct]), fact_analysis[period_label] = \"3Y\")", "formatString": "0.00%"},
        {"name": "5Y Sales CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_sales_growth_pct]), fact_analysis[period_label] = \"5Y\")", "formatString": "0.00%"},
        {"name": "10Y Sales CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_sales_growth_pct]), fact_analysis[period_label] = \"10Y\")", "formatString": "0.00%"},
        {"name": "TTM Sales CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_sales_growth_pct]), fact_analysis[period_label] = \"TTM\")", "formatString": "0.00%"},
        {"name": "3Y Profit CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_profit_growth_pct]), fact_analysis[period_label] = \"3Y\")", "formatString": "0.00%"},
        {"name": "5Y Profit CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_profit_growth_pct]), fact_analysis[period_label] = \"5Y\")", "formatString": "0.00%"},
        {"name": "10Y Profit CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_profit_growth_pct]), fact_analysis[period_label] = \"10Y\")", "formatString": "0.00%"},
        {"name": "TTM Profit CAGR", "expression": "CALCULATE(AVERAGE(fact_analysis[compounded_profit_growth_pct]), fact_analysis[period_label] = \"TTM\")", "formatString": "0.00%"},
        {"name": "Sector Avg OPM%", "expression": "AVERAGE(fact_profit_loss[opm_pct])", "formatString": "0.00%"},
        {"name": "Sector Avg D/E", "expression": "AVERAGE(fact_balance_sheet[debt_to_equity])", "formatString": "0.00"},
        {"name": "Sector Avg ROE", "expression": "CALCULATE(AVERAGE(fact_analysis[roe_pct]), ALLEXCEPT(dim_company, dim_company[sector]))", "formatString": "0.00%"},
        {"name": "ROE Last Year", "expression": "CALCULATE(AVERAGE(fact_analysis[roe_pct]), fact_analysis[period_label] = \"TTM\")", "formatString": "0.00%"},
        {"name": "Total Revenue", "expression": "SUM(fact_profit_loss[sales])", "formatString": "₹#,0.00"},
        {"name": "Total Net Profit", "expression": "SUM(fact_profit_loss[net_profit])", "formatString": "₹#,0.00"},
        {"name": "Equity Ratio", "expression": "AVERAGE(fact_balance_sheet[equity_ratio])", "formatString": "0.00"},
        {"name": "Free Cash Flow", "expression": "SUM(fact_cash_flow[free_cash_flow])", "formatString": "₹#,0.00"},
        {"name": "Cash Conversion Ratio", "expression": "DIVIDE(SUM(fact_cash_flow[operating_activity]), SUM(fact_profit_loss[net_profit]))", "formatString": "0.00"},
        {"name": "Debt-to-Equity", "expression": "AVERAGE(fact_balance_sheet[debt_to_equity])", "formatString": "0.00"},
        {"name": "Borrowings", "expression": "SUM(fact_balance_sheet[borrowings])", "formatString": "₹#,0.00"},
        {"name": "Reserves", "expression": "SUM(fact_balance_sheet[reserves])", "formatString": "₹#,0.00"},
        {"name": "Health Score", "expression": "AVERAGE(fact_ml_scores[overall_score])", "formatString": "0.0"},
        {"name": "Sales Growth Rate YoY", "expression": "VAR CurrentSales = SUM(fact_profit_loss[sales]) VAR PreviousSales = CALCULATE(SUM(fact_profit_loss[sales]), FILTER(ALL(dim_year), dim_year[fiscal_year] = MAX(dim_year[fiscal_year]) - 1)) RETURN DIVIDE(CurrentSales - PreviousSales, PreviousSales) * 100", "formatString": "0.00%"},
        {"name": "Profit Growth Rate YoY", "expression": "VAR CurrentProfit = SUM(fact_profit_loss[net_profit]) VAR PreviousProfit = CALCULATE(SUM(fact_profit_loss[net_profit]), FILTER(ALL(dim_year), dim_year[fiscal_year] = MAX(dim_year[fiscal_year]) - 1)) RETURN DIVIDE(CurrentProfit - PreviousProfit, PreviousProfit) * 100", "formatString": "0.00%"},
        {"name": "Consistent Growers Flag", "expression": "VAR CurrentCompany = SELECTEDVALUE(dim_company[symbol]) VAR YearsWithGrowth = COUNTROWS(FILTER(SUMMARIZE(FILTER(ALL(fact_profit_loss), fact_profit_loss[symbol] = CurrentCompany), fact_profit_loss[year_label], \"YoYGrowth\", [Sales Growth Rate YoY]), [YoYGrowth] > 0)) RETURN IF(YearsWithGrowth >= 5, 1, 0)", "formatString": "0"},
        {"name": "Consistent Dividend Payers Flag", "expression": "VAR CurrentCompany = SELECTEDVALUE(dim_company[symbol]) VAR YearsWithDividends = COUNTROWS(FILTER(ALL(fact_profit_loss), fact_profit_loss[symbol] = CurrentCompany && fact_profit_loss[dividend_payout_pct] > 0)) RETURN IF(YearsWithDividends >= 5, 1, 0)", "formatString": "0"},
        {"name": "Interest Coverage", "expression": "AVERAGE(fact_profit_loss[interest_coverage])", "formatString": "0.00"},
        {"name": "Dividend Yield", "expression": "AVERAGE(fact_profit_loss[dividend_payout_pct])", "formatString": "0.00%"},
        {"name": "EPS", "expression": "AVERAGE(fact_profit_loss[eps])", "formatString": "₹#,0.00"},
        {"name": "ROCE", "expression": "AVERAGE(fact_analysis[roe_pct])", "formatString": "0.00%"}
    ]

    for db_id, db_meta in dashboards.items():
        db_dir = os.path.join("powerbi", f"{db_id}.pbip")
        dataset_dir = os.path.join("powerbi", f"{db_id}.Dataset")
        report_dir = os.path.join("powerbi", f"{db_id}.Report")

        # Create directories
        os.makedirs(db_dir, exist_ok=True)
        os.makedirs(dataset_dir, exist_ok=True)
        os.makedirs(report_dir, exist_ok=True)

        print(f"Generating semantic model and layout for: {db_meta['name']}...")

        # 1. Write the <Name>.pbip entrypoint file
        pbip_data = {
            "version": "1.0",
            "settings": {
                "connection": {
                    "type": "pbiProject"
                }
            },
            "datasetReference": {
                "byPath": f"../{db_id}.Dataset"
            },
            "reportReference": {
                "byPath": f"../{db_id}.Report"
            }
        }
        with open(os.path.join(db_dir, f"{db_id}.pbip"), "w") as f:
            json.dump(pbip_data, f, indent=2)

        # 2. Write Dataset definition.pbidataset
        pbidataset_data = {
            "dataset": {
                "byPath": "./model.bim"
            }
        }
        with open(os.path.join(dataset_dir, "definition.pbidataset"), "w") as f:
            json.dump(pbidataset_data, f, indent=2)

        # 3. Write Report definition.pbir
        pbir_data = {
            "datasetReference": {
                "byPath": f"../{db_id}.Dataset"
            }
        }
        with open(os.path.join(report_dir, "definition.pbir"), "w") as f:
            json.dump(pbir_data, f, indent=2)

        # 4. Generate the model.bim Tabular Object Model JSON file
        bim_tables = []
        for t_def in tables_definition:
            columns_meta = []
            for col in t_def["columns"]:
                columns_meta.append({
                    "name": col["name"],
                    "dataType": col["dataType"],
                    "sourceColumn": col["sourceColumn"]
                })
            
            bim_tables.append({
                "name": t_def["name"],
                "columns": columns_meta,
                "partitions": [
                    {
                        "name": f"{t_def['name']}-Partition",
                        "source": {
                            "type": "m",
                            "expression": t_def["expression"].split("\n")
                        }
                    }
                ]
            })

        # Add the measures table
        bim_tables.append({
            "name": "_KeyMeasures",
            "columns": [
                {
                    "name": "Placeholder",
                    "dataType": "int64",
                    "isHidden": True,
                    "sourceLineageTag": "Placeholder"
                }
            ],
            "partitions": [
                {
                    "name": "_KeyMeasures-Partition",
                    "source": {
                        "type": "m",
                        "expression": [
                            "let",
                            "    Source = Table.FromRows(Json.Document(Binary.Decompress(Binary.FromText(\"i45KKi1OLTJU0lEyMjAyMTU1M7ewMjAEAA==\", BinaryEncoding.Base64), Compression.Deflate)), let _t = ((type nullable text) meta [Serialized.Text = true]) in type table [Placeholder = _t]),",
                            "    Type = Table.TransformColumnTypes(Source,{{\"Placeholder\", Int64.Type}})",
                            "in",
                            "    Type"
                        ]
                    }
                }
            ],
            "measures": [
                {
                    "name": m["name"],
                    "expression": m["expression"],
                    "formatString": m["formatString"]
                } for m in measures
            ]
        })

        # Map relationships into BIM format
        bim_relationships = []
        for idx, rel in enumerate(relationships):
            bim_relationships.append({
                "name": f"Relationship_Auto_{idx}",
                "fromTable": rel["fromTable"],
                "fromColumn": rel["fromColumn"],
                "toTable": rel["toTable"],
                "toColumn": rel["toColumn"],
                "crossFilteringBehavior": "single"
            })

        bim_data = {
            "name": db_id,
            "compatibilityLevel": 1550,
            "model": {
                "culture": "en-US",
                "dataSources": [
                    {
                        "type": "structured",
                        "name": "PostgreSQL/localhost:5432;bluestock_dw",
                        "connectionDetails": {
                            "protocol": "postgresql",
                            "address": {
                                "server": "localhost:5432",
                                "database": "bluestock_dw"
                            },
                            "authentication": None,
                            "query": None
                        },
                        "credential": {
                            "AuthenticationKind": "UsernamePassword",
                            "Username": "postgres",
                            "EncryptConnection": False
                        }
                    }
                ],
                "tables": bim_tables,
                "relationships": bim_relationships
            }
        }

        with open(os.path.join(dataset_dir, "model.bim"), "w") as f:
            json.dump(bim_data, f, indent=2)

        # 5. Generate Report layout.json containing the pre-named pages
        layout_pages = []
        for idx, page in enumerate(db_meta["pages"]):
            layout_pages.append({
                "name": f"ReportPage_{idx}",
                "displayName": page["displayName"],
                "displayAreaWidth": 1280.00,
                "displayAreaHeight": 720.00,
                "visualContainers": []
            })

        layout_data = {
            "version": "1.30",
            "theme": "Courier",
            "pages": layout_pages
        }
        with open(os.path.join(report_dir, "layout.json"), "w") as f:
            json.dump(layout_data, f, indent=2)

    print("\n[SUCCESS] Generated all 7 Power BI Project Templates in the 'powerbi/' folder!")
    print("Each project has the PostgreSQL connection, all 10 relationships, and all required DAX measures pre-packaged!")

if __name__ == "__main__":
    generate_dashboards()

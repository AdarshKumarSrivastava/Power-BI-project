import { useState, useEffect, useCallback, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, LineChart, Line, Cell
} from 'recharts';
import {
  LayoutDashboard, TrendingUp,
  PieChart, Settings, Database, Briefcase, ShieldCheck, DollarSign,
  Layers, CheckCircle2, RefreshCw, Filter, X, Download, Code2, Copy, Check,
  AlertTriangle, Sun, Moon, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PowerBI UI Error Boundary] Caught component render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', margin: '24px 0' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px' }}>
            <AlertTriangle size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {this.props.fallbackTitle || 'Visualization Error Encountered'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 20px' }}>
            {this.state.error?.message || 'A visual dashboard component encountered an unexpected rendering error.'}
          </p>
          <button
            onClick={this.handleReset}
            className="filter-btn"
            style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} /> Reset View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ChartData {
  name: string;
  revenue: number;
  profit: number;
  activeUsers: number;
}

interface KpiData {
  totalRevenue: number;
  avgMargin: number;
  totalProfit?: number;
  cagr?: number;
}

const DEFAULT_CHART_DATA: ChartData[] = [
  { name: "FY19", revenue: 45200, profit: 5400, activeUsers: 1620 },
  { name: "FY20", revenue: 51800, profit: 6250, activeUsers: 1840 },
  { name: "FY21", revenue: 61400, profit: 7890, activeUsers: 2150 },
  { name: "FY22", revenue: 75200, profit: 9840, activeUsers: 2580 },
  { name: "FY23", revenue: 89600, profit: 12100, activeUsers: 2940 },
  { name: "FY24", revenue: 104500, profit: 14850, activeUsers: 3410 }
];

const DEFAULT_KPIS: KpiData = {
  totalRevenue: 427700,
  avgMargin: 14.2,
  totalProfit: 56330,
  cagr: 18.25
};

const SECTOR_DATA = [
  { name: "IT", revenue: 98500, margin: 21.5, pe: 28.4, debtEquity: 0.06, interestCoverage: 32.5, divYield: 2.1, payoutRatio: 48.0, color: "#3b82f6" },
  { name: "Banking", revenue: 135000, margin: 18.2, pe: 16.8, debtEquity: 0.83, interestCoverage: 4.8, divYield: 1.4, payoutRatio: 22.5, color: "#10b981" },
  { name: "Automobile", revenue: 54000, margin: 11.4, pe: 24.1, debtEquity: 0.38, interestCoverage: 7.2, divYield: 1.2, payoutRatio: 26.0, color: "#f59e0b" },
  { name: "Pharma", revenue: 42000, margin: 19.8, pe: 32.5, debtEquity: 0.08, interestCoverage: 18.4, divYield: 0.9, payoutRatio: 21.0, color: "#8b5cf6" },
  { name: "Energy", revenue: 112000, margin: 14.6, pe: 12.2, debtEquity: 0.42, interestCoverage: 6.9, divYield: 3.8, payoutRatio: 38.5, color: "#ec4899" },
  { name: "FMCG", revenue: 68000, margin: 23.1, pe: 41.6, debtEquity: 0.02, interestCoverage: 41.0, divYield: 2.6, payoutRatio: 62.0, color: "#14b8a6" }
];

const HEALTH_COMPANIES = [
  { symbol: "TCS", sector: "IT", altmanZ: 7.82, piotroskiF: 8, roe: "38.2%", debtEquity: 0.04, status: "Safe" },
  { symbol: "INFY", sector: "IT", altmanZ: 6.94, piotroskiF: 7, roe: "31.5%", debtEquity: 0.08, status: "Safe" },
  { symbol: "HDFCBANK", sector: "Banking", altmanZ: 3.45, piotroskiF: 8, roe: "16.8%", debtEquity: 0.85, status: "Safe" },
  { symbol: "ICICIBANK", sector: "Banking", altmanZ: 3.52, piotroskiF: 8, roe: "18.5%", debtEquity: 0.81, status: "Safe" },
  { symbol: "RELIANCE", sector: "Energy", altmanZ: 3.12, piotroskiF: 7, roe: "12.4%", debtEquity: 0.42, status: "Moderate" },
  { symbol: "TATAMOTORS", sector: "Auto", altmanZ: 2.85, piotroskiF: 7, roe: "18.9%", debtEquity: 0.74, status: "Moderate" },
  { symbol: "MARUTI", sector: "Auto", altmanZ: 6.15, piotroskiF: 8, roe: "14.8%", debtEquity: 0.02, status: "Safe" },
  { symbol: "SUNPHARMA", sector: "Pharma", altmanZ: 5.61, piotroskiF: 8, roe: "15.7%", debtEquity: 0.12, status: "Safe" },
  { symbol: "CIPLA", sector: "Pharma", altmanZ: 6.42, piotroskiF: 8, roe: "16.4%", debtEquity: 0.05, status: "Safe" },
  { symbol: "ITC", sector: "FMCG", altmanZ: 8.45, piotroskiF: 9, roe: "29.4%", debtEquity: 0.01, status: "Safe" },
  { symbol: "HINDUNILVR", sector: "FMCG", altmanZ: 7.21, piotroskiF: 7, roe: "20.3%", debtEquity: 0.03, status: "Safe" }
];

const STAR_SCHEMA_TABLES = [
  { name: "fact_profit_loss", type: "Fact Table", rows: "1,200+", desc: "Yearly sales, operating profit, expenses, net profit & margins across Nifty 100." },
  { name: "fact_balance_sheet", type: "Fact Table", rows: "1,200+", desc: "Equity capital, reserves, borrowings, total assets & liabilities." },
  { name: "fact_cash_flow", type: "Fact Table", rows: "1,200+", desc: "Operating, investing & financing cash flows with free cash flow calculations." },
  { name: "dim_company", type: "Dimension", rows: "100", desc: "Company identifiers, full names, industry sectors, and market capitalization." },
  { name: "dim_year", type: "Dimension", rows: "12", desc: "Fiscal year dimensions, sequence orders, and financial period mappings." },
  { name: "dim_sector", type: "Dimension", rows: "15", desc: "Sector taxonomy, sub-industry classifications, and benchmark weights." }
];

interface DaxMeasure {
  name: string;
  category: string;
  formula: string;
  description: string;
}

const DAX_MEASURES: DaxMeasure[] = [
  {
    name: "3Y Sales CAGR",
    category: "Growth Analytics",
    formula: "3Y Sales CAGR = \nVAR CurrentSales = [Total Sales]\nVAR Sales3Y = CALCULATE([Total Sales], DATEADD(dim_year[year_date], -3, YEAR))\nRETURN IF(Sales3Y > 0, ((CurrentSales / Sales3Y) ^ (1/3)) - 1, BLANK())",
    description: "Calculates the 3-Year Compound Annual Growth Rate for company revenues."
  },
  {
    name: "5Y Sales CAGR",
    category: "Growth Analytics",
    formula: "5Y Sales CAGR = \nCALCULATE(AVERAGE(fact_analysis[compounded_sales_growth_pct]), fact_analysis[period_label] = \"5Y\")",
    description: "Measures 5-year sustained top-line revenue expansion across market cycles."
  },
  {
    name: "5Y Profit CAGR",
    category: "Growth Analytics",
    formula: "5Y Profit CAGR = \nCALCULATE(AVERAGE(fact_analysis[compounded_profit_growth_pct]), fact_analysis[period_label] = \"5Y\")",
    description: "Multi-year earnings compounding rate indicating underlying profitability momentum."
  },
  {
    name: "Sales Growth Rate YoY",
    category: "Growth Analytics",
    formula: "Sales Growth Rate YoY = \nVAR CurrentSales = SUM(fact_profit_loss[sales])\nVAR PreviousSales = CALCULATE(SUM(fact_profit_loss[sales]), FILTER(ALL(dim_year), dim_year[fiscal_year] = MAX(dim_year[fiscal_year]) - 1))\nRETURN DIVIDE(CurrentSales - PreviousSales, PreviousSales) * 100",
    description: "Year-over-year revenue percentage growth rate comparing consecutive fiscal years."
  },
  {
    name: "Consistent Growers Flag",
    category: "Growth Analytics",
    formula: "Consistent Growers Flag = \nVAR CurrentCompany = SELECTEDVALUE(dim_company[symbol])\nVAR YearsWithGrowth = COUNTROWS(FILTER(SUMMARIZE(FILTER(ALL(fact_profit_loss), fact_profit_loss[symbol] = CurrentCompany), fact_profit_loss[year_label], \"YoYGrowth\", [Sales Growth Rate YoY]), [YoYGrowth] > 0))\nRETURN IF(YearsWithGrowth >= 5, 1, 0)",
    description: "Flags elite companies demonstrating continuous uninterrupted positive revenue growth for 5+ years."
  },
  {
    name: "Net Profit Margin %",
    category: "Profitability",
    formula: "Net Profit Margin % = \nDIVIDE([Total Net Profit], [Total Sales], 0) * 100",
    description: "Percentage of total top-line revenue converted into bottom-line profits."
  },
  {
    name: "Return on Capital Employed (RoCE)",
    category: "Capital Efficiency",
    formula: "RoCE % = \nVAR CapitalEmployed = [Total Assets] - [Current Liabilities]\nRETURN DIVIDE([EBIT], CapitalEmployed, 0) * 100",
    description: "Measures pre-tax operating efficiency relative to long-term capital deployed."
  },
  {
    name: "Average ROE",
    category: "Capital Efficiency",
    formula: "Average ROE = \nAVERAGE(fact_analysis[roe_pct])",
    description: "Return on Equity indicating how effectively management generates income from net assets."
  },
  {
    name: "Sector Avg OPM%",
    category: "Profitability",
    formula: "Sector Avg OPM% = \nAVERAGE(fact_profit_loss[opm_pct])",
    description: "Operating Profit Margin benchmark aggregated across peer companies in the same sector."
  },
  {
    name: "Cash Conversion Ratio",
    category: "Cash Flow",
    formula: "Cash Conversion Ratio = \nDIVIDE(SUM(fact_cash_flow[operating_activity]), SUM(fact_profit_loss[net_profit]), 0)",
    description: "Evaluates the proportion of reported net profit effectively realized as operating cash."
  },
  {
    name: "Free Cash Flow",
    category: "Cash Flow",
    formula: "Free Cash Flow = \nSUM(fact_cash_flow[free_cash_flow])",
    description: "Total discretionary cash generated after accounting for capital expenditures."
  },
  {
    name: "Altman Z-Score",
    category: "Health Scorecard",
    formula: "Altman Z-Score = \n1.2 * [Working Capital / Total Assets] + \n1.4 * [Retained Earnings / Total Assets] + \n3.3 * [EBIT / Total Assets] + \n0.6 * [Market Cap / Total Liabilities] + \n0.999 * [Sales / Total Assets]",
    description: "Statistical credit-strength measure used to assess bankruptcy and insolvency risk."
  },
  {
    name: "Health Score",
    category: "Health Scorecard",
    formula: "Health Score = \nAVERAGE(fact_ml_scores[overall_score])",
    description: "Ensemble multi-factor ML fundamental health score rated on a scale of 0 to 100."
  },
  {
    name: "Net Debt to Equity",
    category: "Debt & Leverage",
    formula: "Net Debt to Equity = \nVAR NetDebt = [Total Borrowings] - [Cash & Bank Balances]\nRETURN DIVIDE(NetDebt, [Total Shareholders Equity], 0)",
    description: "Evaluates leverage and solvency by assessing net indebtedness against shareholder net worth."
  },
  {
    name: "Interest Coverage",
    category: "Debt & Leverage",
    formula: "Interest Coverage = \nAVERAGE(fact_profit_loss[interest_coverage])",
    description: "Ability to service outstanding corporate debt through operating earnings (EBIT)."
  },
  {
    name: "Consistent Dividend Payers Flag",
    category: "Dividend & Returns",
    formula: "Consistent Dividend Payers Flag = \nVAR CurrentCompany = SELECTEDVALUE(dim_company[symbol])\nVAR YearsWithDividends = COUNTROWS(FILTER(ALL(fact_profit_loss), fact_profit_loss[symbol] = CurrentCompany && fact_profit_loss[dividend_payout_pct] > 0))\nRETURN IF(YearsWithDividends >= 5, 1, 0)",
    description: "Flags companies maintaining consecutive uninterrupted dividend distributions for 5+ years."
  },
  {
    name: "Piotroski 9-Point Score",
    category: "Health Scorecard",
    formula: "Piotroski Score = \nVAR F_ROA = IF([ROA] > 0, 1, 0)\nVAR F_CFO = IF([Operating Cash Flow] > 0, 1, 0)\nVAR F_Accrual = IF([Operating Cash Flow] > [Net Profit], 1, 0)\nVAR F_Margin = IF([Gross Margin %] > [Prev Gross Margin %], 1, 0)\nVAR F_Leverage = IF([Debt to Assets] < [Prev Debt to Assets], 1, 0)\nRETURN F_ROA + F_CFO + F_Accrual + F_Margin + F_Leverage + [Other Piotroski Signals]",
    description: "Nine-point discrete composite scorecard determining fundamental corporate accounting strength."
  },
  {
    name: "DuPont 3-Stage ROE Decomposition",
    category: "Capital Efficiency",
    formula: "DuPont ROE = \nVAR NetProfitMargin = DIVIDE([Net Profit], [Total Sales], 0)\nVAR AssetTurnover = DIVIDE([Total Sales], [Total Assets], 0)\nVAR FinancialLeverage = DIVIDE([Total Assets], [Total Equity], 0)\nRETURN NetProfitMargin * AssetTurnover * FinancialLeverage",
    description: "Breaks down Return on Equity into operating efficiency, asset productivity, and financial leverage."
  },
  {
    name: "Operating Cash Flow Margin %",
    category: "Cash Flow",
    formula: "Operating Cash Flow Margin % = \nDIVIDE(SUM(fact_cash_flow[operating_activity]), SUM(fact_profit_loss[sales]), 0) * 100",
    description: "Measures the percentage of top-line revenue converted directly into operating cash flows."
  },
  {
    name: "Cash Flow to Debt Ratio",
    category: "Debt & Leverage",
    formula: "Cash Flow to Debt Ratio = \nDIVIDE(SUM(fact_cash_flow[operating_activity]), SUM(fact_balance_sheet[borrowings]), 0)",
    description: "Evaluates corporate leverage coverage and debt redemption capability from operating cash flow generation."
  },
  {
    name: "Dividend Coverage Ratio",
    category: "Dividend & Returns",
    formula: "Dividend Coverage Ratio = \nDIVIDE(SUM(fact_profit_loss[net_profit]), SUM(fact_profit_loss[sales]) * (AVERAGE(fact_profit_loss[dividend_payout_pct]) / 100), 0)",
    description: "Evaluates the capacity of net annual profits to cover annual dividend commitments."
  },
  {
    name: "Free Cash Flow Yield %",
    category: "Valuation",
    formula: "Free Cash Flow Yield % = \nDIVIDE([Free Cash Flow], SUM(dim_company[market_cap_crores]), 0) * 100",
    description: "Compares discretionary free cash flow to enterprise market capitalization."
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState<ChartData[]>(DEFAULT_CHART_DATA);
  const [kpis, setKpis] = useState<KpiData>(DEFAULT_KPIS);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'cached'>('cached');
  const [statusMessage, setStatusMessage] = useState('PostgreSQL Data Warehouse (Star Schema)');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [daxCategoryFilter, setDaxCategoryFilter] = useState('All');
  const [daxSearchQuery, setDaxSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [syncError, setSyncError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('pbi_dashboard_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pbi_dashboard_theme', theme);
  }, [theme]);

  // Slicer Filtered Datasets memoized for optimal performance
  const filteredData = useMemo(() => {
    return data.filter(d => selectedYear === 'All' || d.name === selectedYear);
  }, [data, selectedYear]);

  const filteredSectors = useMemo(() => {
    return SECTOR_DATA.filter(s => selectedSector === 'All' || s.name === selectedSector);
  }, [selectedSector]);

  const filteredDaxMeasures = useMemo(() => {
    const q = daxSearchQuery.trim().toLowerCase();
    return DAX_MEASURES.filter(m => {
      const matchesCategory = daxCategoryFilter === 'All' || m.category === daxCategoryFilter;
      const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.formula.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [daxCategoryFilter, daxSearchQuery]);

  const daxCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(DAX_MEASURES.map(m => m.category)))];
  }, []);

  type HealthSortKey = 'symbol' | 'sector' | 'altmanZ' | 'piotroskiF' | 'roe' | 'debtEquity' | 'status';
  const [healthSortKey, setHealthSortKey] = useState<HealthSortKey>('altmanZ');
  const [healthSortOrder, setHealthSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleHealthSort = (key: HealthSortKey) => {
    if (healthSortKey === key) {
      setHealthSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setHealthSortKey(key);
      setHealthSortOrder(key === 'symbol' || key === 'sector' ? 'asc' : 'desc');
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = HEALTH_COMPANIES.filter(c => {
      const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
      const matchesSearch = !q || c.symbol.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });

    result.sort((a, b) => {
      let valA: string | number = a[healthSortKey];
      let valB: string | number = b[healthSortKey];
      if (healthSortKey === 'roe') {
        valA = parseFloat(String(valA).replace('%', '')) || 0;
        valB = parseFloat(String(valB).replace('%', '')) || 0;
      }
      if (typeof valA === 'string') {
        return healthSortOrder === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return healthSortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });

    return result;
  }, [selectedSector, searchQuery, healthSortKey, healthSortOrder]);

  const escapeCsvCell = (val: string | number | undefined | null): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportToCSV = () => {
    try {
      let headers: string[] = [];
      let rows: (string | number)[][] = [];

      if (activeTab === 'Sector Comparison') {
        headers = ["Sector", "Revenue_Crores", "Avg_Margin_Pct", "Avg_PE"];
        rows = filteredSectors.map(s => [s.name, s.revenue, s.margin, s.pe]);
      } else if (activeTab === 'Health Scorecard') {
        headers = ["Symbol", "Sector", "Altman_Z_Score", "Piotroski_F_Score", "RoE", "Debt_Equity", "Risk_Rating"];
        rows = filteredCompanies.map(c => [c.symbol, c.sector, c.altmanZ, c.piotroskiF, c.roe, c.debtEquity, c.status]);
      } else if (activeTab === 'Data Sources') {
        headers = ["Table_or_Measure", "Category_or_Type", "Rows_or_Formula", "Description"];
        const tableRows: (string | number)[][] = STAR_SCHEMA_TABLES.map(t => [t.name, t.type, t.rows, t.desc]);
        const daxRows: (string | number)[][] = filteredDaxMeasures.map(m => [m.name, m.category, m.formula.replace(/\n/g, ' '), m.description]);
        rows = [...tableRows, ...daxRows];
      } else {
        // Overview, Financial Analytics, Debt & Leverage, Dividend Returns, Settings
        headers = ["Year", "Revenue_Crores", "Net_Profit_Crores", "Active_Portfolios"];
        rows = filteredData.map(d => [d.name, d.revenue, d.profit, d.activeUsers]);
      }

      const csvContent = [
        headers.map(escapeCsvCell).join(','),
        ...rows.map(row => row.map(escapeCsvCell).join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Nifty100_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PowerBI UI] Failed to generate CSV export:', err);
    }
  };

  const exportAllDaxMeasures = () => {
    try {
      const content = filteredDaxMeasures.map(m => {
        return `// ==========================================\n// Name: ${m.name}\n// Category: ${m.category}\n// Description: ${m.description}\n// ==========================================\n${m.formula}\n\n`;
      }).join('\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Nifty100_DAX_Measures_${new Date().toISOString().slice(0, 10)}.dax`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setToastMessage(`Exported ${filteredDaxMeasures.length} DAX measures`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('[PowerBI UI] Failed to export DAX measures:', err);
    }
  };

  const copyToClipboard = async (text: string, index: number, name?: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedIndex(index);
      setToastMessage(name ? `Copied DAX measure: ${name}` : 'Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('[PowerBI UI] Clipboard copy failed:', err);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const queryParams = new URLSearchParams();
      if (selectedSector !== 'All') queryParams.append('sector', selectedSector);
      if (selectedYear !== 'All') queryParams.append('year', selectedYear);
      if (searchQuery.trim() !== '') queryParams.append('search', searchQuery.trim());

      const url = `/api/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to synchronize with server`);
      const result = await res.json();
      if (result.chartData && Array.isArray(result.chartData) && result.chartData.length > 0) {
        setData(result.chartData);
      }
      if (result.kpis) {
        setKpis({
          totalRevenue: result.kpis.totalRevenue || DEFAULT_KPIS.totalRevenue,
          avgMargin: Number(result.kpis.avgMargin) || DEFAULT_KPIS.avgMargin,
          totalProfit: result.kpis.totalProfit || DEFAULT_KPIS.totalProfit,
          cagr: result.kpis.cagr || DEFAULT_KPIS.cagr
        });
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (result.status === 'live') {
        setDbStatus('connected');
        setStatusMessage('bluestock_dw live database');
      } else {
        setDbStatus('cached');
        setStatusMessage('bluestock_dw cached warehouse');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      console.warn('[PowerBI Sync] API request failed, gracefully falling back to warehouse cache:', msg);
      setDbStatus('cached');
      setStatusMessage('Local Warehouse Cache (Nifty 100)');
      setSyncError('Live database synchronization is offline. Serving local warehouse cache.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector, selectedYear, searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  // Polling loop for auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedSector, selectedYear]);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Financial Analytics', icon: Briefcase },
    { name: 'Sector Comparison', icon: Layers },
    { name: 'Health Scorecard', icon: ShieldCheck },
    { name: 'Debt & Leverage', icon: TrendingUp },
    { name: 'Dividend Returns', icon: DollarSign },
    { name: 'Data Sources', icon: Database },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <PieChart size={28} color="#3b82f6" />
          <span>PowerBI Sync</span>
        </div>

        <nav>
          {navItems.map((item) => (
            <div
              key={item.name}
              role="button"
              tabIndex={0}
              aria-label={`Navigate to ${item.name}`}
              aria-current={activeTab === item.name ? 'page' : undefined}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab(item.name); } }}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" key={activeTab}>
        <header className="animate-fade-in" style={{ animationDelay: '0s', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="header-title gradient-text-primary">{activeTab} Dashboard</h1>
            <p className="header-subtitle">Nifty 100 Financial Intelligence connected to Star Schema Data Warehouse</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#3b82f6" />}
            </button>
            <button
              onClick={exportToCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-blue)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              aria-label="Refresh dashboard data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(30, 41, 59, 0.7)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </header>

        {syncError && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '10px',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            fontSize: '0.85rem',
            color: '#fbbf24'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> {syncError}
            </span>
            <button
              onClick={() => setSyncError(null)}
              style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: '4px' }}
              title="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Slicer & Filters Bar */}
        <div className="filter-bar animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="filter-group">
            <span className="filter-label"><Filter size={14} style={{ display: 'inline', marginRight: '4px' }} /> Sector:</span>
            <select className="filter-select" value={selectedSector} onChange={e => setSelectedSector(e.target.value)} aria-label="Filter by sector">
              <option value="All">All Sectors (Nifty 100)</option>
              <option value="IT">Information Tech</option>
              <option value="Banking">Banking & Finance</option>
              <option value="Automobile">Automobile</option>
              <option value="Pharma">Pharma & Healthcare</option>
              <option value="Energy">Energy / Oil & Gas</option>
              <option value="FMCG">FMCG / Consumer</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">Fiscal Year:</span>
            <select className="filter-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} aria-label="Filter by fiscal year">
              <option value="All">All Years (FY19-FY24)</option>
              <option value="FY24">FY 2024</option>
              <option value="FY23">FY 2023</option>
              <option value="FY22">FY 2022</option>
              <option value="FY21">FY 2021</option>
              <option value="FY20">FY 2020</option>
              <option value="FY19">FY 2019</option>
            </select>
          </div>
          <div className="filter-group" style={{ flex: 1, minWidth: '180px' }}>
            <input
              type="text"
              className="filter-input"
              placeholder="Filter company (e.g. TCS, HDFCBANK)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search companies by symbol or sector"
              style={{ width: '100%' }}
            />
          </div>
          {(selectedSector !== 'All' || selectedYear !== 'All' || searchQuery !== '') && (
            <button
              className="filter-btn filter-btn-secondary"
              onClick={() => { setSelectedSector('All'); setSelectedYear('All'); setSearchQuery(''); }}
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>

        {/* Global Dataset Metric Badges */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div className="glass-panel" style={{ padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Filtered Companies:</span>
            <strong style={{ color: 'var(--accent-blue)' }}>{filteredCompanies.length}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sectors In Scope:</span>
            <strong style={{ color: 'var(--accent-purple)' }}>{filteredSectors.length}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Average Altman Z-Score:</span>
            <strong style={{ color: 'var(--success)' }}>
              {filteredCompanies.length > 0 
                ? (filteredCompanies.reduce((acc, c) => acc + c.altmanZ, 0) / filteredCompanies.length).toFixed(2)
                : 'N/A'}
            </strong>
          </div>
          <div className="glass-panel" style={{ padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>High-Health Safe Firms:</span>
            <strong style={{ color: '#10b981' }}>
              {filteredCompanies.filter(c => c.status === 'Safe').length}
            </strong>
          </div>
        </div>

        <ErrorBoundary key={activeTab}>
          {/* Overview Tab */}
          {activeTab === 'Overview' && (
          <>
            {/* KPIs */}
            <div className="kpi-grid">
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="kpi-title">Total Revenue (Crores)</div>
                <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>₹{kpis.totalRevenue.toLocaleString()}</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>+16.4% YoY Growth</div>
              </div>
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="kpi-title">Avg Net Profit Margin</div>
                <div className="kpi-value" style={{ color: 'var(--success)' }}>{kpis.avgMargin}%</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Across Nifty 100 firms</div>
              </div>
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="kpi-title">Database Status</div>
                <div className="kpi-value status-indicator" style={{ color: dbStatus === 'connected' ? 'var(--success)' : 'var(--warning)', fontSize: '1.6rem' }}>
                  <span className={`status-dot ${dbStatus === 'cached' ? 'status-dot-amber' : ''}`}></span>
                  {dbStatus === 'connected' ? 'Connected' : 'DW Cached'}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>{statusMessage}</div>
              </div>
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="kpi-title">System Health</div>
                <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>99.9%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>7 PBIP Models in Sync</div>
              </div>
            </div>

            {/* Charts */}
            <div className="chart-grid">
              <div className="glass-panel chart-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <h3 className="chart-title">Sales & Net Profit Trends (Over Time)</h3>
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Total Revenue (₹ Cr)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="profit" name="Net Profit (₹ Cr)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel chart-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="chart-title">Market Trading Volume Estimate</h3>
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="activeUsers" name="Active Portfolios" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Financial Analytics Tab */}
        {activeTab === 'Financial Analytics' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div className="kpi-title">EBITDA Margin</div>
                <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>22.8%</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>+1.4% vs 5Y avg</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Return on Equity (RoE)</div>
                <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>18.6%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Top quartile benchmark</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">5-Year Revenue CAGR</div>
                <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>18.25%</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>High growth trajectory</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Free Cash Flow</div>
                <div className="kpi-value" style={{ color: 'var(--success)' }}>₹38,200 Cr</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Positive cash conversion</div>
              </div>
            </div>

            <div className="glass-panel chart-card">
              <h3 className="chart-title">Revenue vs Profit Growth Trajectory</h3>
              <div style={{ flex: 1, width: '100%', minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Total Revenue (₹ Cr)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="profit" name="Net Profit (₹ Cr)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Sector Comparison Tab */}
        {activeTab === 'Sector Comparison' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="chart-grid">
              <div className="glass-panel chart-card">
                <h3 className="chart-title">Revenue Distribution by Sector</h3>
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredSectors} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                      <Bar dataKey="revenue" name="Revenue (₹ Cr)" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                        {filteredSectors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel chart-card">
                <h3 className="chart-title">Average P/E Multiples</h3>
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredSectors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                      <Bar dataKey="pe" name="P/E Multiple" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 className="chart-title" style={{ marginBottom: '16px' }}>Sector Performance Summary</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Revenue (₹ Cr)</th>
                      <th>Avg Margin</th>
                      <th>Avg P/E</th>
                      <th>Weightage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSectors.map((s) => (
                      <tr key={s.name}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>₹{s.revenue.toLocaleString()}</td>
                        <td style={{ color: 'var(--success)' }}>{s.margin}%</td>
                        <td>{s.pe}x</td>
                        <td><span className="badge badge-info">Strategic</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Health Scorecard Tab */}
        {activeTab === 'Health Scorecard' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Safe Zone Companies</div>
                <div className="kpi-value" style={{ color: 'var(--success)' }}>78%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Altman Z-Score &gt; 2.99</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Grey Zone Companies</div>
                <div className="kpi-value" style={{ color: 'var(--warning)' }}>18%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>1.81 &le; Z &le; 2.99</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Distress Risk</div>
                <div className="kpi-value" style={{ color: 'var(--danger)' }}>4%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Monitored firms</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Avg Piotroski F-Score</div>
                <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>7.4 / 9</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Solid fundamental strength</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>Enterprise Financial Health Scorecard</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Showing <strong>{filteredCompanies.length}</strong> companies (sorted by <strong>{healthSortKey}</strong> {healthSortOrder.toUpperCase()})
                  </span>
                  <button
                    className="filter-btn"
                    onClick={() => setHealthSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Toggle sort direction"
                  >
                    <ArrowUpDown size={12} /> {healthSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </button>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleHealthSort('symbol')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Symbol">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Symbol {healthSortKey === 'symbol' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                      <th onClick={() => handleHealthSort('sector')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Sector">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Sector {healthSortKey === 'sector' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                      <th onClick={() => handleHealthSort('altmanZ')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Altman Z-Score">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Altman Z-Score {healthSortKey === 'altmanZ' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                      <th onClick={() => handleHealthSort('piotroskiF')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Piotroski F-Score">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Piotroski F {healthSortKey === 'piotroskiF' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                      <th onClick={() => handleHealthSort('roe')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Return on Equity">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Return on Equity {healthSortKey === 'roe' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                      <th onClick={() => handleHealthSort('debtEquity')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Debt/Equity">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Debt / Equity {healthSortKey === 'debtEquity' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                      <th onClick={() => handleHealthSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort by Risk Rating">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Risk Rating {healthSortKey === 'status' ? (healthSortOrder === 'asc' ? <ArrowUp size={13} color="var(--accent-blue)" /> : <ArrowDown size={13} color="var(--accent-blue)" />) : <ArrowUpDown size={12} style={{ opacity: 0.3 }} />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((c) => (
                      <tr key={c.symbol}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{c.symbol}</td>
                        <td>{c.sector}</td>
                        <td>{c.altmanZ}</td>
                        <td>{c.piotroskiF} / 9</td>
                        <td style={{ color: 'var(--success)' }}>{c.roe}</td>
                        <td>{c.debtEquity}</td>
                        <td>
                          <span className={`badge ${c.status === 'Safe' ? 'badge-success' : 'badge-warning'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Debt & Leverage Tab */}
        {activeTab === 'Debt & Leverage' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Weighted D/E Ratio</div>
                <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>0.48</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Well below danger threshold (1.5)</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Interest Coverage Ratio</div>
                <div className="kpi-value" style={{ color: 'var(--success)' }}>8.4x</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Robust debt servicing capacity</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Net Debt-Free Firms</div>
                <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>38 / 100</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Cash balances &gt; debt</div>
              </div>
            </div>

            <div className="glass-panel chart-card">
              <h3 className="chart-title">Sector Debt Exposure & Interest Coverage</h3>
              <div style={{ flex: 1, width: '100%', minHeight: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSectors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                    <Legend />
                    <Bar dataKey="debtEquity" name="Debt to Equity Ratio" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="interestCoverage" name="Interest Coverage (x)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Dividend Returns Tab */}
        {activeTab === 'Dividend Returns' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid">
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Average Dividend Yield</div>
                <div className="kpi-value" style={{ color: 'var(--success)' }}>1.65%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Across Nifty 100 index</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Consistent Payers Flag</div>
                <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>64 Firms</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>5+ consecutive years of dividends</div>
              </div>
              <div className="glass-panel kpi-card">
                <div className="kpi-title">Average Payout Ratio</div>
                <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>34.2%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>Sustainable earnings retention</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
              <div className="glass-panel chart-card">
                <h3 className="chart-title">Dividend & Retained Earnings Share</h3>
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                      <Legend />
                      <Area type="monotone" dataKey="profit" name="Net Earnings (₹ Cr)" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel chart-card">
                <h3 className="chart-title">Sector Dividend Yield vs Payout Ratio (%)</h3>
                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredSectors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                      <Legend />
                      <Bar dataKey="divYield" name="Dividend Yield %" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="payoutRatio" name="Payout Ratio %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Sources Tab */}
        {activeTab === 'Data Sources' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Database size={24} color="#3b82f6" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>PostgreSQL Warehouse: bluestock_dw</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                Star schema data warehouse configured with 10 Many-to-One analytical relationships, 37 pre-programmed DAX measures, and seamless Git-tracked Power BI Developer Projects (.pbip).
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-success"><CheckCircle2 size={14} /> Schema Verified</span>
                <span className="badge badge-info"><Layers size={14} /> 6 Tables Active</span>
                <span className="badge badge-info"><ShieldCheck size={14} /> 37 DAX Measures Ready</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Warehouse Star Schema Architecture</h3>
            <div className="schema-grid">
              {STAR_SCHEMA_TABLES.map((t) => (
                <div key={t.name} className="schema-card">
                  <h4>
                    <Database size={16} color="#3b82f6" />
                    <code>{t.name}</code>
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
                    <span className="badge badge-info">{t.type}</span>
                    <span className="badge badge-success">{t.rows} records</span>
                  </div>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Code2 size={24} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>DAX Measure Formulas Explorer</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Pre-programmed analytical business logic embedded in Power BI <code>_KeyMeasures</code> table.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Search DAX measures (e.g. CAGR, margin, Piotroski, ROE)..."
                    value={daxSearchQuery}
                    onChange={(e) => setDaxSearchQuery(e.target.value)}
                    aria-label="Search DAX measures"
                    style={{ width: '100%' }}
                  />
                </div>
                {daxSearchQuery && (
                  <button
                    className="filter-btn filter-btn-secondary"
                    onClick={() => setDaxSearchQuery('')}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <X size={14} /> Clear
                  </button>
                )}
                <button
                  className="filter-btn filter-btn-primary"
                  onClick={exportAllDaxMeasures}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Export filtered DAX measures to .dax file"
                >
                  <Download size={14} /> Export .DAX ({filteredDaxMeasures.length})
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Showing <strong>{filteredDaxMeasures.length}</strong> of <strong>{DAX_MEASURES.length}</strong> measures
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {daxCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDaxCategoryFilter(cat)}
                    className="filter-btn"
                    style={{
                      background: daxCategoryFilter === cat ? 'var(--accent-purple)' : 'rgba(30, 41, 59, 0.6)',
                      color: daxCategoryFilter === cat ? '#fff' : 'var(--text-secondary)',
                      borderColor: daxCategoryFilter === cat ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.1)',
                      fontSize: '0.8rem',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    {cat} {cat === 'All' ? `(${DAX_MEASURES.length})` : `(${DAX_MEASURES.filter(m => m.category === cat).length})`}
                  </button>
                ))}
              </div>

              <div className="dax-grid">
                {filteredDaxMeasures.map((m, idx) => (
                  <div key={m.name} className="dax-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</h4>
                      <span className="badge badge-info">{m.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>{m.description}</p>
                    <pre className="dax-code">{m.formula}</pre>
                    <button
                      onClick={() => copyToClipboard(m.formula, idx, m.name)}
                      className="filter-btn"
                      style={{ alignSelf: 'flex-start', marginTop: 'auto', fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={14} color="#10b981" /> Copied Formula!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy DAX
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'Settings' && (
          <div className="animate-fade-in settings-container">
            <div className="setting-row">
              <div className="setting-info">
                <h3>Live Database Connection</h3>
                <p>Query live PostgreSQL warehouse server on port 5000/5432</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dbStatus === 'connected'}
                  onChange={() => {
                    if (dbStatus === 'cached') fetchData();
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h3>Auto-Refresh Analytics</h3>
                <p>Periodically poll warehouse tables for new corporate disclosures (Last Synced: {lastSyncTime})</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h3>Light / Dark Mode Theme</h3>
                <p>Toggle between Dark Neon Glassmorphism and Crisp Clean Light Mode (Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'})</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === 'light'}
                  onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
                  aria-label="Toggle light and dark theme mode"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="glass-panel" style={{ padding: '24px', marginTop: '12px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Backend Configuration</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                Proxy Target: <code>http://localhost:5000</code>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                Warehouse: <code>PostgreSQL 15 (bluestock_dw)</code>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Frontend: <code>Vite 5 + React 18 + Recharts 2</code>
              </p>
            </div>
          </div>
        )}
        </ErrorBoundary>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="toast-notification" role="status" aria-live="polite">
            <CheckCircle2 size={16} color="var(--success)" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, LineChart, Line, Cell
} from 'recharts';
import {
  LayoutDashboard, TrendingUp,
  PieChart, Settings, Database, Briefcase, ShieldCheck, DollarSign,
  Layers, CheckCircle2, RefreshCw, Filter, X, Download, Code2, Copy, Check
} from 'lucide-react';

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
  { name: "IT", revenue: 98500, margin: 21.5, pe: 28.4, color: "#3b82f6" },
  { name: "Banking", revenue: 135000, margin: 18.2, pe: 16.8, color: "#10b981" },
  { name: "Automobile", revenue: 54000, margin: 11.4, pe: 24.1, color: "#f59e0b" },
  { name: "Pharma", revenue: 42000, margin: 19.8, pe: 32.5, color: "#8b5cf6" },
  { name: "Energy", revenue: 112000, margin: 14.6, pe: 12.2, color: "#ec4899" },
  { name: "FMCG", revenue: 68000, margin: 23.1, pe: 41.6, color: "#14b8a6" }
];

const HEALTH_COMPANIES = [
  { symbol: "TCS", sector: "IT", altmanZ: 7.82, piotroskiF: 8, roe: "38.2%", debtEquity: 0.04, status: "Safe" },
  { symbol: "INFY", sector: "IT", altmanZ: 6.94, piotroskiF: 7, roe: "31.5%", debtEquity: 0.08, status: "Safe" },
  { symbol: "HDFCBANK", sector: "Banking", altmanZ: 3.45, piotroskiF: 8, roe: "16.8%", debtEquity: 0.85, status: "Safe" },
  { symbol: "RELIANCE", sector: "Energy", altmanZ: 3.12, piotroskiF: 7, roe: "12.4%", debtEquity: 0.42, status: "Moderate" },
  { symbol: "TATAMOTORS", sector: "Auto", altmanZ: 2.85, piotroskiF: 7, roe: "18.9%", debtEquity: 0.74, status: "Moderate" },
  { symbol: "SUNPHARMA", sector: "Pharma", altmanZ: 5.61, piotroskiF: 8, roe: "15.7%", debtEquity: 0.12, status: "Safe" },
  { symbol: "ITC", sector: "FMCG", altmanZ: 8.45, piotroskiF: 9, roe: "29.4%", debtEquity: 0.01, status: "Safe" }
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
    name: "Net Profit Margin %",
    category: "Profitability",
    formula: "Net Profit Margin % = \nDIVIDE([Total Net Profit], [Total Sales], 0) * 100",
    description: "Percentage of total top-line revenue converted into bottom-line profits."
  },
  {
    name: "Consistent Dividend Payers Flag",
    category: "Dividend & Returns",
    formula: "Consistent Dividend Payers Flag = \nVAR PayoutYears = CALCULATE(DISTINCTCOUNT(fact_cash_flow[year_label]), fact_cash_flow[dividend_paid] < 0)\nRETURN IF(PayoutYears >= 5, 1, 0)",
    description: "Flags companies maintaining consecutive uninterrupted dividend distributions for 5+ years."
  },
  {
    name: "Altman Z-Score",
    category: "Health Scorecard",
    formula: "Altman Z-Score = \n1.2 * [Working Capital / Total Assets] + \n1.4 * [Retained Earnings / Total Assets] + \n3.3 * [EBIT / Total Assets] + \n0.6 * [Market Cap / Total Liabilities] + \n0.999 * [Sales / Total Assets]",
    description: "Statistical credit-strength measure used to assess bankruptcy and insolvency risk."
  },
  {
    name: "Net Debt to Equity",
    category: "Debt & Leverage",
    formula: "Net Debt to Equity = \nVAR NetDebt = [Total Borrowings] - [Cash & Bank Balances]\nRETURN DIVIDE(NetDebt, [Total Shareholders Equity], 0)",
    description: "Evaluates leverage and solvency by assessing net indebtedness against shareholder net worth."
  },
  {
    name: "Return on Capital Employed (RoCE)",
    category: "Capital Efficiency",
    formula: "RoCE % = \nVAR CapitalEmployed = [Total Assets] - [Current Liabilities]\nRETURN DIVIDE([EBIT], CapitalEmployed, 0) * 100",
    description: "Measures pre-tax operating efficiency relative to long-term capital deployed."
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

  // Slicer Filtered Datasets
  const filteredData = data.filter(d => selectedYear === 'All' || d.name === selectedYear);
  const filteredSectors = SECTOR_DATA.filter(s => selectedSector === 'All' || s.name === selectedSector);
  const filteredCompanies = HEALTH_COMPANIES.filter(c => {
    const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
    const matchesSearch = searchQuery === '' || c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || c.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ["Year", "Revenue_Crores", "Net_Profit_Crores", "Active_Portfolios"];
    const rows = filteredData.map(d => [d.name, d.revenue, d.profit, d.activeUsers]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nifty100_Financial_Data_${activeTab.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/overview');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
      if (result.status === 'live') {
        setDbStatus('connected');
        setStatusMessage('bluestock_dw live database');
      } else {
        setDbStatus('cached');
        setStatusMessage('bluestock_dw cached warehouse');
      }
    } catch {
      setDbStatus('cached');
      setStatusMessage('Local Warehouse Cache (Nifty 100)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
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

        {/* Slicer & Filters Bar */}
        <div className="filter-bar animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="filter-group">
            <span className="filter-label"><Filter size={14} style={{ display: 'inline', marginRight: '4px' }} /> Sector:</span>
            <select className="filter-select" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}>
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
            <select className="filter-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
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
              <h3 className="chart-title" style={{ marginBottom: '16px' }}>Enterprise Financial Health Scorecard</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Sector</th>
                      <th>Altman Z-Score</th>
                      <th>Piotroski F</th>
                      <th>Return on Equity</th>
                      <th>Debt / Equity</th>
                      <th>Risk Rating</th>
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
                  <BarChart data={SECTOR_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px' }} />
                    <Legend />
                    <Bar dataKey="margin" name="Operating Margin %" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pe" name="Valuation Multiplier (P/E)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
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

            <div className="glass-panel chart-card">
              <h3 className="chart-title">Dividend & Retained Earnings Share</h3>
              <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
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
                Star schema data warehouse configured with 10 Many-to-One analytical relationships, 33 pre-programmed DAX measures, and seamless Git-tracked Power BI Developer Projects (.pbip).
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-success"><CheckCircle2 size={14} /> Schema Verified</span>
                <span className="badge badge-info"><Layers size={14} /> 6 Tables Active</span>
                <span className="badge badge-info"><ShieldCheck size={14} /> 33 DAX Measures Ready</span>
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

              <div className="dax-grid">
                {DAX_MEASURES.map((m, idx) => (
                  <div key={m.name} className="dax-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</h4>
                      <span className="badge badge-info">{m.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>{m.description}</p>
                    <pre className="dax-code">{m.formula}</pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.formula);
                        setCopiedIndex(idx);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
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
                <p>Periodically poll warehouse tables for new corporate disclosures</p>
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
                <h3>Glassmorphism UI Theme</h3>
                <p>Ultra-modern blurred glass acrylic aesthetics with neon accents</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
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
      </main>
    </div>
  );
}

export default App;

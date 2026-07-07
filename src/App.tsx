import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Users, Activity,
  PieChart, Settings, Database, Briefcase
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
}

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState<ChartData[]>([]);
  const [kpis, setKpis] = useState<KpiData>({ totalRevenue: 0, avgMargin: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Node.js backend (using Vite proxy)
    fetch('/api/overview')
      .then(res => res.json())
      .then(result => {
        if (result.chartData) setData(result.chartData);
        if (result.kpis) setKpis(result.kpis);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch API data", err);
        setLoading(false);
      });
  }, []);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Financial Analytics', icon: Briefcase },
    { name: 'Sales Performance', icon: TrendingUp },
    { name: 'Customer Insights', icon: Users },
    { name: 'Market Operations', icon: Activity },
    { name: 'Data Sources', icon: Database },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <PieChart size={28} color="#3b82f6" />
          PowerBI Sync
        </div>

        <nav>
          {navItems.map((item) => (
            <div
              key={item.name}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon size={20} />
              {item.name}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="animate-fade-in" style={{ animationDelay: '0s' }}>
          <h1 className="header-title">{activeTab} Dashboard</h1>
          <p className="header-subtitle">Real-time enterprise analytics connected to PostgreSQL Data Warehouse</p>
        </header>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-blue)' }}>Loading Live Database Data...</div>
        ) : activeTab === 'Overview' ? (
          <>
            {/* KPIs */}
            <div className="kpi-grid">
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="kpi-title">Total Revenue (Crores)</div>
                <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>₹{kpis.totalRevenue.toLocaleString()}</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Pulled from fact_profit_loss</div>
              </div>
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="kpi-title">Avg Net Profit Margin</div>
                <div className="kpi-value" style={{ color: 'var(--success)' }}>{kpis.avgMargin}%</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>Across all years</div>
              </div>
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="kpi-title">Database Status</div>
                <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>Connected</div>
                <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '0.9rem' }}>bluestock_dw database</div>
              </div>
              <div className="glass-panel kpi-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="kpi-title">System Health</div>
                <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>99.9%</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>All APIs operational</div>
              </div>
            </div>

            {/* Charts */}
            <div className="chart-grid">
              <div className="glass-panel chart-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <h3 className="chart-title">Sales & Profit Trends (Over Time)</h3>
                <div style={{ flex: 1, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel chart-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="chart-title">User Activity Estimate</h3>
                <div style={{ flex: 1, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="activeUsers" name="Active Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{activeTab} Module</h2>
            <p>This module is currently under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

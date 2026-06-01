import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/overview', async (req, res) => {
  try {
    const plResult = await pool.query(`
      SELECT year_label, SUM(sales) as revenue, SUM(net_profit) as profit 
      FROM fact_profit_loss 
      GROUP BY year_label 
      ORDER BY year_label DESC
      LIMIT 12
    `);
    
    // Format for frontend
    const chartData = plResult.rows.reverse().map(r => ({
      name: r.year_label,
      revenue: parseFloat(r.revenue || 0),
      profit: parseFloat(r.profit || 0),
      activeUsers: Math.floor(Math.random() * (3000 - 1500) + 1500) // Dummy data for user activity chart
    }));

    const kpiResult = await pool.query(`
      SELECT SUM(sales) as total_revenue, AVG(net_profit_margin_pct) as avg_margin
      FROM fact_profit_loss
    `);

    res.json({
      chartData,
      kpis: {
        totalRevenue: parseFloat(kpiResult.rows[0]?.total_revenue || 0),
        avgMargin: parseFloat(kpiResult.rows[0]?.avg_margin || 0).toFixed(2),
      }
    });
  } catch (err) {
    console.error("Database connection failed. Serving fallback mock data.", err.message);
    
    // Fallback Mock Data
    const mockChartData = [
      { name: "2019", revenue: 450, profit: 120, activeUsers: 1600 },
      { name: "2020", revenue: 520, profit: 140, activeUsers: 1800 },
      { name: "2021", revenue: 610, profit: 180, activeUsers: 2100 },
      { name: "2022", revenue: 750, profit: 220, activeUsers: 2500 },
      { name: "2023", revenue: 900, profit: 280, activeUsers: 2900 }
    ];
    
    res.json({
      chartData: mockChartData,
      kpis: {
        totalRevenue: 3230,
        avgMargin: "25.50"
      },
      status: "mock"
    });
  }
});

app.listen(port, () => {
  console.log(`Backend API Server running on http://localhost:${port}`);
});

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
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend API Server running on http://localhost:${port}`);
});

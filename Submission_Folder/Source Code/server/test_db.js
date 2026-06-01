import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    const res = await pool.query('SELECT * FROM fact_profit_loss LIMIT 1');
    console.log("SUCCESS:", res.rows);
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    pool.end();
  }
}
test();

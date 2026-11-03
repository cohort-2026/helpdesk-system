import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)||5432,
  ssl: false
});
const r = await pool.query('SELECT * FROM department ORDER BY department_id DESC');
console.log(r.rows);
await pool.end();
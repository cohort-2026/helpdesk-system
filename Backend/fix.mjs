import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: false
});

try {
  // Make department_id auto-increment
  await pool.query(`CREATE SEQUENCE IF NOT EXISTS department_department_id_seq`);
  await pool.query(`ALTER TABLE department ALTER COLUMN department_id SET DEFAULT nextval('department_department_id_seq')`);
  await pool.query(`ALTER SEQUENCE department_department_id_seq OWNED BY department.department_id`);
  await pool.query(`SELECT setval('department_department_id_seq', COALESCE((SELECT MAX(department_id) FROM department), 0) + 1, false)`);
  console.log("DONE - department_id will now auto-increment!");
} catch (e) {
  console.error("Error:", e.message);
}
await pool.end();
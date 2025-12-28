import mysql from "mysql2/promise";
import { requiredEnv } from '../utils/utils.js';


const DBPool = mysql.createPool({
  host: requiredEnv("DB_HOST"),
  user: requiredEnv("DB_USER"),
  password: requiredEnv("DB_PASS"),
  database: requiredEnv("DB_NAME"),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  queueLimit: 0,
});

export async function pingDB() {
  const conn = await DBPool.getConnection();
  await conn.ping();
  conn.release();
}




export async function connectWithRetry(retries = 5, delay = 3000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await DBPool.getConnection();
      console.log('MySQL connected');
      return conn; 
    } catch (err) {
      lastError = err;
      console.log(
        `MySQL connection failed (${i + 1}/${retries}), retrying in ${delay}ms...`
      );

      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  throw new Error(
    `Could not connect to MySQL after ${retries} attempts: ${String(lastError)}`
  );
}


export default DBPool;

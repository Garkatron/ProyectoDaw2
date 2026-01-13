import mysql from "mysql2/promise";
import { requiredEnv } from '../utils/utils.js';
import Logger from '../helpers/logger.js';


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

export async function withdb(doit) {
  const conn = await connectdb();

  try {
    return await doit(conn);
  } catch (err) {
    Logger.error("❌ Error en withdb:", err); 
    Logger.error("❌ Stack trace:", err.stack); 
    throw new Error("withdb failed", { cause: err });
  } finally {
    await conn.close?.();
  }
}





export async function connectdb() {
  let lastError;
  try {
    const conn = await DBPool.getConnection();
    Logger.error(`MySQL connected`);
    return conn;
  } catch (err) {
    lastError = err;
    Logger.error(`MySQL connection failed (${i + 1}/${retries}), retrying in ${delay}ms...`);
    return null;
  }
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

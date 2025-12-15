import mysql from "mysql2/promise";

const DBPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await DBPool.getConnection();
      console.log("MySQL connected");
      conn.release();
      return;
    } catch (err) {
      console.log(`MySQL connection failed, retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Could not connect to MySQL after multiple attempts");
}


export default DBPool;

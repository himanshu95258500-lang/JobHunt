const mysql = require("mysql2");
require("dotenv").config();

const sslEnabled = process.env.DB_SSL === "true";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  ssl: sslEnabled
    ? {
        minVersion: "TLSv1.2",
      }
    : undefined,

  connectionLimit: 5,
  maxIdle: 2,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");

  connection.release();
});

module.exports = db;
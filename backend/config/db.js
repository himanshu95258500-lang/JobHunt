const mysql = require("mysql2");
require("dotenv").config();

const sslEnabled = process.env.DB_SSL === "true";

const db = mysql.createConnection({
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
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");
});

module.exports = db;
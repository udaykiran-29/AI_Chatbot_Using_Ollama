const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789", // replace with your password
  database: "chatbot", // replace with your DB name
});

module.exports = db;

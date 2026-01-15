const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30',
  // Add connection retry and error handling
  reconnect: true,
  // Handle connection errors gracefully
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection on startup
db.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    console.error('Please check:');
    console.error('1. DB_HOST:', process.env.DB_HOST);
    console.error('2. DB_USER:', process.env.DB_USER);
    console.error('3. DB_NAME:', process.env.DB_NAME);
    if (err.sqlMessage && err.sqlMessage.includes('@')) {
      const ipMatch = err.sqlMessage.match(/@'([^']+)'/);
      if (ipMatch) {
        console.error('4. Database user permissions for IP:', ipMatch[1]);
      }
    }
    console.error('\nIf you see "Access denied" errors, the database user may need:');
    console.error('- Permission to connect from your IP address');
    console.error('- Correct password');
    console.error('- Proper privileges on the database');
  });

// Handle pool errors
db.on('error', (err) => {
  console.error('Database pool error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
  }
});

module.exports = db;

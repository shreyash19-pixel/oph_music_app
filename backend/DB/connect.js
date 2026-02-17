const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100, // Increased to 100 for production (supports 100+ concurrent users)
  queueLimit: 0, // Unlimited queue (requests wait if pool is full)
  // Use UTC so DATETIME columns (created_at, updated_at) are read as UTC and
  // JSON serialization sends correct instant (e.g. 08:27 UTC → 1:57 PM IST in admin).
  timezone: '+00:00',
  // Add connection retry and error handling
  reconnect: true,
  // Handle connection errors gracefully
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Performance optimizations
  acquireTimeout: 60000, // 60 seconds to acquire connection
  idleTimeout: 300000, // 5 minutes before closing idle connections
  // Connection reuse optimization
  maxIdle: 10, // Keep 10 idle connections ready
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

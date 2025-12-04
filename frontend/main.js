const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes - serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Use port 4173 to match nginx configuration
const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
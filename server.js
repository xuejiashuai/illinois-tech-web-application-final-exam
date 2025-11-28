const express = require('express');
const path = require('path');
const app = express();
// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
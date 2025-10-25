const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Google login
app.post('/api/login', (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'ID token required' });
  try {
    const payload = jwt.decode(idToken);
    if (!payload?.sub) return res.status(400).json({ error: 'Invalid token' });
    res.json({ googleId: payload.sub, email: payload.email });
  } catch (err) {
    res.status(400).json({ error: 'Decode failed' });
  }
});

// Save user data
app.post('/api/save', async (req, res) => {
  const { googleId, data } = req.body;
  if (!googleId || !data) return res.status(400).json({ error: 'Missing data' });
  try {
    await fs.writeFile(path.join(DATA_DIR, `${googleId}.json`), JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Save failed' });
  }
});

// Load user data
app.get('/api/load/:googleId', async (req, res) => {
  const { googleId } = req.params;
  try {
    const content = await fs.readFile(path.join(DATA_DIR, `${googleId}.json`), 'utf8');
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(404).json({ error: 'No data' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Smart Wardrobe running on http://localhost:${PORT}`);
});
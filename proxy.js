import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const TWITTER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/twitter/profile', async (req, res) => {
  const handle = req.query.handle || 'nayaksomkar';
  if (!TWITTER_TOKEN) {
    return res.json({ error: 'Twitter Bearer token not set. Add TWITTER_BEARER_TOKEN to environment.' });
  }
  try {
    const r = await fetch(`https://api.twitter.com/2/users/by/username/${handle}?user.fields=public_metrics,description,profile_image_url`, {
      headers: { Authorization: `Bearer ${TWITTER_TOKEN}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/twitter/tweets', async (req, res) => {
  const handle = req.query.handle || 'nayaksomkar';
  if (!TWITTER_TOKEN) {
    return res.json({ error: 'Twitter Bearer token not set.' });
  }
  try {
    const userR = await fetch(`https://api.twitter.com/2/users/by/username/${handle}`, {
      headers: { Authorization: `Bearer ${TWITTER_TOKEN}` }
    });
    const userData = await userR.json();
    if (!userData.data) return res.json({ error: 'User not found' });

    const userId = userData.data.id;
    const r = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=public_metrics,created_at`, {
      headers: { Authorization: `Bearer ${TWITTER_TOKEN}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

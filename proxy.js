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

app.get('/api/coc', async (req, res) => {
  try {
    const r = await fetch('https://www.clashofstats.com/players/kalki-9PU28QLQQ/summary', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' }
    });
    if (!r.ok) throw new Error('CoS returned ' + r.status);
    const html = await r.text();

    const stats = {};

    const nameMatch = html.match(/<h1[^>]*class="text-h3"[^>]*>([^<]+)<\/h1>/);
    if (nameMatch) stats.name = nameMatch[1].trim();

    const thMatch = html.match(/num-val">TH\s*(\d+)</);
    if (thMatch) stats.townHall = 'TH ' + thMatch[1];

    const bhMatch = html.match(/num-val">BH\s*(\d+)</);
    if (bhMatch) stats.builderHall = 'BH ' + bhMatch[1];

    const trophyMatch = html.match(/body-2">(\d{1,3}(?:,\d{3})*)</);
    if (trophyMatch) stats.bestTrophies = trophyMatch[1];

    const clanMatch = html.match(/v-list-item__title">([^<]+)<\/div>\s*<div class="v-list-item__subtitle">/);
    if (clanMatch) stats.clan = clanMatch[1].trim();

    const locMatch = html.match(/fl[\s\S]{0,300}?num-val">([A-Za-z\s]+)<\/span>/);
    if (locMatch && locMatch[1].trim() !== 'TH' && locMatch[1].trim() !== 'BH') {
      stats.location = locMatch[1].trim();
    }

    if (!stats.name) throw new Error('Could not parse player data');
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message, note: 'Try a CoC API key in portfolio-config.json instead' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

import redis from '../lib/redis.js';

export default async function handler(req, res) {
  const { id } = req.query;

  const svg = await redis.get(`captcha-svg:${id}`);
  if (!svg) return res.status(404).send('Not found');

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}

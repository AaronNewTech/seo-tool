import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).send('Invalid CAPTCHA ID');
  }

  try {
    const svg = await redis.get(`captcha-svg:${id}`);
    if (!svg) {
      return res.status(404).send('Not found');
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(svg);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

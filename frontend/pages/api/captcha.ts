import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import svgCaptcha from 'svg-captcha';
import redis from '../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const captcha = svgCaptcha.create();
  const id = uuidv4();

  try {
    // Store both the answer and SVG in Redis with a 10-minute TTL
    await redis.setex(`captcha:${id}`, 600, captcha.text.toLowerCase());
    await redis.setex(`captcha-svg:${id}`, 600, captcha.data);

    res.status(200).json({
      captcha_id: id,
      captcha_svg: `/api/captcha-image?id=${id}`,
    });
  } catch (error) {
    console.error('Error generating CAPTCHA:', error);
    res.status(500).json({ error: 'Failed to generate CAPTCHA' });
  }
}

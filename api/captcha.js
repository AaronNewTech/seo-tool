import { v4 as uuidv4 } from 'uuid';
import svgCaptcha from 'svg-captcha';
import redis from '../lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const captcha = svgCaptcha.create();
  const id = uuidv4();

  await redis.setex(`captcha:${id}`, 600, captcha.text.toLowerCase()); // 10 min TTL
  await redis.setex(`captcha-svg:${id}`, 600, captcha.data); // optional

  res.status(200).json({
    captcha_id: id,
    captcha_svg: `/api/captcha-image?id=${id}`,
  });
}

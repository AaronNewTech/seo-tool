import { v4 as uuidv4 } from 'uuid';
import svgCaptcha from 'svg-captcha';
import { setCaptcha } from '../lib/captcha-store.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const captcha = svgCaptcha.create();
  const id = uuidv4();

  // Use the shared memory store so `captcha-image.js` can access it
  setCaptcha(id, {
    answer: captcha.text.toLowerCase(),
    image: captcha.data,
  });

  res.status(200).json({
    captcha_id: id,
    captcha_svg: `/api/captcha-image?id=${id}`,
  });
}

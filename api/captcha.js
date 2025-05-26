import { v4 as uuidv4 } from 'uuid';
import svgCaptcha from 'svg-captcha';
import { setCaptcha } from '../lib/captcha-store.js';

const captchaStore = new Map();

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const captcha = svgCaptcha.create();
  const id = uuidv4();

  captchaStore.set(id, {
    answer: captcha.text.toLowerCase(),
    image: captcha.data,
  });

  setTimeout(() => captchaStore.delete(id), 10 * 60 * 1000);

  res.status(200).json({
    captcha_id: id,
    captcha_svg: `/api/captcha-image?id=${id}`,
  });
}

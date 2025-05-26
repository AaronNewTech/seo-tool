import { getCaptcha } from '../lib/captcha-store.js';

export default function handler(req, res) {
  const { id } = req.query;
  const captcha = getCaptcha(id);

  if (!captcha) {
    return res.status(404).send('Not found');
  }

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(captcha.image);
}
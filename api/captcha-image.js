const captchaStore = new Map(); 

export default function handler(req, res) {
  const { id } = req.query;
  const captcha = captchaStore.get(id);

  if (!captcha) return res.status(404).send('Not found');

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(captcha.image);
}

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import redis from '../lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { url, captcha_id, captcha_answer } = req.body;

  // Validate CAPTCHA from Redis
  const storedAnswer = await redis.get(`captcha:${captcha_id}`);

  if (!storedAnswer || storedAnswer !== captcha_answer?.toLowerCase()) {
    await redis.del(`captcha:${captcha_id}`);
    await redis.del(`captcha-svg:${captcha_id}`);
    return res.status(403).json({ error: 'Invalid CAPTCHA' });
  }

  // Clean up CAPTCHA after use
  await redis.del(`captcha:${captcha_id}`);
  await redis.del(`captcha-svg:${captcha_id}`);

  try {
    const start = Date.now();

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0',
      },
    });

    const html = await response.text();
    const load_time = (Date.now() - start) / 1000;
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const issues = [];
    const meta_tags = {};

    const title = doc.querySelector('title')?.textContent?.trim() || 'No title found';

    if (!doc.querySelector('title')) {
      issues.push({
        type: 'Missing Title',
        description: 'The page has no title tag',
        severity: 'high',
        recommendation: 'Add a descriptive title tag',
      });
    }

    const metaElements = [...doc.querySelectorAll('meta')];
    for (const meta of metaElements) {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) meta_tags[name.toLowerCase()] = content.trim();
    }

    if (!doc.querySelector('link[rel="canonical"]')) {
      issues.push({
        type: 'Missing Canonical Tag',
        description: 'No canonical tag found',
        severity: 'medium',
        recommendation: 'Add a canonical link',
      });
    }

    res.status(200).json({
      url,
      title,
      load_time,
      status_code: response.status,
      issues,
      meta_tags,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: 'Failed to analyze the URL.' });
  }
}

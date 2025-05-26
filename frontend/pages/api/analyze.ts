import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import redis from '../lib/redis'; // Adjust if needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { url, captcha_id, captcha_answer } = req.body;

  const storedAnswer = await redis.get(`captcha:${captcha_id}`);

  if (!storedAnswer || storedAnswer !== captcha_answer?.toLowerCase()) {
    await redis.del(`captcha:${captcha_id}`);
    await redis.del(`captcha-svg:${captcha_id}`);
    return res.status(403).json({ error: 'Invalid CAPTCHA, please try again!' });
  }

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
    const meta_tags: Record<string, string> = {};

    const title =
      doc.querySelector('title')?.textContent?.trim() || 'No title found';
    if (!doc.querySelector('title')) {
      issues.push({
        type: 'Missing Title',
        description: 'The page has no title tag',
        severity: 'high',
        recommendation: 'Add a descriptive title tag',
      });
    }

    const metaDesc = doc.querySelector('meta[name="description"]');
    if (!metaDesc) {
      issues.push({
        type: 'Missing Meta Description',
        description: 'The page has no meta description',
        severity: 'high',
        recommendation: 'Add a meta description tag',
      });
    }

    const imgs = Array.from(doc.querySelectorAll('img'));
    if (imgs.some((img) => !img.alt)) {
      issues.push({
        type: 'Missing Alt Text',
        description: 'One or more images are missing alt text',
        severity: 'medium',
        recommendation: 'Add descriptive alt text to all images',
      });
    }
    if (imgs.some((img) => !img.title)) {
      issues.push({
        type: 'Missing Title Attribute',
        description: 'One or more images are missing a title attribute',
        severity: 'low',
        recommendation: 'Add a title attribute to images if relevant',
      });
    }

    const h1Tags = doc.querySelectorAll('h1');
    if (h1Tags.length === 0) {
      issues.push({
        type: 'Missing H1',
        description: 'The page has no H1 heading',
        severity: 'high',
        recommendation: 'Add an H1 heading to the page',
      });
    } else if (h1Tags.length > 1) {
      issues.push({
        type: 'Multiple H1 Tags',
        description: 'The page contains more than one H1 heading',
        severity: 'medium',
        recommendation: 'Use only one H1 heading per page for proper hierarchy',
      });
    }

    const metaElements = Array.from(doc.querySelectorAll('meta'));
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
        recommendation:
          'Add a canonical link to avoid duplicate content issues.',
      });
    }

    const robotsMeta = doc.querySelector(
      'meta[name="robots"]',
    ) as HTMLMetaElement;
    if (robotsMeta && robotsMeta.content.toLowerCase().includes('noindex')) {
      issues.push({
        type: 'Noindex Tag Detected',
        description:
          "The page contains a 'noindex' directive in the robots meta tag.",
        severity: 'high',
        recommendation:
          "Remove 'noindex' if this page should appear in search results.",
      });
    }

    const htmlTag = doc.querySelector('html');
    if (htmlTag && !htmlTag.getAttribute('lang')) {
      issues.push({
        type: 'Missing Language Attribute',
        description: "The <html> tag has no 'lang' attribute.",
        severity: 'low',
        recommendation:
          "Add a language attribute (e.g., lang='en') for accessibility and SEO.",
      });
    }

    const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    for (const tag of requiredOgTags) {
      if (!meta_tags[tag.toLowerCase()]) {
        issues.push({
          type: 'Missing Open Graph Tag',
          description: `The Open Graph tag '${tag}' is missing.`,
          severity: 'medium',
          recommendation: `Add the '${tag}' meta tag to improve social sharing.`,
        });
      }
    }

    if (!doc.querySelector('link[rel*="icon"]')) {
      issues.push({
        type: 'Missing Favicon',
        description: 'No favicon found for the website.',
        severity: 'low',
        recommendation:
          'Add a favicon to enhance brand recognition in browser tabs.',
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

// lib/redis.js
import Redis from 'ioredis';

const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {}, // required for Upstash
});

export default redis;

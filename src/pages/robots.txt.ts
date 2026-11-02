import type { APIRoute } from 'astro';
import { origen } from '../config/seo';

/** Buscadores y asistentes de IA: todo permitido salvo la página de gracias (solo sirve de conversión). */
const ROBOTS = [
  '*',
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
  'Meta-ExternalAgent',
];

export const GET: APIRoute = () => {
  // Cada grupo repite la exclusión: un robot con grupo propio no hereda el de "*".
  const grupos = ROBOTS.map((r) => `User-agent: ${r}\nAllow: /\nDisallow: /gracias.html\n`).join('\n');
  return new Response(`${grupos}\nSitemap: ${origen}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

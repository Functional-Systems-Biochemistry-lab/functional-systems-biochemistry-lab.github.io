import type { APIRoute } from 'astro';
import { isDraft } from '../lib/draft';

// Draft 모드(PUBLIC_DRAFT_BANNER=true)에서는 전체 차단. 공개 시 변수를 false 로 바꾸면 Allow 로 바뀝니다 (CLAUDE.md D25).
export const GET: APIRoute = ({ site }) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const sitemap = site ? new URL(`${base}/sitemap-index.xml`, site).href : `${base}/sitemap-index.xml`;
  const lines = isDraft ? ['User-agent: *', 'Disallow: /'] : ['User-agent: *', 'Allow: /', `Sitemap: ${sitemap}`];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

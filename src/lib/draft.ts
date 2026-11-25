/**
 * Draft 모드. 환경변수 PUBLIC_DRAFT_BANNER 가 false/0/off/no 가 아니면 true (기본 true).
 * 켜져 있는 동안: 상단 Draft 띠, 모든 페이지 <meta name="robots" content="noindex">, robots.txt Disallow: /.
 * 공개 시 .github/workflows/deploy.yml 에서 PUBLIC_DRAFT_BANNER: "false" (CLAUDE.md §7.5, §10 공개 체크리스트, D25).
 */
const flag = String(import.meta.env.PUBLIC_DRAFT_BANNER ?? 'true').toLowerCase();
export const isDraft = !['false', '0', 'off', 'no'].includes(flag);

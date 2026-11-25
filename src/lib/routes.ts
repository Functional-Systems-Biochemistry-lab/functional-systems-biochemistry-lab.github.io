// 라우트 표. 모든 페이지는 (언어 × 종류) 로 생성됩니다. 기본 언어는 src/i18n/config.ts 한 곳에서 바꿉니다.
import type { Locale } from '../i18n/config';
import { getResearch } from './content';

export type RouteKind =
  | 'home'
  | 'faculty'
  | 'research'
  | 'research-detail'
  | 'facility'
  | 'publications'
  | 'members'
  | 'join'
  | 'contact'
  | 'news'
  | 'gallery';

export interface RouteDef {
  kind: RouteKind;
  /** 언어 접두어 없는 경로. 홈은 '' */
  path: string;
  slug?: string;
}

export async function getRoutes(locale: Locale): Promise<RouteDef[]> {
  const research = await getResearch(locale);
  return [
    { kind: 'home', path: '' },
    { kind: 'faculty', path: 'faculty' },
    { kind: 'research', path: 'research' },
    ...research.map((r) => ({ kind: 'research-detail' as const, path: `research/${r.data.slug}`, slug: r.data.slug })),
    { kind: 'facility', path: 'facility' },
    { kind: 'publications', path: 'publications' },
    { kind: 'members', path: 'members' },
    { kind: 'join', path: 'join' },
    { kind: 'contact', path: 'contact' },
    { kind: 'news', path: 'news' },
    { kind: 'gallery', path: 'gallery' },
  ];
}

// 경로 도우미: 언어 접두어와 배포 base 를 한 곳에서 처리합니다.
import { getRelativeLocaleUrl, getAbsoluteLocaleUrl } from 'astro:i18n';
import type { Locale } from '../i18n/config';

const BASE = import.meta.env.BASE_URL || '/';

/** base 를 붙인 경로. withBase('favicon.svg') → '/favicon.svg' 또는 '/repo/favicon.svg' */
export function withBase(path: string): string {
  const b = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  return `${b}/${path.replace(/^\/+/, '')}`;
}

/** 언어별 상대 경로. href('ko', '/faculty') → '/ko/faculty/' */
export function href(locale: Locale, path = '/'): string {
  return getRelativeLocaleUrl(locale, path.replace(/^\/+/, ''));
}

/** 언어별 절대 URL (hreflang, canonical 용) */
export function absoluteHref(locale: Locale, path = '/'): string {
  return getAbsoluteLocaleUrl(locale, path.replace(/^\/+/, ''));
}

/** 끝 슬래시를 제거한 비교용 경로 */
export function normalizePath(p: string): string {
  const out = p.replace(/\/+$/, '');
  return out === '' ? '/' : out;
}

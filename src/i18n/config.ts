// 언어 설정 — 기본 언어는 여기 한 곳에서 바꿉니다 (CLAUDE.md §7.2, §12 Q2).
// astro.config.mjs 와 페이지 라우팅이 모두 이 값을 읽습니다.
export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function otherLocales(): Locale[] {
  return locales.filter((l) => l !== defaultLocale);
}

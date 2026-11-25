// UI 문구 조회. 문구 자체는 src/i18n/{en,ko}.json 에만 둡니다 (R11).
import en from '../i18n/en.json';
import ko from '../i18n/ko.json';
import { defaultLocale, isLocale, locales, type Locale } from '../i18n/config';

export { defaultLocale, locales, isLocale, type Locale };

const dict: Record<Locale, unknown> = { en, ko };

function lookup(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** 키(예: "nav.home")로 문구를 가져옵니다. 없으면 기본 언어 → 키 이름 순으로 대체합니다. */
export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const path = key.split('.');
  let value = lookup(dict[locale], path);
  if (typeof value !== 'string') value = lookup(dict[defaultLocale], path);
  let out = typeof value === 'string' ? value : key;
  if (vars) {
    out = out.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
  }
  return out;
}

export type Translator = (key: string, vars?: Record<string, string | number>) => string;

export function useTranslations(locale: Locale): Translator {
  return (key, vars) => t(locale, key, vars);
}

/** URL 경로의 첫 세그먼트에서 언어를 읽습니다. 없으면 기본 언어. */
export function localeFromPath(pathname: string, base = '/'): Locale {
  const path = stripBase(pathname, base);
  const first = path.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

/** base 경로를 제거한 경로("/"로 시작) */
export function stripBase(pathname: string, base = '/'): string {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  if (b && pathname.startsWith(b)) pathname = pathname.slice(b.length);
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/** 언어 접두어를 제거한 경로("/"로 시작). "/ko/faculty" → "/faculty" */
export function stripLocale(pathname: string, base = '/'): string {
  const path = stripBase(pathname, base);
  const parts = path.split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  return '/' + parts.join('/');
}

/** 날짜 표기 (언어별) */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** "2024-03" → "2024.03" (ko) / "Mar 2024" (en) */
export function formatYearMonth(ym: string | null | undefined, locale: Locale): string {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  if (locale === 'ko') return `${y}.${String(m).padStart(2, '0')}`;
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(new Date(y, m - 1, 1));
}

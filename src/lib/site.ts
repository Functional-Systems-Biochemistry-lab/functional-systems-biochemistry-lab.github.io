// src/data/site.yml 을 읽어 타입을 붙입니다. 빌드 시 1회 실행.
import { load as yamlLoad } from 'js-yaml';
import siteYaml from '../data/site.yml?raw';
import type { Locale } from '../i18n/config';

export interface NavItem {
  key: string;
  path: string;
  hide_when_empty?: 'news' | 'gallery';
}

export interface SiteData {
  name: Record<Locale, string>;
  short_name: Record<Locale, string>;
  department: Record<Locale, string>;
  pi_id: string;
  address: { en: string; ko: string; postal_code?: string };
  contact: {
    email?: string;
    phone?: string;
    map_url?: string;
    map_links?: { label_en: string; label_ko: string; url: string }[];
    map_embed_url?: string;
    map_image?: string;
    map_credit?: string;
    map_credit_url?: string;
  };
  links: Record<string, { label_en: string; label_ko: string; url: string }>;
  nav: { header: NavItem[]; footer: NavItem[]; join: NavItem };
}

export const site = yamlLoad(siteYaml) as SiteData;

export function siteName(locale: Locale): string {
  return site.name[locale] || site.name.en;
}

export function shortName(locale: Locale): string {
  return site.short_name[locale] || site.short_name.en;
}

/** 줄바꿈 안 되는 공백(U+00A0). 파일에 보이지 않는 글자를 넣지 않으려고 코드로 만듭니다. */
const NBSP = String.fromCharCode(0xa0);

/** 끝에 붙은 괄호 묶음(예: "(Global Campus)") 안의 공백을 줄바꿈 안 되는 공백으로 바꿔,
 *  좁은 화면에서 "(Global" / "Campus)"로 쪼개지지 않고 한 덩어리로 다음 줄로 내려가게 합니다. */
function keepTrailingParenTogether(text: string): string {
  return text.replace(/\(([^()]*)\)\s*$/, (m) => m.replace(/ /g, NBSP));
}

export function department(locale: Locale): string {
  return keepTrailingParenTogether(site.department[locale] || site.department.en);
}

export function address(locale: Locale): string {
  return site.address[locale] || site.address.en;
}

export function linkLabel(key: string, locale: Locale): string {
  const l = site.links[key];
  if (!l) return key;
  return locale === 'ko' ? l.label_ko : l.label_en;
}

export function mapLinkLabel(l: { label_en: string; label_ko: string }, locale: Locale): string {
  return locale === 'ko' ? l.label_ko : l.label_en;
}

/** "[TODO" 가 들어 있지 않은 실제 값인지 */
export function isReal(value: string | null | undefined): value is string {
  return !!value && value.trim() !== '' && !value.includes('[TODO');
}

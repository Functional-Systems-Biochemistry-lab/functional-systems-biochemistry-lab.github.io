// 콘텐츠 컬렉션 조회 도우미 (언어별 필터, 정렬, 본문 섹션 분리)
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { defaultLocale, isLocale, type Locale } from '../i18n/config';

export type ResearchEntry = CollectionEntry<'research'>;
export type MemberEntry = CollectionEntry<'members'>;
export type FacilityEntry = CollectionEntry<'facility'>;
export type PageEntry = CollectionEntry<'pages'>;
export type NewsEntry = CollectionEntry<'news'>;
export type GalleryEntry = CollectionEntry<'gallery'>;

/** "en/lipidomics" 같은 id 에서 언어를 읽습니다 */
export function localeOfId(id: string): Locale {
  const first = id.split('/')[0];
  return isLocale(first) ? first : defaultLocale;
}

export async function getResearch(locale: Locale): Promise<ResearchEntry[]> {
  const all = await getCollection('research', (e) => localeOfId(e.id) === locale);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getResearchBySlug(locale: Locale, slug: string): Promise<ResearchEntry | undefined> {
  return getEntry('research', `${locale}/${slug}`);
}

export async function getFacility(locale: Locale): Promise<FacilityEntry[]> {
  const all = await getCollection('facility', (e) => localeOfId(e.id) === locale);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getPage(locale: Locale, name: 'home' | 'faculty' | 'join' | 'contact'): Promise<PageEntry> {
  const entry = (await getEntry('pages', `${locale}/${name}`)) ?? (await getEntry('pages', `${defaultLocale}/${name}`));
  if (!entry) throw new Error(`pages/${locale}/${name}.md 가 없습니다.`);
  return entry;
}

export async function getNews(locale: Locale): Promise<NewsEntry[]> {
  const all = await getCollection('news', (e) => localeOfId(e.id) === locale);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 동의한 멤버만 (R5) */
export async function getMembers(): Promise<MemberEntry[]> {
  return getCollection('members', (e) => e.data.consent === true);
}

export async function getGallery(): Promise<GalleryEntry[]> {
  const all = await getCollection('gallery');
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** News·Gallery 가 비어 있으면 메뉴에서 숨기기 위한 개수 (빌드 중 1회만 조회) */
const countsCache = new Map<Locale, Promise<{ news: number; gallery: number }>>();
export function getCounts(locale: Locale): Promise<{ news: number; gallery: number }> {
  let p = countsCache.get(locale);
  if (!p) {
    p = Promise.all([getNews(locale), getGallery()]).then(([news, gallery]) => ({
      news: news.length,
      gallery: gallery.length,
    }));
    countsCache.set(locale, p);
  }
  return p;
}

export interface HtmlSection {
  heading: string;
  id?: string;
  html: string;
}

/** 렌더된 HTML 을 <h2> 기준으로 나눕니다. Research 상세 템플릿(§5.3)에서 섹션 사이에 그림을 끼우기 위해 사용 */
export function splitSections(html: string): { intro: string; sections: HtmlSection[] } {
  const re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/g;
  const matches = [...html.matchAll(re)];
  if (matches.length === 0) return { intro: html, sections: [] };
  const intro = html.slice(0, matches[0].index ?? 0);
  const sections: HtmlSection[] = matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? html.length) : html.length;
    const idMatch = m[1].match(/id="([^"]+)"/);
    return {
      heading: m[2].replace(/<[^>]+>/g, '').trim(),
      id: idMatch?.[1],
      html: html.slice(start, end).trim(),
    };
  });
  return { intro: intro.trim(), sections };
}

/** 멤버 이름 (언어별) */
export function memberName(m: MemberEntry, locale: Locale): string {
  return locale === 'ko' ? m.data.name_ko : m.data.name_en;
}

export function memberTopic(m: MemberEntry, locale: Locale): string | null | undefined {
  return locale === 'ko' ? m.data.topic_ko ?? m.data.topic_en : m.data.topic_en ?? m.data.topic_ko;
}

const ROLE_ORDER: Record<MemberEntry['data']['role'], number> = {
  pi: 0,
  postdoc: 1,
  phd: 2,
  ms: 3,
  undergrad: 4,
  alumni: 5,
};

/** 직위 → 입학 연월 순 정렬 (§5.6) */
export function sortMembers(list: MemberEntry[]): MemberEntry[] {
  return [...list].sort((a, b) => {
    const r = ROLE_ORDER[a.data.role] - ROLE_ORDER[b.data.role];
    if (r !== 0) return r;
    return (a.data.since ?? '9999').localeCompare(b.data.since ?? '9999');
  });
}

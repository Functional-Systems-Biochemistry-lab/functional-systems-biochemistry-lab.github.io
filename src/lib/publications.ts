// data/publications.bib 를 빌드 시 파싱해 정렬·그룹화합니다 (CLAUDE.md §5.5, §7.3).
// 파서: @retorquere/bibtex-parser (WASM). LaTeX 악센트 → 유니코드 변환을 포함합니다.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { initSync, parse, type Entry, type Name, type ParseError } from '@retorquere/bibtex-parser';
import bibText from '../../data/publications.bib?raw';

export interface Author {
  last: string;
  first: string;
  /** "Kim KP" 형식 */
  display: string;
  /** 멤버 alias 매칭용 정규화 키 목록 */
  keys: string[];
}

export interface Publication {
  key: string;
  type: string;
  title: string;
  authors: Author[];
  journal: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  pdf?: string;
  /** BibTeX keywords 원본 */
  keywords: string[];
  /** keywords 중 Research slug 와 일치하는 것 */
  tags: string[];
  selected: boolean;
}

let initialized = false;

function ensureParser(): void {
  if (initialized) return;
  const require = createRequire(import.meta.url);
  let wasmPath: string;
  try {
    wasmPath = require.resolve('@retorquere/bibtex-parser/bibtex_parser_bg.wasm');
  } catch {
    wasmPath = new URL('../../node_modules/@retorquere/bibtex-parser/dist/bibtex_parser_bg.wasm', import.meta.url).pathname;
  }
  initSync({ module: readFileSync(wasmPath) });
  initialized = true;
}

/** 공백·구두점을 제거한 소문자 키 */
export function normalizeName(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '');
}

function initials(first: string): string {
  return first
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

function toAuthor(n: Name): Author {
  const last = (n.lastName ?? n.name ?? '').trim();
  const first = (n.firstName ?? '').trim();
  const ini = initials(first);
  const display = first ? `${last} ${ini}` : last;
  const keys = new Set<string>();
  keys.add(normalizeName(`${last}${ini}`));
  keys.add(normalizeName(`${last}${first}`));
  keys.add(normalizeName(`${first}${last}`));
  keys.add(normalizeName(`${ini}${last}`));
  if (n.name) keys.add(normalizeName(n.name));
  keys.delete('');
  return { last, first, display, keys: [...keys] };
}

function str(v: unknown): string | undefined {
  if (typeof v === 'string') return v.trim() || undefined;
  if (Array.isArray(v)) return v.map(String).join(', ') || undefined;
  return undefined;
}

function keywordList(v: unknown): string[] {
  const raw = Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.split(/[,;]/) : [];
  return raw.map((k) => k.trim().toLowerCase()).filter(Boolean);
}

function toPublication(e: Entry, validSlugs: string[]): Publication {
  const f = e.fields;
  const authors = (Array.isArray(f.author) ? (f.author as Name[]) : []).map(toAuthor);
  const keywords = keywordList(f.keywords);
  const year = Number.parseInt(str(f.year) ?? '', 10);
  return {
    key: e.key,
    type: e.type,
    title: str(f.title) ?? '(untitled)',
    authors,
    journal: str(f.journal) ?? str(f.journaltitle) ?? str(f.booktitle) ?? '',
    year: Number.isFinite(year) ? year : 0,
    volume: str(f.volume),
    issue: str(f.number) ?? str(f.issue),
    pages: str(f.pages)?.replace(/--/g, '–'),
    doi: str(f.doi)?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, ''),
    pmid: str(f.pmid),
    url: str(f.url),
    pdf: str(f.pdf),
    keywords,
    tags: keywords.filter((k) => validSlugs.includes(k)),
    selected: keywords.includes('selected'),
  };
}

export interface PublicationsResult {
  publications: Publication[];
  errors: ParseError[];
}

let cache: PublicationsResult | undefined;

/** 모든 논문 (연도 내림차순, 같은 연도는 파일 순서) */
export function loadPublications(validSlugs: string[]): PublicationsResult {
  if (cache) return cache;
  ensureParser();
  const lib = parse(bibText);
  const publications = lib.entries
    .map((e) => toPublication(e, validSlugs))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.year - a.p.year || a.i - b.i)
    .map(({ p }) => p);
  cache = { publications, errors: lib.errors };
  return cache;
}

/** 연도별 그룹 (내림차순) */
export function groupByYear(pubs: Publication[]): { year: number; items: Publication[] }[] {
  const map = new Map<number, Publication[]>();
  for (const p of pubs) {
    if (!map.has(p.year)) map.set(p.year, []);
    map.get(p.year)!.push(p);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }));
}

/** 멤버 alias 집합 (정규화) */
export function aliasKeySet(aliasLists: string[][]): Set<string> {
  const set = new Set<string>();
  for (const list of aliasLists) for (const a of list) set.add(normalizeName(a));
  set.delete('');
  return set;
}

export function isMemberAuthor(author: Author, aliasKeys: Set<string>): boolean {
  return author.keys.some((k) => aliasKeys.has(k));
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

export function pubmedUrl(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

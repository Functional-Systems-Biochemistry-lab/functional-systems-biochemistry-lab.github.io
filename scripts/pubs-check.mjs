#!/usr/bin/env node
// npm run pubs:check — data/publications.bib 검증 (CLAUDE.md §5.5)
//  DOI 중복, 필수 필드 누락, 연도 형식, keywords 의 Research slug 오타, pdf 파일 존재, 중복 키,
//  저널 표기 불일치·같은 저널의 IF 불일치(경고)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { initSync, parse } from '@retorquere/bibtex-parser';
import { root, rel, exists, researchSlugs } from './lib.mjs';

const bibPath = path.join(root, 'data', 'publications.bib');
if (!exists(bibPath)) {
  console.error(`✗ ${rel(bibPath)} 가 없습니다.`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
initSync({ module: fs.readFileSync(require.resolve('@retorquere/bibtex-parser/bibtex_parser_bg.wasm')) });

const text = fs.readFileSync(bibPath, 'utf8');
const lib = parse(text);
const slugs = researchSlugs();
const allowedKeywords = new Set([...slugs, 'selected']);

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

for (const e of lib.errors) fail(`파싱 오류: ${e.error}${e.input ? ` — ${e.input.slice(0, 80)}` : ''}`);

const REQUIRED = {
  article: ['author', 'title', 'journal', 'year'],
  default: ['author', 'title', 'year'],
};

function str(v) {
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(String).join(', ');
  return '';
}

function similarity(a, b) {
  // 간단한 유사도: 공통 접두어 길이 + 포함 여부
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i + (a.includes(b) || b.includes(a) ? 3 : 0);
}
function suggest(word) {
  let best = null;
  let score = 0;
  for (const s of allowedKeywords) {
    const sc = similarity(word, s);
    if (sc > score) { score = sc; best = s; }
  }
  return score >= 3 ? best : null;
}

const seenKeys = new Map();
const seenDoi = new Map();
const years = [];
/** 정규화한 저널명 → { names: 표기별 키 목록, ifs: IF 값별 키 목록 } */
const journals = new Map();
/** src/lib/publications.ts 의 normalizeName 과 같은 규칙 — 저널별 보기가 같은 저널로 묶는 기준 */
const normalizeName = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9가-힣]/g, '');

for (const e of lib.entries) {
  const where = `@${e.type}{${e.key}}`;
  if (seenKeys.has(e.key)) fail(`${where}: 중복 키 (이전 항목과 같은 key)`);
  seenKeys.set(e.key, true);

  const required = REQUIRED[e.type] ?? REQUIRED.default;
  for (const k of required) {
    const v = e.fields[k];
    if (v === undefined || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0)) {
      fail(`${where}: 필수 필드 누락 — ${k}`);
    }
  }

  const year = str(e.fields.year);
  if (year && !/^\d{4}$/.test(year)) fail(`${where}: year 형식 오류 (${year})`);
  else if (year) {
    const y = Number(year);
    if (y < 1900 || y > new Date().getFullYear() + 1) warn(`${where}: year 가 범위 밖 (${year})`);
    years.push(y);
  }

  const doiRaw = str(e.fields.doi);
  if (doiRaw) {
    const doi = doiRaw.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase();
    if (!/^10\.\d{4,9}\/\S+$/.test(doi)) warn(`${where}: DOI 형식 확인 필요 (${doiRaw})`);
    if (seenDoi.has(doi)) fail(`${where}: DOI 중복 — ${doi} (이미 ${seenDoi.get(doi)} 에 있음)`);
    seenDoi.set(doi, e.key);
  } else {
    warn(`${where}: DOI 없음 (링크가 표시되지 않음)`);
  }

  const ifRaw = str(e.fields.impactfactor);
  if (ifRaw && !/^\d+(\.\d+)?$/.test(ifRaw)) warn(`${where}: impactfactor 는 숫자만 적어야 표시됩니다 (${ifRaw})`);

  const journalRaw = str(e.fields.journal) || str(e.fields.journaltitle) || str(e.fields.booktitle);
  if (journalRaw) {
    const jk = normalizeName(journalRaw);
    if (!journals.has(jk)) journals.set(jk, { names: new Map(), ifs: new Map() });
    const jg = journals.get(jk);
    jg.names.set(journalRaw, [...(jg.names.get(journalRaw) ?? []), e.key]);
    if (ifRaw && /^\d+(\.\d+)?$/.test(ifRaw)) jg.ifs.set(ifRaw, [...(jg.ifs.get(ifRaw) ?? []), e.key]);
  }

  const kwRaw = e.fields.keywords;
  const keywords = (Array.isArray(kwRaw) ? kwRaw : str(kwRaw).split(/[,;]/)).map((k) => String(k).trim().toLowerCase()).filter(Boolean);
  if (keywords.filter((k) => k !== 'selected').length === 0) warn(`${where}: keywords 에 Research slug 가 없어 어느 분야에도 표시되지 않음`);
  for (const k of keywords) {
    if (!allowedKeywords.has(k)) {
      const s = suggest(k);
      fail(`${where}: 알 수 없는 keyword "${k}"${s ? ` — "${s}" 의 오타?` : ''} (사용 가능: ${[...allowedKeywords].join(', ')})`);
    }
  }

  const pdf = str(e.fields.pdf);
  if (pdf && !/^https?:\/\//i.test(pdf)) {
    const p = path.join(root, 'public', pdf.replace(/^\//, ''));
    if (!exists(p)) fail(`${where}: pdf 파일 없음 — public${pdf.startsWith('/') ? '' : '/'}${pdf}`);
    warn(`${where}: pdf 는 오픈액세스 논문에만 사용합니다 (R6) — 라이선스 확인`);
  }
}

// 저널 표기·IF 일관성: 저널별 보기는 정규화 키로 묶으므로 표기가 달라도 한 그룹이 되지만, 화면에는 가장 많이 쓰인 표기·IF 하나만 나옴
for (const [, g] of journals) {
  if (g.names.size > 1) {
    const list = [...g.names.entries()].map(([n, keys]) => `"${n}"(${keys.length}편)`).join(' / ');
    warn(`journal 표기 불일치 — ${list}: 같은 저널로 묶이지만 표기를 하나로 통일하세요`);
  }
  if (g.ifs.size > 1) {
    const name = [...g.names.keys()][0];
    const list = [...g.ifs.entries()].map(([v, keys]) => `${v}(${keys.join(', ')})`).join(' / ');
    warn(`같은 저널인데 IF 가 다름 — "${name}": ${list} — JCR 2025 값 하나로 통일하세요`);
  }
}

// 연도 정렬 상태 (출력은 빌드 시 자동 정렬되므로 정보용)
const sortedDesc = years.every((y, i) => i === 0 || years[i - 1] >= y);
const byYear = years.reduce((m, y) => m.set(y, (m.get(y) ?? 0) + 1), new Map());

console.log('── npm run pubs:check ─────────────────────────');
console.log(`${rel(bibPath)}: 항목 ${lib.entries.length}개` + (lib.entries.length === 0 ? ' — [TODO: Q8 논문 목록 추가]' : ''));
if (lib.entries.length) {
  console.log(`연도별: ${[...byYear.entries()].sort((a, b) => b[0] - a[0]).map(([y, n]) => `${y}(${n})`).join(' ')}`);
  console.log(`파일 내 연도 정렬: ${sortedDesc ? '내림차순' : '섞여 있음 (빌드 시 자동 정렬됨)'}`);
}
if (warnings.length) { console.log(`\n경고 ${warnings.length}건`); for (const w of warnings) console.log(`  ! ${w}`); }
if (errors.length) { console.log(`\n오류 ${errors.length}건`); for (const e of errors) console.log(`  ✗ ${e}`); console.log('\npubs:check 실패'); process.exit(1); }
console.log('\npubs:check 통과');

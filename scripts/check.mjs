#!/usr/bin/env node
// npm run check — 콘텐츠 점검 (CLAUDE.md §7.4)
//  - i18n 키 동등성(en/ko), 콘텐츠 en/ko 파일 짝, 그림 alt·credit·license, 멤버 consent, 자산 파일 존재
//  - dist/ 가 있으면 내부 링크·이미지 alt 검사 (npm run build 후)
//  - [TODO] 개수와 draft 페이지 수 보고 (실패 아님)
import fs from 'node:fs';
import path from 'node:path';
import {
  root, rel, exists, listFiles, readMarkdown, flattenKeys, findTodos, todoScope, researchSlugs,
} from './lib.mjs';

const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${file ? rel(file) + ': ' : ''}${msg}`);
const warn = (file, msg) => warnings.push(`${file ? rel(file) + ': ' : ''}${msg}`);

const LOCALES = ['en', 'ko'];
const LICENSES = ['own', 'cc-by', 'permission', 'oa'];
const ROLES = ['pi', 'postdoc', 'phd', 'ms', 'undergrad', 'alumni'];
const STATUSES = ['draft', 'review', 'final'];
const content = (...p) => path.join(root, 'src', 'content', ...p);
const assetExists = (p) => !!p && exists(path.join(root, 'src', 'assets', String(p).replace(/^\/?(src\/)?assets\//, '')));

// ---------- 1. i18n ----------
{
  const dicts = {};
  for (const l of LOCALES) {
    const f = path.join(root, 'src', 'i18n', `${l}.json`);
    try { dicts[l] = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { fail(f, `JSON 오류: ${e.message}`); }
  }
  if (dicts.en && dicts.ko) {
    const en = new Set(flattenKeys(dicts.en));
    const ko = new Set(flattenKeys(dicts.ko));
    for (const k of en) if (!ko.has(k)) fail(path.join(root, 'src/i18n/ko.json'), `키 누락: ${k}`);
    for (const k of ko) if (!en.has(k)) fail(path.join(root, 'src/i18n/en.json'), `키 누락: ${k}`);
  }
}

// ---------- 공용: en/ko 파일 짝 ----------
function pairCheck(collection, { requireKo = true } = {}) {
  const sets = {};
  for (const l of LOCALES) {
    sets[l] = new Set(listFiles(content(collection, l), ['.md']).map((f) => path.basename(f)));
  }
  for (const name of sets.en) {
    if (!sets.ko.has(name)) (requireKo ? fail : warn)(content(collection, 'ko', name), `ko 파일 없음 (en 에는 있음) → [TODO ko]`);
  }
  for (const name of sets.ko) {
    if (!sets.en.has(name)) fail(content(collection, 'en', name), `en 파일 없음 (ko 에만 있음)`);
  }
}

function checkFigure(file, fig, label) {
  if (!fig || typeof fig !== 'object') return;
  if (!fig.src) fail(file, `${label}: src 누락`);
  else if (!assetExists(fig.src)) fail(file, `${label}: 그림 파일 없음 src/assets/${fig.src}`);
  if (!fig.alt || !String(fig.alt).trim()) fail(file, `${label}: alt(대체 텍스트) 누락`);
  if (!fig.credit || !String(fig.credit).trim()) fail(file, `${label}: credit(출처) 누락 (R6)`);
  if (!LICENSES.includes(fig.license)) fail(file, `${label}: license 는 ${LICENSES.join('|')} 중 하나여야 함 (R6)`);
}

const statusCount = { draft: 0, review: 0, final: 0 };
function noteStatus(file, data) {
  const s = data?.status ?? 'draft';
  if (!STATUSES.includes(s)) fail(file, `status 는 ${STATUSES.join('|')} 중 하나여야 함`);
  else statusCount[s]++;
  if (!data?.source) fail(file, 'source(출처) 누락 (R3)');
}

// ---------- 2. research ----------
{
  pairCheck('research');
  const byLocale = {};
  for (const l of LOCALES) {
    byLocale[l] = {};
    for (const f of listFiles(content('research', l), ['.md'])) {
      const { data, error } = readMarkdown(f);
      if (error || !data) { fail(f, `frontmatter 오류: ${error ?? '없음'}`); continue; }
      noteStatus(f, data);
      const base = path.basename(f, '.md');
      if (data.slug !== base) fail(f, `slug(${data.slug}) 와 파일명(${base}) 불일치`);
      if (!Number.isInteger(data.order)) fail(f, 'order(정수) 누락');
      if (!data.title) fail(f, 'title 누락');
      if (!data.summary) fail(f, 'summary 누락');
      else if (String(data.summary).length > 140) fail(f, `summary 140자 초과 (${String(data.summary).length}자)`);
      if (!Array.isArray(data.tags) || data.tags.length === 0) fail(f, 'tags 누락');
      if (data.cover) {
        if (!assetExists(data.cover)) fail(f, `cover 파일 없음 src/assets/${data.cover}`);
        if (!data.cover_alt) fail(f, 'cover 가 있으면 cover_alt 필요');
      }
      if (data.workflow) checkFigure(f, data.workflow, 'workflow');
      (data.figures ?? []).forEach((fig, i) => checkFigure(f, fig, `figures[${i}]`));
      byLocale[l][base] = data;
    }
    const n = Object.keys(byLocale[l]).length;
    if (n !== 6) warn(content('research', l), `연구 분야가 ${n}개 (명세는 6개)`);
  }
  for (const [slug, en] of Object.entries(byLocale.en)) {
    const ko = byLocale.ko[slug];
    if (ko && ko.order !== en.order) fail(content('research', 'ko', `${slug}.md`), `order(${ko.order}) 가 en(${en.order}) 과 다름`);
    if (ko && JSON.stringify([...(ko.tags ?? [])].sort()) !== JSON.stringify([...(en.tags ?? [])].sort())) warn(content('research', 'ko', `${slug}.md`), 'tags 가 en 과 다름');
  }
}

// ---------- 3. facility ----------
{
  pairCheck('facility');
  for (const l of LOCALES) {
    for (const f of listFiles(content('facility', l), ['.md'])) {
      const { data, error } = readMarkdown(f);
      if (error || !data) { fail(f, `frontmatter 오류: ${error ?? '없음'}`); continue; }
      noteStatus(f, data);
      const base = path.basename(f, '.md');
      if (data.id !== base) fail(f, `id(${data.id}) 와 파일명(${base}) 불일치`);
      for (const k of ['name', 'vendor', 'order']) if (data[k] === undefined || data[k] === '') fail(f, `${k} 누락`);
      if (data.photo) {
        if (!assetExists(data.photo)) fail(f, `photo 파일 없음 src/assets/${data.photo}`);
        if (!['own', 'permission'].includes(data.license)) fail(f, 'photo 가 있으면 license 는 own|permission (R6)');
        if (!data.photo_alt) warn(f, 'photo_alt 가 없으면 장비명을 alt 로 사용합니다');
      }
    }
  }
}

// ---------- 4. pages ----------
{
  pairCheck('pages');
  for (const l of LOCALES) {
    for (const name of ['home', 'faculty', 'join', 'contact']) {
      const f = content('pages', l, `${name}.md`);
      if (!exists(f)) { fail(f, '필수 페이지 파일 없음'); continue; }
      const { data, error } = readMarkdown(f);
      if (error || !data) { fail(f, `frontmatter 오류: ${error ?? '없음'}`); continue; }
      noteStatus(f, data);
      if (!data.title) fail(f, 'title 누락');
      if (name === 'home' && !data.tagline) fail(f, 'tagline(한 줄 소개) 누락');
      if (name === 'home' && data.hero_image && !assetExists(data.hero_image)) fail(f, `hero_image 파일 없음 src/assets/${data.hero_image}`);
      if (name === 'home' && data.hero_image && !data.hero_image_alt) fail(f, 'hero_image 가 있으면 hero_image_alt 필요');
      if (name === 'faculty' && data.photo && !assetExists(data.photo)) fail(f, `photo 파일 없음 src/assets/${data.photo}`);
      if (name === 'join') {
        (data.faq ?? []).forEach((item, i) => { if (!item?.q || !item?.a) fail(f, `faq[${i}]: q/a 누락`); });
      }
    }
  }
}

// ---------- 5. news ----------
{
  pairCheck('news', { requireKo: false });
  for (const l of LOCALES) {
    for (const f of listFiles(content('news', l), ['.md'])) {
      const { data, error } = readMarkdown(f);
      if (error || !data) { fail(f, `frontmatter 오류: ${error ?? '없음'}`); continue; }
      if (!data.title) fail(f, 'title 누락');
      if (!data.date) fail(f, 'date 누락');
      if (!/^\d{4}-\d{2}-\d{2}-/.test(path.basename(f))) warn(f, '파일명은 YYYY-MM-DD-<slug>.md 형식 권장');
      const s = data.status ?? 'draft';
      if (STATUSES.includes(s)) statusCount[s]++;
    }
  }
}

// ---------- 6. members ----------
const memberStats = { total: 0, consented: 0, excluded: [] };
{
  for (const f of listFiles(content('members'), ['.md'])) {
    const { data, error } = readMarkdown(f);
    if (error || !data) { fail(f, `frontmatter 오류: ${error ?? '없음'}`); continue; }
    memberStats.total++;
    noteStatus(f, data);
    const base = path.basename(f, '.md');
    if (data.id !== base) fail(f, `id(${data.id}) 와 파일명(${base}) 불일치`);
    for (const k of ['name_en', 'name_ko']) if (!data[k]) fail(f, `${k} 누락`);
    if (!ROLES.includes(data.role)) fail(f, `role 은 ${ROLES.join('|')} 중 하나`);
    if (typeof data.consent !== 'boolean') fail(f, 'consent(true/false) 누락 (R5)');
    if (data.consent === true) memberStats.consented++; else memberStats.excluded.push(base);
    if (data.role === 'alumni' && !data.left) warn(f, 'alumni 는 left(졸업·퇴실 연월) 권장');
    if (data.photo && !assetExists(data.photo)) fail(f, `photo 파일 없음 src/assets/${data.photo}`);
    if (!Array.isArray(data.aliases)) warn(f, 'aliases 가 없으면 논문 저자 굵게 표시가 되지 않습니다');
    for (const k of ['phone', 'student_id', 'home_address']) if (data[k]) fail(f, `${k} 는 게시 금지 항목 (R5)`);
  }
}

// ---------- 7. gallery ----------
{
  for (const f of listFiles(content('gallery'), ['.md'])) {
    const { data, error } = readMarkdown(f);
    if (error || !data) { fail(f, `frontmatter 오류: ${error ?? '없음'}`); continue; }
    if (!data.title_en || !data.title_ko) fail(f, 'title_en/title_ko 누락');
    (data.photos ?? []).forEach((p, i) => {
      if (!assetExists(p.src)) fail(f, `photos[${i}] 파일 없음 src/assets/${p.src}`);
      if (!p.alt_en || !p.alt_ko) fail(f, `photos[${i}] alt_en/alt_ko 누락`);
      if (p.consent !== true) warn(f, `photos[${i}] consent 가 true 가 아니어서 표시되지 않습니다 (초상 동의)`);
    });
  }
}

// ---------- 8. dist: 내부 링크 · img alt ----------
const dist = path.join(root, 'dist');
const linkStats = { pages: 0, links: 0, broken: 0 };
if (exists(dist)) {
  const htmlFiles = listFiles(dist, ['.html']);
  linkStats.pages = htmlFiles.length;
  const resolves = (url) => {
    const clean = url.split('#')[0].split('?')[0];
    if (!clean || clean === '/') return exists(path.join(dist, 'index.html'));
    const p = path.join(dist, decodeURIComponent(clean));
    return exists(p) || exists(path.join(p, 'index.html')) || exists(p + '.html') || exists(p.replace(/\/$/, '') + '.html');
  };
  for (const f of htmlFiles) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      // alt="" 는 Astro 가 bare `alt` 로 출력하므로 둘 다 허용 (장식용 이미지)
      if (!/\balt(\s*=|[\s/>])/.test(m[0])) fail(f, `alt 없는 <img>: ${m[0].slice(0, 80)}`);
    }
    for (const m of html.matchAll(/\b(?:href|src|srcset)\s*=\s*"([^"]*)"/gi)) {
      const raw = m[1];
      for (const candidate of m[0].startsWith('srcset') ? raw.split(',').map((s) => s.trim().split(/\s+/)[0]) : [raw]) {
        if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) continue;
        linkStats.links++;
        if (!resolves(candidate)) { linkStats.broken++; fail(f, `깨진 내부 링크: ${candidate}`); }
      }
    }
    if (!/<html[^>]*\blang=/.test(html)) fail(f, '<html lang> 누락');
  }
} else {
  warn(null, 'dist/ 가 없어 내부 링크·이미지 alt 검사를 건너뜀 (npm run build 후 다시 실행)');
}

// ---------- 9. [TODO] · draft 보고 ----------
const todos = todoScope().flatMap(findTodos);
const todoByFile = new Map();
for (const t of todos) todoByFile.set(rel(t.file), (todoByFile.get(rel(t.file)) ?? 0) + 1);

// ---------- 출력 ----------
const line = (s = '') => console.log(s);
line('── npm run check ──────────────────────────────');
line(`연구 분야 slug: ${researchSlugs().join(', ')}`);
line(`멤버: ${memberStats.total}명 중 consent=true ${memberStats.consented}명${memberStats.excluded.length ? ` (제외: ${memberStats.excluded.join(', ')})` : ''}`);
line(`status: draft ${statusCount.draft} · review ${statusCount.review} · final ${statusCount.final}`);
line(`[TODO]: ${todos.length}건 (${todoByFile.size}개 파일) — 상세: npm run todo`);
if (exists(dist)) line(`dist: 페이지 ${linkStats.pages}개, 내부 링크 ${linkStats.links}개, 깨짐 ${linkStats.broken}개`);
if (warnings.length) { line(`\n경고 ${warnings.length}건`); for (const w of warnings) line(`  ! ${w}`); }
if (errors.length) { line(`\n오류 ${errors.length}건`); for (const e of errors) line(`  ✗ ${e}`); line('\ncheck 실패'); process.exit(1); }
line('\ncheck 통과');

#!/usr/bin/env node
// npm run check — 콘텐츠 점검 (CLAUDE.md §7.4)
//  - i18n 키 동등성(en/ko), 콘텐츠 en/ko 파일 짝, 그림 alt·credit·license, 멤버 consent, 자산 파일 존재
//  - 배경 그림 설정(src/data/background.yml): 파일 존재, credit·license(R6), 오타·범위 (D26)
//  - dist/ 가 있으면 내부 링크·이미지 alt 검사 (npm run build 후)
//  - [TODO] 개수와 draft 페이지 수 보고 (실패 아님)
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';
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

// ---------- 7-1. 배경 그림 · 부드러운 스크롤 (src/data/background.yml, CLAUDE.md D26) ----------
const bgStats = { float: 0, fixed: 0, smooth: null };
{
  const f = path.join(root, 'src', 'data', 'background.yml');
  // src/lib/background.ts 의 PAGE_KEYS 와 같은 목록
  const PAGES = ['home', 'faculty', 'research', 'facility', 'publications', 'members', 'contact', 'join', 'news', 'gallery'];
  const TOP_KEYS = ['enabled', 'smooth_scroll', 'auto_gap', 'auto_repeat', 'pictures'];
  const PIC_KEYS = ['file', 'credit', 'license', 'pages', 'opacity', 'mode', 'near', 'at', 'dy', 'side', 'offset', 'size', 'rotate', 'flip', 'parallax', 'fade', 'blend', 'show', 'fit', 'position'];
  const FLOAT_ONLY = ['near', 'at', 'dy', 'side', 'offset', 'size', 'rotate', 'flip', 'parallax', 'fade', 'blend'];
  const FIXED_ONLY = ['show', 'fit'];
  const ENUMS = { mode: ['float', 'fixed'], side: ['left', 'right', 'center'], at: ['top', 'middle', 'bottom'], blend: ['normal', 'multiply'], fit: ['cover', 'contain'] };
  const RANGES = { dy: [-300, 300], offset: [-60, 100], size: [8, 120], rotate: [-180, 180], parallax: [-0.6, 0.6], fade: [0, 45] };
  const EXTS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif'];
  const MAX_BYTES = 1.5 * 1024 * 1024;
  const viewsText = listFiles(path.join(root, 'src'), ['.astro']).map((p) => fs.readFileSync(p, 'utf8')).join('\n');

  if (!exists(f)) {
    warn(null, 'src/data/background.yml 이 없습니다 (배경 그림·부드러운 스크롤 설정)');
  } else {
    let data = null;
    try { data = yamlLoad(fs.readFileSync(f, 'utf8')) ?? {}; } catch (e) { fail(f, `YAML 오류(들여쓰기·따옴표 확인): ${e.message}`); }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const k of Object.keys(data)) if (!TOP_KEYS.includes(k)) warn(f, `알 수 없는 설정 이름 '${k}' — 오타인가요? (${TOP_KEYS.join(', ')})`);
      const sm = data.smooth_scroll;
      if (sm !== undefined && (typeof sm !== 'object' || sm === null)) fail(f, 'smooth_scroll 은 enabled·strength 를 가진 항목이어야 합니다');
      else if (sm) {
        bgStats.smooth = sm.enabled !== false;
        for (const k of Object.keys(sm)) if (!['enabled', 'strength'].includes(k)) warn(f, `smooth_scroll 에 알 수 없는 설정 '${k}'`);
        if (sm.strength !== undefined && !(Number(sm.strength) >= 0.03 && Number(sm.strength) <= 0.3)) warn(f, `smooth_scroll.strength(${sm.strength}) 는 0.03~0.3 사이여야 합니다 (범위 밖이면 가까운 값으로 조정됨)`);
      } else bgStats.smooth = true;
      if (data.auto_gap !== undefined && !(Number(data.auto_gap) >= 40 && Number(data.auto_gap) <= 200)) warn(f, `auto_gap(${data.auto_gap}) 은 40~200 사이여야 합니다`);

      const pics = data.pictures ?? [];
      if (!Array.isArray(pics)) fail(f, 'pictures 는 목록(- 로 시작하는 항목들)이어야 합니다');
      else pics.forEach((pic, i) => {
        const label = `pictures[${i}]${pic?.file ? ` (${pic.file})` : ''}`;
        if (!pic || typeof pic !== 'object') { fail(f, `${label}: 항목 형식이 잘못되었습니다`); return; }
        for (const k of Object.keys(pic)) if (!PIC_KEYS.includes(k)) warn(f, `${label}: 알 수 없는 설정 이름 '${k}' — 오타인가요?`);
        // 파일
        const name = String(pic.file ?? '').replace(/^\/?(src\/)?(assets\/)?(backdrops\/)?/, '');
        const file = path.join(root, 'src', 'assets', 'backdrops', name);
        if (!name) fail(f, `${label}: file(그림 파일 이름) 누락`);
        else if (!exists(file)) fail(f, `${label}: 그림 파일 없음 src/assets/backdrops/${name}`);
        else {
          if (!EXTS.includes(path.extname(name).toLowerCase())) fail(f, `${label}: 지원하지 않는 형식 (${EXTS.join(' ')})`);
          const size = fs.statSync(file).size;
          if (size > MAX_BYTES) warn(f, `${label}: 파일이 ${(size / 1048576).toFixed(1)}MB 로 큽니다 — 1.5MB 이하로 줄이면 페이지가 빨라집니다`);
        }
        // 출처·라이선스 (R6)
        if (!pic.credit || !String(pic.credit).trim()) fail(f, `${label}: credit(출처) 누락 (R6)`);
        if (!LICENSES.includes(pic.license)) fail(f, `${label}: license 는 ${LICENSES.join('|')} 중 하나여야 함 (R6)`);
        // 종류별 설정
        const mode = pic.mode ?? 'float';
        if (!ENUMS.mode.includes(mode)) fail(f, `${label}: mode 는 ${ENUMS.mode.join('|')} 중 하나`);
        for (const k of ['side', 'at', 'blend', 'fit']) if (pic[k] !== undefined && !ENUMS[k].includes(pic[k])) fail(f, `${label}: ${k} 는 ${ENUMS[k].join('|')} 중 하나 (지금: ${pic[k]})`);
        if (mode === 'fixed') {
          bgStats.fixed++;
          for (const k of FLOAT_ONLY) if (pic[k] !== undefined) warn(f, `${label}: ${k} 는 float 그림에만 적용됩니다 (mode: fixed 에서는 무시)`);
          if (pic.show !== undefined) {
            const [a, b] = Array.isArray(pic.show) ? pic.show.map(Number) : [NaN, NaN];
            if (!(a >= 0 && b <= 100 && a < b)) fail(f, `${label}: show 는 [시작, 끝] 형태로 0 ≤ 시작 < 끝 ≤ 100 (예: [0, 50])`);
          }
        } else {
          bgStats.float++;
          for (const k of FIXED_ONLY) if (pic[k] !== undefined) warn(f, `${label}: ${k} 는 fixed 그림에만 적용됩니다 (mode: float 에서는 무시)`);
          if (pic.near !== undefined) {
            if (typeof pic.near !== 'string' || !/^[a-z][\w-]*$/i.test(pic.near.trim())) fail(f, `${label}: near 는 구역 이름(예: research)이어야 합니다`);
            else if (!viewsText.includes(`id="${pic.near.trim()}"`)) warn(f, `${label}: near '${pic.near}' 구역(id="${pic.near}")을 src 안에서 찾지 못했습니다 — 해당 구역이 없으면 자동 위치에 놓입니다`);
          }
        }
        // 숫자 범위 (벗어나면 가까운 값으로 조정되므로 경고)
        const [oMin, oMax] = mode === 'fixed' ? [0, 1] : [0, 0.8];
        if (pic.opacity !== undefined && !(Number(pic.opacity) >= oMin && Number(pic.opacity) <= oMax)) warn(f, `${label}: opacity(${pic.opacity}) 는 ${oMin}~${oMax} 사이여야 합니다`);
        for (const [k, [lo, hi]] of Object.entries(RANGES)) {
          if (pic[k] !== undefined && !(Number(pic[k]) >= lo && Number(pic[k]) <= hi)) warn(f, `${label}: ${k}(${pic[k]}) 는 ${lo}~${hi} 사이여야 합니다`);
        }
        // pages
        if (pic.pages !== undefined && pic.pages !== 'all') {
          const list = Array.isArray(pic.pages) ? pic.pages : [pic.pages];
          for (const n of list) if (!PAGES.includes(String(n).toLowerCase())) warn(f, `${label}: pages 의 '${n}' 은(는) 페이지 이름이 아닙니다 (${PAGES.join(' ')})`);
        }
      });
    }
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
line(`배경 그림: 떠 있는 그림 ${bgStats.float}개 · 고정 배경 ${bgStats.fixed}개 · 부드러운 스크롤 ${bgStats.smooth === null ? '(설정 없음)' : bgStats.smooth ? '켜짐' : '꺼짐'}`);
line(`[TODO]: ${todos.length}건 (${todoByFile.size}개 파일) — 상세: npm run todo`);
if (exists(dist)) line(`dist: 페이지 ${linkStats.pages}개, 내부 링크 ${linkStats.links}개, 깨짐 ${linkStats.broken}개`);
if (warnings.length) { line(`\n경고 ${warnings.length}건`); for (const w of warnings) line(`  ! ${w}`); }
if (errors.length) { line(`\n오류 ${errors.length}건`); for (const e of errors) line(`  ✗ ${e}`); line('\ncheck 실패'); process.exit(1); }
line('\ncheck 통과');

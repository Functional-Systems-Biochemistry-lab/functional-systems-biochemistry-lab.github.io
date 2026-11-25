// 점검 스크립트 공용 도우미 (Node 내장 모듈 + js-yaml 만 사용)
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

export const root = process.cwd();

export function rel(p) {
  return path.relative(root, p).split(path.sep).join('/');
}

export function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

/** 디렉터리 아래 파일을 재귀적으로 나열 (확장자 필터 선택) */
export function listFiles(dir, exts = null) {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p, exts));
    else if (!exts || exts.includes(path.extname(entry.name).toLowerCase())) out.push(p);
  }
  return out.sort();
}

/** Markdown 파일의 frontmatter(YAML)와 본문을 분리 */
export function readMarkdown(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: null, body: text, raw: text };
  let data = null;
  try { data = yamlLoad(m[1]); } catch (e) { return { data: null, body: text.slice(m[0].length), raw: text, error: e.message }; }
  return { data: data ?? {}, body: text.slice(m[0].length), raw: text };
}

/** 중첩 객체의 키 경로 목록 (a.b.c) */
export function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...flattenKeys(v, key));
    else keys.push(key);
  }
  return keys;
}

/** 파일에서 [TODO 표식을 찾아 {file, line, text} 목록으로 */
export function findTodos(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const hits = [];
  lines.forEach((line, i) => {
    const count = (line.match(/\[TODO[^\]]*\]?/g) ?? []).length;
    for (let k = 0; k < count; k++) {
      hits.push({ file, line: i + 1, text: line.trim().slice(0, 120) });
    }
  });
  return hits;
}

/** [TODO] 를 찾는 범위 — 콘텐츠·데이터·설정 (코드 주석 포함) */
export function todoScope() {
  const files = [
    ...listFiles(path.join(root, 'src', 'content'), ['.md', '.mdx', '.yml', '.yaml', '.json']),
    ...listFiles(path.join(root, 'src', 'data'), ['.yml', '.yaml', '.json']),
    ...listFiles(path.join(root, 'src', 'i18n'), ['.json']),
    ...listFiles(path.join(root, 'data'), ['.bib']),
  ];
  for (const f of ['astro.config.mjs', '.github/workflows/deploy.yml']) {
    const p = path.join(root, f);
    if (exists(p)) files.push(p);
  }
  return files;
}

export const RESEARCH_SLUGS_DIR = path.join(root, 'src', 'content', 'research', 'en');

/** Research slug 목록 (en 파일명 기준) */
export function researchSlugs() {
  return listFiles(RESEARCH_SLUGS_DIR, ['.md']).map((f) => path.basename(f, '.md'));
}

export function fmt(n) {
  return String(n).padStart(3, ' ');
}

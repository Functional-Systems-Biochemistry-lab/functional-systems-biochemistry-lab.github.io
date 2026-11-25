// src/data/background.yml 을 읽어 검증하고 기본값을 채웁니다. 빌드 시 1회 실행. (CLAUDE.md D26)
// 설정 문법은 background.yml 맨 위 주석에 있습니다. 잘못된 값은 조용히 기본값으로 바꾸고, 없는 그림 파일은 건너뜁니다
// (`npm run check` 가 같은 문제를 오류로 알려 줍니다).
import { load as yamlLoad } from 'js-yaml';
import type { ImageMetadata } from 'astro';
import rawYaml from '../data/background.yml?raw';
import { resolveAsset } from './assets';

/** 페이지 이름. 내비게이션 key 와 같고, News·Gallery·Join 이 더해집니다. scripts/check.mjs 에도 같은 목록이 있습니다. */
export const PAGE_KEYS = ['home', 'faculty', 'research', 'facility', 'publications', 'members', 'contact', 'join', 'news', 'gallery'] as const;

const MAX_AUTO_SLOTS = 10;

type Side = 'left' | 'right' | 'center';
type At = 'top' | 'middle' | 'bottom';

export interface Backdrop {
  file: string;
  img: ImageMetadata;
  mode: 'float' | 'fixed';
  opacity: number;
  // float
  near: string | null;
  /** near 구역 안의 위치 (0=위 경계, 0.5=가운데, 1=아래 경계) */
  at: number;
  /** 위아래로 더 옮기기 (화면 높이의 %) */
  dy: number;
  side: Side;
  /** 가장자리에서의 거리 (화면 너비의 %) */
  offset: number;
  /** 그림 너비 (화면 너비의 %) */
  size: number;
  rotate: number;
  flip: boolean;
  parallax: number;
  fade: number;
  blend: 'normal' | 'multiply';
  /** near 를 못 찾았을 때·자동 배치용 세로 칸 번호 */
  slot: number;
  // fixed
  show: [number, number];
  fit: 'cover' | 'contain';
  position: string;
}

export interface Background {
  smooth: { enabled: boolean; lerp: number };
  /** 자동 배치 그림 사이 간격 (화면 높이의 %) */
  gap: number;
  fixed: Backdrop[];
  floats: Backdrop[];
}

/** 설정을 읽는 동안만 쓰는 형태: side 를 지정하지 않았는지 기억해 두었다가 번갈아 배치할 때 씁니다. */
interface Draft extends Backdrop {
  autoSide: boolean;
}

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v);

function num(v: unknown, def: number, min: number, max: number): number {
  if (v === null || v === undefined || v === '') return def;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

function pick<T extends string>(v: unknown, allowed: readonly T[], def: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : def;
}

/** "center", "top", "top left" 처럼 방향 단어 1~2개만 허용 (CSS 로 그대로 들어가므로 검사) */
function position(v: unknown): string {
  if (typeof v !== 'string') return 'center';
  const words = v.trim().toLowerCase().split(/\s+/);
  const ok = words.length >= 1 && words.length <= 2 && words.every((w) => ['center', 'top', 'bottom', 'left', 'right'].includes(w));
  return ok ? words.join(' ') : 'center';
}

function pagesOf(v: unknown): string[] | null {
  if (v === undefined || v === null || v === 'all') return null;
  const list = Array.isArray(v) ? v : [v];
  const names = list.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  return names.includes('all') ? null : names;
}

function load(): Raw {
  try {
    const data = yamlLoad(rawYaml);
    return isObj(data) ? data : {};
  } catch (e) {
    throw new Error(`src/data/background.yml 을 읽을 수 없습니다. 들여쓰기·따옴표를 확인하세요: ${(e as Error).message}`);
  }
}

const config = load();

/** 페이지 이름: 언어 접두어를 뺀 경로의 첫 마디. "/" → home, "/research/ptm" → research */
export function pageKeyOf(pathNoLocale: string): string {
  return pathNoLocale.split('/').filter(Boolean)[0]?.toLowerCase() ?? 'home';
}

/** 이 페이지에 보일 배경 그림과 스크롤 설정 */
export function getBackground(pageKey: string): Background {
  const smoothRaw = isObj(config.smooth_scroll) ? config.smooth_scroll : {};
  const smooth = {
    enabled: smoothRaw.enabled !== false,
    lerp: num(smoothRaw.strength, 0.1, 0.03, 0.3),
  };
  const gap = num(config.auto_gap, 80, 40, 200);
  const repeat = config.auto_repeat !== false;
  const out: Background = { smooth, gap, fixed: [], floats: [] };
  if (config.enabled === false) return out;

  const list = Array.isArray(config.pictures) ? config.pictures.filter(isObj) : [];
  const autos: Draft[] = [];
  const nears: Draft[] = [];

  for (const p of list) {
    const pages = pagesOf(p.pages);
    if (pages && !pages.includes(pageKey)) continue;

    const file = String(p.file ?? '').replace(/^\/?(src\/)?(assets\/)?(backdrops\/)?/, '');
    const img = resolveAsset(`backdrops/${file}`);
    if (!img) {
      console.warn(`[background] src/assets/backdrops/${file || '(file 없음)'} 파일을 찾을 수 없어 건너뜁니다.`);
      continue;
    }

    const isFixed = p.mode === 'fixed';
    const base = {
      file,
      img,
      // 떠 있는 그림은 글자를 가리지 않도록 최대 0.8, 전체 배경(fixed)은 이미 은은한 그림이라 기본 1
      opacity: isFixed ? num(p.opacity, 1, 0, 1) : num(p.opacity, 0.5, 0, 0.8),
    };
    const sidePicked = typeof p.side === 'string' ? pick(p.side, ['left', 'right', 'center'] as const, 'right') : null;

    if (isFixed) {
      let [from, to] = Array.isArray(p.show) && p.show.length === 2 ? [num(p.show[0], 0, 0, 100), num(p.show[1], 100, 0, 100)] : [0, 100];
      if (to <= from) [from, to] = [0, 100];
      out.fixed.push({
        ...base,
        mode: 'fixed',
        near: null, at: 0.5, dy: 0, side: 'center', offset: 0, size: 100, rotate: 0, flip: false, parallax: 0, fade: 0, blend: 'normal', slot: 0,
        show: [from, to],
        fit: pick(p.fit, ['cover', 'contain'] as const, 'cover'),
        position: position(p.position),
      });
      continue;
    }

    const near = typeof p.near === 'string' && /^[a-z][\w-]*$/i.test(p.near.trim()) ? p.near.trim() : null;
    const item: Draft = {
      ...base,
      autoSide: sidePicked === null,
      mode: 'float',
      near,
      at: { top: 0, middle: 0.5, bottom: 1 }[pick(p.at, ['top', 'middle', 'bottom'] as const, 'middle') as At],
      dy: num(p.dy, 0, -300, 300),
      side: sidePicked ?? 'right', // 아래에서 번갈아 다시 정함
      offset: num(p.offset, 0, -60, 100),
      size: num(p.size, 40, 8, 120),
      rotate: num(p.rotate, 0, -180, 180),
      flip: p.flip === true,
      parallax: num(p.parallax, 0.15, -0.6, 0.6),
      fade: num(p.fade, 0, 0, 45),
      blend: pick(p.blend, ['normal', 'multiply'] as const, 'normal'),
      slot: 0,
      show: [0, 100],
      fit: 'cover',
      position: 'center',
    };
    (near ? nears : autos).push(item);
  }

  // 자동 배치: 위에서부터 칸(slot)을 하나씩. 긴 페이지에서는 같은 그림을 반복해서 채웁니다.
  const autoTotal = autos.length === 0 ? 0 : repeat ? Math.max(autos.length, MAX_AUTO_SLOTS) : autos.length;
  for (let s = 0; s < autoTotal; s++) {
    const { autoSide, ...src } = autos[s % autos.length]!;
    out.floats.push({ ...src, slot: s, side: autoSide ? (s % 2 === 0 ? 'right' : 'left') : src.side });
  }
  // near 그림: 구역을 찾으면 스크립트가 위치를 다시 잡고, 못 찾으면(예: 뉴스가 없는 날) 이 칸에 그대로 둡니다.
  nears.forEach(({ autoSide, ...src }, j) => {
    out.floats.push({ ...src, slot: j, side: autoSide ? (j % 2 === 0 ? 'right' : 'left') : src.side });
  });

  return out;
}

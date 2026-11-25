// src/assets 아래 이미지를 "research/xxx.svg" 같은 상대 경로로 찾습니다.
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{svg,png,jpg,jpeg,webp,avif}',
  { eager: true },
);

/** 콘텐츠 frontmatter 의 경로(src/assets 기준) → 이미지 메타데이터. 없으면 undefined */
export function resolveAsset(rel: string | null | undefined): ImageMetadata | undefined {
  if (!rel) return undefined;
  const clean = rel.replace(/^\/?(src\/)?assets\//, '').replace(/^\/+/, '');
  return images[`/src/assets/${clean}`]?.default;
}

/** 존재 여부만 확인 */
export function hasAsset(rel: string | null | undefined): boolean {
  return resolveAsset(rel) !== undefined;
}

/**
 * <Image> 반응형 속성. SVG 는 리사이즈가 되지 않으므로(동일 파일이 여러 번 복사됨) widths/sizes 를 생략합니다.
 */
export function responsive(
  img: ImageMetadata,
  widths: number[],
  sizes: string,
): { widths?: number[]; sizes?: string } {
  return img.format === 'svg' ? {} : { widths, sizes };
}

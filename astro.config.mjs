// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defaultLocale, locales } from './src/i18n/config.ts';
import { remarkTodo } from './src/lib/remark-todo.mjs';
import { remarkLocalizeLinks } from './src/lib/remark-localize-links.mjs';

// 배포 주소 (CLAUDE.md §7.5, D16). GitHub Pages: https://functional-systems-biochemistry-lab.github.io
// 다른 주소로 시험 배포할 때만 환경변수 SITE_URL / BASE_PATH 로 덮어씁니다.
const site = process.env.SITE_URL || 'https://functional-systems-biochemistry-lab.github.io';
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((l) => [l, l])),
      },
    }),
  ],
  markdown: {
    // Astro 7 기본 처리기는 Sätteri. remark 플러그인([TODO] 표식, 내부 링크 언어 접두어)을 쓰기 위해 unified 파이프라인 사용.
    processor: unified({
      remarkPlugins: [remarkTodo, [remarkLocalizeLinks, { base, defaultLocale, locales: [...locales] }]],
    }),
  },
});

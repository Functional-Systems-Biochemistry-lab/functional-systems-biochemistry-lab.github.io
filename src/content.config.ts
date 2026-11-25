// 콘텐츠 컬렉션 스키마 (CLAUDE.md §6). frontmatter 오류는 빌드 시 바로 드러납니다.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const status = z.enum(['draft', 'review', 'final']).default('draft');
const license = z.enum(['own', 'cc-by', 'permission', 'oa']);

/** 그림: 출처(credit)와 라이선스가 없으면 사용 금지 (R6) */
const figure = z.object({
  src: z.string().min(1), // src/assets 기준 경로. 예: research/research-lipidomics-01.webp
  alt: z.string().min(1),
  caption: z.string().optional(),
  credit: z.string().min(1),
  license,
});

/** 항목 id 는 항상 파일 경로(en/lipidomics)로 — frontmatter 의 slug 가 id 를 덮어쓰지 않게 함 */
const pathId = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/i, '').split('\\').join('/');

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research', generateId: pathId }),
  schema: z
    .object({
      slug: z.string().min(1),
      order: z.number().int().positive(),
      title: z.string().min(1),
      summary: z.string().min(1).max(140),
      tags: z.array(z.string().min(1)).min(1),
      cover: z.string().nullable().optional(),
      cover_alt: z.string().optional(),
      workflow: figure.nullable().optional(),
      figures: z.array(figure).default([]),
      status,
      source: z.string().min(1),
    })
    .refine((d) => !d.cover || (d.cover_alt ?? '').length > 0, {
      message: 'cover 가 있으면 cover_alt(대체 텍스트)가 필요합니다.',
    }),
});

const members = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/members' }),
  schema: z.object({
    id: z.string().min(1),
    name_en: z.string().min(1),
    name_ko: z.string().min(1),
    role: z.enum(['pi', 'postdoc', 'phd', 'ms', 'undergrad', 'alumni']),
    since: z.string().regex(/^\d{4}-\d{2}$/).nullable().optional(),
    left: z.string().regex(/^\d{4}-\d{2}$/).nullable().optional(),
    degree: z.string().nullable().optional(), // alumni: 취득 학위 (예: Ph.D., M.S.)
    topic_en: z.string().nullable().optional(),
    topic_ko: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    email: z.email().nullable().optional(),
    current_position: z.string().nullable().optional(),
    aliases: z.array(z.string()).default([]),
    consent: z.boolean(), // true 가 아니면 렌더링 제외 (R5)
    status,
    source: z.string().min(1),
  }),
});

const facility = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/facility' }),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    vendor: z.string().min(1),
    model: z.string().optional(),
    order: z.number().int().positive(),
    photo: z.string().nullable().optional(),
    photo_alt: z.string().optional(),
    license: z.enum(['own', 'permission']).default('own'),
    status,
    source: z.string().min(1),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    status,
    source: z.string().min(1),
    // home
    tagline: z.string().optional(),
    description: z.string().optional(),
    hero_image: z.string().nullable().optional(),
    hero_image_alt: z.string().optional(),
    // faculty
    name: z.string().optional(),
    name_alt: z.string().optional(),
    position: z.string().optional(),
    photo: z.string().nullable().optional(),
    email: z.string().optional(),
    education: z.array(z.string()).default([]),
    career: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    awards: z.array(z.string()).default([]),
    links: z
      .object({
        scholar: z.string().optional(),
        orcid: z.string().optional(),
        pubmed: z.string().optional(),
      })
      .partial()
      .optional(),
    // join / contact
    lead: z.string().optional(),
    apply_email: z.string().optional(),
    faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).default([]),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    summary: z.string().optional(),
    status,
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/gallery' }),
  schema: z.object({
    title_en: z.string().min(1),
    title_ko: z.string().min(1),
    date: z.coerce.date(),
    photos: z
      .array(
        z.object({
          src: z.string().min(1), // gallery/<event>/<file>
          alt_en: z.string().min(1),
          alt_ko: z.string().min(1),
          caption_en: z.string().optional(),
          caption_ko: z.string().optional(),
          consent: z.boolean().default(false), // 초상 동의 확인 (R5)
        }),
      )
      .default([]),
    status,
  }),
});

export const collections = { research, members, facility, pages, news, gallery };

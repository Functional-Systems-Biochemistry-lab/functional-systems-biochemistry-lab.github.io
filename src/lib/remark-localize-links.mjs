// remark 플러그인: Markdown 본문의 내부 링크("/facility" 같은 절대 경로)에
// 현재 파일의 언어 접두어(/ko)와 배포 base 경로를 자동으로 붙입니다.
// 언어는 파일 경로 src/content/<컬렉션>/<locale>/ 에서 읽습니다. 언어 폴더가 없으면 기본 언어로 봅니다.

export function remarkLocalizeLinks(options = {}) {
  const base = normalizeBase(options.base ?? '/');
  const defaultLocale = options.defaultLocale ?? 'en';
  const locales = options.locales ?? [defaultLocale];

  return (tree, file) => {
    const locale = localeFromPath(file?.path ?? file?.history?.[0], locales) ?? defaultLocale;
    walk(tree, (node) => {
      if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
        node.url = localize(node.url, locale, defaultLocale, base);
      }
    });
  };
}

function normalizeBase(base) {
  let b = String(base || '/');
  if (!b.startsWith('/')) b = '/' + b;
  if (b.length > 1 && b.endsWith('/')) b = b.slice(0, -1);
  return b === '/' ? '' : b;
}

function localeFromPath(p, locales) {
  if (!p) return undefined;
  const norm = String(p).split('\\').join('/');
  const m = norm.match(/\/src\/content\/[^/]+\/([^/]+)\//);
  if (m && locales.includes(m[1])) return m[1];
  return undefined;
}

function localize(url, locale, defaultLocale, base) {
  if (!url.startsWith('/') || url.startsWith('//')) return url; // 외부·상대 링크는 그대로
  if (base && (url === base || url.startsWith(base + '/'))) return url; // 이미 base 포함
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (prefix && (url === prefix || url.startsWith(prefix + '/'))) return base + url; // 이미 언어 포함
  return `${base}${prefix}${url}`;
}

function walk(node, fn) {
  if (!node) return;
  fn(node);
  if (Array.isArray(node.children)) for (const c of node.children) walk(c, fn);
}

// remark 플러그인: Markdown 본문의 "{{site.contact.email}}" 같은 표식을 src/data/site.yml 의 값으로 바꿉니다 (D32).
// - 경로는 site. 로 시작하는 점 경로입니다. 예: {{site.contact.email}}, {{site.contact.phone}}, {{site.address.ko}}
// - 값이 이메일 모양이면 mailto 링크로, 그 외는 글자로 넣습니다.
// - 값이 없거나 "[TODO" 가 들어 있으면 "[TODO: site.yml <경로>]" 글자로 바꿉니다. 이 플러그인을 remarkTodo 앞에 두면
//   그 글자가 다른 [TODO] 표식처럼 <mark class="todo"> 로 보입니다.
// - site.yml 은 첫 사용 때 한 번 읽습니다(개발 서버에서 site.yml 을 고치면 다시 시작해야 반영됨).
import fs from 'node:fs';
import { load } from 'js-yaml';

const VAR_RE = /\{\{\s*site\.([a-zA-Z0-9_.-]+)\s*\}\}/g;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function remarkSiteVars(options = {}) {
  const sitePath = options.sitePath ?? new URL('../data/site.yml', import.meta.url);
  let site;
  const getSite = () => (site ??= load(fs.readFileSync(sitePath, 'utf8')));
  return (tree) => {
    walk(tree, getSite);
  };
}

function lookup(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function isReal(v) {
  return typeof v === 'string' && v.trim() !== '' && !v.includes('[TODO');
}

function nodesFor(value, dotted) {
  if (!isReal(value)) return [{ type: 'text', value: `[TODO: site.yml ${dotted}]` }];
  const v = value.trim();
  if (EMAIL_RE.test(v)) return [{ type: 'link', url: `mailto:${v}`, children: [{ type: 'text', value: v }] }];
  return [{ type: 'text', value: v }];
}

function walk(node, getSite) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'text' && VAR_RE.test(child.value)) {
      VAR_RE.lastIndex = 0;
      const parts = [];
      let last = 0;
      for (const m of child.value.matchAll(VAR_RE)) {
        if (m.index > last) parts.push({ type: 'text', value: child.value.slice(last, m.index) });
        parts.push(...nodesFor(lookup(getSite(), m[1]), m[1]));
        last = m.index + m[0].length;
      }
      if (last < child.value.length) parts.push({ type: 'text', value: child.value.slice(last) });
      node.children.splice(i, 1, ...parts);
      i += parts.length - 1;
      continue;
    }
    VAR_RE.lastIndex = 0;
    walk(child, getSite);
  }
}

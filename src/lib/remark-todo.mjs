// remark 플러그인: 본문의 "[TODO: …]" 표식을 <mark class="todo">로 감싸서 초안 단계에서 눈에 띄게 합니다.
// 의존성 없이 mdast 트리를 직접 순회합니다.

const TODO_RE = /\[TODO[^\]]*\]/g;

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function splitTodo(value) {
  const nodes = [];
  let last = 0;
  for (const m of value.matchAll(TODO_RE)) {
    if (m.index > last) nodes.push({ type: 'text', value: value.slice(last, m.index) });
    nodes.push({ type: 'html', value: `<mark class="todo">${escapeHtml(m[0])}</mark>` });
    last = m.index + m[0].length;
  }
  if (last < value.length) nodes.push({ type: 'text', value: value.slice(last) });
  return nodes;
}

export function remarkTodo() {
  return (tree) => {
    walk(tree);
  };
}

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'text' && TODO_RE.test(child.value)) {
      TODO_RE.lastIndex = 0;
      const parts = splitTodo(child.value);
      node.children.splice(i, 1, ...parts);
      i += parts.length - 1;
      continue;
    }
    TODO_RE.lastIndex = 0;
    walk(child);
  }
}

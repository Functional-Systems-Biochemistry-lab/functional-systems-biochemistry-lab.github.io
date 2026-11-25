#!/usr/bin/env node
// npm run todo — [TODO 위치 목록 (CLAUDE.md §7.4)
import { todoScope, findTodos, rel } from './lib.mjs';

const hits = todoScope().flatMap(findTodos);
if (hits.length === 0) {
  console.log('[TODO] 없음');
  process.exit(0);
}
let current = '';
for (const h of hits) {
  const f = rel(h.file);
  if (f !== current) { console.log(`\n${f}`); current = f; }
  console.log(`  L${h.line}: ${h.text}`);
}
console.log(`\n총 ${hits.length}건`);

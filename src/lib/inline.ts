// 데이터 문자열의 간단한 서식 (CLAUDE.md D29). Markdown 전체가 아니라 "**굵게**" 하나만 지원합니다.
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

/** "**…**" → <strong>…</strong>. 먼저 HTML 을 이스케이프하므로 원문에 든 태그는 글자로만 보입니다 (XSS 방지). */
export function boldMarkup(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
}

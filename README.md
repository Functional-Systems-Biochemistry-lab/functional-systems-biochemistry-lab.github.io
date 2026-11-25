# FSB Lab 홈페이지

Functional Systems Biochemistry Lab(경희대학교 응용화학과) 홈페이지 소스입니다.
Astro 정적 사이트 + Markdown/YAML 콘텐츠 + GitHub Pages 로 운영합니다.

- 명세·작업 지침: [CLAUDE.md](CLAUDE.md)
- 관리 가이드(초보자용): [docs/MAINTAINING.md](docs/MAINTAINING.md)
- 원자료 넣는 곳: [inbox/](inbox/README.md)

## 명령어

```bash
npm install          # 처음 한 번
npm run dev          # 로컬 미리보기 (http://localhost:4321)
npm run build        # 정적 빌드 → dist/
npm run check        # 타입·콘텐츠 점검 ([TODO] 개수, draft 페이지 수 보고)
npm run todo         # [TODO] 위치 목록
npm run pubs:check   # data/publications.bib 검증
```

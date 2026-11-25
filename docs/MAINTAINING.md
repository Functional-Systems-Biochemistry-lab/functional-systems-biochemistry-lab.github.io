# FSB Lab 홈페이지 관리 가이드 (초보자용)

> 이 문서는 개발을 모르는 후배도 홈페이지를 고칠 수 있게 쓴 안내서입니다.
> 더 자세한 규칙은 저장소의 `CLAUDE.md`에 있습니다.

## 1. 이 사이트는 어떻게 동작하나요?

- 글(연구 소개, 멤버, 지원 안내 등)은 **Markdown 파일**(`.md`)입니다. `src/content/` 폴더 안에 있습니다.
- 논문 목록은 **BibTeX 파일** 하나입니다: `data/publications.bib`. Zotero에서 내보낸 내용을 붙여 넣으면 됩니다.
- 파일을 고쳐서 GitHub의 `main` 브랜치에 올리면, GitHub Actions가 자동으로 사이트를 다시 만들어 GitHub Pages에 올립니다. 보통 1~3분 걸립니다.
- 영어가 원본이고, 한국어는 같은 구조의 파일이 `ko/` 폴더에 따로 있습니다. 둘 다 고쳐야 합니다. (논문 페이지는 영어만)

```
src/content/
├─ research/en/<slug>.md     연구 분야 (영어)
├─ research/ko/<slug>.md     연구 분야 (한국어)
├─ members/<id>.md           구성원 1명 = 파일 1개 (국/영 같이)
├─ facility/{en,ko}/<id>.md  장비
├─ pages/{en,ko}/            home, faculty, join, contact
└─ news/{en,ko}/YYYY-MM-DD-<slug>.md   소식
data/publications.bib        논문 (영어)
src/assets/                  그림·사진 (research/, members/, facility/, gallery/)
```

## 2. GitHub 웹에서 파일 고치기 (설치 없이)

1. GitHub 저장소 페이지에서 고칠 파일을 찾아 클릭합니다.
2. 오른쪽 위 **연필 아이콘(Edit this file)** 을 누릅니다.
3. 내용을 고친 뒤 오른쪽 위 **Commit changes…** 를 누릅니다.
4. 간단한 설명을 쓰고(예: `멤버 추가: 홍길동`) **Commit changes** 를 누릅니다.
   - "Create a new branch and start a pull request"를 고르면 다른 사람이 확인한 뒤 반영할 수 있습니다. 혼자 관리하면 `main`에 바로 커밋해도 됩니다.
5. 저장소 상단 **Actions** 탭에서 초록색 체크가 뜨면 배포가 끝난 것입니다. 빨간 X가 뜨면 7번을 보세요.

## 3. 자주 하는 일

### 3.1 논문 추가

1. Zotero에서 논문을 선택 → 오른쪽 클릭 → **Export Items…** → 형식 **BibTeX**.
2. 내보낸 내용을 `data/publications.bib` 맨 아래에 붙여 넣습니다.
3. 각 항목에 `keywords` 를 적습니다. 연구 분야 slug를 쉼표로 구분합니다.
   - 사용 가능한 slug: `biomarker-discovery`, `imaging-ms`, `lipidomics`, `ptm`, `nitroproteomics`, `systems-biology`
   - 대표 논문으로 교수 페이지에 올리려면 `selected` 를 추가합니다.
   ```bibtex
   keywords = {lipidomics, ptm, selected}
   ```
4. PDF는 **오픈액세스 논문만** 올립니다. `public/pdf/` 에 파일을 넣고 `pdf = {/pdf/파일명.pdf}` 를 적습니다. 그 외 논문은 DOI 링크만 둡니다.
5. 멤버 이름을 굵게 표시하려면 멤버 파일(`src/content/members/<id>.md`)의 `aliases` 에 논문 저자 표기(예: `Hong GD`)가 들어 있어야 합니다.

### 3.2 멤버 추가·졸업

- 추가: `src/content/members/` 에 `이름-영문.md` 파일을 만들고 아래처럼 적습니다.
  ```yaml
  ---
  id: hong-gildong
  name_en: Gildong Hong
  name_ko: 홍길동
  role: ms            # pi | postdoc | phd | ms | undergrad | alumni
  since: 2025-03      # 입학 연월
  left: null
  topic_en: Lipidomics of liver disease
  topic_ko: 간질환 지질체 분석
  photo: members/hong-gildong.webp   # 없으면 null
  email: null         # 본인이 공개에 동의한 경우만
  current_position: null
  aliases: ["Hong GD", "Hong G"]
  consent: true       # 본인 동의가 없으면 false → 사이트에 나오지 않음
  status: draft
  source: 본인 제공 2026-03
  ---
  ```
- 졸업: 그 사람 파일에서 `role: alumni`, `left: 2026-02` 로 바꾸고, 동의했다면 `current_position` 을 적습니다.
- 사진: 정사각형, 800px 이하, WebP 권장. `src/assets/members/` 에 넣습니다.
- **개인 전화번호, 학번, 집 주소는 절대 올리지 않습니다.**

### 3.3 소식·모집 공고

`src/content/news/en/2026-03-01-recruiting.md` 와 `src/content/news/ko/2026-03-01-recruiting.md` 를 만듭니다.

```markdown
---
title: Recruiting graduate students for Fall 2026
date: 2026-03-01
status: draft
---
본문…
```

파일이 하나라도 있으면 소식 메뉴가 자동으로 나타나고, 홈에 최근 3건이 보입니다.

### 3.4 연구 분야 글·그림 고치기

- `src/content/research/en/<slug>.md` 와 `ko/<slug>.md` 를 함께 고칩니다.
- 본문은 `## Background`(배경) → `## Approach`(접근 방법) → `## Representative results`(대표 결과) 순서의 소제목을 유지합니다. 한국어 파일은 `## 배경`, `## 접근 방법`, `## 대표 결과`.
- 그림을 넣을 때는 frontmatter의 `figures:` 에 `src`, `alt`, `caption`, `credit`, `license` 를 **모두** 적습니다. `license` 는 `own`(연구실 제작), `cc-by`, `permission`(허가 받음), `oa`(오픈액세스 논문 그림) 중 하나입니다. 출처가 없는 그림은 쓰지 않습니다.
- 그림 규격: 16:9, 폭 1600px 이상, WebP 또는 PNG. 파일명 `research-<slug>-01.webp`.

### 3.5 지원 안내(Join Us) 수정

`src/content/pages/en/join.md`, `ko/join.md`. 날짜가 들어가는 공고는 여기 말고 소식(3.3)에 올립니다. 교수님 확인이 끝나면 `status: final` 로 바꿉니다.

## 4. `[TODO]`와 `status`

- 본문이나 설정에 `[TODO: …]` 가 있으면 "아직 확인되지 않은 정보"라는 뜻입니다. 사이트에는 노란 표식으로 보입니다. 공개 전에 모두 없어야 합니다.
- 각 파일의 `status` 는 `draft`(초안) → `review`(검토 중) → `final`(확정) 순서입니다. 교수님 확인 후 `final`.
- 사이트 상단의 "Draft — content under review" 띠는 공개할 때 끕니다: `.github/workflows/deploy.yml` 에서 `PUBLIC_DRAFT_BANNER: "false"`.

## 5. 로컬에서 미리 보기 (선택)

Node.js LTS를 설치한 뒤 저장소 폴더에서:

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:4321` 을 엽니다. 저장하면 바로 반영됩니다.

점검 명령:

```bash
npm run check        # 누락된 번역, 그림 출처, 동의 여부, 깨진 링크, [TODO] 개수
npm run pubs:check   # 논문 파일 오류 (DOI 중복, 필수 항목 누락, keywords 오타)
npm run todo         # [TODO] 위치 목록
```

## 6. Claude Code로 고치기

저장소 폴더에서 Claude Code를 열고 자연어로 요청하면 됩니다. 예:

- `새 논문 DOI 10.xxxx/yyyy 추가하고 lipidomics 태그 달아줘`
- `멤버 추가: 홍길동, 석사과정, 2026-03 입학, 연구 주제 …`
- `inbox 처리해줘` (원자료를 `inbox/` 폴더에 넣은 뒤)
- `한국어 번역 동기화해줘`
- `공개 전 점검해줘`

## 7. 문제가 생겼을 때 되돌리기

1. 저장소 → **Commits**(시계 아이콘) 또는 파일의 **History** 를 엽니다.
2. 문제를 만든 커밋을 열고 오른쪽 위 **…** → **Revert** 를 누릅니다.
3. 만들어진 Pull request를 **Merge** 하면 이전 상태로 돌아갑니다.
4. Actions 에서 빨간 X가 떴다면 해당 실행을 눌러 로그를 봅니다. 대개 Markdown 맨 위의 `---` 사이(frontmatter) 오타, 콜론 뒤 공백 누락, 그림 경로 오타가 원인입니다.

## 8. 하지 말아야 할 것

- 멤버·졸업생 정보를 본인 동의 없이 올리기
- 제조사 설명문, 다른 사이트 이미지, 출처 없는 논문 그림 복사
- 모집 조건·약력·수상 내용을 확인 없이 적기 → 모르면 `[TODO]`
- `git push --force`, 히스토리 재작성, 비밀키 커밋

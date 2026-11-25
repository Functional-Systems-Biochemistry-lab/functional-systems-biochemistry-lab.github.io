# FSB Lab 홈페이지 — Claude Code 프로젝트 지침

> 작성 2026-11-25 (rev. 1) · 근거: 사용자–Claude 대화(2026-11-24~25), 기존 사이트 조사(2026-11-24)

이 파일은 Claude Code가 따르는 **명세서이자 작업 지침**임.
(1) 홈페이지 초안을 처음 만들 때, (2) 이후 계속 수정할 때 모두 이 파일을 기준으로 함.
새 폴더의 루트에 `CLAUDE.md`로 저장해서 사용.

---

## 0. 시작하기 (사람용)

사용자는 Git·웹 개발 초보자임. 설명은 쉬운 한국어로, 명령어는 복사해서 쓸 수 있게 제시.

1. 새 폴더를 만들고 이 파일을 `CLAUDE.md`로 저장.
2. 그 폴더에서 Claude Code를 실행하고 첫 요청:
   `CLAUDE.md를 읽고 §10의 Phase 0~1을 진행해줘. 모르는 정보는 지어내지 말고 [TODO]로 남겨줘.`
3. 글·사진·논문 목록 등 원자료는 `inbox/`에 넣고 `inbox 처리해줘`라고 요청.
4. 초안이 나오면 `npm run dev`로 미리보기. 이후 수정은 자연어로 요청.
   - `새 논문 DOI 10.xxxx/yyyy 추가하고 lipidomics 태그 달아줘`
   - `멤버 추가: 홍길동, 석사과정, 연구 주제 …`
   - `Join Us의 지원 절차 문구를 이렇게 바꿔줘 …`
   - `한국어 번역 동기화해줘`
   - `공개 전 점검해줘`
5. 공개(GitHub Pages)는 교수님 확인 후에 진행(R9, §10 공개 체크리스트).

---

## 1. 작업 규칙 (모든 작업에서 준수)

- **R1 기준 문서**: 작업 전 §3, §12, §13을 확인. 작업 후 §13, §14 갱신.
- **R2 사실 날조 금지**: 멤버, 논문, 수상, 연구비, 장비, 모집 조건, 날짜, 연락처를 지어내지 않음. 모르면 `[TODO: 필요한 정보]`로 표시하고 §12에 기록.
- **R3 출처·상태 표기**: 사실을 담은 콘텐츠 파일의 frontmatter에 `source`와 `status`(draft/review/final) 기록. 사용자·교수님 확인 전은 `draft`.
- **R4 문구 수준**: 분야·기술의 일반적 정의 수준은 초안으로 작성 가능. 연구실 고유 성과, 수치, 우수성 주장은 근거 자료 없이 작성 금지.
- **R5 개인정보**: 저장소는 Public이므로 커밋하는 모든 것이 변경 기록과 함께 공개됨. 멤버 정보(이름·사진·이메일·진로)는 본인 동의를 확인한 뒤에만 `src/content/members/`에 파일을 만들고 `consent: true`로 기록. 동의 전 자료는 `inbox/`에만 두고, `inbox/`는 git에서 제외(`.gitignore`). 멤버는 `consent: true`일 때만 렌더링. 개인 전화번호, 학번, 집 주소 게시 금지. 사진·이메일·진로는 본인 동의 범위 안에서만 공개.
- **R6 저작권**: 제조사 설명문, 타 사이트 이미지, 논문 그림을 복사하지 않음. 장비 설명은 자체 문장으로 작성. 그림은 `license`(own/cc-by/permission/oa)와 `credit`이 없으면 사용 금지. 논문 PDF는 오픈액세스만 호스팅하고 그 외는 DOI 링크.
- **R7 자동 수집 금지**: 기존 사이트(fsb.khu.ac.kr)는 프레임 구조이며 자동 열람이 막혀 있음. 크롤링하지 말고 사용자가 `inbox/`에 넣은 자료만 사용.
- **R8 한/영**: 영어가 원본, 국문은 같은 구조로 유지. 국문 누락 시 영어로 대체하고 `[TODO ko]` 표시. Publications는 영문 전용.
- **R9 공개 승인**: Pages 활성화, 모집 문구, 교수님 약력은 교수님 확인 후에만 `final`. 작업은 브랜치에서 하고 main 병합은 사용자 확인 후.
- **R10 검증**: 변경 후 `npm run build`와 `npm run check` 통과를 확인한 뒤 완료 보고. 실패하면 원인을 고치고 재실행. 통과하지 못한 채 완료를 선언하지 않음.
- **R11 콘텐츠/코드 분리**: 문구는 `src/content`, `src/i18n`, `src/data`에만 두고 컴포넌트에 하드코딩 금지.
- **R12 안전**: force push, 대량 삭제, 히스토리 재작성 금지. 저장소는 Public이라 한 번 커밋한 내용은 지워도 기록에 남음. 비밀키·토큰, 미발표 데이터, 임상 정보, 대용량 원본 파일 커밋 금지. 커밋 전 `git status`로 올라갈 파일을 확인.
- **R13 범위**: 명세 밖 기능(로그인, 댓글, 분석·추적 도구 등) 임의 추가 금지. §2~§8 명세는 사용자 승인 없이 변경 금지. 변경 시 §3에 사유 기록.
- **R14 소통**: 사용자에게 한국어로 보고. 변경 요약은 짧게, 확인이 필요한 질문은 모아서 한 번에.

---

## 2. 프로젝트 개요

- **연구실**: Functional Systems Biochemistry Lab (FSB Lab), 경희대학교 응용화학과(국제캠퍼스). 국문 연구실명 `[TODO]`.
- **PI**: 김광표(Kwang Pyo Kim) 교수 1명.
- **연구 개요**(기존 사이트 About Us 요지): 질량분석(LC-ESI-MS, MALDI-TOF 등) 기반 multi-omics(proteomics, glycomics, lipidomics, imaging)로 생명현상의 기전을 분자 수준에서 개체 수준까지 연구. 질병 진단, 치료제 개발, 바이오마커 발굴로 확장.
- **목표**: 푸터 저작권이 2013년으로 표기된 프레임 기반 구 사이트를 대체. 모바일에서 읽기 쉽고, 후배가 Markdown만 고쳐서 갱신할 수 있는 구조.
- **독자**: 1순위 대학원·인턴 지원자. 2순위 공동연구자, 논문 독자, 학과 홍보.
- **언어**: 한/영 병행. Publications는 영문만.
- **톤**: 담백하고 구체적. 과장·수식어 최소. 문장은 짧게.
- **성공 기준**: 홈에서 2클릭 이내에 Join Us 도달. 모바일 가독성. 비개발자도 유지보수 가능. 공개되는 모든 정보에 출처와 동의 확인.

---

## 3. 결정 로그

상태: **확정** = 사용자가 직접 밝힘, **제안** = Claude 제안이며 사용자 미확정.

| ID | 내용 | 상태 | 비고 |
|---|---|---|---|
| D1 | 한/영 병행 | 확정 | Publications는 영문만 |
| D2 | 주 독자는 대학원·인턴 지원자 | 확정 | |
| D3 | Faculty 별도 메뉴 유지(교수님 1분) | 확정 | 기존 사이트는 Group Member 하위 |
| D4 | About Us는 별도 메뉴 없이 Home에 간단히 표시 | 확정 | |
| D5 | Research = 목록 + 분야별 상세 6개(대표 그림, 관련 논문 그림, 분야 소개) | 확정 | 제목은 §5.3 |
| D6 | 기존 사이트 내용만 참고하고 거의 새로 제작 | 확정 | |
| D7 | 교수님 약력·학력·경력·연구 관심사·연락처·수상은 사용자가 보유, 나중에 삽입 | 확정 | `[TODO]` 자리 확보 |
| D8 | Publications 자동 연동, 연구 분야 태그로 Research와 연결 | 확정 | 방식(BibTeX)은 제안 |
| D9 | Join Us 페이지 신설 | 확정 | 작성 방법을 문의함 |
| D10 | Facility 메뉴 1차 포함 | 제안 | 기존 사이트에 있던 메뉴 |
| D11 | Contact 페이지 1차 포함 | 제안 | |
| D12 | News, Gallery(기존 Photo), Resources 추가 | 제안 | 빈 페이지는 메뉴에서 자동 숨김 |
| D13 | 기술: Astro 정적 사이트 + Markdown/YAML 콘텐츠 + GitHub Pages | 제안 | Claude Code 수정 용이, 무료, 디자인 자유도. 대안 §7.7 |
| D14 | 기본 언어 영어(`/`), 한국어 `/ko/` | 제안 | §12 Q2 |
| D15 | 디자인은 §8 토큰(대화 중 만든 '연구실 홈페이지 데모' 시안 기반) | 제안 | |
| D16 | 무료 운영: Organization `Functional-Systems-Biochemistry-lab`의 저장소 `functional-systems-biochemistry-lab.github.io`(Public) → `https://functional-systems-biochemistry-lab.github.io`, base `/` | 확정 | 사용자 결정(2026-11-25). 학교 도메인은 학과 확인 후(Q10) |
| D17 | Alumni는 동의한 사람만 공개 | 제안 | |
| D18 | Astro 7.4 + `@astrojs/markdown-remark`(unified) 사용 | 제안 | Astro 7 기본 Markdown 처리기(Sätteri)는 remark 플러그인을 못 씀. `[TODO]` 표식·내부 링크 언어 접두어 플러그인 때문에 unified 파이프라인 선택 (2026-11-25) |
| D19 | 페이지는 `src/pages/index.astro` + `src/pages/[...path].astro` 2개 파일과 `src/lib/routes.ts` 라우트 표로 생성 | 제안 | 기본 언어 변경은 `src/i18n/config.ts` 한 곳(Q2 대응). 뷰는 `src/views/` |
| D20 | BibTeX 파서 `@retorquere/bibtex-parser`(WASM, 2026-11 갱신, ISC) | 제안 | LaTeX 악센트 → 유니코드 변환 포함. 문제 시 §7.3 대안(JSON 변환) |
| D21 | 폰트는 npm 패키지로 자체 호스팅(`@fontsource-variable/manrope`, `@fontsource/ibm-plex-mono`, `pretendard`) | 제안 | 빌드 시 네트워크 불필요 |
| D22 | Research 그림은 frontmatter `workflow`(접근 방법 1장) + `figures`(대표 결과)로 분리. 본문은 `## 배경 / 접근 방법 / 대표 결과` 순서의 h2로 나눠 렌더 | 제안 | §5.3 템플릿 구현 방식 |
| D23 | 플레이스홀더 그림(자체 제작 SVG, `license: own`)은 "Illustration only" 캡션과 함께 표시. 실제 그림이 오면 교체 | 제안 | Q7, Q14 |
| D24 | 색상 기조를 랩미팅 PPT(`1_랩미팅_양식.pptx`) 색으로 변경: 로열블루·금색·네이비. D15의 시안 색(청록·앰버)을 대체 | 확정 | 사용자 요청(2026-11-25). 값은 §8 |
| D25 | Draft 띠(`PUBLIC_DRAFT_BANNER`)가 켜진 동안 robots.txt는 `Disallow: /`, 모든 페이지에 `<meta name="robots" content="noindex">`. 띠를 끄면 같은 변수로 함께 해제 | 확정 | 사용자 요청(2026-11-25). 공개 전 검색 노출 방지. 구현 `src/lib/draft.ts` |
| D26 | 배경 그림 + 부드러운 스크롤: 설정은 `src/data/background.yml` 한 파일, 그림은 `src/assets/backdrops/`. 그림은 `float`(떠 있는 그림: `near` 구역 또는 자동 배치, 패럴랙스, 나타나기)과 `fixed`(전체 배경, 스크롤 %에 따라 스며듦) 두 종류. 마우스 휠은 Lenis(`lenis`, MIT, 번들 자체 호스팅)로 부드럽게, 터치·키보드는 기본 동작. `prefers-reduced-motion` 이면 패럴랙스·나타나기·부드러운 스크롤 모두 끔 | 확정 | 사용자 요청(2026-11-25, 참고: leejoosang.wixsite.com/ngml). §8 '장식 최소'의 예외 — 글자 가독성·R6(credit·license)·`npm run check` 검증 필수. 구현 `src/lib/background.ts`, `src/components/Backdrops.astro` |
| D27 | Contact 지도: 구글 지도 퍼가기 iframe(`site.yml` `contact.map_embed_url`, `https://www.google.com/maps/embed`로 시작하는 주소만 통과)만 허용, 그 외 외부 iframe 금지. 퍼가기 주소가 없으면 지도 이미지(`map_image` + `map_credit`)로 대체. 외부 지도 링크 버튼은 `map_links`(여러 개) 또는 `map_url` | 확정 | 사용자 요청(2026-11-25, `inbox/fsb-contact-map-image.patch`). §5.8·§8 금지 목록 수정. 지도 iframe은 Google 서버에서 불러오므로 §7.6(외부 스크립트·쿠키 미사용)의 예외 — 캡션 `contact.map_embed_note`로 표기. 구현 `src/views/ContactView.astro` |

---

## 4. 사이트 구조

| 메뉴(영/국) | 경로 | Phase | 언어 | 비고 |
|---|---|---|---|---|
| Home / 홈 | `/` | 1 | 한/영 | About 요약 포함 |
| Faculty / 교수 | `/faculty` | 1 | 한/영 | |
| Research / 연구 | `/research`, `/research/<slug>` ×6 | 1 | 한/영 | |
| Facility / 연구 장비 | `/facility` | 1 | 한/영 | D10 |
| Publications / 논문 | `/publications` | 1 | 영문 목록 | 한국어 경로는 UI만 국문 |
| Members / 구성원 | `/members` | 1 | 한/영 | Current(Graduate, Undergraduate) + Alumni |
| Join Us / 지원 안내 | `/join` | 1 | 한/영 | 헤더 버튼으로 강조 |
| Contact / 연락처 | `/contact` | 1 | 한/영 | |
| News / 소식 | `/news` | 2 | 한/영 | Home에는 최근 3건 |
| Gallery / 사진 | `/gallery` | 2 | 캡션만 한/영 | 행사별 앨범 |
| Resources / 자료 | `/resources` | 3 | 영문 | 프로토콜, 코드, 데이터 링크 |

- 헤더: Home, Faculty, Research, Facility, Publications, Members, Contact + **[Join Us] 버튼** + 언어 토글(EN | KO).
- 메뉴가 8개를 넘으면 News, Gallery, Resources는 푸터로 이동.
- 항목이 0개인 페이지·섹션(News, Gallery 등)은 메뉴와 Home에서 자동 숨김. 라우트와 컴포넌트는 Phase 1에서 구현.

---

## 5. 페이지별 명세

### 5.1 Home (위에서 아래 순서)

1. **Hero**: 연구실명, 한 줄 소개(2문장 이하), 버튼 [Join Us] [Publications], 대표 이미지(연구실 사진 또는 자체 그림. 없으면 질량 스펙트럼 SVG + "Illustration only" 캡션).
2. **About** (3~4문장): 무엇을 하는지, 어떤 방식인지, 누구와 일하는지. 연구 철학·문화처럼 길어지는 내용은 Join Us로.
3. **Research 하이라이트**: 6개 타일(제목 + 한 줄 + 대표 이미지) → 각 상세로 링크.
4. **News**: 최근 3건(없으면 숨김).
5. **Members 요약 + Join Us 띠**: 다크 밴드, 버튼 1개.

초안 문구(기존 사이트 About Us의 요지를 다시 쓴 것. 교수님 확인 전까지 `draft`):

- 한 줄 소개 EN: `Mass spectrometry–based systems biochemistry for disease research.`
- 한 줄 소개 KO: `질량분석 기반 시스템 생화학으로 질병을 연구합니다.`
- About EN: `We study how biological systems work, from molecules to whole organisms, using mass spectrometry–based multi-omics: proteomics, glycomics, lipidomics, and imaging. We apply these methods to disease diagnosis, biomarker discovery, and drug development. If you are interested in our research, please get in touch or visit the lab.`
- About KO: `저희 연구실은 질량분석 기반 multi-omics(프로테오믹스, 글라이코믹스, 지질체학, 이미징)로 생명현상의 기전을 분자 수준에서 개체 수준까지 연구합니다. 이를 질병 진단, 치료제 개발, 바이오마커 발굴로 확장하고 있습니다. 연구에 관심이 있으신 분은 언제든 연락하거나 방문해 주세요.`

### 5.2 Faculty

- 사진, 이름(국/영), 소속·직위, 연락처(기관 이메일 `[TODO]`).
- 학력, 경력(연도 역순 타임라인), 연구 관심사, 수상·활동, 대표 논문(선택, Publications의 `selected`), 외부 링크(Google Scholar, ORCID, PubMed `[TODO]`).
- 자료 출처: 사용자 보유 자료(D7) → `inbox/faculty/`. 기존 사이트 Professor 페이지에 학력·경력이 있으나 참고만 하고 사용자가 준 최신본으로 대체.

### 5.3 Research

**목록 페이지**: 6개 카드. 아래 순서와 제목을 그대로 사용(사용자 제공).

| 순서 | slug | 국문 제목 | 영문 제목 |
|---|---|---|---|
| 1 | `biomarker-discovery` | 정량분석을 통한 질병 특이 바이오마커 발굴 | Development of disease specific biomarkers by quantitative analysis |
| 2 | `imaging-ms` | MALDI-TOF 질량분석기를 이용한 이미징 질량분석 기술 | Imaging mass spectrometry (IMS) using MALDI-TOF-MS |
| 3 | `lipidomics` | 질량분석기를 이용한 지질 분석 | Lipidomics using mass spectrometry |
| 4 | `ptm` | 다양한 단백질의 번역 후 변형 분석 | Analysis of post-translational modifications (PTMs) |
| 5 | `nitroproteomics` | 질량분석기를 이용한 질산화 단백질 분석 | Nitroproteomics using mass spectrometry |
| 6 | `systems-biology` | 시스템 생물학 | Systems biology |

**상세 페이지 템플릿** (순서 고정):

1. 제목(국/영) + 한 줄 요약
2. 배경(3~4문장): 왜 이 연구를 하는가
3. 접근 방법: workflow 그림 1장 + 2~3문장
4. 대표 결과: 그림 1~2장 + 캡션(`credit`, `license` 필수)
5. 관련 논문: Publications 중 `keywords`에 해당 slug가 있는 논문 3~5편 자동 표시 + 전체 보기 링크
6. 이전/다음 분야 링크

**규칙**
- 그림 규격: 16:9, 폭 1600px 이상, WebP 또는 PNG. 파일명 `research-<slug>-NN.ext`. 대체 텍스트(국/영) 필수.
- 논문 그림은 R6 적용. 저자인 경우에도 출판 계약에 따라 허가가 필요할 수 있음. 가능하면 연구실이 새로 그린 요약 그림 + 논문 링크 사용.
- 본문 초안은 일반 정의 수준(R4). 연구실 성과·수치는 사용자 자료가 올 때까지 `[TODO]`.

### 5.4 Facility

- 카드 필드: 장비명, 제조사, 모델, 용도 1~2문장(자체 문장), 사진(자체 촬영 또는 사용 허가).
- 기존 사이트에서 확인한 항목(일부): Thermo Scientific Q Exactive Hybrid Quadrupole-Orbitrap MS, Agilent 6490 Triple Quadrupole LC/MS (iFunnel), Thermo Scientific EASY-nLC 1000. 목록 하단에 추가 항목이 더 있으나 미확인.
- 현재 보유·운용 장비는 사용자 확인 후 확정. 구형·폐기 장비는 제외하고 신규 도입 장비 누락 여부를 확인(§12 Q3).
- 기존 설명문은 제조사 소개문 형태이므로 복사 금지(R6).

### 5.5 Publications (영문 전용)

- **소스**: `data/publications.bib` (Zotero 내보내기). 연도 역순 그룹.
- **항목 형식**: `Authors. Title. Journal Year;Vol:Pages. DOI` + 분야 칩. 연구실 멤버 이름은 굵게.
- **분야 연결**: BibTeX `keywords`에 Research slug(예: `lipidomics, ptm`) 기재 → 해당 Research 상세에 자동 노출. 목록 페이지에서 분야별 필터.
- **멤버 강조**: 멤버 파일의 `aliases`(예: `Kim KP`, `Kim, Kwang Pyo`)로 저자명 매칭.
- **링크**: DOI/PubMed 링크가 기본. PDF는 오픈액세스 논문만 `pdf` 필드로 연결(R6).
- **현황**: 기존 사이트 목록은 화면상 2023년이 최신이었음. 2024~2026 논문은 새로 수집(§12 Q8).
- **입력 형식**: `.bib`, `.ris`, `.nbib`(PubMed MEDLINE), DOI 목록(.txt)을 `inbox/publications/`에서 받아 BibTeX로 변환.
- **점검**: `npm run pubs:check` — DOI 중복, 필수 필드 누락, 연도 정렬, `keywords`의 slug 오타.
- **선택(Phase 3)**: DOI → BibTeX 변환 스크립트. `doi.org`의 content negotiation(`Accept: application/x-bibtex`) 사용. 동작 확인 후 구현.

### 5.6 Members

- 상단: PI 카드(→ Faculty 링크).
- **Current**: Graduate students(M.S./Ph.D.), Undergraduate interns. 카드: 사진, 이름(국/영), 과정, 연구 주제 한 줄, 이메일(선택).
- **Alumni**: 이름, 학위·졸업 연도, 현재 소속·직위(동의 시).
- 정렬: 직위 → 입학 연도.
- `consent: true`가 아닌 항목은 렌더링 제외(R5).

### 5.7 Join Us

구성(순서 고정):

1. 환영 한두 문장 — 어떤 사람을 찾는지
2. 모집 구분 — 석사, 박사, 학석사 연계, 학부 인턴, 박사후 중 **실제로 받는 구분만**
3. 하게 될 일과 배우는 것 — 구체적으로(예: 시료 준비, 정량 분석, 결과 해석, 분석 파이프라인)
4. 지원 자격 — 필수/우대 구분
5. 지원 절차 — 보낼 서류(CV, 성적표, 관심 연구 한 단락), 메일 제목 `[지원] 구분/이름`, 면담, 회신 시기
6. 연구실 환경 — 장비, 세미나, 졸업 후 진로(확인된 것만)
7. FAQ 3~5개 — 비전공자 가능 여부, 방문 면담, 인턴 시기 등
8. 연락처 → Contact 링크, 하단에 CTA 1개

작성 원칙: 날짜 고정 금지(`상시 모집, 문의 환영` 형태. 기간 공고는 News), 과장 금지(구체적 사실 사용), 지원 장벽을 낮추는 문장, 한/영 구조 동일.

교수님 확인 필요(확인 전까지 `[TODO]` + `draft`): 모집 구분과 상시 여부, 인건비·장학금 안내 가능 범위, 학부 인턴 조건과 최소 기간, 지원서 수신 이메일.

### 5.8 Contact

- 주소(기관 공개 주소, 기존 사이트 기준): 경기도 용인시 기흥구 덕영대로 1732, 경희대학교 국제캠퍼스 응용화학과 가설연구동 101호. 우편번호·현행 여부 `[TODO]`.
- 대표 이메일 `[TODO]`, 전화 `[TODO]`.
- 지도: 구글 지도 퍼가기 iframe(`site.yml`의 `contact.map_embed_url`)만 허용, 그 외 외부 iframe 금지(D27). 퍼가기 주소가 없으면 지도 이미지(`map_image`, R6에 따라 `map_credit` 표기)로 대체. 외부 지도 링크 버튼(`map_links`)과 교통편은 선택.

### 5.9 후속 페이지

- **News**: 날짜·제목·짧은 본문. Home에 최근 3건. 모집 공고도 News로.
- **Gallery**: 행사별 앨범(연도/행사명). 사진 1600px 이하, 초상 동의 확인, 캡션 국/영. 기존 Photo 메뉴는 비어 있었으므로 새 사진 필요.
- **Resources**: 프로토콜, 분석 코드(GitHub 링크), 공개 데이터, 소프트웨어. 영문.

---

## 6. 콘텐츠 모델 & 폴더 구조

```
.
├─ CLAUDE.md                 # 이 파일
├─ inbox/                    # 사용자가 넣는 원자료. 처리 후 inbox/_done/ 으로 이동
│  ├─ faculty/  members/  research/<slug>/  publications/  facility/  gallery/<event>/
│  └─ text/                  # 기존 사이트에서 복사한 텍스트, 캡처 이미지
├─ docs/MAINTAINING.md       # 후배용 관리 가이드(한국어, 초보자용). Claude Code가 생성·유지
├─ data/publications.bib     # 논문 원본(Zotero 내보내기)
├─ public/                   # favicon, robots.txt 등 정적 파일
├─ scripts/                  # check, todo, pubs-check, (선택) doi2bib
├─ src/
│  ├─ assets/                # research/, members/, facility/, gallery/, backdrops/(배경 그림)
│  ├─ components/            # Header, Footer, Hero, ResearchCard, MemberCard, PubList, ...
│  ├─ content/
│  │  ├─ research/{en,ko}/<slug>.md
│  │  ├─ members/<id>.md      # 인물별 1파일(국/영 필드 포함)
│  │  ├─ facility/{en,ko}/<id>.md
│  │  ├─ pages/{en,ko}/{home,faculty,join,contact}.md
│  │  └─ news/{en,ko}/YYYY-MM-DD-<slug>.md
│  ├─ data/site.yml          # 연구실명, 주소, 외부 링크, 내비게이션
│  ├─ data/background.yml    # 배경 그림 목록·위치, 부드러운 스크롤 (D26)
│  ├─ i18n/{en,ko}.json      # UI 문구
│  └─ layouts/  pages/  styles/
└─ .github/workflows/deploy.yml
```

콘텐츠 컬렉션 스키마(zod 등)로 frontmatter를 검증. 아래는 필수 필드.

**research** (`src/content/research/<locale>/<slug>.md`, 본문 = 배경/접근/결과)

```yaml
slug: lipidomics
order: 3
title: Lipidomics using mass spectrometry   # ko 파일은 국문 제목
summary: ...                                # 한 줄, 140자 이내
tags: [lipidomics]                          # BibTeX keywords와 매칭
cover: <src/assets 기준 경로>
figures:
  - src: ...
    alt: ...
    caption: ...
    credit: "Author et al., Journal Year, Fig. 2"
    license: own   # own | cc-by | permission | oa
status: draft      # draft | review | final
source: 사용자 제공
```

**members** (`src/content/members/<id>.md`)

```yaml
id: hong-gildong
name_en: Gildong Hong
name_ko: 홍길동
role: phd          # pi | postdoc | phd | ms | undergrad | alumni
since: 2024-03
left: null         # alumni는 졸업·퇴실 연월
topic_en: ...
topic_ko: ...
photo: <src/assets 기준 경로>
email: null        # 선택, 동의 시만
current_position: null   # alumni
aliases: ["Hong GD", "Hong G"]   # 논문 저자 매칭
consent: true      # 필수. true가 아니면 렌더링 제외
status: draft
source: 사용자 제공
```

**facility** (`src/content/facility/<locale>/<id>.md`, 본문 = 용도 1~2문장)

```yaml
id: q-exactive
name: Q Exactive Hybrid Quadrupole-Orbitrap MS
vendor: Thermo Scientific
order: 1
photo: ...
license: own       # own | permission
status: draft
source: 기존 사이트 2026-11 (목록만 참고, 문장은 자체 작성)
```

**news**: `date`, `title`, `status`, 본문. **pages**: `title`, `status`, `source`, 본문.

---

## 7. 기술 스택 · 명령어

### 7.1 스택 (D13)
- **Astro**(최신 안정판, 공식 문서 확인) + TypeScript strict + 순수 CSS(변수 기반) + Markdown/YAML 콘텐츠 컬렉션. Node LTS.
- UI 프레임워크, CSS 프레임워크 사용하지 않음. 의존성은 최소로 하고 추가 시 유지보수 상태를 확인.
- 초기화: `npm create astro@latest` (minimal 템플릿).

### 7.2 다국어
- Astro 내장 i18n 라우팅 사용. `defaultLocale: en`, `locales: [en, ko]`. 루트(`/`)는 영어, 한국어는 `/ko/`.
- 언어 토글은 같은 페이지의 다른 언어 버전으로 이동(없으면 해당 언어 홈).
- `<html lang>`, `hreflang` 대체 링크, 사이트맵 출력.
- 국문 본문 `word-break: keep-all`, `line-height` 1.7.
- 기본 언어는 설정 한 곳에서 바꿀 수 있게 구현(§12 Q2).

### 7.3 Publications 파이프라인
- 빌드 시 `data/publications.bib`를 파싱(BibTeX 파서 라이브러리 사용, 유지보수 상태 확인) → 연도별 정렬·그룹 → 렌더.
- 파서에 문제가 있으면 `scripts/`에서 JSON으로 변환하는 방식도 허용.

### 7.4 명령어 (`package.json`에 정의)

| 명령 | 역할 |
|---|---|
| `npm run dev` | 로컬 미리보기 |
| `npm run build` | 정적 빌드(`dist/`) |
| `npm run check` | 스키마, i18n 동등성, 이미지 alt, figure license, member consent, 내부 링크 검사. `[TODO]` 개수와 `draft` 페이지 수를 보고(빌드 실패는 아님) |
| `npm run todo` | `[TODO` 위치 목록 |
| `npm run pubs:check` | BibTeX 검증(§5.5) |

### 7.5 배포
- GitHub Pages + GitHub Actions. Astro 공식 배포 가이드를 따름.
- 저장소: Organization `Functional-Systems-Biochemistry-lab` / `functional-systems-biochemistry-lab.github.io`(Public, D16). 기본 주소는 `astro.config.mjs`에 고정(`site` `https://functional-systems-biochemistry-lab.github.io`, `base` `/`). 다른 주소로 시험 배포할 때만 환경변수 `SITE_URL`/`BASE_PATH`로 덮어씀.
- 초안 단계에서는 상단에 얇은 띠 `Draft — content under review`를 표시. 환경변수 `PUBLIC_DRAFT_BANNER`로 켜고 끔. 켜진 동안 robots.txt `Disallow: /`와 `noindex` 메타가 함께 적용됨(D25).
- 커스텀 도메인은 학과·학교 확인 후(Phase 3).

### 7.6 프라이버시·보안
- 외부 추적 스크립트, 쿠키, 분석 도구 미사용. 폰트는 자체 호스팅(Fontsource 등).
- 이메일 스팸 방지를 위한 표기 난독화는 선택(§12에서 사용자 결정).

### 7.7 대안 스택 (사용자가 요청할 때만)
- Hugo Blox Research Group 템플릿. 논문은 `content/publications/*/index.md` 페이지 번들이며 `academic import --bibtex`로 생성, 언어별 폴더는 `--publication-dir` 옵션. 연구 분야는 Projects 콘텐츠 유형 사용.
- 전환 시 §6의 콘텐츠 모델은 유지하고 변환 스크립트를 작성. 템플릿 구조가 바뀌었을 수 있으므로 공식 문서를 먼저 확인.

---

## 8. 디자인 가이드

**방향**: 담백한 학술 사이트. 장식 최소, 텍스트·그림 중심, 여백 넉넉. 단일 흐름으로 읽히는 정보형 구성.

**색상 토큰** (CSS 변수, 라이트 모드만. 다크 모드는 Phase 3)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#F3F5F9` | 페이지 배경 |
| `--surface` | `#FFFFFF` | 카드, 교차 섹션 |
| `--ink` | `#0E2841` | 본문, 제목 (PPT 본문 네이비) |
| `--muted` | `#44536C` | 보조 텍스트 |
| `--muted-2` | `#55657E` | 캡션, 날짜, 라벨 |
| `--line` | `#D3DAE6` | 테두리, 구분선 |
| `--tint` | `#E7EDF8` | 이미지 자리, 그림 배경 |
| `--accent` | `#1A4CC8` | 링크, 기본 버튼(글자색 `#FFFFFF`). PPT 표지 파랑(accent4 `#4775E7`)의 75% 밝기 |
| `--brand` | `#113386` | 다크 밴드(Join Us) 배경. PPT 표지 배경색 |
| `--highlight` | `#FFD579` | CTA·강조에만 드물게(글자색 `--ink`). PPT 표지 제목 금색. 그림 안 강조는 앰버 `#FFC000` |

색상 출처(D24): 랩미팅 PPT `1_랩미팅_양식.pptx` — 표지 배경 `#113386`, 제목 `#FFD579`, 하단 띠 KHU 적색 `#9E1818`(미사용, 필요 시 포인트), 본문 `#0E2841`·`#FFC000`. 모든 본문·링크·버튼 조합은 WCAG AA(4.5:1) 이상 확인(2026-11-25).

**타이포그래피**
- 영문: Manrope(제목 800, 본문 400/500). 라벨·날짜·수치: IBM Plex Mono.
- 국문: Pretendard 또는 Noto Sans KR. 폰트 스택 `'Manrope','Pretendard','Noto Sans KR',system-ui,sans-serif`.
- 크기: 본문 16~18px, h1 46px(모바일 32px), h2 32px, h3 20px, 라벨 12~13px mono 대문자 `letter-spacing: 0.06em`.

**레이아웃**: 최대 폭 1120px, 좌우 여백 24px(모바일 16px), 섹션 상하 72px, 카드 `border-radius: 12px` + 1px `--line`. flex/grid + `gap` 사용. 400px 이하에서 1열.

**컴포넌트**: 헤더(로고·메뉴·Join Us 버튼·언어 토글), Hero, 섹션 헤딩(mono 라벨 + 제목), 카드(연구/멤버/장비), 연도별 논문 리스트, 뉴스 행(날짜 mono + 제목), 다크 밴드(Join Us), FAQ(`details/summary`), 푸터(주소, 학과·학교 링크).

**이미지**: 인물 사진은 정사각 크롭, 같은 크기. Astro 이미지 최적화와 lazy loading 사용. 연구 내용을 스톡 이미지로 대체하지 않음.

**접근성**: WCAG AA(본문 대비 4.5:1 이상), 키보드 포커스 표시(3px outline), 본문 건너뛰기 링크, `prefers-reduced-motion` 존중, 터치 타깃 44px 이상, 이미지 alt 필수, 색만으로 정보를 전달하지 않음.

**금지**: 이모지 아이콘, 보라–파랑 그라디언트, 자동 재생 미디어, 외부 iframe(구글 지도 퍼가기 iframe `map_embed_url`만 허용, D27).

**배경 그림·스크롤(D26)**: 사용자 요청으로 `src/data/background.yml` 의 그림을 글자 뒤(`z-index:-1`)에 깔고 마우스 휠 스크롤을 부드럽게 함. §8 '장식 최소'의 예외이므로 ① 글자 대비 4.5:1 을 해치지 않게 그림은 옅게(float `opacity` ≤ 0.8, 선 그림 0.5~0.7, 사진 0.15~0.3) ② 그림마다 `credit`·`license` 필수(R6) ③ 보라–파랑 그라디언트 금지는 그대로 ④ `prefers-reduced-motion` 에서는 모든 움직임 끔 ⑤ 그림은 장식이므로 `alt=""`·`aria-hidden`. 홈페이지 기본 샘플은 자체 제작 SVG(`license: own`)이며 실제 그림이 오면 교체.

---

## 9. 반복 작업 절차

- **새 논문**: `data/publications.bib`에 BibTeX 추가 → `keywords`에 Research slug 기입 → 멤버 저자명 표기 통일 → `npm run pubs:check` → `npm run build`.
- **멤버 추가·졸업**: `src/content/members/<id>.md` 추가 또는 `role: alumni`와 `left` 기입. `consent` 확인. 사진은 정사각, 800px 이하, WebP.
- **뉴스·모집 공고**: `src/content/news/{en,ko}/날짜-제목.md`.
- **연구 분야 갱신**: 해당 slug의 en/ko 모두 수정. 그림 추가 시 `credit`, `license` 기입.
- **모집 상태 변경**: `pages/{en,ko}/join.md` 수정. 날짜가 들어가는 문구는 News로. 교수님 확인 후 `status: final`.
- **inbox 처리**: 파일 종류별 분류 → 콘텐츠로 변환 → `source` 기록 → `inbox/_done/`로 이동 → §13·§14 갱신. 저해상도 이미지, 출처 불명 자료, 동의가 불명확한 인물 정보는 사용하지 않고 §12에 질문.
- **번역 동기화**: en 변경 시 ko를 같은 구조로 갱신. 못 하면 `[TODO ko]` 표시.
- **구조·디자인 변경**: 사용자 승인 후 §3 결정 로그와 §4/§8 갱신.
- **`docs/MAINTAINING.md`**(Phase 0에서 생성, 한국어 초보자용): GitHub 웹에서 파일 수정과 Commit, 논문·멤버·뉴스 추가법, 사진 규칙, 배포 확인(Actions 초록 체크), 문제 시 되돌리기(History → Revert).

---

## 10. 단계 계획 · 완료 기준

| Phase | 내용 | 완료 기준 |
|---|---|---|
| **0 뼈대** | Astro 프로젝트, i18n, 토큰 CSS, 레이아웃·헤더·푸터, 배포 워크플로, check 스크립트, `docs/MAINTAINING.md` 초안 | 빈 페이지들이 en/ko로 빌드됨. `check` 통과 |
| **1 핵심 초안** | Home, Faculty, Research(목록 + 6개), Facility, Publications, Members, Join Us, Contact, News·Gallery 골격(0개면 숨김). 미확정 정보는 `[TODO]`/draft | 두 언어 빌드. 390·768·1280px에서 레이아웃 확인. 접근성 점검 통과. §13 갱신 |
| **2 콘텐츠 채우기** | inbox 자료 반영: 교수님 약력, 멤버, 2024~2026 논문 포함 목록, Research 그림·소개문, 장비 현황, News·Gallery | `[TODO]` 0건(숨김 항목 제외). 공개 페이지 `status: final`(교수님 확인) |
| **3 운영 고도화(선택)** | 커스텀 도메인, DOI→BibTeX 도구, PubMed 정기 갱신 PR(Actions), Resources, 다크 모드, 검색 | 사용자 요청 시 |

**공개 체크리스트** (Phase 2 → 배포 전)
- 교수님 확인(약력, Join Us, 연구 소개)
- 멤버·Alumni 공개 동의
- 그림·사진 라이선스와 초상 동의
- 연락처·주소 최신 여부
- 링크 점검, Draft 띠 끄기(`PUBLIC_DRAFT_BANNER: "false"`). 배너를 끌 때 noindex 메타와 robots.txt `Disallow: /`도 함께 제거되었는지 배포된 페이지 소스와 `/robots.txt`에서 확인(같은 변수에 연동, D25)
- 학과·학교 홈페이지에 걸린 기존 링크를 새 주소로 교체 요청

---

## 11. 기존 사이트 조사 요약 (2026-11-24)

구조: 프레임 기반 구형 사이트. 푸터 저작권 2013. 모바일 대응은 안 되는 것으로 추정. 메뉴 7개.

| 기존 메뉴 | 확인 내용 | 신규 위치 | 조치 |
|---|---|---|---|
| Home | 인사말, 이미지 콜라주, 주소·전화, 학교·학과 로고 | Home, Contact | 재작성. 주소는 현행 확인 |
| About Us | 단체 사진, 연구실 소개(한/영). 끝에 연락·방문 문의 안내 | Home의 About 요약 | §5.1 초안 사용. 최신 사진 요청 |
| Group Member | 하위: Professor / Graduate Students / Undergraduate Students / Alumni. Professor에 학력·경력·연락처 | Faculty, Members | 약력은 사용자 최신 자료로 대체 |
| Research | 미확인. 사용자가 6개 분야 제목 제공 | Research | §5.3 |
| Facility | 장비 카드(Q Exactive, Agilent 6490, EASY-nLC 1000 등). 설명이 제조사 소개문 형태 | Facility | 현행 목록 확인, 설명 재작성 |
| Publication | 연도별 목록(화면상 최신 2023), 멤버 굵게, DOI, PDF 링크 | Publications | 2024~2026 추가, BibTeX로 재구축 |
| Photo | 비어 있음 | Gallery | 새 사진 |

미확인: Research 하위 내용, Group Member의 Graduate/Undergraduate/Alumni 페이지, Facility 하단 장비, Publication 이전 연도.

---

## 12. 미해결 질문 (Claude Code가 갱신)

| ID | 질문 | 영향 | 답 전 기본 진행 | 상태 |
|---|---|---|---|---|
| Q1 | 국문 연구실명 | 헤더·푸터 | `[TODO]` | 열림 |
| Q2 | 기본 언어: 영어 `/` vs 한국어 `/` | 라우팅 | 영어 | 열림 |
| Q3 | Facility 현재 보유 장비 목록 | Facility | 기존 3종만 draft 표기 | 열림 |
| Q4 | 교수님 약력·연락처·수상(D7) | Faculty | `[TODO]` 자리 | 열림 |
| Q5 | Join Us: 모집 구분, 지원 방법, 인건비 안내 범위, 인턴 조건, 수신 이메일 | Join Us | `상시 모집, 문의 환영` draft | 열림 |
| Q6 | Alumni 공개 동의 | Members | 공개하지 않음 | 열림 |
| Q7 | Research 6개의 대표 그림, 논문 그림, 소개문 | Research | 일러스트 placeholder | 열림 |
| Q8 | 2024~2026 논문 목록 | Publications | 비어 있음 | 열림 |
| Q9 | GitHub 계정/조직명(주소) | 배포 | – | 닫힘(2026-11-25): Organization `Functional-Systems-Biochemistry-lab`, 저장소 `functional-systems-biochemistry-lab.github.io` |
| Q10 | 학교·학과 도메인 사용 가능 여부 | 주소 | `github.io` | 열림 |
| Q11 | Contact 이메일·전화·우편번호 | Contact | – | 대부분 닫힘(2026-11-25): 사용자가 `site.yml`에 이메일·전화·우편번호·주소(실험연구동 A동 101, 102호) 입력. 남은 것: 영문 건물명은 번역("Experimental Research Building A")이라 학교 공식 영문명 확인 필요 |
| Q12 | Gallery 사진과 초상 동의 | Gallery | Phase 2 | 열림 |
| Q13 | 이메일 표기 난독화 여부 | Contact, Members | 사용 안 함 | 열림 |
| Q14 | Home Hero 대표 이미지(연구실 사진 또는 자체 그림) | Home | 질량 스펙트럼 SVG + "Illustration only" | 열림 |
| Q15 | 현재 구성원 명단(이름 국/영, 과정, 입학 연월, 연구 주제, 공개 동의) | Members | PI 카드만 표시 | 열림 |

---

## 13. 상태판 (Claude Code가 작업 후 갱신)

상태: 미착수 / 골격 / 초안 / 검토중 / 완료

| 항목 | Phase | en | ko | 상태 | 막힌 사유 |
|---|---|---|---|---|---|
| 프로젝트 뼈대·i18n·토큰 CSS | 0 | – | – | 완료 | |
| 배포 워크플로 | 0 | – | – | 초안 | 주소 확정(Q9 닫힘). Pages 활성화는 교수님 확인 후(R9) |
| `docs/MAINTAINING.md` | 0 | – | – | 초안 | |
| Home | 1 | 초안 | 초안 | 초안 | Q1, Q14 |
| Faculty | 1 | 골격 | 골격 | 골격 | Q4 (약력 전부 `[TODO]`) |
| Research 목록 + 상세 ×6 | 1 | 초안 | 초안 | 초안 | Q7 (대표 결과·그림) |
| Facility | 1 | 초안 | 초안 | 초안 | Q3 (3종만, 현행 확인) |
| Publications | 1 | 골격 | – | 골격 | Q8 (목록 0건) |
| Members | 1 | 골격 | 골격 | 골격 | Q6, Q15 |
| Join Us | 1 | 초안 | 초안 | 초안 | Q5 |
| Contact | 1 | 초안 | 초안 | 초안 | Q11 |
| News | 2 | 골격 | 골격 | 골격 | 0건(메뉴 숨김) |
| Gallery | 2 | 골격 | 골격 | 골격 | Q12, 0건(메뉴 숨김) |
| Resources | 3 | 미착수 | – | 미착수 | |

---

## 14. 변경 이력 (최신 항목을 아래에 추가)

- 2026-11-25 rev.1: 최초 작성. 사용자–Claude 대화(2026-11-24~25)와 기존 사이트 조사(2026-11-24)를 반영.
- 2026-11-25 rev.2: Phase 0~1 초안 구현. Astro 7.4(minimal 템플릿) 기반, en/ko 33페이지 빌드·`npm run check`·`pubs:check` 통과, 390/768/1280px 레이아웃 확인. §3 D18~D23, §12 Q14~Q15, §13 갱신. `[TODO]` 96건(모두 사용자·교수님 확인 대기). 브랜치 `draft/phase-0-1`.
- 2026-11-25 rev.3: 색상 토큰을 랩미팅 PPT 기조(로열블루 `#113386`, 금색 `#FFD579`, 네이비 `#0E2841`)로 교체(D24, §8). 플레이스홀더 SVG 색도 함께 교체.
- 2026-11-25 rev.4: GitHub 공개 준비. 배포 주소 확정(D16 확정, Q9 닫힘): `https://functional-systems-biochemistry-lab.github.io`, base `/`. `.gitignore`에 `inbox/`·`.env.*`(`.env.example` 제외) 추가. Draft 띠가 켜진 동안 robots.txt `Disallow: /`와 전 페이지 `noindex` 메타(D25, `src/lib/draft.ts`). R5·R12 보강(Public 저장소 공개 범위, 멤버 동의 후 파일 생성, `inbox/` git 제외, 비밀키·미발표 데이터·임상 정보·대용량 원본 커밋 금지, 커밋 전 `git status`). 공개 체크리스트에 noindex 제거 확인 추가.
- 2026-11-25 rev.5: 배경 그림·부드러운 스크롤 추가(D26). `src/data/background.yml`(설정), `src/lib/background.ts`(검증·기본값), `src/components/Backdrops.astro`(그림 층 + Lenis 스크롤 + 패럴랙스), `src/assets/backdrops/`(샘플 SVG 7개, `license: own`), `scripts/check.mjs`(설정 점검), 의존성 `lenis`. `docs/MAINTAINING.md` 3.6 추가. 참고: Wix 사이트(leejoosang.wixsite.com/ngml)의 고정 배경·구역에 걸친 그림·부드러운 스크롤 느낌.
- 2026-11-25 rev.6: Contact 지도 추가(D27, `inbox/fsb-contact-map-image.patch`). `site.yml` `contact`에 `map_embed_url`(구글 퍼가기 iframe)·`map_image`·`map_credit`·`map_links` 지원(`src/lib/site.ts`, `src/views/ContactView.astro`), UI 문구 `contact.map_alt`·`contact.map_embed_note`. §5.8과 §8 금지 목록을 "구글 지도 퍼가기 iframe만 허용, 그 외 외부 iframe 금지"로 수정. 브랜치 `feat/contact-map-image`.
- 2026-11-25 rev.7: Faculty 페이지의 `[TODO]` 칩 제거(사용자 요청). 주소가 없는 외부 링크(PubMed)는 `[TODO]` 칩 대신 줄을 숨김(`src/views/FacultyView.astro`). 푸터 영문 주소를 국문 주소 번역으로 채움(`site.yml`, 공식 영문 건물명은 Q11에 남김). 해결된 학과 URL의 `[TODO]` 주석 삭제. `[TODO]` 75→73건.
- 2026-11-25 rev.8: 구성원 카드(`src/components/MemberCard.astro`) 손질(사용자 요청). 사진이 없으면 이니셜 칸을 그리지 않고 글이 카드 전체를 씀. 가로 카드의 사진은 120px 정사각에 고정(카드 높이를 따라 커지지 않음). 교수 영문 이름을 Faculty 페이지와 같은 "Kwang Pyo Kim"으로 통일(`members/Kim-kwangpyo.md`).

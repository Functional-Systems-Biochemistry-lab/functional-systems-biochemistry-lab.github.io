# inbox — 원자료 넣는 곳

여기에 파일을 넣고 Claude Code에 `inbox 처리해줘`라고 요청하면
콘텐츠(`src/content`, `data/`)로 변환한 뒤 `inbox/_done/`으로 옮깁니다.

| 폴더 | 넣을 것 |
|---|---|
| `faculty/` | 교수님 약력(학력·경력·수상·연구 관심사), 사진, 외부 링크(Google Scholar, ORCID) |
| `members/` | 구성원 명단(이름 국/영, 과정, 입학 연월, 연구 주제 한 줄, 공개 동의 여부), 사진(정사각 권장) |
| `research/<slug>/` | 분야별 소개문, 대표 그림, 그림 출처·라이선스 메모. slug는 `biomarker-discovery`, `imaging-ms`, `lipidomics`, `ptm`, `nitroproteomics`, `systems-biology` |
| `publications/` | Zotero 내보내기(`.bib`), `.ris`, `.nbib`, 또는 DOI 목록(`.txt`) |
| `facility/` | 현재 보유 장비 목록(장비명·제조사·모델·용도), 사진 |
| `gallery/<행사명>/` | 행사 사진(1600px 이하), 캡션, 초상 동의 확인 메모 |
| `text/` | 기존 사이트에서 복사한 글, 화면 캡처 |

규칙: 출처가 불명확한 자료, 저해상도 이미지, 동의가 확인되지 않은 인물 정보는 사용하지 않고 `CLAUDE.md` §12에 질문으로 남깁니다.

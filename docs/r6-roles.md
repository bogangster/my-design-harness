# R6 역할 (roles)

> 기준: docs/r3-pipeline.md, docs/r4-artifacts.md, docs/r5-gates.md

## 에이전트 (편집 폴더 1개 원칙)

| 에이전트 | 단계 | 편집 폴더 | 읽기 | 도구 |
|---|---|---|---|---|
| researcher | S1 | `refs/` | docs/, rules/ | uibowl MCP |
| planner | S2 | `specs/` | docs/, refs/, rules/ | 읽기 전용 도구 |
| system-builder | S3 (컨셉 모드 1회) | `system/` | docs/design.md, rules/ | — |
| screen-builder | S3 | `screens/` | specs/, system/, rules/ | — |
| judge 🔒 | S4 | `reports/` (스크립트 출력만) | 전체 | 판정 스크립트 실행만. 편집 권한 없음 |
| 오케스트레이터 (메인, CLAUDE.md) | 전체 | `state/`, `system/APPROVED` | 전체 | 에이전트 호출·순서 관리 |

- S3는 `system/`과 `screens/` 두 폴더를 건드리므로 에이전트 2개로 분리했다.
- `system/APPROVED`가 있으면 system-builder는 실행하지 않는다 (사람 승인 없이 system 수정 금지).

## 판정자 (judge)

- 판정 스크립트만 사용. LLM 판정 없음.
- Node.js, 외부 패키지 없이 HTML/CSS 파싱.
- 입력: `screens/<id>.html`, `specs/<id>.md`, `refs/<id>.md`, `rules/rules.json`
- 출력: `reports/<id>.json` (게이트별 pass/fail + 위반 목록)

## 폴더 경계 강제

- 에이전트 호출 전 `judge.js snapshot`으로 파일 해시를 기록, 호출 후 `judge.js boundary <에이전트>`로 비교. 편집 폴더 밖 변경이 1건이라도 있으면 실패. (git status는 이전 단계의 미커밋 파일까지 잡으므로 해시 비교로 대체)

## 자연어 트리거

| 말 | 동작 |
|---|---|
| "컨셉 돌려줘" | 컨셉 모드: home, my-assets, admin-review → S1~S5 |
| "`<화면>` 화면 만들어줘" | 확장 모드: 해당 화면 → S1~S4 |
| "이어서 해줘" | `state/` 읽고 마지막 통과 단계 다음부터 |
| "`<화면>` 검사만 해줘" | S4 judge만 |
| "승인" / "거절: 코멘트" | S5 처리 |

## 후속 작업 에이전트

| 에이전트 | 작업 | 편집 대상 | 읽기 | 도구 |
|---|---|---|---|---|
| figma-publisher | 피그마 이관 | 피그마 파일 1개 (`state/figma.json`의 file URL) | screens/, system/, reports/ | 피그마 MCP |

- 로컬 파일은 수정하지 않는다. 피그마 파일 URL은 오케스트레이터가 `state/figma.json`에 기록.

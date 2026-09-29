# 산출물 (artifacts)

> 기준: docs/r3-pipeline.md

## 폴더 구조와 파일명

| 경로 | 단계 | 내용 |
|---|---|---|
| `docs/` | — | 사람이 쓰는 기준 문서. 에이전트는 읽기만 |
| `rules/rules.json` | — | ★ 규칙 SSOT |
| `refs/<id>.md` | S1 | 레퍼런스 5개 + 가져올 패턴 (패턴마다 출처 ref ID) |
| `specs/<id>.md` | S2 | 섹션·컴포넌트·PRD 필드·역할별 상태 |
| `system/tokens.css` | S3 | 디자인 토큰 (컨셉 모드 1회) |
| `system/components.html` | S3 | 컴포넌트 (컨셉 모드 1회) |
| `screens/<id>.html` | S3 | 화면 |
| `reports/<id>.json` | S4 | 스크립트 판정 결과 |
| `system/APPROVED` | S5 | 사람 확정 표시. 존재하면 `system/` 잠금 |
| `state/<id>.json` | 전체 | 재개용 상태 |

## 규칙 SSOT

- 파일: `rules/rules.json` 1개
- 스크립트와 에이전트는 rules.json만 읽는다. design.md·story-service.md는 사람이 읽는 원본.
- rules.json과 design.md가 다르면 rules.json이 우선. design.md 수정은 사람만.
- 실제 파일은 R5 게이트 확정 후 생성.

### design.md 공백·충돌 처리

| 항목 | 결정 |
|---|---|
| `{colors.on-primary}` hex 값 없음 | `#ffffff` |
| `ex-modal-card`·`ex-toast`의 shadow vs Don't "그림자 금지" | Don't 우선. 그림자 예외는 `segmented-control-active` 하나 |
| `field`·`hairline-soft` 둘 다 `#f0f0f0` | 그대로 둔다 (위반 아님) |

## 재개

- 가능. `state/<id>.json` 필드: `mode`, `stage`(마지막 통과 단계), `retries`(단계별), `last_fail`(사유)
- 재실행 시 `stage` 다음 단계부터 이어간다.

## 버전 관리

- `design-harness/` 안에서 별도 `git init` (상위 ~/Desktop 저장소와 분리)

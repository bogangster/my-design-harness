# R8 검증과 리뷰 (verify)

> 기준: docs/r5-gates.md, docs/r6-roles.md, docs/r7-orchestrator.md

## 하네스 검증

| ID | 검증 | 방법 | 통과 기준 |
|---|---|---|---|
| V1 | judge 자기 테스트 | `tests/fixtures/`에 게이트별로 일부러 틀린 HTML 1개씩 + 정상 1개 | 틀린 것 전부 fail, 정상 pass. 예상과 다른 결과 0건 |
| V2 | 폴더 경계 | planner가 `screens/`를 건드린 상황을 흉내 | judge fail |
| V3 | 드라이런 | "컨셉 돌려줘" 1회 | S1~S4 산출물 존재 · `state/` 단계별 갱신 · S5에서 승인 대기 |
| V4 | 재개 | S2 후 중단 → "이어서 해줘" | S3부터 재개, S1·S2 재실행 없음 |

- V1·V2 실행: `node scripts/judge.js --selftest`

### fixture 목록 (V1)

| fixture | 걸려야 하는 게이트 |
|---|---|
| `bad-color.html` (`#ff0000`) | G-token |
| `bad-shadow.html` (card에 box-shadow) | G-token |
| `bad-accent-cta.html` (`button-primary`에 `#0066ff`) | G-token |
| `bad-n1.html` (`판매 신청`에 `data-role-only` 없음) | ★ G-N1 |
| `bad-n2.html` (기본 선택 `멤버 공개`) | ★ G-N2 |
| `bad-g1.html` (한 ref 비율 60%) | G1 |
| `bad-field.html` (spec 필드 누락) | G-field |
| `bad-unmarked.html` (마킹 없는 섹션) | G-token |
| `good.html` | 전부 pass |

## 360px 가로 스크롤

- 스크립트 게이트 아님. S5에서 사람이 브라우저 패널을 360px로 줄여 눈으로 확인.

## 리뷰

- 하네스 파일 생성 직후 `/code-review` 1회 → 커밋
- 첫 컨셉 실행 후 회고 1회 → `docs/r8-review.md`에 오탐·미탐 기록
- `rules.json` 수치 조정(예: G1 40%)은 회고 결과 기반, 사람 승인 필요

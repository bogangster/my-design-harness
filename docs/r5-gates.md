# R5 게이트 (gates)

> 기준: docs/r3-pipeline.md, docs/r4-artifacts.md, docs/story-service.md
> 모든 수치는 rules/rules.json에서 읽는다.

## HTML 마킹 규칙 (필수)

스크립트가 셀 수 있도록 화면 HTML에 아래 속성을 단다. 마킹 없는 섹션·컴포넌트가 있으면 G-token 실패.

| 속성 | 대상 | 예 |
|---|---|---|
| `data-component` | 모든 컴포넌트 | `data-component="button-primary"` |
| `data-ref` | 모든 섹션 | `data-ref="R2"` |
| `data-role-only` | 역할 제한 요소 | `data-role-only="seller"` |
| `data-field` | PRD 데이터가 표시되는 요소 | `data-field="Asset.visibility"` |

## 게이트

| 게이트 | 위치 | 통과 조건 | 실패 시 |
|---|---|---|---|
| G-ref | S1 후 | ref ≥ 5 · 서로 다른 앱 ≥ 5 · 모든 ref에 uibowl URL · 모든 패턴에 출처 ref ID | S1 |
| G-spec | S2 후 | spec 필드 ⊂ prd.md §8 데이터 모델 (지어낸 필드 0) · 상태 라벨 ⊂ `status_enum` | S2 |
| G-token | S4 | 허용 목록 밖 색·모서리·폰트 크기·굵기·간격 0 · letter-spacing 0 · 대문자 변환 0 · 그림자 0 (예외 `segmented-control-active`) · `#0066ff` 화면당 ≤ 2, `button-primary`에 0 · 마킹 누락 0 | S3 |
| ★ G-N1 | S4 | `판매 신청` 옵션은 모두 `data-role-only="seller"` 보유. 역할 표시 없이 노출 1건이라도 있으면 실패 | S3 |
| ★ G-N2 | S4 | 새 자산 등록의 공개 범위 기본 선택(`checked`/`selected`)이 `비공개`가 아니면 실패 | S3 |
| G1 따라하기 | S4 | 섹션 중 같은 `data-ref` 비율 ≤ 40% · 사용한 ref ≥ 3 | S1 |
| G-field | S4 | spec의 `data-field`가 화면에 모두 존재 (누락 0) | S2 |

★ = story-service.md의 "어기면 안 되는 것"(N1·N2) 위반 시 걸리는 조건

## 사람 승인 (1곳)

- 위치: S5 (컨셉 모드만)
- 방식: 키스크린 3개를 브라우저 패널에 띄우고 reports 요약을 보여준 뒤, 사람이 채팅에 "승인" → 오케스트레이터가 `system/APPROVED` 생성
- 거절 시: "거절 + 코멘트" → S2 복귀 (코멘트에 `[ref]` 태그 있으면 S1)

## 공통

- 게이트당 자동 재시도 최대 3회 → 초과 시 중단, `state/<id>.json`의 `last_fail`과 함께 사람에게 리포트

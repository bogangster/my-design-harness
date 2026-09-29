# 목적 (purpose)

> 기준: docs/prd.md, docs/design.md, docs/story-service.md, docs/story-work.md

## 결과물 형태

- HTML/CSS, 390×844 모바일 기준 (Figma 이관은 이후 단계)

## 모드 2개

| 모드 | 매번 달라지는 것 (입력) | 1회 실행 범위 | story-work 대응 |
|---|---|---|---|
| 컨셉 | 키스크린 화면 ID 3개 | 레퍼런스 수집 → 분석 → 화면 설계 → 키스크린 3개 → 사람 확정 | 1~5번 |
| 확장 | 화면 ID 1개 | 확정된 토큰·컴포넌트로 화면 1장 → 가이드 검토 | 6~7번 |

화면 ID (PRD §16 핵심 화면 10개):

| 화면 ID | 화면 |
|---|---|
| home | 홈 |
| free-library | 무료 학습자료 |
| member-library | 유료 멤버 자료실 |
| skill-library | 스킬 라이브러리 |
| mission-detail | 미션 상세 |
| submit | 제출 화면 |
| my-learning | 내 학습 |
| my-assets | 내 자산 |
| asset-detail | 자산 상세 (내 자산 상세 · 운영자 검수 상세용) |
| admin-review | 운영자 검수 화면 |

## 사용자

- 나 자신(디자이너). 결과물은 PRD §16 제출물로 사용한다.

## 완료 기준 (한 문장)

- **컨셉 모드**: 키스크린 3개의 HTML이 존재하고, 디자인 토큰 위반 0건, N1·N2 위반 0건, 레퍼런스 따라하기 게이트(G1) 통과, 사람이 1회 확정했다.
- **확장 모드**: `screens/<화면ID>.html` 1개가 존재하고, 확정된 토큰·컴포넌트 외 값 사용 0건, 디자인 토큰 위반 0건, N1·N2 위반 0건, 해당 화면이 쓰는 PRD 데이터 필드 누락 0건이다.

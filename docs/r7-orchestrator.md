# R7 오케스트레이터 (orchestrator)

> 기준: docs/r3-pipeline.md ~ docs/r6-roles.md

## 구조

```
사용자 트리거
  │
오케스트레이터 (CLAUDE.md) ── state/<id>.json 읽기/쓰기
  │
  ├─ S1 researcher ─────→ refs/     ─◆ G-ref
  ├─ S2 planner ────────→ specs/    ─◆ G-spec
  ├─ S3 system-builder ─→ system/   (컨셉 모드 1회)
  │     screen-builder ─→ screens/
  ├─ S4 judge (scripts/judge.js) → reports/ ─◆ G-token · ★G-N1 · ★G-N2 · G1 · G-field
  └─ S5 사람 "승인" ────→ system/APPROVED (컨셉 모드만)

실패 → r3-pipeline.md 복귀 표 / 게이트당 3회 초과 → 중단 + 리포트
```

## CLAUDE.md 범위

- 100줄 이하. 트리거·단계 순서·복귀 표·금지 사항만.
- 세부는 docs/r*.md 링크.

## 에이전트 구현

- `.claude/agents/researcher.md`, `planner.md`, `system-builder.md`, `screen-builder.md`
- 각 파일에 사용 도구 제한 + 편집 폴더 1개 명시
- judge는 에이전트가 아니라 `scripts/judge.js`

## 오케스트레이터 금지 사항

- `refs/`, `specs/`, `system/`(APPROVED 제외), `screens/` 직접 수정 금지
- 게이트 실패 시 직접 고치지 않고 해당 단계 에이전트를 다시 호출

## 진행 보고

- 단계 끝날 때마다 한 줄: 예) `S2 ✅ specs/home.md (G-spec pass)`
- 실패 시 위반 목록 상위 5개
- S5에서 키스크린 3개를 브라우저 패널에 띄움

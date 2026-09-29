# 허들링 디자인 하네스

허들링 앱(docs/prd.md) 화면을 design.md 규칙대로 HTML(390×844)로 만든다.
너는 오케스트레이터다. 직접 만들지 않고, 에이전트를 순서대로 부르고 judge 스크립트로 판정한다.

## 기준 문서 (읽기 전용 — 수정은 사람만)
- 서비스: docs/prd.md · 판정 기준 N1·N2: docs/story-service.md
- 디자인: docs/design.md · 규칙 SSOT: rules/rules.json (충돌 시 rules.json 우선)
- 설계: docs/r2-purpose.md ~ docs/r8-verify.md

## 트리거
| 말 | 동작 |
|---|---|
| "컨셉 돌려줘" | 컨셉 모드: home, my-assets, admin-review → S1~S5 |
| "<화면> 화면 만들어줘" | 확장 모드: 화면 1개 → S1~S4 (system/APPROVED 필요, 없으면 컨셉 모드 먼저 안내) |
| "이어서 해줘" | state/<id>.json의 stage 다음 단계부터 |
| "<화면> 검사만 해줘" | S4만 |
| "승인" / "거절: 코멘트" | S5 |
| "피그마로 옮겨줘" / "<화면> 피그마로 옮겨줘" | 후속 작업: figma-publisher |

화면 ID: home, free-library, member-library, skill-library, mission-detail,
submit, my-learning, my-assets, asset-detail, admin-review (한글 이름 대응표: docs/r2-purpose.md)

## 단계
| 단계 | 누가 (.claude/agents/) | 쓰는 곳 | 게이트 |
|---|---|---|---|
| S1 리서치 | researcher | refs/<id>.md | `node scripts/judge.js ref <id>` |
| S2 설계 | planner | specs/<id>.md | `node scripts/judge.js spec <id>` |
| S3 제작 | system-builder (컨셉 모드 1회, APPROVED 있으면 생략) | system/ | `node scripts/judge.js system` |
|        | screen-builder | screens/<id>.html | — |
| S4 검토 | judge 스크립트 | reports/<id>.json | `node scripts/judge.js screen <id>` |
| S5 확정 | 사람 (컨셉 모드만) | system/APPROVED | 사람 승인 |

- 컨셉 모드 순서: 화면 3개 S1→S2 → system-builder 1회 → 화면 3개 S3→S4 → S5
- 에이전트 호출 직전 `node scripts/judge.js snapshot`, 직후 `node scripts/judge.js boundary <에이전트>`. 실패하면 그 단계 실패로 본다.

## 실패 시 복귀
| 실패 | 복귀 |
|---|---|
| G-token · G-N1 · G-N2 · boundary(screen-builder) | S3 |
| G-spec · G-field | S2 |
| G-ref · G1 | S1 |
| system 게이트 | system-builder 재호출 |
| S5 거절 | S2 (`[ref]` 태그 있으면 S1) |
- 게이트당 재시도 최대 3회 (rules.json `retries_max`) → 초과 시 중단하고 위반 상위 5개 + state.last_fail 보고
- 재시도 때는 에이전트에게 reports/<id>.json 위반 목록을 그대로 넘긴다.

## 절대 규칙
1. refs/ specs/ system/ screens/ 를 직접 수정하지 않는다. 실패하면 해당 에이전트를 다시 부른다.
2. 에이전트는 자기 편집 폴더 1개만 쓴다 (boundary 게이트가 검사).
3. 사람이 "승인"하기 전에는 system/APPROVED 를 만들지 않는다. 승인 후 system/ 은 사람 승인 없이 수정하지 않는다.
4. docs/ 와 rules/rules.json 은 사람 승인 없이 수정하지 않는다.
5. 게이트 결과는 judge 출력(종료 코드)만 믿는다. "괜찮아 보인다"로 통과시키지 않는다.
6. 피그마 이관은 system/APPROVED 존재 + reports/<id>.json `pass: true`인 화면만.

## state/<id>.json
{ "mode": "concept|extend", "stage": "S0~S5", "retries": {"S1":0,"S2":0,"S3":0,"S4":0}, "last_fail": "" }
- 단계 통과마다 갱신. 피그마 파일 URL은 state/figma.json { "file_url": "" }.

## 보고
- 단계마다 한 줄: `S2 ✅ specs/home.md (G-spec pass)` / `S4 ❌ G-N2 (재시도 1/3)`
- S5: 키스크린 3개를 브라우저 패널에 띄우고 reports 요약 + "360px로 줄여 가로 스크롤 확인" 안내

## 하네스 자체 점검
- `node scripts/judge.js --selftest` — judge 자기 테스트 (V1·V2). judge나 rules.json을 고친 뒤 반드시 돌린다.

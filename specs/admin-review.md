# spec: admin-review

## 목적
- 유저스토리 #5 — 운영자(복수)가 판매 신청 자산을 판매 기준 체크리스트로 보고 승인·수정 요청·반려를 결정한다 (PRD §3-6, §6-7, §7-5)
- 모바일 390×844 단일 컬럼. refs P2의 좌우 2단(미리보기 | 검수 패널)은 위→아래 세로 스택으로 바꾼다: 검수 대기 목록 → (행 탭) 자산 상세 → 검수 진행 상태 → 체크리스트 → 가격 → 코멘트 → 하단 고정 액션 바
- MVP 1차 최종 상태는 `승인됨`. 허들링 픽 선정·판매 중지 처리(Phase 2)는 이 화면에 없다

## 역할
- admin (운영자, 복수 운영진). 다른 역할(guest / free / paid / seller)은 이 화면에 진입할 수 없다

## 섹션
- S1 | own | page-header | 상단 헤더. 제목 "운영자 검수", 우측에 검수 대기 건수 카운트. 운영자 전용 화면임을 표시 (data-role-only="admin")
- S2 | R6 | status-filter | 검수 상태 필터 칩 가로 스크롤: 검수 대기(기본 선택) · 수정 요청 · 승인됨 · 반려. 신청 건을 상태별로 나눠 보는 신청 내역 흐름 참고. 필터 값은 Asset.review_status (pending / revision_requested / approved / rejected)
- S3 | R1 | review-queue-list | 검수 대기 목록. P1의 PC 테이블을 모바일 카드 리스트로 변환: 각 행 첫머리에 상태 배지(Asset.review_status), 자산명(Asset.title), 제출자(User.name, Asset.owner_id로 연결), 제출일(Asset.updated_at), 희망가(Asset.price), 카테고리(Asset.category). 행 탭 시 같은 화면 아래 상세 영역(S4~S10)으로 전환. 비어 있으면 "검수 대기 중인 판매 신청이 없어요" 빈 상태
- S4 | R2 | asset-preview | 자산 상세 상단: 뒤로 가기 + 미리보기(Asset.preview), 자산명(Asset.title), 설명(Asset.description), 카테고리(Asset.category), 태그(Asset.tags), 첨부 파일 목록(Asset.files). 공개 범위 "판매 신청" 라벨(Asset.visibility = sale_requested) — 판매 신청 텍스트가 나오는 모든 요소는 data-role-only="admin" (N1)
- S5 | R2 | asset-detail-table | 검수 판단용 상세 정보 표(라벨-값 2열 행을 세로로 나열): 사용 방법(Asset.usage_guide), 결과 예시(Asset.example_output), 필요 툴/버전/환경 조건(Asset.requirements), 제출자(User.name), 제출일(Asset.updated_at). P2의 우측 메타 정보 표를 본문 아래로 옮긴 형태
- S6 | R4 | review-timeline | 세로 타임라인: 제출 → 검수 대기 → 승인됨 / 수정 요청 / 반려. 현재 단계(Asset.review_status)를 굵게 + 상태 배지로 강조. 마지막 단계는 `승인됨`에서 끝난다(판매 중 단계 없음)
- S7 | R3 | sale-criteria-checklist | 카드: 제목 "판매 기준 체크리스트 (필수)" + 설명 "8개 항목을 모두 확인해야 승인할 수 있어요" 아래 체크박스 8개 세로 나열 (PRD §6-7 판매 가능한 자료 기준 그대로): ① 실제 업무에 써본 것 ② 결과 예시가 있는 것 ③ 사용 방법이 명확한 것 ④ 초보자가 따라할 수 있는 것 ⑤ 특정 툴/버전/환경 조건이 적혀 있는 것 ⑥ 개인정보/고객정보/회사기밀이 없는 것 ⑦ 저작권 문제가 없는 것 ⑧ 구매자가 바로 써볼 수 있는 것. 카드 상단 우측에 "n/8" 진행 표시. 8개 모두 체크 전에는 S10의 승인 버튼 비활성. 체크 상태는 검수 도구 UI 상태이며 §8 필드가 아니므로 data-field 없음
- S8 | R7 | price-setting | 가격 설정/승인: 라벨 "판매 가격 *"(필수 표시) 위, 아래 숫자 입력 필드(Asset.price). 제출자 희망가를 기본값으로 채우고 "제출자 희망가 그대로 승인" 안내 문구. 운영자가 값을 바꾸면 승인 시 그 값으로 확정. 비어 있으면 승인 버튼 비활성
- S9 | R5 | revision-comment | 수정 요청 코멘트: S10에서 "수정 요청"을 누르면 펼쳐지는 여러 줄 입력창(textarea) + 글자 수 카운터 + 예시 가이드("예: 결과 예시 화면을 1장 이상 추가해 주세요"). 체크리스트에서 미체크된 항목을 코멘트 초안 칩으로 제안. 판매 검수 절차의 코멘트이며 미션 피드백과 별개. §8에 코멘트 필드가 없으므로 data-field를 달지 않는다. 코멘트가 비어 있으면 "수정 요청 보내기" 비활성
- S10 | R1 | decision-actions | 하단 고정 액션 바(가로 3버튼): 승인 · 수정 요청 · 반려. 승인 = Asset.review_status → approved(승인됨), 가격(Asset.price) 확정. 수정 요청 = revision_requested(수정 요청), S9 코멘트 필수. 반려 = rejected(반려), 확인 바텀시트 후 처리. 처리 후 목록(S3)으로 돌아가고 다음 검수 대기 건을 연다

## 필드
- Asset.title
- Asset.owner_id
- Asset.review_status
- Asset.visibility
- Asset.price
- Asset.preview
- Asset.description
- Asset.category
- Asset.tags
- Asset.files
- Asset.usage_guide
- Asset.example_output
- Asset.requirements
- Asset.updated_at
- User.name

## 상태
- 검수 대기
- 수정 요청
- 승인됨
- 반려

## 역할별 차이
- admin: 화면 전체 접근. 판매 신청 자산의 상세·체크리스트·가격·판정 버튼 모두 노출
- admin 외(guest / free / paid / seller): 진입 불가. '판매 신청' 텍스트·sale_requested 값을 표시하는 모든 요소는 data-role-only="admin" (N1 — 검수 화면에서는 admin만)
- 임시저장 상태 자산은 제출 전이므로 검수 목록에 나오지 않는다
- 제외: 허들링 픽 선정, 판매 중지 처리(Phase 2), 수수료·수익(Phase 3), AI 1차 검수

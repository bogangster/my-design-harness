# spec: my-assets

## 목적
- 유저스토리 #4: 판매 승인 회원이 내 자산 중 일부를 판매 신청하고 검수 상태를 확인한다 (PRD §6-5, §7-4)
- 유저스토리 #3 연계: 유료 멤버가 프롬프트·스킬 파일·자동화 템플릿·사용 사례를 내 자산으로 저장한다 (PRD §6-5, §7-3)
- 화면 구성: 모바일 390×844 단일 컬럼. 상단은 내 자산 목록, 우하단 버튼으로 새 자산 등록 폼(같은 화면 하단 섹션)으로 이어진다

## 역할
- 이 화면을 보는 역할: paid / seller
- guest / free 는 접근 불가 (PRD §7-3 "내 자산 등록"은 유료 회원부터)

## 섹션
- S1 | R2 | page-header | 큰 페이지 제목 "내 자산" (P3)
- S2 | R2 | tab-bar | 자산 유형 탭: 전체·프롬프트·스킬 파일·자동화 템플릿·사용 사례 (Asset.category 기준, P3)
- S3 | R1 | filter-chip | 가로 스크롤 상태 필터 칩: 전체·임시저장·검수 대기·수정 요청·승인됨·반려 (Asset.review_status 기준, P1). paid는 전체·임시저장만 노출
- S4 | R3 | list-count | 목록 머리 "총 n개" 카운트 (P4)
- S5 | R1 | asset-card | 자산 카드 목록. 맨 위 줄 상태 배지(Asset.review_status) + 공개 범위 라벨(Asset.visibility), 그 아래 제목(Asset.title)·유형(Asset.category)·수정일(Asset.updated_at), 카드 하단 상태별 액션 버튼 한 줄(임시저장→이어쓰기, 수정 요청→수정하기) (P2)
- S6 | R3 | empty-state | 필터 결과가 없을 때 섹션 안 빈 상태 안내 카드 + 새 자산 등록 유도 (P4)
- S7 | own | sale-status-summary | seller 전용 판매 신청 상태 영역: 검수 대기·수정 요청·승인됨·반려 건수 요약 한 줄. paid에게는 렌더하지 않음
- S8 | R6 | fab | 우하단 "+ 새 자산" 플로팅 버튼 → 새 자산 등록 폼 진입 (P7)
- S9 | R4 | visibility-radio | 새 자산 등록 폼 최상단 공개 범위 라디오 그룹(Asset.visibility). 기본 선택 '비공개'. 선택지: 비공개·멤버 공개 (+ seller만 판매 신청) (P5)
- S10 | R4 | info-banner | 선택한 공개 범위를 설명하는 안내 배너 (비공개: 나만 볼 수 있음 / 멤버 공개: 유료 멤버에게 공개 / 판매 신청(seller만): 운영자 검수 후 승인) (P5)
- S11 | R5 | text-field | 제목(Asset.title, 글자수 카운터)·설명(Asset.description, 글자수 카운터)·유형 드롭다운(Asset.category)·태그(Asset.tags) 입력 (P6)
- S12 | own | file-upload | 파일 첨부 영역(Asset.files): 프롬프트·스킬 파일·템플릿 파일 첨부, 첨부 목록 표시
- S13 | R5 | bottom-action-bar | 하단 고정 전폭 제출 버튼 "저장"(visibility가 판매 신청이면 "검수 요청") + 보조 버튼 "임시저장" 병치 (P6)

## 필드
- Asset.title
- Asset.category
- Asset.description
- Asset.tags
- Asset.files
- Asset.visibility
- Asset.review_status
- Asset.updated_at
- User.role

## 상태
- 임시저장
- 검수 대기
- 수정 요청
- 승인됨
- 반려

## 역할별 차이
- 공통(paid·seller): 내 자산 목록(S1–S6), 새 자산 등록 버튼(S8), 등록 폼(S9–S13) 노출. 공개 범위 기본값은 '비공개'(Asset.visibility=private)로 미리 선택된 상태에서 시작한다 (N2). 멤버 공개는 본인이 직접 선택할 때만 적용된다
- paid: 공개 범위 라디오에 '비공개'·'멤버 공개' 두 개만 노출. '판매 신청' 옵션은 비활성 표시도 하지 않고 아예 렌더하지 않는다 (N1). 판매 신청 상태 영역(S7) 없음. 상태 필터 칩은 전체·임시저장만, 카드 상태 배지는 임시저장만 표시(검수 관련 상태는 판매 신청 자산에만 생김)
- seller: 공개 범위 라디오에 '판매 신청'(Asset.visibility=sale_requested) 옵션 추가 노출 (N1). 기본 선택은 여전히 '비공개' (N2). 판매 신청 상태 영역(S7) 노출, 상태 필터 칩 전체(임시저장·검수 대기·수정 요청·승인됨·반려) 노출, 카드에 검수 상태 배지 표시. 판매 신청 선택 시 안내 배너에 "운영자 검수를 통과해야 승인됨" 문구, 제출 버튼 라벨 "검수 요청"
- 제외(§9): 판매 중·판매 중지·구매·수익·정산·허들링 픽·가격(price)·수수료(commission_rate) 관련 UI와 문구는 넣지 않는다. 최종 상태는 '승인됨'

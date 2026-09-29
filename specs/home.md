# spec: home

## 목적
- #1 무료 학습자(비회원·무료 회원)가 무료 학습자료와 유료 콘텐츠 미리보기를 홈에서 바로 둘러본다
- #2 유료 멤버가 멤버 자료실·스킬 카드로 가는 입구를 홈 한 화면에서 찾는다
- #3 유료 멤버가 이번 달 미션과 제출 상태를 확인하고 제출로 이어간다
- #4 판매 승인 회원이 내 자산의 검수 상태를 홈 요약에서 확인한다
- 화면: PRD §16 "홈" · 모바일 390×844 단일 컬럼, 세로 카드 스택 + 하단 탭바 고정 (P7)

## 역할
- guest / free / paid / seller / admin (한 화면, 역할에 따라 섹션 노출·잠금이 달라짐)

## 섹션
- S1 | R1 | greeting-header | 상단 인사 헤드라인 2줄(P1). 로그인 역할은 User.name + 이번 달 학습 문구, guest는 "허들링에서 AI 실무를 시작해요" 일반 문구. 우측에 User.membership_status 배지(무료/유료)
- S2 | R1 | progress-summary-card | "내 학습" 진행 요약 카드(P1): 이번 달 Mission.title, 내 Submission.status(작성 중/제출 완료) 칩, 진행률 바, "이어서 하기 >" 다음 행동 링크. 진행 중 미션이 없으면 ex-empty-state-card 점선 카드로 대체(P3)
- S3 | R3 | entry-grid | 5개 입구 아이콘+라벨 그리드 한 카드(P2): 무료 학습자료 · 유료 멤버 자료실 · 스킬 라이브러리 · 내 학습 · 내 자산. 권한 없는 입구는 잠금 아이콘 오버레이(badge-overlay). admin에게만 6번째 입구 "운영자 검수" 추가
- S4 | R2 | mission-today-card | "이번 달 미션" 큰 카드 1장(P5): Mission.month, Mission.title, Mission.required_outputs 요약, Mission.due_date(마감 D-n), Mission.access_level 표시. 카드 하단 풀폭 주 CTA 1개 "제출하러 가기"(button-primary) — 제출 대상은 Submission, 상태는 작성 중/제출 완료만
- S5 | R4 | free-content-rail | 섹션 헤더 "무료 학습자료" + "전체보기 >"(P3), 신규 Content 가로 스크롤 카드(P4): Content.category 칩(AI 실무·Figma + AI·바이브코딩·자동화·콘텐츠 제작·1인 사업가 운영), Content.title, Content.published_at, Content.access_level 무료/유료 표시 배지
- S6 | R5 | member-content-card | "유료 멤버 자료실" 오늘의 자료 카드 1장: Content.title, Content.summary(미리보기 2줄), Content.updated_at(업데이트 날짜). 하단 2버튼 반반(P6): 보조 "자료 보기"(button-outline) / 주 "미션 시작"(button-primary). guest/free에게는 잠금 상태로 요약만 미리보기
- S7 | R4 | skill-card-rail | 섹션 헤더 "스킬 라이브러리" + "전체보기 >"(P3), SkillCard 가로 스크롤: SkillCard.title, SkillCard.category, SkillCard.difficulty 난이도 표시, SkillCard.tools, SkillCard.access_level(무료/유료/코호트) 표시. 권한 밖 카드는 잠금 아이콘
- S8 | R2 | my-assets-summary | "내 자산" 요약 리스트 최근 3개: Asset.title, Asset.category, Asset.updated_at. seller에게만 Asset.review_status 상태 칩(임시저장/검수 대기/수정 요청/승인됨/반려). 자산이 없으면 점선 빈 상태 카드 + "제출 완료된 미션을 자산으로 옮겨보세요" 안내(P3)
- S9 | own | upgrade-cta-card | 가입/유료 전환 CTA 카드. guest에게는 "무료로 가입하기", free에게는 "유료 멤버십으로 전환하기" 주 CTA(button-primary). paid/seller/admin에게는 섹션 자체를 렌더하지 않음
- S10 | R3 | notice-list | 화면 하단 "새 소식" 텍스트 리스트, 구분선(P8): 운영자가 올린 Content(Content.source = admin)의 Content.title + Content.published_at 최근 3개
- S11 | R2 | bottom-tab-bar | 하단 고정 탭바(P7): 홈 · 자료실 · 내 학습 · 내 자산. guest는 내 학습·내 자산 탭을 누르면 가입 유도

## 필드
- User.name
- User.role
- User.membership_status
- Mission.title
- Mission.month
- Mission.required_outputs
- Mission.due_date
- Mission.access_level
- Submission.status
- Content.title
- Content.summary
- Content.category
- Content.access_level
- Content.source
- Content.published_at
- Content.updated_at
- SkillCard.title
- SkillCard.category
- SkillCard.difficulty
- SkillCard.tools
- SkillCard.access_level
- Asset.title
- Asset.category
- Asset.review_status
- Asset.updated_at

## 상태
- 작성 중
- 제출 완료
- 임시저장
- 검수 대기
- 수정 요청
- 승인됨
- 반려

## 역할별 차이
- guest: S1 일반 인사 문구(이름 없음), S2 대신 "가입하고 내 학습을 시작해요" 빈 상태 카드. S3에서 유료 멤버 자료실·내 학습·내 자산 입구에 잠금 표시. S4 미션 카드는 Mission.title·Mission.due_date만 보이고 CTA는 "가입하고 참여하기". S5 무료 자료 열람 가능(공개 콘텐츠 일부), Content.access_level이 paid/cohort인 카드는 잠금 배지 + 제목만. S6 잠금 + Content.summary 미리보기만, 2버튼 대신 "가입하기" 1버튼. S7 SkillCard.access_level 무료 카드만 열림, 나머지 잠금. S8 비노출. S9 "무료로 가입하기" CTA 노출.
- free: S2는 무료 미션(Mission.access_level=free) 기준 진행 요약. S3 유료 멤버 자료실 입구 잠금, 내 자산 입구 잠금. S4 유료 미션이면 잠금 + "유료 전환하고 제출하기" CTA. S5 전체 열람, 유료 항목은 잠금 배지 + 미리보기. S6 잠금 + 미리보기(유료 자료 미리보기 §7-2), 버튼은 "유료로 전환하기" 1개. S7 샘플(무료) 카드만 열림. S8 비노출. S9 "유료 멤버십으로 전환하기" CTA 노출.
- paid: 모든 입구·자료 잠금 해제. S4 "제출하러 가기" 활성. S8 내 자산 요약에 Asset.title·Asset.category·Asset.updated_at만 표시, 상태 칩 없음, '판매 신청' 문구·옵션 없음. S9 비노출.
- seller: paid와 동일 + S8에 Asset.review_status 상태 칩(임시저장/검수 대기/수정 요청/승인됨/반려) 노출. '판매 신청' 관련 문구는 seller에게만 보인다(N1). 판매 중·수익·정산 표시는 없음.
- admin: paid와 동일한 학습 섹션 + S3 입구 그리드에 "운영자 검수" 입구 추가(검수 대기 목록으로 이동). S9 비노출. 허들링 픽·구매·정산 입구는 어떤 역할에도 없음(§9 제외).

# refs: my-assets

## 레퍼런스
- R1 | 네이버플러스 스토어 | https://uibowl.io/name/%EB%84%A4%EC%9D%B4%EB%B2%84%ED%94%8C%EB%9F%AC%EC%8A%A4%20%EC%8A%A4%ED%86%A0%EC%96%B4?patterns=%EB%82%B4%EC%97%AD&imgId=cmrjwxcrk007ujm04c99crasx | 상태 필터 칩 + 상태 라벨이 맨 위에 오는 카드 목록 + 카드 하단 액션 버튼 줄
- R2 | 쏘카 | https://uibowl.io/name/%EC%8F%98%EC%B9%B4?patterns=%EB%82%B4%EC%97%AD&imgId=cmogjjehl00ggkz04605kdctt | 큰 페이지 제목 + 유형 탭 + 상태 배지 달린 단일 카드 구조
- R3 | 런드리고 | https://uibowl.io/name/%EB%9F%B0%EB%93%9C%EB%A6%AC%EA%B3%A0?patterns=%EB%82%B4%EC%97%AD&imgId=cmq4uz9mb000cif04c3q68f3x | 섹션 제목 + "총 n건" 카운트 + 상태 배지 리스트, 빈 섹션 안내 카드
- R4 | 아이쿠카 | https://uibowl.io/name/%EC%95%84%EC%9D%B4%EC%BF%A0%EC%B9%B4?patterns=%EA%B8%80%EC%93%B0%EA%B8%B0&patternName=%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0%20%EA%B8%80%EC%93%B0%EA%B8%B0 | 등록 폼 상단의 공개 설정 라디오 그룹과 공개 범위 안내 배너
- R5 | 아하 | https://uibowl.io/name/%EC%95%84%ED%95%98?patterns=%EA%B8%80%EC%93%B0%EA%B8%B0&patternName=%EC%A7%88%EB%AC%B8%ED%95%98%EA%B8%B0 | 제목/내용 필드 글자수 카운터, 분류 드롭다운, 하단 고정 제출 버튼 폼
- R6 | 후루츠패밀리 | https://uibowl.io/name/%ED%9B%84%EB%A3%A8%EC%B8%A0%ED%8C%A8%EB%B0%80%EB%A6%AC?patterns=%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80 | 마이 영역 안 "내 상품 관리" 진입 버튼과 우하단 등록 플로팅 버튼

## 패턴
- P1 | R1 | 목록 상단에 가로 스크롤 상태 필터 칩(전체·임시저장·검수 대기·수정 요청·승인됨·반려)
- P2 | R1, R2 | 자산 카드 맨 위 줄에 상태 배지, 그 아래 제목·유형·수정일, 카드 하단에 상태별 액션 버튼(이어쓰기/수정하기) 한 줄
- P3 | R2 | 큰 페이지 제목 "내 자산" 아래 자산 유형 탭(프롬프트·스킬 파일·템플릿·사용 사례)
- P4 | R3 | 목록 머리에 "총 n개" 카운트, 결과 없을 때 섹션 안 빈 상태 안내 카드
- P5 | R4 | 새 자산 등록 폼 최상단에 공개 범위 라디오 그룹(비공개·멤버 공개·판매 신청)과 선택 결과를 설명하는 안내 배너
- P6 | R5 | 제목·설명 필드에 글자수 카운터, 파일 첨부 영역, 하단 고정 전폭 제출 버튼(임시저장 보조 버튼 병치)
- P7 | R6 | 목록 화면 우하단 "+ 새 자산" 플로팅 버튼으로 등록 폼 진입

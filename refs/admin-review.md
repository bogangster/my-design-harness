# refs: admin-review

## 레퍼런스
- R1 | 페이히어 포스기 | https://uibowl.io/website/%ED%8E%98%EC%9D%B4%ED%9E%88%EC%96%B4%20%ED%8F%AC%EC%8A%A4%EA%B8%B0?patterns=%ED%86%B5%EA%B3%84%C2%B7%EB%A6%AC%ED%8F%AC%ED%8A%B8&imgId=cmndzqmm600m6l50488is6gk5 | PC 관리 테이블 첫 열 상태 배지 + 행 단위 목록 구조 (검수 대기 목록용)
- R2 | 뿌리오 | https://uibowl.io/website/%EB%BF%8C%EB%A6%AC%EC%98%A4?patterns=%EB%82%B4%EC%97%AD&imgId=cmu1vvvsk0015jv04awfg9c12 | 좌측 콘텐츠 미리보기 + 우측 상세 정보 테이블 2단 상세 레이아웃 (자산 상세 + 검수 패널용)
- R3 | AI 픽 | https://uibowl.io/name/AI%20%ED%94%BD?patterns=%EC%84%A4%EC%A0%95&patternName=%EA%B4%80%EC%8B%AC%EC%82%AC%EC%84%A4%EC%A0%95 | 카드 안 제목·설명 아래 체크박스 항목 묶음 + 하단 저장 버튼 (판매 기준 체크리스트 8항목용)
- R4 | 헤이딜러 | https://uibowl.io/name/%ED%97%A4%EC%9D%B4%EB%94%9C%EB%9F%AC?patterns=%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD&patternName=%EA%B0%90%EA%B0%80%EC%8B%AC%EC%82%AC%EC%84%BC%ED%84%B0 | 세로 타임라인으로 심사 단계와 현재 단계 강조 (검수 진행 상태 표시용)
- R5 | 패스오더 | https://uibowl.io/name/%ED%8C%A8%EC%8A%A4%EC%98%A4%EB%8D%94?patterns=%EB%AC%B8%EC%9D%98%ED%95%98%EA%B8%B0&imgId=cmspgir4w0007lg04coybllnv | 여러 줄 입력창 + 글자 수 카운터 + 예시 안내 + 하단 전송 버튼 (수정 요청 코멘트용)
- R6 | 페이히어 | https://uibowl.io/name/%ED%8E%98%EC%9D%B4%ED%9E%88%EC%96%B4?patterns=%EB%82%B4%EC%97%AD&patternName=%EA%B0%80%EB%A7%B9%EC%A0%90%20%EC%8B%A0%EC%B2%AD%20%EB%82%B4%EC%97%AD | 신청 건을 상태별로 보여주는 신청 내역 흐름 (신청 상태 전이 참고)
- R7 | Kia | https://uibowl.io/name/Kia?patterns=%EB%AC%B8%EC%9D%98%ED%95%98%EA%B8%B0&imgId=cmpur13m90011jo04zwnhc418 | 라벨 위 입력 필드 + 필수 표시(*) 폼 구조 (가격 설정 입력용)

## 패턴
- P1 | R1 | 검수 대기 목록은 상태 배지 열 + 자산명·제출자·제출일·희망가 열의 테이블, 행 클릭 시 상세로 진입
- P2 | R2 | 상세는 좌측 자산 미리보기/본문, 우측 고정 검수 패널(메타 정보 표 + 판정 영역) 2단 분할
- P3 | R3 | 우측 패널 안에 '판매 기준 체크리스트' 카드: 제목·설명 후 체크박스 8항목 세로 나열, 전부 체크 전 승인 버튼 비활성
- P4 | R4, R6 | 패널 상단에 제출→검수중→승인/수정요청/반려 단계 타임라인과 현재 상태 배지
- P5 | R5 | 수정 요청 선택 시 여러 줄 코멘트 입력창 + 글자 수 카운터 + 예시 가이드 노출
- P6 | R7 | 가격 설정은 라벨 위 필수(*) 숫자 입력 필드, 제출자 희망가를 기본값으로 보여 주고 승인 시 확정
- P7 | R1, R2 | 패널 하단에 승인·수정 요청·반려 3개 액션 버튼을 가로 정렬해 고정

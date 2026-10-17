# SPEC — 한난 문자 진위 대조 (kdhc-msg-check)

## 목적
한국지역난방공사(한난) 이름의 문자를 받은 고객이, 문자 속 전화번호·인터넷 주소를 「공사 홈페이지에 공개된 값 목록」과 브라우저 안에서 대조한다. 공모 제안(「공식 발신 목록 1쪽」)이 시행되면 고객이 얻게 될 화면의 시제품이며, 한국지역난방공사의 공식 서비스가 아니다. 저장·전송 0.

## 용어 (코드 이름과 같음)
- 공식 목록(OfficialList): 공사 홈페이지에 공개된 전화번호(phones)와 호스트(hosts) 각각에 출처 URL을 붙인 표.
- 발견값(Finding): 문자에서 뽑은 전화번호 또는 인터넷 주소 1개와 판정(listed / unlisted).
- 판정(Verdict): `match`(발견값 ≥1, 전부 목록 일치) / `unlisted`(목록에 없는 발견값 ≥1) / `empty`(발견값 0).

## 성공 조건 (숫자)
- 테스트 ≥ 8개 통과(node --test), 네트워크 0.
- 목록 값은 공사 홈페이지에서 curl로 확인한 것만: 전화 1(1688-2488), 호스트 3(www·rps·econtract.kdhc.co.kr).
- 공개 URL이 비로그인 창에서 HTTP 200, 입력칸 id=`msg`, 결과칸 id=`verdict`.

## Given / When / Then
1. Given 문자에 `1688-2488`만 있다 / When 판정 / Then match.
2. Given 문자에 `https://www.kdhc.co.kr/...` / Then match(링크가 있으면 「공사 표준은 링크 없는 문자」 경고 동반).
3. Given `https://kdhc.co.kr.pay-check.com/x` 또는 `https://www.kdhc.co.kr@evil.com` / Then unlisted(호스트 완전 일치만).
4. Given `bit.ly/abc`, `kdhc-co.kr` / Then unlisted.
5. Given `010-1234-5678` / Then unlisted(전화는 숫자만 비교, 하이픈·공백 무시).
6. Given 목록에 있는 값 + 없는 값 혼재 / Then unlisted.
7. Given 값 없음 / Then empty.
8. Given 호스트 대소문자·끝 구두점(`WWW.KDHC.CO.KR.`) / Then 정규화 후 match.

## 비목표
스미싱 악성 여부 판정, 번호 변작 탐지, 저장·서버·로그인, 공사 발송 시스템 연동. 목록 일치는 안전 보증이 아니다(번호는 변작될 수 있음) — 화면이 그렇게 말한다.

## 구조
domain/check.js(순수 함수, I/O 없음) ← official-list.js(데이터) ← index.html(어댑터: DOM만).

## UI 수용기준 (notes/원칙-디자인 체크리스트 10 적용)
1. 모바일 퍼스트: viewport 메타, 390px 가로 스크롤 0, 1280px 정상.
2. 한 화면 한 질문: 입력 1개(문자 내용), 주 버튼 1개(대조하기, 높이 52px).
3. 타이포: 본문 16px, 제목 24px, 줄간격 1.6, 굵기 ≥400, 시스템 글꼴 1종.
4. 여백: 간격 4 배수 중심, 카드 라운드 16px, 좌우 16px.
5. 터치 목표 ≥44px.
6. 결과 카드 첫 요소는 판정 제목(「목록과 일치」「목록에 없음」).
7. 근거(공식 목록 표·출처)는 `<details>` 기본 닫힘.
8. 마이크로카피: 해요체 대신 존중하는 안내체 유지, 오류 대신 「대조할 값이 없습니다 + 해야 할 일」 1줄.
9. 색: 브랜드 1(#1B64DA) + 상태 3(ok #087F5B / warn #9C4F00 / no #C62828), 글자 대비 ≥4.5:1, 다크 대응, 포커스 표시 유지.
10. 외부 폰트·CDN·스크립트 0, 저장·전송 0.

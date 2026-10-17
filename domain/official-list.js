// 공식 목록 — 한국지역난방공사 홈페이지(https://www.kdhc.co.kr)에 공개된 값만. 확인일 2026-10-18.
(function (root) {
  var OFFICIAL_LIST = {
    checkedAt: '2026-10-18',
    phones: [
      { value: '1688-2488', use: '대표전화·고객상담', source: 'https://www.kdhc.co.kr/kdhc/main/contents.do?menuNo=200155' }
    ],
    hosts: [
      { value: 'www.kdhc.co.kr', use: '공사 홈페이지·고객마당', source: 'https://www.kdhc.co.kr/kdhc/main/main.do' },
      { value: 'rps.kdhc.co.kr', use: 'RPS 관리시스템(홈페이지 메뉴 링크)', source: 'https://www.kdhc.co.kr/kdhc/main/main.do' },
      { value: 'econtract.kdhc.co.kr', use: '전자계약(홈페이지 링크)', source: 'https://www.kdhc.co.kr/kdhc/main/main.do' }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = OFFICIAL_LIST;
  else root.OFFICIAL_LIST = OFFICIAL_LIST;
})(typeof self !== 'undefined' ? self : this);

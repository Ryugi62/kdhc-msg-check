const test = require('node:test');
const assert = require('node:assert');
const { judge } = require('../domain/check.js');
const L = require('../domain/official-list.js');
const v = (t) => judge(t, L).verdict;

test('1 대표전화만 있으면 match (하이픈 없어도)', () => {
  assert.strictEqual(v('문의는 1688-2488 로'), 'match');
  assert.strictEqual(v('문의 16882488'), 'match');
});
test('2 공식 호스트 링크는 match + 링크 경고 플래그', () => {
  const r = judge('확인 https://www.kdhc.co.kr/cyb/heat/main.do', L);
  assert.strictEqual(r.verdict, 'match'); assert.strictEqual(r.hasLink, true);
});
test('3 도메인 사칭(접미 이어붙이기·userinfo)은 unlisted', () => {
  assert.strictEqual(v('https://kdhc.co.kr.pay-check.com/x'), 'unlisted');
  assert.strictEqual(v('https://www.kdhc.co.kr@evil.com/login'), 'unlisted');
  assert.strictEqual(v('https://evil.com/www.kdhc.co.kr'), 'unlisted');
});
test('4 단축주소·유사 도메인은 unlisted', () => {
  assert.strictEqual(v('bit.ly/abc123'), 'unlisted');
  assert.strictEqual(v('http://kdhc-co.kr/pay'), 'unlisted');
  assert.strictEqual(v('http://kdhc.co.kr'), 'unlisted');
});
test('5 일반 휴대전화 번호는 unlisted', () => {
  assert.strictEqual(v('연락 010-1234-5678'), 'unlisted');
});
test('6 목록 값과 목록 밖 값이 섞이면 unlisted', () => {
  assert.strictEqual(v('1688-2488 또는 http://evil.example.com'), 'unlisted');
});
test('7 값이 없으면 empty', () => {
  assert.strictEqual(v('열요금 안내입니다. 감사합니다.'), 'empty');
  assert.strictEqual(v(''), 'empty');
});
test('8 대소문자·끝 구두점 정규화 후 match', () => {
  assert.strictEqual(v('WWW.KDHC.CO.KR.'), 'match');
  assert.strictEqual(v('(https://rps.kdhc.co.kr/login).'), 'match');
});
test('9 발견값 항목별 판정과 출처가 따라온다', () => {
  const r = judge('1688-2488 그리고 02-123-4567', L);
  assert.strictEqual(r.findings.length, 2);
  assert.ok(r.findings[0].entry.source.startsWith('https://www.kdhc.co.kr/'));
  assert.strictEqual(r.findings[1].listed, false);
});

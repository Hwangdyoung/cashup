import { BASE_RATE, MAX_RATE } from '../lib/rules.js';
import { pct, pp } from '../lib/format.js';

/* 기본 회색 · S급 나혼렙 보라(아직 확보 전이면 연한 보라) · 길드 카뱅 노랑 */
const COLOR = { base: '#C9CCD3', s: '#6B4FD6', sPend: '#CFC4F5', guild: '#FEE500' };

/* 금리 막대 (전체 폭 = 최고 금리). R = rates(s)
   S급 우대는 26주를 다 채워야 확보되므로, 예상에만 들어간 부분은 연한 보라로 따로 그린다 */
export function RateStack({ R }) {
  const w = (v) => (v / MAX_RATE) * 100 + '%';
  return (
    <div className="stack" role="img" aria-label={'확보 ' + pct(R.now) + ', 만기 예상 ' + pct(R.exp)}>
      <i style={{ width: w(BASE_RATE), background: COLOR.base }} />
      <i style={{ width: w(R.guild), background: COLOR.guild }} />
      <i style={{ width: w(R.sNow), background: COLOR.s }} />
      <i style={{ width: w(R.sExp - R.sNow), background: COLOR.sPend }} />
    </div>
  );
}

/* 범례: 지금 값 기준 */
export function RateKey({ R }) {
  const st = R.s.st;
  const sText = st === 'done' ? pp(R.sNow) + ' 확보' : st === 'prog' ? pp(R.sExp) + ' 완납 시' : st === 'risk' ? '미납 구제 대기' : '받을 수 없음';
  return (
    <div className="key">
      <span style={{ '--kc': COLOR.base }}>기본 {pct(BASE_RATE).replace('연 ', '')}</span>
      <span style={{ '--kc': COLOR.guild }}>길드 {R.guild > 0 ? pp(R.guild) : '없음'}</span>
      <span style={{ '--kc': st === 'done' ? COLOR.s : COLOR.sPend }}>S급 달성 {sText}</span>
    </div>
  );
}

import { BASE_RATE, GUILD_MAX, MAX_RATE, S_BONUS } from '../lib/rules.js';
import { pp } from '../lib/format.js';

const COLOR = { base: '#9C94C9', s: '#FEE500', guild: '#63D2FF' };

/* 금리 막대: 기본 · S급 · 길드 (전체 폭 = 최고 금리) */
export function RateStack({ base = BASE_RATE, s, guild }) {
  const w = (v) => (v / MAX_RATE) * 100 + '%';
  return (
    <div className="stack">
      <i style={{ width: w(base), background: COLOR.base }} />
      <i style={{ width: w(s), background: COLOR.s }} />
      <i style={{ width: w(guild), background: COLOR.guild }} />
    </div>
  );
}

/* 범례. full: 우대 최대치까지 적기 */
export function RateKey({ full }) {
  return (
    <div className="key">
      <span style={{ '--kc': COLOR.base }}>기본{full && ' ' + BASE_RATE.toFixed(1) + '%'}</span>
      <span style={{ '--kc': COLOR.s }}>S급 달성{full && ' ' + pp(S_BONUS)}</span>
      <span style={{ '--kc': COLOR.guild }}>길드{full && ' 최대 ' + pp(GUILD_MAX)}</span>
    </div>
  );
}

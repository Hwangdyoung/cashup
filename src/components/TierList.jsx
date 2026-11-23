import { TIERS } from '../lib/rules.js';
import { pp } from '../lib/format.js';

/* 길드 구간표 (파티 · 레이드 공격대 · 길드 · 연합 길드). current: 지금 구간 번호 */
export default function TierList({ current, style }) {
  return (
    <div className="tiers" style={style}>
      {TIERS.map((x, i) => (
        <div key={x.n} className={`tier${i === current ? ' on' : ''}`}>
          <span>
            <b>{x.n}</b> · {x.d}
          </span>
          <span>{x.min + (x.max === Infinity ? '명 이상' : '~' + x.max + '명')}</span>
          <span className="r">{pp(x.r)}</span>
        </div>
      ))}
    </div>
  );
}

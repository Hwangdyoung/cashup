import { RANK, TOTAL } from '../lib/rules.js';
import { CONCEPTS, RC, RT } from '../lib/characters.js';
import { DAYS, pct } from '../lib/format.js';
import { rates } from '../lib/savings.js';
import { SoundIcon } from './Icons.jsx';

/* 폰 위쪽: 등급 배지 · 헌터 이름 · 주차 · 효과음 · 만기 예상 금리 */
export default function Header({ s, soundOn, onSound, onRate }) {
  const g = s.grade;
  const C = s.concept ? CONCEPTS[s.concept] : null;
  const wk = Math.min(s.wk, TOTAL);
  return (
    <div className="hdr">
      <div className="rk" style={C ? { background: RC[g], color: RT[g], boxShadow: '0 0 14px ' + RC[g] + '66' } : undefined}>
        {RANK[g]}
      </div>
      <div className="who">
        <b>{C ? C.n + ' · ' + RANK[g] + '급 헌터' : '헌터'}</b>
        <span>{s.matured ? '만기 달성' : wk + '주차 / ' + TOTAL + '주' + (C ? ' · ' + DAYS[s.day] + '요일' : '')}</span>
      </div>
      <button type="button" className="snd" aria-label="효과음" aria-pressed={soundOn} title={soundOn ? '효과음 끄기 (M)' : '효과음 켜기 (M)'} onClick={onSound}>
        <SoundIcon />
      </button>
      <button type="button" className="ratepill" aria-label="우대금리 보기" onClick={onRate}>
        만기 예상<b>{pct(rates(s).exp)}</b>
      </button>
    </div>
  );
}

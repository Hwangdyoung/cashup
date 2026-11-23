import { RANK, TOTAL } from '../lib/rules.js';
import { HUNTER, RC, RT } from '../lib/characters.js';
import { DAYS, pct } from '../lib/format.js';
import { rates } from '../lib/savings.js';

/* 적금 상세 위쪽: 등급 배지 · 헌터 이름 · 주차 · 만기 예상 금리 */
export default function Header({ s, onRate }) {
  const g = s.grade;
  const wk = Math.min(s.wk, TOTAL);
  return (
    <div className="hdr">
      <div className="rk" style={{ background: RC[g], color: RT[g], boxShadow: '0 0 12px ' + RC[g] + '88' }}>
        {RANK[g]}
      </div>
      <div className="who">
        <b>
          {HUNTER.n} · {RANK[g]}급 헌터
        </b>
        <span>{s.matured ? '만기 달성' : wk + '주차 / ' + TOTAL + '주 · ' + DAYS[s.day] + '요일'}</span>
      </div>
      <button type="button" className="ratepill" aria-label="우대금리 보기" onClick={onRate}>
        만기 예상<b>{pct(rates(s).exp)}</b>
      </button>
    </div>
  );
}

/* 효과음·BGM 켜고 끄기 (적금 상세 상단 바 오른쪽) */
export function SoundButton({ on, onClick }) {
  return (
    <button type="button" className="snd" aria-label="효과음과 배경음" aria-pressed={on} title={on ? '소리 끄기 (M)' : '소리 켜기 (M)'} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path className="spk" d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4z" />
        <path className="w" d="M15.3 9.2a4 4 0 0 1 0 5.6M17.9 6.6a7.6 7.6 0 0 1 0 10.8" />
        <path className="x" d="M16 9.6l4.8 4.8M20.8 9.6L16 14.4" />
      </svg>
    </button>
  );
}

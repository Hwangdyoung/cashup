import hunterImg from '../assets/hunter.png';
import SystemWindow, { KV } from './SystemWindow.jsx';
import { AWAKEN_EXP, RANK, TICKETS, TOTAL } from '../lib/rules.js';
import { CONCEPTS, RC, SHADOWS } from '../lib/characters.js';
import { fmt, pct, won } from '../lib/format.js';
import { doneCount, principal, rates } from '../lib/savings.js';

/* 상태창: 헌터를 누르면 열림 */
export default function StatusWindow({ s, onClose }) {
  const C = CONCEPTS[s.concept];
  const g = s.grade;
  const rows = [
    ['장비 :', C.gear[g]],
    ...(C.shadows ? [['그림자 병사 :', g ? SHADOWS.slice(0, g).join(' · ') : '없음']] : []),
    ['누적 원금 :', won(principal(s))],
    ['누적 걸음 :', fmt(s.stepsAll) + '보'],
    ['걷기 보너스 EXP :', fmt(s.walkExp) + ' / ' + fmt(AWAKEN_EXP)],
    ['만기 예상 금리 :', <span style={{ color: 'var(--y)' }}>{pct(rates(s).exp)}</span>],
    ['미납 유예권 :', s.tickets + ' / ' + TICKETS + '장'],
  ];
  return (
    <SystemWindow title="상태창" onClose={onClose}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}>
        <div
          style={{
            flex: 'none',
            width: 72,
            height: 92,
            borderRadius: 4,
            display: 'grid',
            placeItems: 'end center',
            overflow: 'hidden',
            border: '1px solid rgba(155,228,255,.35)',
            background: `radial-gradient(circle at 50% 65%,${C.c}55,rgba(8,26,64,.45) 72%)`,
          }}
        >
          <img src={hunterImg} style={{ height: 86 }} alt="" />
        </div>
        <KV
          style={{ flex: 1 }}
          rows={[
            ['콘셉트 :', C.n],
            ['등급 :', <span style={{ color: RC[g] }}>{RANK[g]}급</span>],
            ['EXP :', fmt(s.exp)],
            ['완납 :', doneCount(s) + ' / ' + TOTAL + '주'],
          ]}
        />
      </div>
      <div className="swdiv" />
      <KV rows={rows} />
      <div className="foot2">
        <button type="button" className="btn" onClick={onClose}>
          확인
        </button>
      </div>
    </SystemWindow>
  );
}

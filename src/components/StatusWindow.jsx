import SystemWindow from './SystemWindow.jsx';
import { AWAKEN_EXP, EXP_REQ, LAST, RANK, TICKETS, TOTAL, WK_REQ } from '../lib/rules.js';
import { HUNTER, RC, RT, SHADOWS, hunterArt } from '../lib/characters.js';
import { fmt, pct, won } from '../lib/format.js';
import { doneCount, principal, rates } from '../lib/savings.js';

/* 상태창 (원작 상태창 구조: 이름·칭호 → HP/MP 같은 막대 → 능력치 두 칸 격자 → 장비)
   막대: EXP · 완납 = 다음 등급까지 / 걷기 = 히든 각성까지 */
export default function StatusWindow({ s, onClose }) {
  const C = HUNTER;
  const g = s.grade;
  const done = doneCount(s);
  const top = g >= LAST;
  const n = top ? LAST : g + 1;
  const bars = [
    { k: 'EXP', v: s.exp, max: EXP_REQ[n], to: top ? '최고 등급' : RANK[n] + '급까지', cls: 'exp' },
    { k: '완납', v: done, max: top ? TOTAL : WK_REQ[n], unit: '주', to: top ? '26주 완주' : RANK[n] + '급까지', cls: 'wk' },
    { k: '걷기', v: s.walkExp, max: AWAKEN_EXP, to: s.walkExp >= AWAKEN_EXP ? '히든 각성 달성' : '히든 각성까지', cls: 'walk' },
  ];
  const stats = [
    ['누적 원금', won(principal(s))],
    ['만기 예상', pct(rates(s).exp)],
    ['누적 걸음', fmt(s.stepsAll) + '보'],
    ['유예권', s.tickets + ' / ' + TICKETS + '장'],
  ];
  const soldiers = SHADOWS.slice(0, g);
  return (
    <SystemWindow title="상태창" onClose={onClose}>
      <div className="st-top">
        <div className="st-pic" style={{ '--pc': C.c }}>
          <img src={hunterArt(g)} alt="" />
        </div>
        <div className="st-id">
          <p>
            <span>이름</span> {C.n}
          </p>
          <p>
            <span>칭호</span> {C.title}
          </p>
          <p>
            <span>등급</span>
            <b className="st-grade" style={{ background: RC[g], color: RT[g] }}>
              {RANK[g]}급
            </b>
          </p>
        </div>
      </div>

      <div className="st-bars">
        {bars.map((b) => {
          const met = b.v >= b.max;
          return (
          <div key={b.k} className={`st-bar ${b.cls}${met ? ' met' : ''}`}>
            <span className="k">{b.k}</span>
            <i>
              <b style={{ width: Math.min(100, (b.v / b.max) * 100) + '%' }} />
            </i>
            <span className="v">
              {fmt(b.v)}
              {b.unit} / {fmt(b.max)}
              {b.unit}
            </span>
            <small>{met && b.cls !== 'walk' && !top ? RANK[n] + '급 조건 충족' : b.to}</small>
          </div>
          );
        })}
      </div>

      <div className="swdiv" />
      <dl className="st-grid">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt>{k} :</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="st-gear">
        <p>
          <span>장비</span>
          {C.gear[g]}
        </p>
        <p>
          <span>그림자 병사</span>
          {soldiers.length ? soldiers.join(' · ') : '아직 없음 (D급부터 합류)'}
        </p>
      </div>

      <div className="foot2">
        <button type="button" className="btn" onClick={onClose}>
          확인
        </button>
      </div>
    </SystemWindow>
  );
}

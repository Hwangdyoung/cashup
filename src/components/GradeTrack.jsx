import hunterImg from '../assets/hunter.png';
import { EXP_PAY, EXP_REQ, EXP_WALK, LAST, RANK, WK_REQ } from '../lib/rules.js';
import { RC } from '../lib/characters.js';
import { fmt } from '../lib/format.js';
import { doneCount } from '../lib/savings.js';

/* 홈 · 헌터 등급 카드: E~S 칸 위를 달리는 헌터 + 다음 등급까지 두 조건(EXP · 완납 주차) */
export default function GradeTrack({ s }) {
  const g = s.grade;
  const done = doneCount(s);
  let frac = 1;
  if (g < LAST) {
    const e = (s.exp - EXP_REQ[g]) / (EXP_REQ[g + 1] - EXP_REQ[g]);
    const d = (done - WK_REQ[g]) / (WK_REQ[g + 1] - WK_REQ[g]);
    frac = Math.max(0, Math.min(1, Math.min(e, d)));
  }
  const left = (((g + 0.5 + (g < LAST ? frac * 0.999 : 0)) / RANK.length) * 100).toFixed(2) + '%';
  const n = g + 1;
  return (
    <div className="card">
      <h3>
        헌터 등급<span>{g < LAST ? RANK[n] + '급까지' : '최고 등급'}</span>
      </h3>
      <div className="gtrack">
        <div className="runner" style={{ left }}>
          <img src={hunterImg} alt="" />
        </div>
        <div className="segs">
          {RANK.map((r, i) => (
            <div key={r} className={`seg${i <= g ? ' done' : ''}${i === g ? ' cur' : ''}`} style={{ '--sc': RC[i] }}>
              {r}
            </div>
          ))}
        </div>
      </div>
      <div className="cond">
        {g < LAST ? (
          <>
            <em>EXP</em>
            <div className="pb">
              <i style={{ width: Math.min(100, (s.exp / EXP_REQ[n]) * 100) + '%' }} />
            </div>
            <b>
              {fmt(s.exp)} / {fmt(EXP_REQ[n])}
            </b>
            <em>완납 주차</em>
            <div className="pb w">
              <i style={{ width: Math.min(100, (done / WK_REQ[n]) * 100) + '%' }} />
            </div>
            <b>
              {done} / {WK_REQ[n]}주
            </b>
            <span className="small" style={{ gridColumn: '1/-1' }}>
              두 조건을 모두 채우면 승급해요 · 납입 +{fmt(EXP_PAY)} · 걷기 목표 +{fmt(EXP_WALK)}
            </span>
          </>
        ) : (
          <span className="small" style={{ gridColumn: '1/-1' }}>
            S급 달성! EXP {fmt(s.exp)} · 완납 {done}주
          </span>
        )}
      </div>
    </div>
  );
}

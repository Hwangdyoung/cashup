import { EXP_PAY, EXP_REQ, EXP_WALK, LAST, RANK, WK_REQ } from '../lib/rules.js';
import { GRADE_STORY, RC, RT, hunterArt } from '../lib/characters.js';
import { fmt } from '../lib/format.js';
import { doneCount } from '../lib/savings.js';

/* 헌터 등급: E~S 칸 위의 헌터 + 다음 등급까지 두 조건(EXP · 완납 주차) + 등급 리워드(예정) */
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
    <section className="sec">
      <div className="sec-h">
        <h3>헌터 등급</h3>
        <span>{g < LAST ? '다음 ' + RANK[n] + '급' : '최고 등급'}</span>
      </div>
      <div className="gtrack">
        <div className="runner" style={{ left }}>
          <img src={hunterArt(g)} alt="" />
        </div>
        <div className="segs">
          {RANK.map((r, i) => (
            <div key={r} className={`seg${i <= g ? ' done' : ''}${i === g ? ' cur' : ''}`} style={{ '--sc': RC[i], '--st': RT[i] }}>
              {r}
            </div>
          ))}
        </div>
      </div>
      <p className="gstory">
        {g < LAST ? (
          <>
            {RANK[n]}급이 되면 <b>{GRADE_STORY[n]}</b>
          </>
        ) : (
          <b>{GRADE_STORY[g]}</b>
        )}
      </p>
      {g < LAST && (
        <div className="cond">
          <em>EXP</em>
          <div className="pb">
            <i style={{ width: Math.min(100, (s.exp / EXP_REQ[n]) * 100) + '%' }} />
          </div>
          <b>
            {fmt(s.exp)} / {fmt(EXP_REQ[n])}
          </b>
          <em>완납</em>
          <div className="pb w">
            <i style={{ width: Math.min(100, (done / WK_REQ[n]) * 100) + '%' }} />
          </div>
          <b>
            {done} / {WK_REQ[n]}주
          </b>
        </div>
      )}
      <p className="sec-note">
        {g < LAST ? `두 조건을 모두 채우면 승급 · 납입 +${fmt(EXP_PAY)} · 걷기 +${fmt(EXP_WALK)}` : `EXP ${fmt(s.exp)} · 완납 ${done}주`}
      </p>
      <div className="info-row">
        <span>등급 달성 리워드</span>
        <b>
          카카오페이 포인트·카카오페이지 캐시 <i className="soon">예정</i>
        </b>
      </div>
    </section>
  );
}

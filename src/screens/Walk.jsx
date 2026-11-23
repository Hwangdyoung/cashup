import { AWAKEN_EXP, EXP_WALK, TOTAL, WALK_GOAL } from '../lib/rules.js';
import { CONCEPTS } from '../lib/characters.js';
import { DAYS, fmt } from '../lib/format.js';
import { awakened } from '../lib/savings.js';

const RING = 314.16; // 반지름 50 원 둘레

/* 걷기: 오늘의 일일 퀘스트(8,000보) · 히든 각성 게이지 · 이번 주 걷기 */
export default function Walk({ s, onWalk }) {
  const f = Math.min(1, s.steps / WALK_GOAL);
  const aw = awakened(s);
  return (
    <>
      <div className="card">
        <h3>
          오늘의 일일 퀘스트
          <span>
            {Math.min(s.wk, TOTAL)}주차 {DAYS[s.day]}요일
          </span>
        </h3>
        <div className="ringwrap">
          <div className="ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1C1640" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#B4F55E" strokeWidth="12" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={(RING * (1 - f)).toFixed(1)} style={{ transition: 'stroke-dashoffset .5s' }} />
            </svg>
            <div className="c">
              <b>{fmt(s.steps)}</b>
              <span>/ {fmt(WALK_GOAL)}보</span>
            </div>
          </div>
          <div className="qlist">
            <div className={`q${s.goalDone ? ' ok' : ''}`}>
              <span>{fmt(WALK_GOAL)}보 걷기</span>
              <em>EXP +{fmt(EXP_WALK)}</em>
            </div>
          </div>
        </div>
        <div className="btnrow">
          {[1000, 3000].map((n) => (
            <button key={n} type="button" className="btn sub" onClick={() => onWalk(n)}>
              +{fmt(n)}보
            </button>
          ))}
        </div>
        <p className="small" style={{ marginTop: 8 }}>
          실제 앱에서는 걸음 수가 자동으로 집계돼요. 버튼은 시연용이에요.
        </p>
      </div>

      <div className={`card aw${aw ? ' ok' : ''}`}>
        <h3>
          히든 각성
          <span>
            {fmt(s.walkExp)} / {fmt(AWAKEN_EXP)}
          </span>
        </h3>
        <div className="awbar">
          <i style={{ width: Math.min(100, (s.walkExp / AWAKEN_EXP) * 100) + '%' }} />
        </div>
        <p className="small" style={{ marginTop: 6 }}>
          {aw
            ? '조건 달성! 만기 때 ' + CONCEPTS[s.concept].n + ' 최종 연출이 열려요'
            : '남은 걷기 목표 ' + Math.ceil((AWAKEN_EXP - s.walkExp) / EXP_WALK) + '일 · 만기까지 채우면 히든 각성'}
        </p>
      </div>

      <div className="card">
        <h3>
          이번 주 걷기<span>EXP +{fmt(s.walkDays.filter(Boolean).length * EXP_WALK)}</span>
        </h3>
        <div className="daydots">
          {DAYS.split('').map((d, i) => (
            <div key={d} className={`dd${s.walkDays[i] ? ' ok' : ''}${i === s.day ? ' today' : ''}`}>
              <i />
              {d}
            </div>
          ))}
        </div>
      </div>
      <p className="note">
        원작에서 헌터의 일일 퀘스트에 달리기가 있는 것처럼, 매일 걷기 목표를 채우면 추가 EXP를 받아요. 걷기는 금리와 상관없고, 만기까지 걷기 보너스 EXP {fmt(AWAKEN_EXP)}을 모으면 캐릭터별 히든 각성 연출이 열려요.
      </p>
    </>
  );
}

import { AWAKEN_EXP, EXP_WALK, TOTAL, WALK_GOAL } from '../lib/rules.js';
import { HUNTER } from '../lib/characters.js';
import { DAYS, fmt } from '../lib/format.js';
import { awakened } from '../lib/savings.js';

const RING = 314.16; // 반지름 50 원 둘레

/* 걷기: 오늘의 일일 퀘스트(8,000보) · 히든 각성 게이지 · 이번 주 걷기 */
export default function Walk({ s, onWalk }) {
  const f = Math.min(1, s.steps / WALK_GOAL);
  const aw = awakened(s);
  const left = Math.max(0, WALK_GOAL - s.steps);
  const needDays = Math.ceil((AWAKEN_EXP - s.walkExp) / EXP_WALK); // 히든 각성까지 더 채워야 할 날
  const daysLeft = s.matured ? 0 : (TOTAL - Math.min(s.wk, TOTAL)) * 7 + (7 - s.day); // 오늘 포함 만기까지 남은 날
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
              <circle cx="60" cy="60" r="50" fill="none" stroke="#EEF0F3" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#6B4FD6" strokeWidth="10" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={(RING * (1 - f)).toFixed(1)} style={{ transition: 'stroke-dashoffset .5s' }} />
            </svg>
            <div className="c">
              <b>{fmt(s.steps)}</b>
              <span>/ {fmt(WALK_GOAL)}보</span>
            </div>
          </div>
          <div className={`qstat${s.goalDone ? ' ok' : ''}`}>
            <b>{s.goalDone ? '오늘 목표 달성' : fmt(left) + '보 남았어요'}</b>
            <span>보상 EXP +{fmt(EXP_WALK)}{s.goalDone ? ' 받음' : ''}</span>
            <span>히든 각성 게이지 +{fmt(EXP_WALK)}</span>
          </div>
        </div>
        <div className="walk-demo">
          <span className="demo-chip">시연</span>
          <span className="t" title="실제 앱에서는 걸음 수가 자동으로 집계돼요">걸음 더하기</span>
          {[1000, 3000].map((n) => (
            <button key={n} type="button" onClick={() => onWalk(n)}>
              +{fmt(n)}
            </button>
          ))}
        </div>
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
            ? '조건 달성! 만기 때 ' + HUNTER.n + ' 최종 연출(벨리온)과 추가 리워드(예정)가 열려요'
            : '목표를 ' + needDays + '일 더 채우면 각성 · 만기까지 ' + daysLeft + '일 남음'}
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
      <p className="note">걷기는 금리와 상관없어요. 등급 EXP와 히든 각성에만 쓰여요.</p>
    </>
  );
}

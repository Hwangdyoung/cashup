import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { RANK } from '../lib/rules.js';
import { AWAKEN_REWARD, HUNTER, RC, RT, hunterArt } from '../lib/characters.js';
import { fmt, pct, won } from '../lib/format.js';
import { awakened, doneCount, interestFor, lostCount, rates } from '../lib/savings.js';

/* 만기 결과: ① 헌터·최종 등급 ② 받는 금액(가장 크게) ③ 완납·미납·걷기 ④ 히든 각성(걷기 보너스 EXP 10,000 이상) */
export default function ResultWindow({ s, onClose, onReset }) {
  const C = HUNTER;
  const R = rates(s);
  const P = interestFor(s, R.now, false);
  const aw = awakened(s);
  const g = s.grade;
  return (
    <SystemWindow variant="gold" title="프로젝트 수료">
      <div className="res-hero">
        <img src={hunterArt(g)} alt="" className={aw ? 'aw' : undefined} />
        <span className="res-grade" style={{ background: RC[g], color: RT[g] }}>
          {RANK[g]}
        </span>
      </div>
      <SysLine>
        <em>헌터 협회 특별 성장 프로젝트</em>를 수료했습니다.
      </SysLine>

      <div className="res-money">
        <span>받는 금액 (세전)</span>
        <b>{won(P.p + P.i)}</b>
        <small>
          원금 {won(P.p)} + 이자 {won(P.i)} · {pct(R.now)}
        </small>
      </div>

      <div className="res-stats">
        <div>
          <b>{doneCount(s)}주</b>
          <span>완납</span>
        </div>
        <div>
          <b>{lostCount(s)}주</b>
          <span>미납</span>
        </div>
        <div>
          <b>{fmt(s.walkExp)}</b>
          <span>걷기 EXP</span>
        </div>
      </div>

      {aw && (
        <div className="res-awaken">
          <b>히든 각성</b>
          <p>{C.awaken}</p>
          <small>{AWAKEN_REWARD}</small>
        </div>
      )}

      <div className="foot2">
        <button type="button" className="btn sub" onClick={onClose}>
          닫기
        </button>
        <button type="button" className="btn" onClick={onReset}>
          처음부터 다시
        </button>
      </div>
    </SystemWindow>
  );
}

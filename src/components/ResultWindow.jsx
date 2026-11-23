import SystemWindow, { KV, SysLine } from './SystemWindow.jsx';
import { RANK } from '../lib/rules.js';
import { AWAKEN_REWARD, HUNTER, hunterArt } from '../lib/characters.js';
import { fmt, pct, won } from '../lib/format.js';
import { awakened, doneCount, interestFor, lostCount, rates } from '../lib/savings.js';

/* 만기 결과 (+ 걷기 보너스 EXP 10,000 이상이면 히든 각성 연출) */
export default function ResultWindow({ s, onClose, onReset }) {
  const C = HUNTER;
  const R = rates(s);
  const P = interestFor(s, R.now, false);
  const aw = awakened(s);
  return (
    <SystemWindow variant="gold" title="던전 결과">
      <div style={{ display: 'grid', placeItems: 'center', height: 130 }}>
        <img src={hunterArt(s.grade)} alt="" style={{ height: 126, filter: `drop-shadow(0 0 ${aw ? 24 : 12}px ${C.c})${aw ? ' brightness(1.25)' : ''}` }} />
      </div>
      <SysLine>
        <em>헌터 협회 특별 성장 프로젝트</em>를 수료했습니다.
      </SysLine>
      {aw && (
        <>
          <div className="swdiv" />
          <SysLine>
            <em>히든 각성</em> 조건을 달성했습니다.
          </SysLine>
          <p className="swsub">{C.awaken}</p>
          <span className="reward-sw">🎁 {AWAKEN_REWARD}</span>
        </>
      )}
      <div className="swdiv" />
      <KV
        rows={[
          ['최종 등급 :', RANK[s.grade] + '급 · ' + C.n],
          ['완납 / 미납 :', doneCount(s) + '주 / ' + lostCount(s) + '주'],
          ['걷기 보너스 EXP :', fmt(s.walkExp) + (aw ? ' · 히든 각성' : '')],
          ['적용 금리 :', pct(R.now)],
          ['원금 :', won(P.p)],
          ['이자 (세전) :', won(P.i)],
          ['받는 금액 :', <b style={{ color: '#FFE680' }}>{won(P.p + P.i)}</b>],
        ]}
      />
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

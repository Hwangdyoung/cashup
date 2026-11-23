import Stage from '../components/Stage.jsx';
import GateCard from '../components/GateCard.jsx';
import GradeTrack from '../components/GradeTrack.jsx';
import { RateKey, RateStack } from '../components/RateBar.jsx';
import { GUILD_MAX, S_BONUS, TOTAL } from '../lib/rules.js';
import { pct, pp, won } from '../lib/format.js';
import { amt, gates, isDone, principal, rates } from '../lib/savings.js';

/* 홈: 무대 · 페널티 게이트 · 만기 예상 금리 · 이번 주 납입 · 헌터 등급 */
export default function Home({ s, pop, onHero, onPay, onGate, onTab }) {
  const R = rates(s);
  const G = gates(s);
  const wk = Math.min(s.wk, TOTAL);
  const cur = s.weeks[wk];
  const st = R.s;
  const hint =
    st.st === 'risk'
      ? '미납 회차를 구제하면 S급 우대 ' + pp(S_BONUS) + '를 지켜요'
      : st.st === 'fail'
        ? 'S급 우대는 받을 수 없어요 · 길드로 올릴 수 있어요'
        : st.st === 'prog'
          ? '26주 완납(S급)까지 ' + (TOTAL - st.done) + '주 남았어요'
          : R.guild < GUILD_MAX
            ? '길드원을 초대하면 더 올라가요'
            : '모든 우대를 받고 있어요';
  const payLabel = s.matured
    ? '만기 달성'
    : isDone(cur)
      ? '이번 주 납입 완료'
      : cur === 'gate'
        ? '페널티 게이트에서 구제하세요'
        : cur === 'lost'
          ? '이번 주 미납 확정'
          : '이번 주 납입하기 +' + won(amt(s, wk));

  return (
    <>
      <Stage s={s} missTint={G.length > 0} pop={pop} onHero={onHero} />
      {G.length > 0 && <GateCard s={s} week={G[0]} onChallenge={onGate} />}

      <div className="ratecard">
        <p className="k">만기까지 이대로 납입하면</p>
        <div className="big">
          <b>{pct(R.exp)}</b>
          <span>지금까지 확보 {pct(R.now)}</span>
        </div>
        <RateStack s={R.sExp} guild={R.guild} />
        <RateKey />
        <div className="go">
          <span className="small">{hint}</span>
          <button type="button" className="link" onClick={() => onTab('rate')}>
            우대금리 자세히
          </button>
        </div>
      </div>

      <div className="card">
        <h3>
          이번 주 납입<span>매주 {won(s.base)}씩 증액</span>
        </h3>
        <div className="row">
          <span>{wk}주차 납입액</span>
          <b>{won(amt(s, wk))}</b>
        </div>
        <div className="row">
          <span>누적 원금</span>
          <b>{won(principal(s))}</b>
        </div>
        <button type="button" className="btn" disabled={s.matured || isDone(cur) || cur === 'gate' || cur === 'lost'} onClick={onPay}>
          {payLabel}
        </button>
      </div>

      <GradeTrack s={s} />
      <p className="note">데모용 가짜 데이터이며 실제 금융거래가 아닙니다.</p>
    </>
  );
}

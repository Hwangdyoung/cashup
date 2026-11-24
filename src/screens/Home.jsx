import Stage from '../components/Stage.jsx';
import StampBoard from '../components/StampBoard.jsx';
import GateCard from '../components/GateCard.jsx';
import GradeTrack from '../components/GradeTrack.jsx';
import { RateKey, RateStack } from '../components/RateBar.jsx';
import { ChevronRight } from '../components/Icons.jsx';
import { GUILD_MAX, S_BONUS, TOTAL } from '../lib/rules.js';
import { pct, pp, won } from '../lib/format.js';
import { amt, gates, isDone, principal, rates } from '../lib/savings.js';

/* 적금 상세 홈
   ① 던전 무대(이번 주 도전 금액) ② 이번 주 납입 버튼 ③ 페널티 게이트 ④ 26주 도전 현황 ⑤ 만기 예상 금리 ⑥ 헌터 등급 */
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
        ? 'S급 우대는 받을 수 없어요. 길드로 올릴 수 있어요'
        : st.st === 'prog'
          ? '26주 완납(S급)까지 ' + (TOTAL - st.done) + '주 남았어요'
          : R.guild < GUILD_MAX
            ? '길드원을 초대하면 더 올라가요'
            : '모든 우대를 받고 있어요';
  const paid = isDone(cur);
  const payLabel = s.matured
    ? '만기 달성'
    : paid
      ? '이번 주 납입 완료'
      : cur === 'gate'
        ? '페널티 게이트에서 구제하세요'
        : cur === 'lost'
          ? '이번 주 미납 확정'
          : wk + '주차 ' + won(amt(s, wk)) + ' 납입하기';

  return (
    <>
      <Stage s={s} label={s.matured ? '26주 도전 완료' : wk + '주차 도전중'} amount={won(amt(s, wk))} missTint={G.length > 0} pop={pop} onHero={onHero} />

      <div className="pay-sec">
        <button type="button" className="kb-btn" disabled={s.matured || paid || cur === 'gate' || cur === 'lost'} onClick={onPay}>
          {payLabel}
        </button>
        <div className="pay-meta">
          <span>누적 원금 {won(principal(s))}</span>
          <span>매주 {won(s.base)}씩 증액</span>
        </div>
      </div>

      {G.length > 0 && <GateCard s={s} week={G[0]} onChallenge={onGate} />}

      <StampBoard s={s} />

      <section className="sec">
        <button type="button" className="sec-h link-row" onClick={() => onTab('rate')}>
          <h3>만기 예상 금리</h3>
          <span>
            우대금리 <ChevronRight />
          </span>
        </button>
        <div className="rate-line">
          <b>{pct(R.exp)}</b>
          <span>지금까지 확보 {pct(R.now)}</span>
        </div>
        <RateStack s={R.sExp} guild={R.guild} />
        <RateKey />
        <p className="sec-note">{hint}</p>
      </section>

      <GradeTrack s={s} />
      <p className="note">시연용 데이터이며 실제 금융거래가 아닙니다.</p>
    </>
  );
}

import { RateKey, RateStack } from '../components/RateBar.jsx';
import TierList from '../components/TierList.jsx';
import { MAX_RATE, S_BONUS, TIERS, TOTAL } from '../lib/rules.js';
import { pct, pp, won } from '../lib/format.js';
import { interestFor, rates, tier } from '../lib/savings.js';

const S_LABEL = { done: '달성', risk: '미납 구제 대기', fail: '미납 확정으로 받을 수 없음' };

/* 우대금리: 만기 예상 금리 · 수령액 · 우대 1 S급 달성 · 우대 2 길드 (26주 납입 현황은 홈 도장판) */
export default function Rate({ s, proj, onProj, onTab }) {
  const R = rates(s);
  const rate = proj === 'keep' ? R.exp : R.max;
  const P = interestFor(s, rate, true);
  const st = R.s;
  const t = tier(s);
  return (
    <>
      <div className="ratecard">
        <p className="k">만기 예상 금리 (세전)</p>
        <div className="big">
          <b>{pct(R.exp)}</b>
          <span>
            지금까지 확보 {pct(R.now)} · 최고 {pct(MAX_RATE)}
          </span>
        </div>
        <RateStack s={R.sExp} guild={R.guild} />
        <RateKey full />
      </div>

      <div className="card">
        <h3>
          만기 예상 수령액<span>세전 · 단순 계산</span>
        </h3>
        <div className="seg2">
          {[
            ['keep', '지금 조건 유지'],
            ['max', '남은 우대 모두 달성'],
          ].map(([id, label]) => (
            <button key={id} type="button" className={proj === id ? 'on' : undefined} onClick={() => onProj(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="row">
          <span>원금 ({TOTAL}주)</span>
          <b>{won(P.p)}</b>
        </div>
        <div className="row">
          <span>이자</span>
          <b>
            {won(P.i)} ({pct(rate)})
          </b>
        </div>
        <div className="row">
          <span>받는 금액</span>
          <b style={{ color: 'var(--y)', fontSize: 16 }}>{won(P.p + P.i)}</b>
        </div>
      </div>

      <div className="card">
        <h3>
          우대 1 · S급 달성<span>{TOTAL}주 완납 시</span>
        </h3>
        <div className={`ms ${st.st}`}>
          <div className="wk">
            S<small>급</small>
          </div>
          <div className="t">
            <b>{TOTAL}주 완납 · S급 헌터 달성</b>
            <span>{S_LABEL[st.st] ?? st.done + ' / ' + TOTAL + '주 완납 진행 중'}</span>
            <div className="pb">
              <i style={{ width: Math.min(100, (st.done / TOTAL) * 100) + '%' }} />
            </div>
          </div>
          <div className="v">{pp(S_BONUS)}</div>
        </div>
        <p className="small" style={{ marginTop: 6 }}>
          미납이 생겨도 미납 유예권으로 페널티 퀘스트에 성공해 재납입하면 완납으로 인정돼요.
        </p>
      </div>

      <div className="card">
        <h3>
          우대 2 · 길드<span>{s.members + '명 · ' + (t < 0 ? '우대 없음' : TIERS[t].n + ' ' + pp(TIERS[t].r))}</span>
        </h3>
        <TierList current={t} />
        <button type="button" className="link" style={{ marginTop: 8 }} onClick={() => onTab('guild')}>
          친구 초대하러 가기
        </button>
      </div>
      <p className="note">기본 연 2.0% + 길드 우대 최대 2.0%p + S급 달성 우대 3.0%p = 최고 연 7.0%는 콜라보 이벤트 기획 제안 예시이며 실제 상품과 다를 수 있습니다.</p>
    </>
  );
}

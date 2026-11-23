import { BankTabBar } from '../components/Shell.jsx';
import { BellIcon } from '../components/Icons.jsx';
import { RANK, TOTAL } from '../lib/rules.js';
import { RC, RT, hunterArt } from '../lib/characters.js';
import { won } from '../lib/format.js';
import { principal } from '../lib/savings.js';

/* 시연용 가짜 계좌 (실제 계좌·잔액 아님) */
export const DEMO_ACCOUNT = { name: '입출금통장', tail: '1234', balance: 1284500 };

/* 카카오뱅크 홈: 콜라보 배너 · 입출금통장 · (가입했으면) 나 혼자만 캐시업 적금 */
export default function BankHome({ s, onPromo, onSavings, onTab, onSoon }) {
  return (
    <div className="view bank">
      <div className="scroll">
        <div className="bank-top">
          <b>홈</b>
          <button type="button" className="bell" aria-label="알림" onClick={onSoon}>
            <BellIcon />
          </button>
        </div>
        <div className="bank-body">
          <button type="button" className="promo" onClick={onPromo}>
            <span className="new">NEW</span>
            <span className="t">
              <small>카카오뱅크 × 나 혼자만 레벨업</small>
              <b className="hol">나 혼자만 캐시업 OPEN</b>
              <span>26주 헌터 성장 적금 · 최고 연 7.0%</span>
            </span>
            <img src={hunterArt(0)} alt="" />
          </button>

          <div className="acct main">
            <div className="name">
              {DEMO_ACCOUNT.name}({DEMO_ACCOUNT.tail})
            </div>
            <div className="row2">
              <div className="bal">{won(DEMO_ACCOUNT.balance)}</div>
              <button type="button" className="mini" onClick={onSoon}>
                이체
              </button>
            </div>
          </div>

          {s.joined ? (
            <button type="button" className="acct" onClick={onSavings}>
              <div className="line">
                <span className="ic hol" style={{ background: RC[s.grade], color: RT[s.grade] }}>
                  {RANK[s.grade]}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="bal" style={{ fontSize: 18, marginTop: 0 }}>
                    {won(principal(s))}
                  </div>
                  <div className="sub">
                    나 혼자만 캐시업 · {s.matured ? '만기' : Math.min(s.wk, TOTAL) + '주차 도전중'}
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div className="acct">
              <div className="sub">아직 가입한 적금이 없어요</div>
            </div>
          )}

          <div className="acct-links">
            <button type="button" onClick={onSoon}>
              전체 계좌 보기
            </button>
            <button type="button" onClick={() => onTab('benefit')}>
              + 상품 추가
            </button>
          </div>

          <div className="bank-sec">
            <h3>카드</h3>
            <p>이번 달 쓴 돈 0원</p>
          </div>
          <p className="bank-note">
            시연용 화면이에요. 실제 카카오뱅크 앱이 아니며
            <br />
            계좌와 금액은 모두 가짜예요.
          </p>
        </div>
      </div>
      <BankTabBar tab="home" onTab={onTab} />
    </div>
  );
}

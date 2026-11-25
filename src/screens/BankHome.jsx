import { BankTabBar } from '../components/Shell.jsx';
import { BellIcon, ChevronRight } from '../components/Icons.jsx';
import { MAX_RATE, RANK, TOTAL } from '../lib/rules.js';
import { RC, RT } from '../lib/characters.js';
import { pct, won } from '../lib/format.js';
import { principal } from '../lib/savings.js';

/* 시연용 가짜 계좌 (실제 계좌·잔액 아님) */
export const DEMO_ACCOUNT = { name: '입출금통장', tail: '1234', balance: 1284500 };

/* 카카오뱅크 홈 (실제 카카오뱅크 홈 구성)
   맨 위 알림 칩 → 대표 입출금통장 카드 → 내 계좌 목록(적금) → 카드 */
export default function BankHome({ s, hint, onPromo, onSavings, onTab, onSoon }) {
  return (
    <div className="view bank">
      <div className="scroll">
        <div className="bank-top">
          <button type="button" className={`notice${hint ? ' hint' : ''}`} onClick={onPromo}>
            <span className="notice-ic hol">S</span>
            <span>
              나 혼자만 캐시업 출시 <em>최고 {pct(MAX_RATE)}</em>
            </span>
            <ChevronRight />
          </button>
          <button type="button" className="bell" aria-label="알림" onClick={onSoon}>
            <BellIcon />
          </button>
        </div>

        <div className="bank-body">
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

          <div className="acct-list">
            {s.joined ? (
              <button type="button" className="acct-row" onClick={onSavings}>
                <span className="ic hol" style={{ background: RC[s.grade], color: RT[s.grade] }}>
                  {RANK[s.grade]}
                </span>
                <span className="t">
                  <b>{won(principal(s))}</b>
                  <span>나 혼자만 캐시업 · {s.matured ? '만기' : Math.min(s.wk, TOTAL) + '주차 도전중'}</span>
                </span>
                <ChevronRight />
              </button>
            ) : (
              <button type="button" className="acct-row" onClick={onPromo}>
                <span className="ic add">+</span>
                <span className="t">
                  <b>나 혼자만 캐시업</b>
                  <span>
                    {TOTAL}주 헌터 성장 적금 · 최고 {pct(MAX_RATE)}
                  </span>
                </span>
                <ChevronRight />
              </button>
            )}
            <div className="acct-foot">
              <button type="button" onClick={onSoon}>
                전체 계좌 보기
              </button>
              <button type="button" onClick={() => onTab('benefit')}>
                상품 추가
              </button>
            </div>
          </div>

          <div className="acct-list">
            <button type="button" className="acct-row" onClick={onSoon}>
              <span className="ic card" aria-hidden="true" />
              <span className="t">
                <b>0원</b>
                <span>카드 · 이번 달 쓴 돈</span>
              </span>
              <ChevronRight />
            </button>
          </div>

          <p className="bank-note">시연용 화면이에요. 실제 카카오뱅크 앱이 아니며 계좌와 금액은 모두 가짜예요.</p>
        </div>
      </div>
      <BankTabBar tab="home" onTab={onTab} />
    </div>
  );
}

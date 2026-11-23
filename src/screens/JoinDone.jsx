import { CheckIcon } from '../components/Icons.jsx';
import { BASE_RATE, PAY_DAYS, TIERS, TOTAL } from '../lib/rules.js';
import { pct, won } from '../lib/format.js';
import { tier } from '../lib/savings.js';
import { DEMO_ACCOUNT } from './BankHome.jsx';

/* 만기일: 오늘부터 26주 뒤 */
const maturityDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + TOTAL * 7);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

/* 개설 완료 (카카오뱅크 26주적금 개설완료 화면 구성) */
export default function JoinDone({ s, onConfirm }) {
  const t = tier(s);
  return (
    <div className="view join">
      <div className="done-toast" role="status">
        <b>출금 {won(s.base)}</b>
        {DEMO_ACCOUNT.name}({DEMO_ACCOUNT.tail}) → 나 혼자만 캐시업 신규
      </div>
      <div className="scroll">
        <div className="done-body">
          <div className="done-check">
            <CheckIcon />
          </div>
          <h2>나 혼자만 캐시업 개설완료</h2>
          <p>아래의 내용을 확인해 주세요.</p>
          <div className="done-rows">
            <div>
              <span>시작금액</span>
              <b>{won(s.base)}</b>
            </div>
            <div>
              <span>자동이체</span>
              <b>매주 {PAY_DAYS[s.payDay]}요일</b>
            </div>
            <div>
              <span>만기일자</span>
              <b>{maturityDate()}</b>
            </div>
            <div>
              <span>적용금리</span>
              <b>{pct(BASE_RATE + (t < 0 ? 0 : TIERS[t].r))}</b>
            </div>
            <div>
              <span>길드</span>
              <b>
                {s.guildOwner ? '새 길드' : '참여'} {s.guildCode} · {s.members}명
              </b>
            </div>
          </div>
          <p className="done-note">· 우대금리는 길드 인원과 26주 완납(S급 달성) 조건에 따라 적용돼요.
            <br />· 시연용 화면이에요. 실제로 돈이 빠져나가지 않아요.</p>
        </div>
      </div>
      <div className="bottom-cta">
        <button type="button" className="kb-btn" onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  );
}

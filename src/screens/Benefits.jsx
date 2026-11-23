import { BankTabBar, DungeonArt } from '../components/Shell.jsx';
import { MAX_RATE, TOTAL } from '../lib/rules.js';
import { pct } from '../lib/format.js';
import { hunterArt } from '../lib/characters.js';

/* 시연용 예시 이벤트 (실제 카카오뱅크 이벤트 아님) */
const OTHER_EVENTS = [
  { icon: '📅', bg: '#FFF4CC', t: '매일 출석 체크', d: '시연용 예시 이벤트' },
  { icon: '🐷', bg: '#E5F4FD', t: '잔돈 모으기 챌린지', d: '시연용 예시 이벤트' },
];

/* 혜택 탭 · 이벤트: 맨 위에 콜라보 배너 */
export default function Benefits({ onCollab, onTab, onSoon }) {
  return (
    <div className="view bank">
      <div className="scroll">
        <div className="ben-head">
          <h1>혜택</h1>
        </div>
        <div className="chips">
          <span className="on">이벤트</span>
          <span>미션</span>
          <span>쿠폰</span>
        </div>
        <div className="ev-list">
          <button type="button" className="ev-hero" onClick={onCollab} aria-label="나 혼자만 캐시업 이벤트 보기">
            <DungeonArt grade={3} hunter={false} />
            <div className="shade" />
            <div className="in">
              <small>카카오뱅크 × 나 혼자만 레벨업 콜라보</small>
              <h2>나 혼자만 캐시업</h2>
              <p>저축하고, 걷고, 함께 성장하는 {TOTAL}주 헌터 양성 적금</p>
              <span className="rate">최고 {pct(MAX_RATE)}</span>
            </div>
            <img src={hunterArt(3)} alt="" />
          </button>
          {OTHER_EVENTS.map((e) => (
            <button key={e.t} type="button" className="ev" onClick={onSoon}>
              <span className="thumb" style={{ background: e.bg }}>
                {e.icon}
              </span>
              <span>
                <b>{e.t}</b>
                <span>{e.d}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <BankTabBar tab="benefit" onTab={onTab} />
    </div>
  );
}

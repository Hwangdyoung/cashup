import SystemWindow, { KV, SysLine } from './SystemWindow.jsx';
import { TICKETS, TRIES_PER_TICKET } from '../lib/rules.js';
import { won } from '../lib/format.js';
import { amt } from '../lib/savings.js';

/* 페널티 게이트 → 유예권 사용 확인 */
export function GateConfirm({ s, week, onClose, onEnter }) {
  return (
    <SystemWindow variant="red" title="미납 유예권" alert onClose={onClose}>
      <SysLine>
        <em>미납 유예권</em>을 사용하시겠습니까?
      </SysLine>
      <p className="swsub">
        {week}주차 {won(amt(s, week))} · 남은 유예권 {s.tickets} / {TICKETS}장
      </p>
      <div className="swdiv" />
      <p className="swsub" style={{ textAlign: 'left' }}>
        · 게임을 시작하면 유예권 1장이 사용돼요. 한 장에 도전 기회는 {TRIES_PER_TICKET}번이에요.
        <br />· 성공하면 {week}주차를 재납입해 완납으로 인정받고 S급 달성 우대를 지킬 수 있어요.
        <br />· 실패해도 실제 납입은 별도로 할 수 있어요.
      </p>
      <div className="foot2">
        <button type="button" className="btn sub" onClick={onClose}>
          나중에
        </button>
        <button type="button" className="btn" onClick={onEnter}>
          페널티 구역 입장
        </button>
      </div>
    </SystemWindow>
  );
}

/* 페널티 퀘스트 통과 → 재납입 */
export function RepayWindow({ s, week, onRepay }) {
  return (
    <SystemWindow variant="gold" title="재납입 기회 획득" alert>
      <SysLine>
        <em>페널티 퀘스트</em>를 완료했습니다.
      </SysLine>
      <p className="swsub">{week}주차를 지금 재납입하면 완납으로 인정돼요.</p>
      <div className="swdiv" />
      <KV
        rows={[
          ['재납입 회차', week + '주차'],
          ['납입액', won(amt(s, week))],
          ['남은 유예권', s.tickets + ' / ' + TICKETS + '장'],
        ]}
      />
      <div className="foot2">
        <button type="button" className="btn" onClick={onRepay}>
          {week}주차 재납입하기 +{won(amt(s, week))}
        </button>
      </div>
    </SystemWindow>
  );
}

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
      <KV
        style={{ marginTop: 14 }}
        rows={[
          ['미납 회차', week + '주차 ' + won(amt(s, week))],
          ['쓰는 유예권', '1장 (남은 ' + s.tickets + ' / ' + TICKETS + '장)'],
          ['도전 기회', TRIES_PER_TICKET + '번 · 30초 미니게임'],
          ['성공하면', '재납입 → 완납 인정'],
        ]}
      />
      <p className="ifnote">실제 입금은 게임 결과와 관계없이 따로 해야 해요.</p>
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

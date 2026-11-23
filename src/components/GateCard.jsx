import { TICKETS, TRIES_PER_TICKET } from '../lib/rules.js';
import { won } from '../lib/format.js';
import { amt } from '../lib/savings.js';
import { GateIcon } from './Icons.jsx';

/* 홈 · 페널티 게이트 카드: 가장 이른 미납 주차와 남은 유예권 */
export default function GateCard({ s, week, onChallenge }) {
  return (
    <div className="gate">
      <h3>
        <GateIcon />
        페널티 게이트 · {week}주차 미납
      </h3>
      <p>
        {week}주차 {won(amt(s, week))} 납입을 놓쳤어요. 미납 유예권 1장으로 페널티 퀘스트에 {TRIES_PER_TICKET}번 도전할 수 있고, 성공하면 재납입해 완납으로 인정받아요.
      </p>
      <div className="tickets">
        {Array.from({ length: TICKETS }, (_, i) => (
          <i key={i} className={`tk${i < s.tickets ? '' : ' used'}`} />
        ))}
        <span>
          미납 유예권 {s.tickets} / {TICKETS}장
        </span>
      </div>
      <button type="button" className="btn pen" onClick={() => onChallenge(week)}>
        유예권 쓰고 페널티 퀘스트 도전
      </button>
    </div>
  );
}

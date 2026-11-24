import { TOTAL } from '../lib/rules.js';
import { doneCount } from '../lib/savings.js';

const LABEL = { paid: '납입', rescued: '구제 후 재납입', gate: '페널티 게이트', lost: '미납 확정' };

/* 26주 도전 현황: 26칸 도장판 (카카오뱅크 26주적금 상세 화면의 도장판 구성)
   납입한 칸은 채우고, 이번 주는 테두리, 미납은 빨강 */
export default function StampBoard({ s }) {
  const missed = s.weeks.filter((x) => x === 'gate' || x === 'lost').length;
  return (
    <section className="sec">
      <div className="sec-h">
        <h3>26주 도전 현황</h3>
        <span>
          완납 {doneCount(s)}주{missed ? ' · 미납 ' + missed + '주' : ''}
        </span>
      </div>
      <div className="stamps">
        {Array.from({ length: TOTAL }, (_, i) => {
          const w = i + 1;
          const x = s.weeks[w];
          return (
            <div key={w} className={`stamp ${x ?? ''}${w === s.wk && !s.matured && !x ? ' now' : ''}`} title={w + '주차 ' + (LABEL[x] ?? '예정')}>
              {w}
            </div>
          );
        })}
      </div>
      <div className="legend">
        <span className="lg">납입</span>
        <span className="lg lg-rescued">구제 후 재납입</span>
        <span className="lg lg-miss">미납</span>
      </div>
    </section>
  );
}

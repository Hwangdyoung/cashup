import { TOTAL, WK_REQ } from '../lib/rules.js';
import { RC } from '../lib/characters.js';
import { won } from '../lib/format.js';
import { amt, doneCount } from '../lib/savings.js';

const LABEL = { paid: '납입', rescued: '구제 후 재납입', gate: '페널티 게이트', lost: '미납 확정' };

/* 적금 상세 맨 위: N주차 도전중 + 26칸 도장판 (카카오뱅크 26주적금 상세 화면 구성 + 던전 밤하늘) */
export default function StampBoard({ s }) {
  const wk = Math.min(s.wk, TOTAL);
  // 칸 색: 그 주차까지 완납했을 때 도달하는 등급 색 (규칙의 완납 주차 기준)
  const colorAt = (w) => RC[WK_REQ.filter((need) => w >= need).length - 1];
  const missed = s.weeks.filter((x) => x === 'gate' || x === 'lost').length;
  return (
    <div className="challenge">
      <small>{s.matured ? '26주 도전 완료' : wk + '주차 도전중'}</small>
      <div className="amt">{won(amt(s, wk))}</div>
      <div className="amt-sub">
        완납 {doneCount(s)}주 · 미납 {missed}주
      </div>
      <div className="stamps">
        {Array.from({ length: TOTAL }, (_, i) => {
          const w = i + 1;
          const x = s.weeks[w];
          return (
            <div key={w} className={`stamp ${x ?? ''}${w === s.wk && !s.matured && !x ? ' now' : ''}`} style={{ '--sc': colorAt(w) }} title={w + '주차 ' + (LABEL[x] ?? '예정')}>
              {w}
            </div>
          );
        })}
      </div>
      <div className="legend">
        <span style={{ '--lc': '#47A6FF' }}>납입</span>
        <span style={{ '--lc': '#47A6FF', '--ls': 'inset 0 0 0 2px #FFD23F' }}>구제 후 재납입</span>
        <span style={{ '--lc': '#7A1E3A' }}>페널티 게이트</span>
        <span style={{ '--lc': 'rgba(255,93,120,.3)' }}>미납 확정</span>
      </div>
    </div>
  );
}

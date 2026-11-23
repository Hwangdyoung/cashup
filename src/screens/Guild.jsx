import TierList from '../components/TierList.jsx';
import { TIERS } from '../lib/rules.js';
import { tier } from '../lib/savings.js';

export const INVITE_CODE = 'HUNTER-7K2Q';
const COLORS = ['#47A6FF', '#3DD68C', '#FF8F45', '#A47BFF', '#FFD23F', '#FF5D78'];
const NAMES = '가나다라마바사아자차';
const SHOWN = 10;

/* 길드: 내 초대 코드 · 함께하는 헌터 · 구간표. 공개 길드는 없고 초대 코드로만 가입 */
export default function Guild({ s, onCopy, onJoin }) {
  const t = tier(s);
  const others = s.members - 1;
  const shown = Math.min(others, SHOWN);
  return (
    <>
      <div className="card">
        <h3>
          내 초대 코드<span>초대 코드로만 가입</span>
        </h3>
        <div className="code">
          <b>{INVITE_CODE}</b>
          <button type="button" className="btn sub" onClick={onCopy}>
            복사
          </button>
        </div>
        <p className="small">별도 미션 없이 함께하는 길드원 수에 따라 우대금리가 올라가요. 공개 길드는 없어요.</p>
      </div>
      <div className="card">
        <h3>
          함께하는 헌터<span>{s.members + '명' + (t < 0 ? '' : ' · ' + TIERS[t].n)}</span>
        </h3>
        <div className="mems">
          <div className="mem" style={{ background: 'var(--c)' }}>
            나
          </div>
          {Array.from({ length: shown }, (_, i) => (
            <div key={i} className="mem" style={{ background: COLORS[i % COLORS.length] }}>
              {NAMES[i]}
            </div>
          ))}
          {others > shown && <div className="mem more">+{others - shown}</div>}
        </div>
        <TierList current={t} style={{ marginTop: 10 }} />
        <button type="button" className="btn" onClick={onJoin}>
          친구가 코드로 가입 (시연)
        </button>
      </div>
    </>
  );
}

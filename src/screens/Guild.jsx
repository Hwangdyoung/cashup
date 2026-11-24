import TierList from '../components/TierList.jsx';
import { TIERS } from '../lib/rules.js';
import { pp } from '../lib/format.js';
import { tier } from '../lib/savings.js';

const NAMES = '가나다라마바사아자차';
const SHOWN = 10;

/* 길드: 초대 코드 · 함께하는 헌터 · 구간표. 공개 길드는 없고 초대 코드로만 함께한다
   (포스터: 초대 코드로 길드를 만들고, 인원이 늘수록 길드원 모두의 우대금리가 오른다) */
export default function Guild({ s, onCopy, onJoin }) {
  const t = tier(s);
  const others = s.members - 1;
  const shown = Math.min(others, SHOWN);
  const next = TIERS[t + 1];
  return (
    <>
      <div className="card">
        <h3>
          {s.guildOwner ? '내 길드 초대 코드' : '참여한 길드 코드'}
          <span>초대 코드로만 함께해요</span>
        </h3>
        <div className="code">
          <b>{s.guildCode}</b>
        </div>
        <p className="small">
          {s.guildOwner ? '내가 만든 길드예요.' : '친구 길드에 참여했어요. 이 코드로 다른 친구도 같은 길드에 들어와요.'} 인원이 늘면 길드원 모두의 우대금리가 함께 올라요.
        </p>
        <button type="button" className="kb-btn copy" onClick={onCopy}>
          초대 코드 복사하기
        </button>
      </div>
      <div className="card">
        <h3>
          함께하는 헌터
          <span>{s.members + '명' + (t < 0 ? ' · 우대 없음' : ' · ' + TIERS[t].n + ' ' + pp(TIERS[t].r))}</span>
        </h3>
        <div className="mems">
          <div className="mem me">나</div>
          {Array.from({ length: shown }, (_, i) => (
            <div key={i} className="mem">
              {NAMES[i]}
            </div>
          ))}
          {others > shown && <div className="mem more">+{others - shown}</div>}
        </div>
        {next && (
          <p className="small" style={{ marginTop: 8 }}>
            {next.n}까지 {next.min - s.members}명 더 모이면 {pp(next.r)}
          </p>
        )}
        <TierList current={t} style={{ marginTop: 10 }} />
        <div className="demo-row">
          <span className="demo-chip">시연</span>
          <span className="t">친구가 코드로 가입</span>
          <button type="button" onClick={onJoin}>
            +1명
          </button>
        </div>
      </div>
    </>
  );
}

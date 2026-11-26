import TierList from '../components/TierList.jsx';
import { GUILD_CAP, GUILD_DROP_MISS, RANK, TIERS } from '../lib/rules.js';
import { RC, RT } from '../lib/characters.js';
import { pp } from '../lib/format.js';
import { isDone, tier } from '../lib/savings.js';
import { guildFeed, guildMates, guildQuest, payDayName } from '../lib/guild.js';

const SHOWN = 5;

function Badge({ g }) {
  return (
    <b className="gm-badge hol" style={{ background: RC[g], color: RT[g] }}>
      {RANK[g]}
    </b>
  );
}

/* 길드: 이번 주 길드 퀘스트 · 함께하는 헌터 · 길드 소식 · 초대 코드
   길드원마다 주차가 다르다. 26주를 채운 길드원은 '수료'로 남아 인원에 계속 들어가고, 이번 주 퀘스트에서만 빠진다
   공개 길드는 없고 초대 코드로만 함께한다 (포스터). 길드원은 모두 시연용 가짜 데이터 (lib/guild.js) */
export default function Guild({ s, onCopy, onJoin, onNudge }) {
  const t = tier(s);
  const next = TIERS[t + 1];
  const mates = guildMates(s);
  const q = guildQuest(s);
  const feed = guildFeed(s);
  const solo = mates.length === 0;
  const myPaid = isDone(s.weeks[s.wk]);
  const full = s.members >= GUILD_CAP;

  const invite = (
    <div className="card">
      <h3>
        {s.guildOwner ? '내 길드 초대 코드' : '참여한 길드 코드'}
        <span>초대 코드로만 함께해요</span>
      </h3>
      <div className="code">
        <b>{s.guildCode}</b>
      </div>
      <p className="small">
        {full
          ? `정원 ${GUILD_CAP}명이 모두 찼어요. 더 초대하려면 친구가 새 길드를 만들어야 해요.`
          : `${solo ? '아직 혼자예요. 친구가 이 코드로 가입하면 같은 길드가 되고, ' : ''}인원이 늘면 길드원 모두의 우대금리가 함께 올라요. 한 길드는 최대 ${GUILD_CAP}명이에요.`}
      </p>
      <p className="small gm-fix">길드는 가입할 때 정해서 만기까지 바꿀 수 없어요.</p>
      <button type="button" className="kb-btn copy" onClick={onCopy} disabled={full}>
        {full ? '정원이 찼어요' : '초대 코드 복사하기'}
      </button>
      <div className="demo-row">
        <span className="demo-chip">시연</span>
        <span className="t">친구가 코드로 가입</span>
        <button type="button" onClick={onJoin} disabled={full}>
          +1명
        </button>
      </div>
    </div>
  );

  return (
    <>
      {solo && invite}

      {!solo && !s.matured && (
        <div className="card">
          <h3>
            이번 주 길드 퀘스트
            <span>납입할 차례 {q.total}명</span>
          </h3>
          <p className="gq-goal">길드원 전원 이번 주 납입</p>
          <p className="gq-count">
            <b>{q.paid}</b> / {q.total}명
            {q.done && <em>완료</em>}
          </p>
          <div className="gq-bar" role="progressbar" aria-valuemin={0} aria-valuemax={q.total} aria-valuenow={q.paid}>
            <i style={{ width: (q.paid / q.total) * 100 + '%' }} />
          </div>
          <p className="small gq-note">
            {q.total === 1 ? '이번 주 납입할 길드원은 나뿐이에요. 다른 길드원은 모두 수료했어요.' : q.done ? '이번 주는 모두 해냈어요. 다음 주도 같이 가요.' : !myPaid ? '내 납입부터 채워 주세요.' : '아직 납입 전인 길드원이 있어요.'}
          </p>
        </div>
      )}

      {!solo && (
        <div className="card">
          <h3>
            함께하는 헌터
            <span>{s.members + ' / ' + GUILD_CAP + '명' + (t < 0 ? ' · 우대 없음' : ' · ' + TIERS[t].n + ' ' + pp(TIERS[t].r))}</span>
          </h3>
          <ul className="gm-list">
            <li className="gm-me">
              <Badge g={s.grade} />
              <span className="gm-who">
                <strong>나</strong>
                <small>{s.matured ? '수료' : s.wk + '주차'} · 그림자 병사 {s.grade}명</small>
              </span>
              <span className={'gm-st' + (myPaid || s.matured ? ' ok' : '')}>{s.matured ? '수료' : myPaid ? '납입 완료' : '납입 전'}</span>
            </li>
            {mates.slice(0, SHOWN).map((m) => (
              <li key={m.i} className={m.risk ? 'gm-risk' : ''}>
                <Badge g={m.grade} />
                <span className="gm-who">
                  <strong>{m.name}</strong>
                  <small>{m.risk ? `${GUILD_DROP_MISS}주 연속 미납 · 정산 인원 제외 위험` : `${m.graduated ? '수료' : m.week + '주차'} · 그림자 병사 ${m.grade}명`}</small>
                </span>
                {m.risk ? (
                  <button type="button" className="gm-nudge" disabled={m.nudged} onClick={() => onNudge(m.i)}>
                    {m.nudged ? '독려함' : '독려하기'}
                  </button>
                ) : (
                  <span className={'gm-st' + (m.paid ? ' ok' : '') + (m.graduated ? ' grad' : '')}>{m.graduated ? '수료' : m.paid ? '납입 완료' : payDayName(m) + ' 납입'}</span>
                )}
              </li>
            ))}
          </ul>
          {mates.length > SHOWN && <p className="small gm-more">외 {mates.length - SHOWN}명</p>}
          {next && (
            <p className="small" style={{ marginTop: 12 }}>
              {next.n}까지 {next.min - s.members}명 더 모이면 {pp(next.r)}
            </p>
          )}
          <TierList current={t} style={{ marginTop: 10 }} />
        </div>
      )}

      {!solo && feed.length > 0 && (
        <div className="card">
          <h3>길드 소식</h3>
          <ul className="gf-list">
            {feed.map((e, k) => (
              <li key={k}>
                <span>{e.text}</span>
                <time>{e.when}</time>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!solo && invite}
    </>
  );
}

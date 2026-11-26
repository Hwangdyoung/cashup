import { GUILD_DROP_MISS, LAST, PAY_DAYS, RANK, WK_REQ } from './rules.js';
import { isDone } from './savings.js';

/* 시연용 길드원 (실제 사람·데이터 아님)
   s.members 만 상태로 두고, 길드원 한 명 한 명의 모습은 번호와 지금 주·요일로 정해진다.
   같은 상태면 늘 같은 화면이 나와야 하므로 무작위를 쓰지 않는다.
   - 3번째 길드원은 납입을 미루는 사람: 연속 미납이 GUILD_DROP_MISS 주가 되면 '만기 정산 때 제외' 경고
     → '독려하기'를 누르면 다음 날 밀린 납입을 정리하고 정상으로 돌아온다 */

const NICKS = ['새벽러너', '만보왕', '짠테크고수', '저축요정', '걷는곰', '야근헌터', '적금새싹', '동네러너', '절약대장', '퇴근헌터', '주말등산러', '커피줄이기'];
export const mateName = (i) => NICKS[i] ?? '헌터' + String(i + 1).padStart(2, '0');

const SLACKER = 2;
/* 시간 순서를 비교하려고 (주, 요일)을 하루 단위 숫자 하나로 */
export const clock = (s) => (s.wk - 1) * 7 + s.day;

function gradeByWeeks(w) {
  let g = 0;
  for (let k = 1; k <= LAST; k++) if (w >= WK_REQ[k]) g = k;
  return g;
}

export function guildMates(s) {
  const now = clock(s);
  const nudged = s.nudged || {};
  const out = [];
  for (let i = 0; i < Math.max(0, s.members - 1); i++) {
    const payDay = (i * 3 + 1) % 7;
    const lag = i % 3; // 늦게 시작했거나 가끔 놓친 주
    const recovered = nudged[i] !== undefined && now > nudged[i];
    const slack = i === SLACKER && !recovered;
    const missStreak = slack ? Math.min(s.wk - 1, GUILD_DROP_MISS) : 0;
    const paid = s.matured || (!slack && (recovered || s.day >= payDay));
    const weeksDone = Math.max(0, s.wk - 1 - lag - missStreak) + (paid ? 1 : 0);
    const grade = gradeByWeeks(weeksDone);
    /* 이번 주 납입으로 등급 문턱을 막 넘었는지 (소식용) */
    const rankedUp = paid && grade > 0 && weeksDone === WK_REQ[grade];
    out.push({ i, name: mateName(i), payDay, paid, missStreak, risk: missStreak >= GUILD_DROP_MISS, nudged: nudged[i] !== undefined, recovered, grade, rankedUp });
  }
  return out;
}

/* 이번 주 길드 퀘스트: 나를 포함한 길드원 전원 납입 */
export function guildQuest(s) {
  const mates = guildMates(s);
  const paid = mates.filter((m) => m.paid).length + (isDone(s.weeks[s.wk]) ? 1 : 0);
  const total = mates.length + 1;
  return { paid, total, done: total > 1 && paid === total };
}

/* 길드 소식: 최근 일부터 n개 { t, text } */
export function guildFeed(s, n = 4) {
  const now = clock(s);
  const weekStart = (s.wk - 1) * 7;
  const ev = [];
  for (const m of guildMates(s)) {
    if (m.recovered) ev.push({ t: s.nudged[m.i] + 1, text: `${m.name}님이 밀린 납입을 정리했어요` });
    else if (m.paid && !s.matured) ev.push({ t: weekStart + m.payDay, text: `${m.name}님이 ${s.wk}주차 납입했어요` });
    if (m.rankedUp && !s.matured) ev.push({ t: (m.recovered ? s.nudged[m.i] + 1 : weekStart + m.payDay) + 0.1, text: `${m.name}님이 ${RANK[m.grade]}급이 됐어요` });
    if (m.risk) ev.push({ t: weekStart, text: `${m.name}님이 ${GUILD_DROP_MISS}주 연속 미납이에요` });
  }
  for (const j of s.guildLog || []) ev.push({ t: j.t - 0.2, text: `${mateName(j.i)}님이 초대 코드로 합류했어요` });
  return ev
    .filter((e) => e.t <= now + 0.5)
    .sort((a, b) => b.t - a.t)
    .slice(0, n)
    .map((e) => ({ ...e, when: whenLabel(now - Math.floor(e.t)) }));
}

const whenLabel = (d) => (d <= 0 ? '오늘' : d === 1 ? '어제' : d < 7 ? d + '일 전' : Math.floor(d / 7) + '주 전');

export const payDayName = (m) => PAY_DAYS[m.payDay] + '요일';

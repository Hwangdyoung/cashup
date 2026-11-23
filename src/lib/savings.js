import { AWAKEN_EXP, BASE_RATE, DEMO_GUILD_MEMBERS, EXP_REQ, GUILD_MAX, LAST, RANK, S_BONUS, TICKETS, TIERS, TOTAL, WK_REQ } from './rules.js';

/* 적금 상태 하나
   joined: 가입했는지 (가입 전에는 카카오뱅크 홈·콜라보 페이지만)
   payDay: 자동이체 요일 (rules.js PAY_DAYS 번호) · guildCode / guildOwner: 내 길드 코드, 내가 만든 길드인지
   weeks[w]: null 예정 · 'paid' 납입 · 'rescued' 구제 후 재납입 · 'gate' 페널티 게이트(구제 대기) · 'lost' 미납 확정
   walkExp: 걷기로 받은 보너스 EXP 합계 (히든 각성 판정용) */
export const fresh = () => ({
  joined: false,
  base: 1000,
  payDay: 1,
  guildCode: null,
  guildOwner: true,
  wk: 1,
  day: 0,
  weeks: Array(TOTAL + 1).fill(null),
  exp: 0,
  walkExp: 0,
  steps: 0,
  goalDone: false,
  walkDays: [false, false, false, false, false, false, false],
  stepsAll: 0,
  tickets: TICKETS,
  members: 1,
  grade: 0,
  matured: false,
  resultShown: false,
});

/* 가입: 시작 금액 · 자동이체 요일 · 길드(만들기 / 받은 코드로 참여) */
export function openSavings({ base, payDay = 1, guild = { mode: 'create', code: makeGuildCode() } }) {
  return {
    ...fresh(),
    joined: true,
    base,
    payDay,
    guildCode: guild.code,
    guildOwner: guild.mode === 'create',
    members: guild.mode === 'join' ? DEMO_GUILD_MEMBERS + 1 : 1,
  };
}
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const makeGuildCode = () => 'HUNTER-' + Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

/* 만기 원금: 1주차 base, 2주차 2×base … 26주차 26×base */
export const maturityPrincipal = (base) => (base * TOTAL * (TOTAL + 1)) / 2;

export const amt = (s, w) => s.base * w;
export const isDone = (st) => st === 'paid' || st === 'rescued';
export const doneCount = (s) => s.weeks.filter(isDone).length;
export const lostCount = (s) => s.weeks.filter((x) => x === 'lost').length;
export const gates = (s) => {
  const r = [];
  for (let w = 1; w <= TOTAL; w++) if (s.weeks[w] === 'gate') r.push(w);
  return r;
};
export const principal = (s) => {
  let sum = 0;
  for (let w = 1; w <= TOTAL; w++) if (isDone(s.weeks[w])) sum += amt(s, w);
  return sum;
};
export const tier = (s) => {
  for (let i = TIERS.length - 1; i >= 0; i--) if (s.members >= TIERS[i].min) return i;
  return -1;
};
export const guildBonus = (s) => {
  const t = tier(s);
  return t < 0 ? 0 : TIERS[t].r;
};
export const awakened = (s) => s.walkExp >= AWAKEN_EXP;

export function gradeOf(s) {
  let g = 0;
  const done = doneCount(s);
  for (let i = 1; i < RANK.length; i++) if (s.exp >= EXP_REQ[i] && done >= WK_REQ[i]) g = i;
  return g;
}

/* S급 달성(26주 완납) 우대 상태
   done 달성 · prog 진행 중 · risk 미납 구제 대기 · fail 미납 확정으로 받을 수 없음 */
export function sStatus(s) {
  const done = doneCount(s);
  if (s.weeks.includes('lost')) return { st: 'fail', done };
  if (gradeOf(s) === LAST) return { st: 'done', done };
  return { st: gates(s).length ? 'risk' : 'prog', done };
}

/* now: 지금까지 확보 · exp: 이대로 끝까지 납입하면 · max: 남은 우대를 모두 받으면 */
export function rates(s) {
  const st = sStatus(s);
  const g = guildBonus(s);
  const sNow = st.st === 'done' ? S_BONUS : 0;
  const sExp = st.st === 'done' || st.st === 'prog' ? S_BONUS : 0;
  const sMax = st.st === 'fail' ? 0 : S_BONUS;
  return { now: BASE_RATE + g + sNow, exp: BASE_RATE + g + sExp, max: BASE_RATE + GUILD_MAX + sMax, s: st, sNow, sExp, guild: g };
}

/* 만기 이자 (세전 · 단순 계산): 주차마다 남은 기간만큼 이자를 붙인다
   allFuture: 아직 안 낸 주차(예정·게이트)도 낸다고 치고 계산 */
export function interestFor(s, rate, allFuture) {
  let i = 0;
  let p = 0;
  for (let w = 1; w <= TOTAL; w++) {
    const st = s.weeks[w];
    if (isDone(st) || (allFuture && (st === null || st === 'gate'))) {
      const a = amt(s, w);
      p += a;
      i += (((a * rate) / 100) * ((TOTAL - w + 1) * 7)) / 365;
    }
  }
  return { p, i };
}

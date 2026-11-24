import { EXP_PAY, EXP_WALK, TIERS, TOTAL, WALK_GOAL } from './rules.js';
import { amt, gates, gradeOf, isDone, rates, tier } from './savings.js';
import { fmt, pct, pp, won } from './format.js';

/* 상태 바꾸기
   모든 함수는 (s, ...) 를 받아 s 를 직접 고치고, 화면이 할 일(효과) 목록을 돌려준다.
   App은 상태를 복사한 뒤 함수에 넘기고, 돌아온 효과를 차례로 처리한다.
   효과: { type:'sys', text, kind, snd } 알림 · { type:'sfx', name } 소리 · { type:'pop' } 헌터 반짝
        { type:'rankUp', from, to } 승급 연출 · { type:'result', delay } 만기 결과
   알림 글: 첫 줄 '[...]' 은 제목, '{...}' 은 강조, 다음 줄부터 설명 */

const sys = (text, kind = '', snd) => ({ type: 'sys', text, kind, snd });

function checkGrade(s, fx) {
  const g = gradeOf(s);
  if (g <= s.grade) return false;
  fx.push({ type: 'rankUp', from: s.grade, to: g });
  s.grade = g;
  return true;
}

/* 마지막 주가 정리되고(납입 또는 미납 확정) 남은 게이트가 없으면 만기 */
function checkMature(s, fx) {
  if (s.resultShown) return false;
  const last = s.weeks[TOTAL];
  if (!last || last === 'gate' || gates(s).length) return false;
  s.matured = true;
  s.resultShown = true;
  const up = checkGrade(s, fx);
  fx.push({ type: 'result', delay: up ? 4200 : 900 });
  return true;
}

function payWeek(s) {
  const w = s.wk;
  if (s.matured || w > TOTAL || s.weeks[w]) return false;
  s.weeks[w] = 'paid';
  s.exp += EXP_PAY;
  return true;
}

/* 오늘 걷기 목표 달성: EXP와 히든 각성용 걷기 EXP를 함께 쌓음 */
function walkGoal(s) {
  s.goalDone = true;
  s.walkDays[s.day] = true;
  s.exp += EXP_WALK;
  s.walkExp += EXP_WALK;
}
function autoWalkDay(s, autoWalk) {
  if (autoWalk && !s.goalDone) {
    walkGoal(s);
    s.stepsAll += WALK_GOAL;
  }
}
function resetDay(s) {
  s.steps = 0;
  s.goalDone = false;
}
function resetWeek(s) {
  s.day = 0;
  resetDay(s);
  s.walkDays = s.walkDays.map(() => false);
}

function missCurrent(s, fx, quiet) {
  const w = s.wk;
  if (s.matured || s.weeks[w]) return;
  if (s.tickets > 0) {
    s.weeks[w] = 'gate';
    if (!quiet) fx.push(sys('[{페널티 게이트}가 열렸습니다]\n' + w + '주차 납입을 놓쳤어요 · 홈에서 유예권으로 구제', 'warn'));
  } else {
    s.weeks[w] = 'lost';
    if (!quiet) fx.push(sys('[{' + w + '주차 미납}이 확정되었습니다]\n유예권을 모두 써서 S급 우대가 사라졌어요', 'warn'));
  }
}

function advanceWeek(s, fx, autoWalk) {
  for (let d = s.day; d < 7; d++) {
    s.day = d;
    autoWalkDay(s, autoWalk);
    s.goalDone = false;
  }
  if (!s.weeks[s.wk]) missCurrent(s, fx, true);
  resetWeek(s);
  if (s.wk < TOTAL) s.wk++;
  /* 마지막 주가 미납 확정으로 끝난 경우에도 만기 결과가 뜨도록 */
  checkMature(s, fx);
}

/* ───── 사용자 행동 ───── */

export function pay(s) {
  const fx = [];
  const w = s.wk;
  if (!payWeek(s)) return fx;
  fx.push({ type: 'pop' }, sys('[{주간 퀘스트}를 완료했습니다]\n' + w + '주차 ' + won(amt(s, w)) + ' 납입 · EXP +' + fmt(EXP_PAY), '', 'level'));
  checkGrade(s, fx);
  checkMature(s, fx);
  return fx;
}

export function walk(s, n) {
  const fx = [];
  s.steps += n;
  s.stepsAll += n;
  if (!s.goalDone && s.steps >= WALK_GOAL) {
    walkGoal(s);
    fx.push(sys('[{일일 퀘스트}를 완료했습니다]\n' + fmt(WALK_GOAL) + '보 달성 · EXP +' + fmt(EXP_WALK), 'gold', 'coin'));
  } else fx.push({ type: 'sfx', name: 'step' });
  checkGrade(s, fx);
  return fx;
}

export function addMates(s, n) {
  const fx = [];
  const t0 = tier(s);
  s.members += n;
  const t1 = tier(s);
  if (t1 !== t0) fx.push(sys('[{' + TIERS[t1].n + '} 구간에 들어섰습니다]\n길드원 ' + s.members + '명 · 우대금리 ' + pp(TIERS[t1].r), 'gold'));
  else fx.push(sys('[{길드원}이 합류했습니다]\n함께하는 헌터 ' + s.members + '명' + (t1 < TIERS.length - 1 ? ' · 다음 구간까지 ' + (TIERS[t1 + 1].min - s.members) + '명' : ''), '', 'coin'));
  return fx;
}

/* ───── 페널티 게이트 ───── */

/* 게임을 시작하면 유예권 1장 사용 */
export function useTicket(s) {
  if (s.tickets > 0) s.tickets--;
  return [];
}

/* 게임에서 통과하지 못하고 나옴 (used: 이번에 유예권을 썼는지) */
export function gameFailed(s, w, used) {
  const fx = [];
  if (!used) return fx;
  if (s.tickets > 0) {
    fx.push(sys('[{유예권 1장}을 사용했습니다]\n' + w + '주차 구제 실패 · 남은 유예권 ' + s.tickets + '장', 'warn'));
    return fx;
  }
  s.weeks[w] = 'lost';
  gates(s).forEach((x) => (s.weeks[x] = 'lost'));
  fx.push(sys('[{' + w + '주차 미납}이 확정되었습니다]\n유예권을 모두 써서 S급 우대가 사라졌어요', 'warn'));
  checkMature(s, fx);
  return fx;
}

/* 페널티 퀘스트 통과 후 재납입 → 완납으로 인정 */
export function repay(s, w) {
  const fx = [];
  if (s.weeks[w] !== 'gate') return fx;
  s.weeks[w] = 'rescued';
  s.exp += EXP_PAY;
  fx.push(sys('[{' + w + '주차 재납입}을 완료했습니다]\n완납으로 인정됩니다 · EXP +' + fmt(EXP_PAY), 'gold'));
  checkGrade(s, fx);
  checkMature(s, fx);
  return fx;
}

/* ───── 시연 컨트롤 ───── */

export function nextDay(s, { autoWalk }) {
  const fx = [];
  if (s.matured) return fx;
  autoWalkDay(s, autoWalk);
  if (s.day < 6) {
    s.day++;
    resetDay(s);
    fx.push(sys('[{일일 퀘스트}가 도착했습니다]\n오늘 목표 ' + fmt(WALK_GOAL) + '보'));
    checkGrade(s, fx);
    return fx;
  }
  advanceWeek(s, fx, autoWalk);
  return fx;
}

export function demoWeek(s, { autoWalk }) {
  const fx = [];
  if (s.matured) return fx;
  if (!s.weeks[s.wk]) payWeek(s);
  const w = s.wk;
  advanceWeek(s, fx, autoWalk);
  if (w >= TOTAL || s.matured) return fx;
  fx.push(sys('[{' + s.wk + '주차} 던전에 입장했습니다]\n' + (isDone(s.weeks[w]) ? w + '주차 납입 완료 · ' : '') + '이번 주 납입액 ' + won(amt(s, s.wk)), '', 'level'));
  checkGrade(s, fx);
  return fx;
}

export function demoFive(s, { autoWalk }) {
  const fx = [];
  if (s.matured) return fx;
  let k = 0;
  for (let i = 0; i < 5 && !s.matured; i++) {
    if (!s.weeks[s.wk] && payWeek(s)) k++;
    const last = s.wk >= TOTAL;
    advanceWeek(s, fx, autoWalk);
    if (last) break;
  }
  if (s.matured) return fx;
  fx.push(sys('[{' + k + '주 연속} 납입했습니다]\n' + s.wk + '주차 · EXP ' + fmt(s.exp) + ' · 만기 예상 ' + pct(rates(s).exp), '', 'level'));
  checkGrade(s, fx);
  return fx;
}

export function demoMiss(s) {
  const fx = [];
  if (s.matured) return fx;
  if (s.weeks[s.wk]) {
    fx.push(sys('[이번 주는 이미 처리되었습니다]\n다음 주로 넘어간 뒤 시도해 주세요', '', 'deny'));
    return fx;
  }
  missCurrent(s, fx, false);
  resetWeek(s);
  if (s.wk < TOTAL) s.wk++;
  checkMature(s, fx);
  return fx;
}

/* 25주차로 이동: 빈 주차는 납입, 걷기는 '건너뛴 날 자동 달성' 설정을 따름 */
export function demoTo25(s, { autoWalk }) {
  const fx = [];
  if (s.matured) return fx;
  while (s.wk < 25) {
    if (!s.weeks[s.wk]) {
      s.weeks[s.wk] = 'paid';
      s.exp += EXP_PAY;
    }
    for (let d = s.day; d < 7; d++) {
      s.day = d;
      autoWalkDay(s, autoWalk);
      s.goalDone = false;
    }
    resetWeek(s);
    s.wk++;
  }
  fx.push(sys('[{25주차}로 이동했습니다]\n이번 주와 다음 주 납입으로 만기에 도전하세요'));
  checkGrade(s, fx);
  return fx;
}


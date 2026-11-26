import { describe, expect, it } from 'vitest';
import { AWAKEN_EXP, DEMO_GUILD_CODE, GUILD_CODE_RE, GUILD_DROP_MISS, MAX_RATE, TICKETS, TIERS, TOTAL } from '../lib/rules.js';
import { awakened, gradeOf, makeGuildCode, maturityPrincipal, openSavings, principal, rates, tier } from '../lib/savings.js';
import { addMates, demoFinish, demoMiss, demoTo25, demoWeek, gameFailed, nextDay, nudgeMate, pay, repay, useTicket, walk } from '../lib/actions.js';
import { guildFeed, guildMates, guildQuest } from '../lib/guild.js';

/* CLAUDE.md '확정된 상품 규칙'이 코드에 그대로 들어갔는지 본다 */
const start = (base = 1000) => openSavings({ base });
const payAll = (s, opts = { autoWalk: false }) => {
  while (!s.matured) demoWeek(s, opts);
  return s;
};

describe('금리', () => {
  it('최고 금리는 2.0 + 2.0 + 3.0 = 7.0%', () => {
    expect(MAX_RATE).toBe(7);
    const r = rates(start());
    expect([r.now, r.exp, r.max]).toEqual([2, 5, 7]);
  });

  it('길드 구간: 파티 +0.5 / 레이드 +1.0 / 길드 +1.5 / 연합 +2.0', () => {
    const s = start();
    const at = (n) => {
      s.members = n;
      return rates(s).guild;
    };
    expect([at(1), at(2), at(5), at(6), at(14), at(15), at(29), at(30)]).toEqual([0, 0.5, 0.5, 1, 1, 1.5, 1.5, 2]);
  });

  it('26주 완납하면 S급 우대 3.0%p를 받는다', () => {
    const s = payAll(start());
    expect(s.grade).toBe(5);
    expect(rates(s).now).toBe(5);
    expect(principal(s)).toBe(maturityPrincipal(1000));
    expect(maturityPrincipal(1000)).toBe(351000);
    expect(maturityPrincipal(10000)).toBe(3510000);
  });
});

describe('EXP · 등급', () => {
  it('납입 +1,000, 8,000보 +100, 10,000보 보너스는 없다', () => {
    const s = start();
    pay(s);
    expect(s.exp).toBe(1000);
    walk(s, 8000);
    expect(s.exp).toBe(1100);
    walk(s, 4000);
    expect(s.exp).toBe(1100);
  });

  it('EXP와 완납 주차를 동시에 채워야 승급 (D: 5,000 · 5주)', () => {
    const s = start();
    s.exp = 9000;
    for (let w = 1; w <= 4; w++) s.weeks[w] = 'paid';
    expect(gradeOf(s)).toBe(0);
    s.weeks[5] = 'paid';
    expect(gradeOf(s)).toBe(1);
  });
});

describe('히든 각성', () => {
  it('걷기 보너스 EXP 10,000 이상이면 열린다', () => {
    const s = start();
    demoTo25(s, { autoWalk: true });
    expect(s.walkExp).toBeGreaterThanOrEqual(AWAKEN_EXP);
    expect(awakened(s)).toBe(true);
  });
  it('걷기 자동 달성을 끄면 쌓이지 않는다', () => {
    const s = start();
    demoTo25(s, { autoWalk: false });
    expect(s.walkExp).toBe(0);
  });
});

describe('미납 · 유예권', () => {
  it('유예권 2장, 다 쓰면 미납 확정되고 S급 우대가 사라진다', () => {
    const s = start();
    demoMiss(s);
    expect(s.weeks[1]).toBe('gate');
    expect(s.tickets).toBe(TICKETS);
    useTicket(s);
    gameFailed(s, 1, true);
    expect(s.weeks[1]).toBe('gate');
    useTicket(s);
    gameFailed(s, 1, true);
    expect(s.weeks[1]).toBe('lost');
    expect(rates(s).s.st).toBe('fail');
    expect(rates(s).max).toBe(4);
  });

  it('페널티 퀘스트 통과 후 재납입하면 완납으로 인정', () => {
    const s = start();
    demoMiss(s);
    useTicket(s);
    repay(s, 1);
    expect(s.weeks[1]).toBe('rescued');
    expect(rates(s).s.st).toBe('prog');
  });

  it('26주차가 미납 확정으로 끝나도 만기 결과가 뜬다', () => {
    const s = start();
    s.tickets = 0;
    demoTo25(s, { autoWalk: false });
    pay(s);
    demoWeek(s, { autoWalk: false });
    let fx = [];
    for (let i = 0; i < 7; i++) fx = fx.concat(nextDay(s, { autoWalk: false }));
    expect(s.weeks[TOTAL]).toBe('lost');
    expect(s.matured).toBe(true);
    expect(fx.some((f) => f.type === 'result')).toBe(true);
  });
});

describe('길드원 합류 알림', () => {
  it('구간이 바뀌면 금색 알림', () => {
    const s = start();
    const fx = addMates(s, 1);
    expect(fx[0].kind).toBe('gold');
  });
});

describe('길드 (포스터: 초대 코드로 만들기 · 참여)', () => {
  it('구간 이름은 파티 · 공격대 · 길드 · 연합 길드', () => {
    expect(TIERS.map((t) => t.n)).toEqual(['파티', '공격대', '길드', '연합 길드']);
  });
  it('길드를 만들면 나 혼자, 내 코드가 생긴다', () => {
    const s = openSavings({ base: 1000, guild: { mode: 'create', code: makeGuildCode() } });
    expect(s.members).toBe(1);
    expect(s.guildOwner).toBe(true);
    expect(GUILD_CODE_RE.test(s.guildCode)).toBe(true);
    expect(rates(s).guild).toBe(0);
  });
  it('받은 코드로 참여하면 바로 파티 구간', () => {
    const s = openSavings({ base: 1000, guild: { mode: 'join', code: DEMO_GUILD_CODE } });
    expect(s.guildOwner).toBe(false);
    expect(tier(s)).toBe(0);
    expect(rates(s).guild).toBe(0.5);
  });
});

describe('시연: 만기 · 히든 각성 바로 보기', () => {
  it('게이트를 정리하고 S급 · 히든 각성으로 만기, 걷기 EXP는 26주 최대치를 넘지 않음', () => {
    const s = openSavings({ base: 1000 });
    demoMiss(s);
    const fx = demoFinish(s);
    expect(s.matured).toBe(true);
    expect(s.grade).toBe(5);
    expect(awakened(s)).toBe(true);
    expect(s.walkExp).toBeLessThanOrEqual(TOTAL * 7 * 100);
    expect(fx.some((f) => f.type === 'result')).toBe(true);
  });
});

describe('길드 협동 (시연용 길드원)', () => {
  it('혼자면 길드 퀘스트가 없고, 길드원이 있으면 전원 납입 때 완료 알림', () => {
    const solo = start();
    expect(guildQuest(solo).done).toBe(false);
    const s = start();
    addMates(s, 1); // 1번 길드원은 화요일(1) 납입
    nextDay(s, { autoWalk: false });
    expect(guildMates(s)[0].paid).toBe(true);
    const fx = pay(s);
    expect(guildQuest(s).done).toBe(true);
    expect(fx.some((f) => f.type === 'sys' && f.text.includes('길드 주간 퀘스트'))).toBe(true);
  });

  it(`${GUILD_DROP_MISS}주 연속 미납한 길드원은 경고, 독려하면 다음 날 정리`, () => {
    const s = start();
    addMates(s, 3);
    demoWeek(s, { autoWalk: false });
    demoWeek(s, { autoWalk: false });
    const lazy = guildMates(s)[2];
    expect(lazy.missStreak).toBe(GUILD_DROP_MISS);
    expect(lazy.risk).toBe(true);
    expect(guildQuest(s).done).toBe(false);
    expect(nudgeMate(s, 2).length).toBe(1);
    expect(nudgeMate(s, 2).length).toBe(0); // 같은 사람에게 두 번은 안 보냄
    nextDay(s, { autoWalk: false });
    const after = guildMates(s)[2];
    expect(after.risk).toBe(false);
    expect(after.paid).toBe(true);
    expect(guildFeed(s).some((e) => e.text.includes('밀린 납입'))).toBe(true);
  });
});

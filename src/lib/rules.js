/* 상품 규칙 (CLAUDE.md '확정된 상품 규칙'과 1:1로 맞춤)
   규칙 숫자는 여기서만 바꾸고, 화면 문구는 이 값으로 만든다. */

export const TOTAL = 26; // 기간 26주
export const AMTS = [1000, 2000, 3000, 5000, 10000]; // 시작 금액 1천~1만 원 (매주 같은 금액씩 증액)

/* 금리: 기본 2.0% + 길드 우대 최대 2.0%p + S급 달성(26주 완납) 우대 3.0%p = 최고 7.0% */
export const BASE_RATE = 2.0;
export const S_BONUS = 3.0;
export const TIERS = [
  { min: 2, max: 5, n: '파티', d: '소규모 던전 공략 기본 단위', r: 0.5 },
  { min: 6, max: 14, n: '레이드 공격대', d: '보스 던전에 도전하는 협력 조직', r: 1.0 },
  { min: 15, max: 29, n: '길드', d: '던전 공략을 이어 가는 조직', r: 1.5 },
  { min: 30, max: Infinity, n: '연합 길드', d: '여러 조직이 힘을 모은 대연합', r: 2.0 },
];
export const GUILD_MAX = TIERS[TIERS.length - 1].r;
export const MAX_RATE = BASE_RATE + GUILD_MAX + S_BONUS;

/* EXP: 주간 납입 +1,000 / 하루 8,000보 달성 시 +100 */
export const EXP_PAY = 1000;
export const EXP_WALK = 100;
export const WALK_GOAL = 8000;

/* 등급: EXP와 완납 주차를 동시에 채워야 승급 */
export const RANK = ['E', 'D', 'C', 'B', 'A', 'S'];
export const LAST = RANK.length - 1;
export const EXP_REQ = [0, 5000, 10000, 15000, 20000, 26000];
export const WK_REQ = [0, 5, 10, 15, 20, 26];

/* 히든 각성: 만기까지 걷기 보너스 EXP가 이 값 이상이면 캐릭터별 최종 연출 */
export const AWAKEN_EXP = 10000;

/* 미납: 유예권 2장, 1장당 페널티 퀘스트 1회 */
export const TICKETS = 2;
export const TRIES_PER_TICKET = 1;

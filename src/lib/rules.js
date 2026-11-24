/* 상품 규칙 (CLAUDE.md '확정된 상품 규칙'과 1:1로 맞춤)
   규칙 숫자는 여기서만 바꾸고, 화면 문구는 이 값으로 만든다. */

export const TOTAL = 26; // 기간 26주
export const AMTS = [1000, 2000, 3000, 5000, 10000]; // 시작 금액 1천~1만 원 (매주 같은 금액씩 증액)

/* 금리: 기본 2.0% + 길드 우대 최대 2.0%p + S급 달성(26주 완납) 우대 3.0%p = 최고 7.0% */
export const BASE_RATE = 2.0;
export const S_BONUS = 3.0;
/* 길드 구간 (포스터 문구). 초대 코드로 길드를 만들거나 받은 코드로 참여, 인원이 늘수록 길드원 모두의 우대금리가 오른다 */
export const TIERS = [
  { min: 2, max: 5, n: '파티', d: '소규모 던전 공략', r: 0.5 },
  { min: 6, max: 14, n: '공격대', d: '강한 보스에 도전하는 조직', r: 1.0 },
  { min: 15, max: 29, n: '길드', d: '던전 클리어를 이어가는 조직', r: 1.5 },
  { min: 30, max: Infinity, n: '연합 길드', d: '여러 조직이 모인 대규모 길드 연합', r: 2.0 },
];

/* 시연용 길드: 받은 초대 코드로 참여하면 이미 있는 길드원 수 (나를 더하면 파티 구간) */
export const DEMO_GUILD_CODE = 'HUNTER-7K2Q';
export const DEMO_GUILD_MEMBERS = 3;
export const GUILD_CODE_RE = /^HUNTER-[A-Z0-9]{4}$/;

/* 자동이체 요일 (월=0 … 일=6) */
export const PAY_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
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

/* 히든 각성: 만기까지 걷기 보너스 EXP가 이 값 이상이면 최종 연출 + 추가 리워드(예정) */
export const AWAKEN_EXP = 10000;

/* 미납: 유예권 2장, 1장당 페널티 퀘스트 1회 */
export const TICKETS = 2;
export const TRIES_PER_TICKET = 1;

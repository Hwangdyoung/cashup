import { RANK, TOTAL } from './rules.js';
import { BELLION_ART, RC, RT, SHADOW_ART, hunterArt } from './characters.js';
import { fmt } from './format.js';
import { awakened, doneCount, rates } from './savings.js';

/* 만기 결과 공유 카드 (1080×1350, 인스타 피드 4:5)
   등급 · 성진우 · 합류한 그림자 병사 · 완납 주 · 걷기 EXP · 최종 금리
   받는 금액·원금은 개인 금융 정보라 넣지 않는다 */

export const SHARE_URL = 'https://cashup-sololevel.vercel.app';
const W = 1080;
const H = 1350;
const HOL = 'HeirOfLight';
const SANS = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", sans-serif';

const load = (src) =>
  new Promise((ok, no) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = no;
    i.src = src;
  });

/* 바닥선(y)에 발을 맞춰 높이 h로 그린다 */
function stand(c, img, cx, floor, h, glow, alpha = 1) {
  const w = (h * img.width) / img.height;
  c.save();
  c.globalAlpha = alpha;
  c.shadowColor = glow;
  c.shadowBlur = 34;
  c.drawImage(img, cx - w / 2, floor - h, w, h);
  c.restore();
}

export function shareFacts(s) {
  return { grade: s.grade, done: doneCount(s), walk: s.walkExp, rate: rates(s).now, awaken: awakened(s) };
}

export async function drawShareCard(s) {
  const f = shareFacts(s);
  await Promise.all([document.fonts.load(`700 80px ${HOL}`), document.fonts.load(`700 30px ${SANS}`), document.fonts.load(`800 30px ${SANS}`)]).catch(() => {});
  const soldiers = SHADOW_ART.slice(0, f.grade);
  const [hero, bellion, ...army] = await Promise.all([hunterArt(f.grade), BELLION_ART, ...soldiers].map(load));

  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d');
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';

  // 던전 바탕 + 무대 뒤 보랏빛 (원작풍 무대 조명)
  c.fillStyle = '#120E2E';
  c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(540, 700, 60, 540, 700, 560);
  g.addColorStop(0, 'rgba(120,84,230,.7)');
  g.addColorStop(1, 'rgba(18,14,46,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  // 머리글
  c.fillStyle = '#C9BDFF';
  c.font = `700 30px ${SANS}`;
  c.fillText('카카오뱅크 × 나 혼자만 레벨업', 540, 104);
  c.font = `700 84px ${HOL}`;
  const t1 = '나 혼자만 ';
  const t2 = '캐시업';
  const w1 = c.measureText(t1).width;
  const w2 = c.measureText(t2).width;
  const x0 = 540 - (w1 + w2) / 2;
  c.textAlign = 'left';
  c.fillStyle = '#fff';
  c.fillText(t1, x0, 202);
  c.fillStyle = '#FFD23F';
  c.fillText(t2, x0 + w1, 202);
  c.textAlign = 'center';
  c.fillStyle = '#E6E0FA';
  c.font = `700 36px ${SANS}`;
  c.fillText(`${TOTAL}주 헌터 양성 프로젝트 수료`, 540, 266);

  // 게이트 아치 · 바닥 마법진
  const floor = 980;
  c.save();
  c.strokeStyle = 'rgba(185,160,255,.32)';
  c.lineWidth = 10;
  c.beginPath();
  c.moveTo(300, floor);
  c.lineTo(300, 560);
  c.arc(540, 560, 240, Math.PI, 0);
  c.lineTo(780, floor);
  c.stroke();
  c.strokeStyle = 'rgba(185,160,255,.5)';
  c.lineWidth = 3;
  c.setLineDash([12, 10]);
  c.beginPath();
  c.ellipse(540, floor - 6, 330, 40, 0, 0, Math.PI * 2);
  c.stroke();
  c.restore();

  // 그림자 병사 (뒤, 양옆에 번갈아). 각성이면 벨리온 자리를 비우고 한 줄 뒤로 물러선다
  const slots = f.awaken
    ? [
        [230, 200],
        [950, 200],
        [110, 170],
        [330, 160],
        [1010, 160],
      ]
    : [
        [250, 230],
        [830, 240],
        [140, 200],
        [940, 190],
        [360, 180],
      ];
  const back = f.awaken ? 60 : 18;
  army.forEach((img, i) => stand(c, img, slots[i][0], floor - back, slots[i][1], '#A47BFF', f.awaken ? 0.7 : 0.82));

  // 성진우 (각성이면 왼쪽으로 비켜서고 벨리온이 오른쪽에 무릎 꿇음)
  const heroX = f.awaken ? 450 : 540;
  stand(c, hero, heroX, floor, 600, '#A47BFF');
  if (f.awaken) stand(c, bellion, 730, floor, 330, '#A47BFF');

  // 등급 배지
  const bx = f.awaken ? 800 : 790;
  const by = 360;
  c.save();
  c.shadowColor = RC[f.grade];
  c.shadowBlur = 40;
  c.fillStyle = RC[f.grade];
  c.beginPath();
  c.roundRect(bx, by, 150, 150, 26);
  c.fill();
  c.restore();
  c.fillStyle = RT[f.grade];
  c.font = `700 112px ${HOL}`;
  c.fillText(RANK[f.grade], bx + 75, by + 114);
  c.fillStyle = '#E6E0FA';
  c.font = `700 28px ${SANS}`;
  c.fillText('최종 등급', bx + 75, by + 196);

  // 히든 각성
  let y = 1052;
  if (f.awaken) {
    c.fillStyle = '#D9C9FF';
    c.font = `700 44px ${HOL}`;
    c.fillText('히든 각성 · 벨리온 합류', 540, 1046);
    y = 1090;
  }

  // 기록 세 칸
  const cols = [
    [`${f.done}주`, '완납'],
    [fmt(f.walk), '걷기 EXP'],
    [f.rate.toFixed(1) + '%', '최종 금리'],
  ];
  const top = y;
  c.strokeStyle = 'rgba(255,230,128,.35)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(90, top);
  c.lineTo(990, top);
  c.moveTo(90, top + 150);
  c.lineTo(990, top + 150);
  c.moveTo(390, top + 30);
  c.lineTo(390, top + 120);
  c.moveTo(690, top + 30);
  c.lineTo(690, top + 120);
  c.stroke();
  cols.forEach(([v, k], i) => {
    const cx = 240 + i * 300;
    c.fillStyle = '#FFE680';
    c.font = `800 54px ${SANS}`;
    c.fillText(v, cx, top + 78);
    c.fillStyle = '#C9BDFF';
    c.font = `700 28px ${SANS}`;
    c.fillText(k, cx, top + 120);
  });

  // 바닥글
  c.fillStyle = 'rgba(230,224,250,.6)';
  c.font = `700 26px ${SANS}`;
  c.fillText('cashup-sololevel.vercel.app · 시연용 프로토타입', 540, H - 52);

  return new Promise((ok) => cv.toBlob(ok, 'image/png'));
}

export const shareText = (s) => {
  const f = shareFacts(s);
  return `나 혼자만 캐시업 ${TOTAL}주 수료! 최종 ${RANK[f.grade]}급 헌터${f.awaken ? ' · 히든 각성' : ''} (시연용)`;
};

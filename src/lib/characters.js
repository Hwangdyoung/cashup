import hunterE from '../assets/character/hunter-e.png';
import hunterUp from '../assets/character/hunter-up.png';
import igris from '../assets/character/igris.png';
import tank from '../assets/character/tank.png';
import iron from '../assets/character/iron.png';
import fang from '../assets/character/fang.png';
import beru from '../assets/character/beru.png';

/* 캐릭터 · 등급 색 · 그림자 병사 · 등급별 성장 문구 (포스터 기준)
   가입자는 성진우 한 명을 26주 동안 키운다. 모든 스토리는 원작과 별개인 콜라보 한정 IF 설정 */

/* 등급 E~S 배경색(RC)과 글자색(RT) */
export const RC = ['#A3A9C6', '#3DD68C', '#47A6FF', '#A47BFF', '#FF8F45', '#FFD23F'];
export const RT = ['#15122A', '#062312', '#03182E', '#FFFFFF', '#2B1100', '#2B1F00'];

/* 등급이 오를 때마다 그림자 병사 1명 합류 (D급부터 순서대로) */
export const SHADOWS = ['이그리트', '탱크', '아이언', '어금니', '베르'];
/* 그림자 병사 그림 (SHADOWS 와 같은 순서) */
export const SHADOW_ART = [igris, tank, iron, fang, beru];

/* 등급별 성장 문구 (포스터 '헌터 승급' 표) */
export const GRADE_STORY = ['곡괭이를 든 신입 헌터', '곡괭이가 첫 무기로 바뀜', '전투 스타일이 자리 잡음', '이펙트가 눈에 띄게 커짐', '완성형에 가까운 모습', '최종 형태, 수료 연출'];

/* 상품 전용 캐릭터 그림 (등급 E~S 순서, src/assets/character/)
   지금은 E급 그림과 성장 그림 두 장. 등급별 그림이 더 생기면 여기만 바꾼다 */
export const HUNTER_ART = [hunterE, hunterUp, hunterUp, hunterUp, hunterUp, hunterUp];
export const hunterArt = (grade = 0) => HUNTER_ART[Math.max(0, Math.min(HUNTER_ART.length - 1, grade))];

/* 보상 (품목·금액 미정 → '(예정)'으로만 표시) */
export const GRADE_REWARD = '카카오페이 포인트·카카오페이지 캐시 (예정)';
export const AWAKEN_REWARD = '히든 각성 추가 리워드 (예정)';

export const HUNTER = {
  id: 'jinwoo',
  n: '성진우',
  title: '그림자 군주',
  c: '#A47BFF',
  d: '단검 전투 · 보라빛 그림자 오라 · 등급이 오를 때마다 그림자 병사가 한 명씩 합류',
  gear: ['곡괭이 · 낡은 헌터복 · 닳은 무릎 보호대와 붕대', '검은 단검 · 기본 헌터복', '검은 재킷 · 쌍단검 · 옅은 보라빛 오라', '보라빛 눈동자', '검은 망토 · 강해진 보라빛 오라', '그림자 군주 갑옷·망토·쌍단검'],
  tool: 'dagger',
  awaken: '그림자 군단이 완성되고, 총사령관 벨리온이 무릎을 꿇습니다',
};

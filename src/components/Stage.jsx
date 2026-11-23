import { useMemo } from 'react';
import hunterImg from '../assets/hunter.png';
import { RANK } from '../lib/rules.js';
import { CONCEPTS, SHADOWS } from '../lib/characters.js';
import { scene } from '../lib/scene.js';

const SHADOW_POS = [27, 73, 15, 85, 5];

/* 홈 무대: 등급 색 던전 배경 · 헌터(누르면 상태창) · 성진우 그림자 병사 · 장비 이름
   pop: 납입할 때마다 늘어나는 숫자 → 헌터가 한 번 반짝 */
export default function Stage({ s, missTint, pop, onHero }) {
  const g = s.grade;
  const C = CONCEPTS[s.concept];
  const bg = useMemo(() => scene(g), [g]);
  const shadows = C.shadows ? SHADOWS.slice(0, g) : [];
  return (
    <div className={`stage${missTint ? ' miss-tint' : ''}`}>
      <div dangerouslySetInnerHTML={{ __html: bg }} />
      <span className="tag l">{C.who}</span>
      <span className="tag r">헌터를 누르면 상태창</span>
      <div className="shadows" aria-hidden="true">
        {shadows.map((name, i) => (
          <img key={name} src={hunterImg} alt="" title={'그림자 병사 ' + name} style={{ left: SHADOW_POS[i] + '%', animationDelay: i * 0.4 + 's' }} />
        ))}
      </div>
      <button
        type="button"
        className={`hero${pop ? ' pop' : ''}`}
        aria-label="상태창 열기"
        onClick={onHero}
        style={{ '--aura': (0.15 + g * 0.13).toFixed(2), '--glow': 3 + g * 3 + 'px' }}
      >
        <i className="aura" />
        <img key={pop} src={hunterImg} alt="내 헌터" />
      </button>
      <div className="gearname">
        {RANK[g]}급 · {C.gear[g]}
        {C.shadows && g > 0 ? ' · 그림자 병사 ' + g + '명' : ''}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { RANK } from '../lib/rules.js';
import { HUNTER, SHADOWS, hunterArt } from '../lib/characters.js';
import { scene } from '../lib/scene.js';

const SHADOW_POS = [27, 73, 15, 85, 5];

/* 던전 무대(나혼렙 포인트): 등급 색 배경 · 성진우(누르면 상태창) · 그림자 병사 · 장비
   pop: 납입할 때마다 늘어나는 숫자 → 헌터가 한 번 반짝 */
export default function Stage({ s, missTint, pop, onHero }) {
  const g = s.grade;
  const bg = useMemo(() => scene(g), [g]);
  const art = hunterArt(g);
  return (
    <div className={`stage${missTint ? ' miss-tint' : ''}`} style={{ '--c': HUNTER.c }}>
      <div dangerouslySetInnerHTML={{ __html: bg }} />
      <span className="tag l">{HUNTER.title}</span>
      <span className="tag r">헌터를 누르면 상태창</span>
      <div className="shadows" aria-hidden="true">
        {SHADOWS.slice(0, g).map((name, i) => (
          <img key={name} src={art} alt="" title={'그림자 병사 ' + name} style={{ left: SHADOW_POS[i] + '%', animationDelay: i * 0.4 + 's' }} />
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
        <img key={pop} src={art} alt={HUNTER.n} />
      </button>
      <div className="gearname">
        {RANK[g]}급 · {HUNTER.gear[g]}
        {g > 0 ? ' · 그림자 병사 ' + g + '명' : ''}
      </div>
    </div>
  );
}

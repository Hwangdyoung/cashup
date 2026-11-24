import { useMemo } from 'react';
import { RANK } from '../lib/rules.js';
import { HUNTER, SHADOWS, hunterArt } from '../lib/characters.js';
import { scene } from '../lib/scene.js';

const SHADOW_POS = [24, 76, 12, 88, 4];

/* 적금 상세 홈 맨 위 대표 영역 (나혼렙 포인트: 던전 무대)
   왼쪽 위에 이번 주 도전 금액, 가운데 성진우(누르면 상태창)와 그림자 병사, 아래에 지금 등급·장비
   pop: 납입할 때마다 늘어나는 숫자 → 헌터가 한 번 반짝 */
export default function Stage({ s, label, amount, missTint, pop, onHero }) {
  const g = s.grade;
  const bg = useMemo(() => scene(g), [g]);
  const art = hunterArt(g);
  return (
    <div className={`stage${missTint ? ' miss-tint' : ''}`} style={{ '--c': HUNTER.c }}>
      <div dangerouslySetInnerHTML={{ __html: bg }} />
      <div className="stage-info">
        <span>{label}</span>
        <b>{amount}</b>
      </div>
      <button type="button" className="stage-status" onClick={onHero}>
        상태창
      </button>
      <div className="shadows" aria-hidden="true">
        {SHADOWS.slice(0, g).map((name, i) => (
          <img key={name} src={art} alt="" title={'그림자 병사 ' + name} style={{ left: SHADOW_POS[i] + '%' }} />
        ))}
      </div>
      <button
        type="button"
        className={`hero${pop ? ' pop' : ''}`}
        aria-label="상태창 열기"
        onClick={onHero}
        style={{ '--aura': (0.15 + g * 0.1).toFixed(2), '--glow': 3 + g * 2 + 'px' }}
      >
        <i className="aura" />
        <img key={pop} src={art} alt={HUNTER.n} />
      </button>
      <div className="gearname">
        <b className="hol">{RANK[g]}급</b> {HUNTER.gear[g]}
        {g > 0 ? ' · 병사 ' + g + '명' : ''}
      </div>
    </div>
  );
}

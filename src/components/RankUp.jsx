import { useEffect } from 'react';
import hunterImg from '../assets/hunter.png';
import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { RANK } from '../lib/rules.js';
import { CONCEPTS, RC, RT, SHADOWS } from '../lib/characters.js';
import { TOOLS } from '../lib/scene.js';
import { sfx } from '../lib/sfx.js';

/* 승급 연출: 암전 → 시스템 창 → 장비 교체 → 이펙트
   E→D: 곡괭이가 부서지고 첫 무기 등장 / 그 이후: 같은 무기가 새 등급 색으로 강화
   성진우는 오른 등급 수만큼 그림자 병사 합류 (여러 등급을 한 번에 올라도 모두 표시) */
export default function RankUp({ concept, from, to, onClose }) {
  const C = CONCEPTS[concept];
  const big = from === 0;
  const tool = TOOLS[C.tool];

  useEffect(() => {
    sfx('warn');
    const a = setTimeout(() => sfx('rank'), 500);
    const b = setTimeout(() => sfx(big ? 'boss' : 'gold'), 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [big]);

  const badge = (g, glow) => <i style={{ background: RC[g], color: RT[g], boxShadow: glow ? '0 0 18px ' + RC[g] : undefined }}>{RANK[g]}</i>;

  return (
    <div className="ru show" aria-live="assertive">
      <SystemWindow variant="gold" title="알림" alert style={{ '--cs': '44px' }}>
        <SysLine>
          <em>등급</em>이 상승했습니다.
        </SysLine>
        <div className="grades">
          {badge(from)}
          <span className="arr">▶</span>
          {badge(to, true)}
        </div>
        <div className={`swap${big ? ' big' : ''}`} style={{ '--c': C.c }}>
          <img src={hunterImg} alt="" />
          {big ? (
            <>
              <div className="tool old" dangerouslySetInnerHTML={{ __html: TOOLS.pick }} />
              <div className="tool new" style={{ right: '12%' }} dangerouslySetInnerHTML={{ __html: tool }} />
            </>
          ) : (
            <div className="tool up" style={{ '--gc': RC[to] }} dangerouslySetInnerHTML={{ __html: tool }} />
          )}
          <i className="burst" />
          <i className="burst b2" />
        </div>
        <p className="swsub gearline">
          {big ? '곡괭이가 부서지고 첫 무기를 손에 넣었습니다' : '장비가 강화되었습니다'}
          <br />
          <b style={{ color: '#fff' }}>{C.gear[to]}</b>
          {C.shadows && (
            <>
              <br />
              <span style={{ color: '#C9B2FF' }}>그림자 병사 {SHADOWS.slice(from, to).join(' · ')} 합류</span>
            </>
          )}
        </p>
        <div className="foot2">
          <button type="button" className="btn" onClick={onClose}>
            확인
          </button>
        </div>
      </SystemWindow>
    </div>
  );
}

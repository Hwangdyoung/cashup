import { useEffect } from 'react';
import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { RANK } from '../lib/rules.js';
import { GRADE_REWARD, GRADE_STORY, HUNTER, RC, RT, SHADOWS, SHADOW_ART, hunterArt } from '../lib/characters.js';
import { TOOLS } from '../lib/scene.js';
import { sfx } from '../lib/sfx.js';

/* 승급 연출: 암전 → 시스템 창 → 새 등급 글자 → 장비 교체 → 이펙트
   E→D: 곡괭이가 부서지고 첫 무기 등장 / 그 이후: 같은 무기가 새 등급 색으로 강화
   오른 등급 수만큼 그림자 병사 합류 (여러 등급을 한 번에 올라도 모두 표시) */
export default function RankUp({ from, to, onClose }) {
  const C = HUNTER;
  const big = from === 0;
  const tool = TOOLS[C.tool];
  const joined = SHADOWS.slice(from, to);

  useEffect(() => {
    sfx('warn');
    const a = setTimeout(() => sfx('rank'), 500);
    const b = setTimeout(() => sfx(big ? 'boss' : 'gold'), 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [big]);

  return (
    <div className="ru show" aria-live="assertive" style={{ '--gc': RC[to], '--c': C.c }}>
      <SystemWindow variant="gold" title="등급 상승" alert style={{ '--cs': '44px' }}>
        <SysLine>
          <em>등급</em>이 상승했습니다.
        </SysLine>
        <div className="grade-up" aria-label={RANK[from] + '급에서 ' + RANK[to] + '급으로'}>
          <span className="old">{RANK[from]}</span>
          <svg className="arr" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span className="new" style={{ background: RC[to], color: RT[to] }}>
            {RANK[to]}
          </span>
        </div>
        <p className="grade-story">{GRADE_STORY[to]}</p>
        <div className={`swap${big ? ' big' : ''}`}>
          <img src={hunterArt(to)} alt="" />
          {big ? (
            <>
              <div className="tool old" dangerouslySetInnerHTML={{ __html: TOOLS.pick }} />
              <div className="tool new" dangerouslySetInnerHTML={{ __html: tool }} />
            </>
          ) : (
            <div className="tool up" dangerouslySetInnerHTML={{ __html: tool }} />
          )}
          <i className="burst" />
        </div>
        <dl className="ru-list">
          <dt>{big ? '첫 무기' : '장비 강화'}</dt>
          <dd>{C.gear[to]}</dd>
          {joined.length > 0 && (
            <>
              <dt>병사 합류</dt>
              <dd className="ru-sold">
                {joined.map((n, i) => (
                  <span key={n}>
                    <img src={SHADOW_ART[from + i]} alt="" />
                    {n}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
        <p className="ru-reward">등급 리워드 · {GRADE_REWARD}</p>
        <div className="foot2">
          <button type="button" className="btn" onClick={onClose}>
            확인
          </button>
        </div>
      </SystemWindow>
    </div>
  );
}

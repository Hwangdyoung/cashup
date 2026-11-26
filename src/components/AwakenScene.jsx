import { useEffect } from 'react';
import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { DungeonArt } from './Shell.jsx';
import { AWAKEN_EXP } from '../lib/rules.js';
import { AWAKEN_REWARD, BELLION_ART, HUNTER, SHADOWS, SHADOW_ART, hunterArt } from '../lib/characters.js';
import { fmt } from '../lib/format.js';
import { sfx } from '../lib/sfx.js';

/* 히든 각성 연출 (만기 · 걷기 보너스 EXP 10,000 이상일 때 결과 창 앞에 한 번)
   폰 화면 전체를 던전 무대로 쓴다. 모든 움직임은 한 번만:
   암전 → 시스템 창 → 성진우 → 그림자 병사 5명이 차례로 솟아오름 → 보랏빛 섬광과 함께 벨리온이 무릎 꿇고 등장 → 군단 완성 */
export default function AwakenScene({ s, onDone }) {
  useEffect(() => {
    sfx('warn');
    const t = [setTimeout(() => sfx('rank'), 500), setTimeout(() => sfx('boss'), 2150), setTimeout(() => sfx('gold'), 2950)];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="ru show aw-scene" aria-live="assertive">
      <DungeonArt className="aw-bg" grade={5} hunter={false} />
      <div className="aw-flash" aria-hidden="true" />
      <div className="aw-col">
        <SystemWindow variant="gold" title="히든 각성" alert>
          <SysLine>
            <em>히든 각성</em> 조건을 달성했습니다.
          </SysLine>
          <p className="aw-cond">
            걷기 보너스 EXP {fmt(s.walkExp)} · 기준 {fmt(AWAKEN_EXP)} 달성
          </p>
        </SystemWindow>

        <div className="aw-stage" aria-hidden="true">
          <i className="aw-glow" />
          <div className="aw-army">
            {SHADOW_ART.map((src, i) => (
              <img key={SHADOWS[i]} src={src} alt="" style={{ animationDelay: 1.3 + i * 0.12 + 's' }} />
            ))}
          </div>
          <img className="aw-hero" src={hunterArt(s.grade)} alt="" />
          <i className="aw-ring" />
          <img className="aw-bellion" src={BELLION_ART} alt="" />
        </div>

        <div className="aw-text">
          <h3 className="aw-title">그림자 군단 완성</h3>
          <p className="aw-line">{HUNTER.awaken}</p>
          <p className="ru-reward">{AWAKEN_REWARD}</p>
          <button type="button" className="btn aw-btn" onClick={onDone}>
            수료 결과 보기
          </button>
        </div>
      </div>
    </div>
  );
}

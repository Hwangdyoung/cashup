import { useEffect } from 'react';
import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { DungeonArt } from './Shell.jsx';
import { BellionSilhouette } from './Silhouettes.jsx';
import { AWAKEN_EXP } from '../lib/rules.js';
import { AWAKEN_REWARD, HUNTER, SHADOWS, SHADOW_ART, hunterArt } from '../lib/characters.js';
import { fmt } from '../lib/format.js';
import { sfx } from '../lib/sfx.js';

/* 히든 각성 연출 (만기 · 걷기 보너스 EXP 10,000 이상일 때 결과 창 앞에 한 번)
   암전 → 시스템 창 → 그림자 병사 5명이 차례로 솟아오름 → 벨리온이 무릎 꿇고 등장 → 군단 완성 */
export default function AwakenScene({ s, onDone }) {
  useEffect(() => {
    sfx('warn');
    const t = [setTimeout(() => sfx('rank'), 500), setTimeout(() => sfx('boss'), 1900), setTimeout(() => sfx('gold'), 2600)];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="ru show aw-scene" aria-live="assertive">
      <SystemWindow variant="gold" title="히든 각성" alert>
        <SysLine>
          <em>히든 각성</em> 조건을 달성했습니다.
        </SysLine>
        <p className="aw-cond">
          걷기 보너스 EXP {fmt(s.walkExp)} / {fmt(AWAKEN_EXP)}
        </p>
        <DungeonArt className="aw-stage" grade={5} hunter={false}>
          <div className="aw-army" aria-hidden="true">
            {SHADOW_ART.map((src, i) => (
              <img key={SHADOWS[i]} src={src} alt="" style={{ animationDelay: 0.9 + i * 0.14 + 's' }} />
            ))}
          </div>
          <img className="aw-hero" src={hunterArt(s.grade)} alt="" />
          <BellionSilhouette className="aw-bellion" />
        </DungeonArt>
        <h3 className="aw-title">그림자 군단 완성</h3>
        <p className="aw-line">{HUNTER.awaken}</p>
        <p className="ru-reward">{AWAKEN_REWARD}</p>
        <div className="foot2 aw-foot">
          <button type="button" className="btn" onClick={onDone}>
            수료 결과 보기
          </button>
        </div>
      </SystemWindow>
    </div>
  );
}

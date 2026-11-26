import { useState } from 'react';
import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { GateIcon } from './Icons.jsx';
import { HUNTER, RC, RT, SHADOW_ART, SHADOWS, hunterArt } from '../lib/characters.js';
import { EXP_PAY, EXP_WALK, LAST, RANK, TICKETS, WALK_GOAL } from '../lib/rules.js';
import { fmt } from '../lib/format.js';
import { sfx } from '../lib/sfx.js';

/* 개설 직후 적금 홈에 처음 들어올 때 (가입할 때마다)
   나혼렙을 모르는 사람용. 긴 문단 없이 그림 + 짧은 줄로만.
   1장: 원작이 어떤 이야기인지 / 2장: 이 적금에서 무엇을 하면 무엇이 되는지 */

function Grade({ g }) {
  return (
    <b className="wi-g hol" style={{ background: RC[g], color: RT[g] }}>
      {RANK[g]}
    </b>
  );
}

const WORDS = [
  ['게이트', '괴물이 나오는 문'],
  ['헌터', `게이트에서 싸우는 사람 · ${RANK[0]}~${RANK[LAST]}급`],
  ['시스템', `${HUNTER.n}에게만 보이는 퀘스트 창`],
];

export default function WelcomeIntro({ onClose }) {
  const [page, setPage] = useState(0);
  const next = () => {
    sfx('tap');
    setPage(1);
  };

  return (
    <SystemWindow title="헌터 협회" alert>
      <p className="wi-page" aria-live="polite">
        {page + 1} / 2
      </p>

      {page === 0 ? (
        <>
          <SysLine>
            <em>특별 성장 프로젝트</em>에 등록되었습니다.
          </SysLine>
          <h3 className="wi-t">
            가장 약한 헌터가
            <br />
            최강이 되는 이야기
          </h3>
          <div className="wi-grow" aria-hidden="true">
            <figure>
              <img src={hunterArt(0)} alt="" />
              <Grade g={0} />
            </figure>
            <span className="wi-arrow">→</span>
            <figure>
              <img src={hunterArt(LAST)} alt="" />
              <Grade g={LAST} />
            </figure>
          </div>
          <dl className="wi-words">
            {WORDS.map(([k, v]) => [<dt key={k + 'k'}>{k}</dt>, <dd key={k + 'v'}>{v}</dd>])}
          </dl>
          <div className="foot2">
            <button type="button" className="btn" onClick={next}>
              이 적금에서는?
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="wi-t">
            저축하고 걸으면
            <br />
            {HUNTER.n}가 강해져요
          </h3>
          <ul className="wi-rows">
            <li>
              <span className="wi-ic wi-ic-grade" aria-hidden="true">
                <Grade g={0} />
                <Grade g={LAST} />
              </span>
              <span>
                <strong>EXP를 모아 등급 상승</strong>
                매주 납입 +{fmt(EXP_PAY)} · 하루 {fmt(WALK_GOAL)}보 +{EXP_WALK}
              </span>
            </li>
            <li>
              <span className="wi-ic" aria-hidden="true">
                <img src={SHADOW_ART[0]} alt="" />
              </span>
              <span>
                <strong>승급마다 그림자 병사 합류</strong>
                {RANK[LAST]}급이 되면 {SHADOWS.length}명 모두
              </span>
            </li>
            <li>
              <span className="wi-ic wi-ic-gate" aria-hidden="true">
                <GateIcon />
              </span>
              <span>
                <strong>놓치면 페널티 게이트</strong>
                유예권 {TICKETS}장 · 미니게임 후 다시 납입
              </span>
            </li>
          </ul>
          <p className="ifnote">원작과 별개인 콜라보 한정 IF(만약에) 세계관입니다.</p>
          <div className="foot2">
            <button type="button" className="btn" onClick={onClose}>
              던전 입장
            </button>
          </div>
        </>
      )}
    </SystemWindow>
  );
}

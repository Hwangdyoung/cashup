import { useState } from 'react';
import SystemWindow, { SysLine } from './SystemWindow.jsx';
import { HUNTER } from '../lib/characters.js';
import { EXP_PAY, EXP_WALK, RANK, TICKETS, TOTAL, WALK_GOAL } from '../lib/rules.js';
import { fmt, won } from '../lib/format.js';
import { sfx } from '../lib/sfx.js';

/* 개설 직후 적금 홈에 처음 들어올 때 한 번 (가입할 때마다)
   나혼렙을 모르는 사람을 위해 1장: 원작이 어떤 이야기인지 / 2장: 그 요소가 이 적금에서 무엇인지 */
export default function WelcomeIntro({ base, onClose }) {
  const [page, setPage] = useState(0);
  const next = () => {
    sfx('tap');
    setPage(1);
  };

  const terms = [
    ['헌터 등급', `매주 납입 +${fmt(EXP_PAY)} EXP, 하루 ${fmt(WALK_GOAL)}보 +${EXP_WALK} EXP로 ${RANK[0]}급에서 ${RANK[RANK.length - 1]}급까지`],
    ['그림자 병사', '등급이 오를 때마다 한 명씩 합류'],
    ['시스템 창', '납입 · 걷기 · 승급 결과를 알려 주는 파란 창'],
    ['페널티 게이트', `납입을 놓치면 열려요. 유예권 ${TICKETS}장으로 미니게임 후 재납입`],
  ];

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
          <h3 className="wi-t">나 혼자만 레벨업은</h3>
          <p className="wi-story">
            괴물이 나오는 문 &lsquo;게이트&rsquo;가 열리고, 그 안에 들어가 싸우는 &lsquo;헌터&rsquo;가 생긴 세계의 이야기예요. 헌터는 E급부터 S급까지 등급이 정해져 있어요.
          </p>
          <p className="wi-story">
            가장 약한 E급 헌터 <b>{HUNTER.n}</b>은 혼자에게만 보이는 &lsquo;시스템&rsquo;의 퀘스트를 매일 해내며 레벨을 올리고, 쓰러뜨린 적을 &lsquo;그림자 병사&rsquo;로 거느리는 최강의 헌터가 돼요.
          </p>
          <div className="foot2">
            <button type="button" className="btn" onClick={next}>
              이 적금에서는?
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="wi-t">이 적금에서는 내가 성진우를 키워요</h3>
          <p className="wi-lead">
            1주차 {won(base)}부터 {TOTAL}주 동안 저축하고 걸으면, 그만큼 성진우가 강해져요.
          </p>
          <dl className="wi-terms">
            {terms.map(([k, v]) => [
              <dt key={k + 'k'}>{k}</dt>,
              <dd key={k + 'v'}>{v}</dd>,
            ])}
          </dl>
          <p className="ifnote">이 상품의 스토리는 원작과 별개인 콜라보 한정 IF(만약에) 세계관입니다.</p>
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

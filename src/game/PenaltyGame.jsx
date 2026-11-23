import { memo, useEffect, useRef } from 'react';
import hunterImg from '../assets/hunter.png';
import { createSound } from './engine/sound.js';
import { createRun } from './engine/run.js';
import { createDodge } from './engine/dodge.js';
import { createHub } from './engine/hub.js';
import './game.css';

/* 페널티 퀘스트 미니게임 (30초 · 던전 러닝 / 독충 회피)
   - 화면 뼈대는 아래 JSX, 움직임은 engine/ 의 캔버스 코드가 맡는다 (React는 뼈대만 한 번 그림)
   - 앱과는 콜백으로 주고받음: onLaunch 게임 시작(유예권 사용) · onRescued 통과 · onQuit 나가기 · onMute 음소거 변경 */
export default function PenaltyGame({ week, tries, muted, onLaunch, onRescued, onQuit, onMute }) {
  const root = useRef(null);
  const engine = useRef(null);
  const cb = useRef(null);
  cb.current = { onLaunch, onRescued, onQuit, onMute };

  useEffect(() => {
    let alive = true;
    const offs = [];
    const el = root.current;
    let hub = null;
    const env = {
      root: el,
      $: (id) => el.querySelector('#' + id),
      on: (target, type, fn, opts) => {
        target.addEventListener(type, fn, opts);
        offs.push(() => target.removeEventListener(type, fn, opts));
      },
      alive: () => alive,
      muted,
      tries,
      weekLabel: week + '주차',
      HUB: () => hub,
      onLaunch: () => cb.current.onLaunch(),
      onRescued: () => cb.current.onRescued(),
      onQuit: () => cb.current.onQuit(),
      onMute: (m) => cb.current.onMute(m),
    };
    env.SND = createSound(env);
    env.G1 = createRun(env);
    env.G2 = createDodge(env);
    hub = createHub(env);
    engine.current = env;
    return () => {
      alive = false;
      offs.forEach((off) => off());
      env.SND.destroy();
      env.G2.destroy();
      engine.current = null;
    };
    // 게임은 열릴 때 한 번만 만든다 (주차·횟수는 그때 값으로 고정)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 앱의 효과음 켜기/끄기(M 키·스피커 버튼)를 게임 배경음에도 반영
  useEffect(() => {
    engine.current?.SND.set(muted, true);
  }, [muted]);

  return (
    <div className="pg">
      <div className="phone" ref={root} tabIndex={-1}>
        <GameSkeleton />
      </div>
    </div>
  );
}

const SoundBtnIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path className="sp" d="M3.5 9.5v5h3.8l4.7 3.8V5.7L7.3 9.5z" />
    <path className="wv" d="M15.3 9a4.2 4.2 0 0 1 0 6" />
    <path className="wv" d="M17.9 6.4a7.8 7.8 0 0 1 0 11.2" />
    <path className="xx" d="M15.6 9.5l5 5M20.6 9.5l-5 5" />
  </svg>
);

/* 엔진이 id로 찾아 직접 고치는 요소들. 한 번 그린 뒤 React가 다시 건드리지 않도록 memo */
const GameSkeleton = memo(function GameSkeleton() {
  return (
    <>
      <div className="pz" id="pz1">
        <div className="pz-hud">
          <div className="pz-t">
            <span id="ttl">페널티 퀘스트 · 던전 러닝</span>
            <b id="tm">0:30</b>
          </div>
          <div className="pz-hp" id="hp" role="img" aria-label="생명 4" />
          <button type="button" className="pz-snd" id="snd" aria-label="사운드 끄기" aria-pressed="false" title="사운드 (M)">
            <SoundBtnIcon />
          </button>
          <button type="button" className="pz-x" id="quit" aria-label="페널티 구역 나가기">
            — X
          </button>
          <div className="pz-bar">
            <i id="bar" />
          </div>
        </div>
        <div className="pz-arena">
          <canvas id="cv" aria-label="사막 던전을 달리며 장애물을 넘는 러닝 게임 화면" />
          <span className="chip l" id="steps">
            0m
          </span>
          <span className="chip r" id="crys">
            마나 결정 0
          </span>
          <div className="goal" id="goal">
            <i id="gbar" />
            <span id="gtxt">0 / 1,500점</span>
          </div>
          <div className="pz-count" id="cnt" aria-live="assertive" />
        </div>
        <div className="pz-ctl">
          <div className="pz-hint">화면 어디든 탭(클릭) 점프 · 길게 누르면 높이 점프</div>
        </div>
      </div>

      <div className="pz" id="pz2" style={{ display: 'none' }}>
        <div className="pz-hud">
          <div className="pz-t">
            <span id="ttl2">페널티 퀘스트 · 독충 회피</span>
            <b id="tm2">0:30</b>
          </div>
          <div className="pz-hp" id="hp2" role="img" aria-label="생명 4" />
          <button type="button" className="pz-snd" id="snd2" aria-label="사운드 끄기" title="사운드 (M)">
            <SoundBtnIcon />
          </button>
          <button type="button" className="pz-x" id="quit2" aria-label="페널티 구역 나가기">
            — X
          </button>
          <div className="pz-bar">
            <i id="bar2" />
          </div>
        </div>
        <div className="pz-arena" style={{ touchAction: 'none' }}>
          <canvas id="cv2" aria-label="위에서 떨어지는 독충을 좌우로 피하는 게임 화면" />
          <span className="chip l" id="steps2">
            생존 0초
          </span>
          <span className="chip r" id="crys2">
            마나 결정 0
          </span>
          <div className="goal" id="goal2">
            <i id="gbar2" />
            <span id="gtxt2">0 / 240점</span>
          </div>
          <div className="pz-count" id="cnt2" aria-live="assertive" />
        </div>
        <div className="pz-ctl">
          <div className="pz-hint">마우스를 움직이거나 화면을 드래그해 좌우로 이동</div>
        </div>
      </div>
      <div className="pz-win show" id="hub" style={{ zIndex: 30 }} />
      <img id="pgHero" alt="" hidden src={hunterImg} />
    </>
  );
});

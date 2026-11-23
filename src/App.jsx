import { useCallback, useEffect, useRef, useState } from 'react';
import { CONCEPTS } from './lib/characters.js';
import { won } from './lib/format.js';
import { fresh, gates } from './lib/savings.js';
import * as act from './lib/actions.js';
import { sfx, sfxOn, sfxSet, installSfx } from './lib/sfx.js';
import { TRIES_PER_TICKET } from './lib/rules.js';
import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import SysToast from './components/SysToast.jsx';
import DemoPanel from './components/DemoPanel.jsx';
import RankUp from './components/RankUp.jsx';
import StatusWindow from './components/StatusWindow.jsx';
import ResultWindow from './components/ResultWindow.jsx';
import { GateConfirm, RepayWindow } from './components/PenaltyWindows.jsx';
import Login from './screens/Login.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Rate from './screens/Rate.jsx';
import Walk from './screens/Walk.jsx';
import Guild, { INVITE_CODE } from './screens/Guild.jsx';
import PenaltyGame from './game/PenaltyGame.jsx';

const SYS_MS = 2800; // 시스템 알림이 떠 있는 시간
const RANKUP_DELAY = 900; // 납입 알림을 보여 준 뒤 승급 연출

/* 앱 전체 상태와 화면 전환
   - s: 적금 상태 (lib/savings.js fresh). 바꿀 때는 run(행동, ...) 으로 lib/actions.js 함수를 부른다
   - 화면 상태: 탭 · 알림 · 모달 · 승급 연출 · 페널티 게임 */
export default function App() {
  const [s, setS] = useState(() => fresh());
  const sRef = useRef(s);
  const [tab, setTab] = useState('home');
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { kind: 'onboard'|'status'|'gate'|'repay'|'result', week? }
  const [rankUp, setRankUp] = useState(null); // { from, to }
  const [game, setGame] = useState(null); // { week, used }
  const [pop, setPop] = useState(0);
  const [soundOn, setSoundOn] = useState(sfxOn);
  const [autoWalk, setAutoWalk] = useState(true);
  const [proj, setProj] = useState('keep');
  // 온보딩 선택
  const [obStep, setObStep] = useState(0);
  const [pick, setPick] = useState('jinwoo');
  const [amount, setAmount] = useState(1000);

  const timers = useRef(new Set());
  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  };

  /* ───── 알림 · 효과 ───── */
  const toastTimer = useRef(null);
  const showSys = useCallback((text, kind = '', snd) => {
    setToast({ text, kind, id: Date.now() + Math.random() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), SYS_MS);
    if (snd !== 'none') sfx(snd || (kind === 'warn' ? 'warn' : kind === 'gold' ? 'gold' : 'sys'));
  }, []);

  const openModal = (m) => {
    setToast(null);
    setModal(m);
  };

  const handle = (fx) => {
    for (const f of fx) {
      if (f.type === 'sys') showSys(f.text, f.kind, f.snd);
      else if (f.type === 'sfx') sfx(f.name);
      else if (f.type === 'pop') setPop((p) => p + 1);
      else if (f.type === 'rankUp')
        later(() => {
          setToast(null);
          setRankUp({ from: f.from, to: f.to });
        }, RANKUP_DELAY);
      else if (f.type === 'result')
        later(() => {
          openModal({ kind: 'result' });
          sfx('result');
        }, f.delay);
    }
  };

  /* 적금 상태 바꾸기: 복사본을 lib/actions.js 함수에 넘기고, 돌아온 효과를 처리 */
  const run = (fn, ...args) => {
    const next = structuredClone(sRef.current);
    const fx = fn(next, ...args);
    sRef.current = next;
    setS(next);
    handle(fx);
  };
  const replace = (next) => {
    sRef.current = next;
    setS(next);
  };

  /* ───── 효과음 ───── */
  useEffect(() => {
    installSfx(() => showSys('[{효과음}이 브라우저에서 막혀 있습니다]\n화면을 한 번 더 누르거나, 주소창의 사이트 설정에서 소리를 허용해 주세요.', 'warn', 'none'));
  }, [showSys]);
  const setSound = useCallback((on) => {
    sfxSet(on);
    setSoundOn(on);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyM' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest?.('input,select,textarea')) setSound(!sfxOn());
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [setSound]);

  /* ───── 모달 닫기 (온보딩 중이면 다시 온보딩) ───── */
  const closeModal = () => {
    sfx('close');
    setModal(sRef.current.concept ? null : { kind: 'onboard' });
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && modal && sRef.current.concept) closeModal();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  /* ───── 시작 · 초기화 ───── */
  const startProject = () => {
    sfx('tap');
    replace(fresh(pick, amount));
    setModal(null);
    setTab('home');
    showSys('[{' + CONCEPTS[pick].n + '} 헌터로 등록되었습니다]\nE급 · 곡괭이를 든 신입 헌터 · 1주차 ' + won(amount));
  };
  const fullReset = () => {
    clearTimers();
    setGame(null);
    setRankUp(null);
    setModal(null);
    setToast(null);
    replace(fresh());
    setObStep(0);
    setPick('jinwoo');
    setAmount(1000);
    setProj('keep');
    setTab('home');
    setLoggedIn(false);
    sfx('reset');
  };

  const goto = (id) => {
    sfx('tap');
    setTab(id);
  };

  /* ───── 페널티 게임 ───── */
  const enterGame = (week) => {
    setModal(null);
    setGame({ week, used: false });
    sfx('pzEnter');
  };
  const gameRef = useRef(game);
  gameRef.current = game;
  const onLaunch = () => {
    const g = gameRef.current;
    if (!g || g.used) return;
    setGame({ ...g, used: true });
    run(act.useTicket);
  };
  const onRescued = () => {
    const g = gameRef.current;
    setGame(null);
    openModal({ kind: 'repay', week: g.week });
    sfx('clear');
  };
  const onQuit = () => {
    const g = gameRef.current;
    setGame(null);
    if (g) run(act.gameFailed, g.week, g.used);
  };

  /* ───── 시연 컨트롤 ───── */
  const onDemo = (id) => {
    if (!sRef.current.concept) return;
    const opts = { autoWalk };
    if (id === 'day') run(act.nextDay, opts);
    else if (id === 'week') run(act.demoWeek, opts);
    else if (id === 'five') run(act.demoFive, opts);
    else if (id === 'miss') run(act.demoMiss);
    else if (id === 'mate') run(act.addMates, 1);
    else if (id === 'mate5') run(act.addMates, 5);
    else if (id === 'to25') run(act.demoTo25, opts);
  };

  const copyCode = () => {
    try {
      navigator.clipboard?.writeText(INVITE_CODE);
    } catch {
      /* 복사가 막혀도 알림은 띄움 */
    }
    showSys('[{초대 코드}를 복사했습니다]\n친구가 이 코드로 가입하면 길드원이 늘어요', '', 'coin');
  };

  const ready = loggedIn && s.concept;
  const C = s.concept ? CONCEPTS[s.concept] : null;

  const renderModal = () => {
    if (!modal) return null;
    switch (modal.kind) {
      case 'onboard':
        return (
          <Onboarding
            step={obStep}
            pick={pick}
            amount={amount}
            onStep={(n) => {
              sfx('tap');
              setObStep(n);
            }}
            onPick={(k) => {
              sfx('tap');
              setPick(k);
            }}
            onAmount={(a) => {
              sfx('tap');
              setAmount(a);
            }}
            onStart={startProject}
          />
        );
      case 'status':
        return <StatusWindow s={s} onClose={closeModal} />;
      case 'gate':
        return <GateConfirm s={s} week={modal.week} onClose={closeModal} onEnter={() => enterGame(modal.week)} />;
      case 'repay':
        return (
          <RepayWindow
            s={s}
            week={modal.week}
            onRepay={() => {
              setModal(null);
              run(act.repay, modal.week);
            }}
          />
        );
      case 'result':
        return <ResultWindow s={s} onClose={closeModal} onReset={fullReset} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="phone" style={C ? { '--c': C.c } : undefined}>
        {!loggedIn && (
          <Login
            onStart={() => {
              sfx('tap');
              setLoggedIn(true);
              setObStep(0);
              setModal({ kind: 'onboard' });
            }}
          />
        )}
        <Header s={s} soundOn={soundOn} onSound={() => setSound(!soundOn)} onRate={() => goto('rate')} />
        <SysToast toast={toast} onClose={() => {
          setToast(null);
          sfx('close');
        }} />

        <div className="screen on" key={tab}>
          {ready && tab === 'home' && (
            <Home
              s={s}
              pop={pop}
              onHero={() => {
                openModal({ kind: 'status' });
                sfx('status');
              }}
              onPay={() => run(act.pay)}
              onGate={(week) => {
                if (sRef.current.tickets <= 0) return;
                openModal({ kind: 'gate', week });
                sfx('warn');
              }}
              onTab={goto}
            />
          )}
          {ready && tab === 'rate' && (
            <Rate
              s={s}
              proj={proj}
              onProj={(p) => {
                sfx('tap');
                setProj(p);
              }}
              onTab={goto}
            />
          )}
          {ready && tab === 'walk' && <Walk s={s} onWalk={(n) => run(act.walk, n)} />}
          {ready && tab === 'guild' && <Guild s={s} onCopy={copyCode} onJoin={() => run(act.addMates, 1)} />}
        </div>

        <TabBar tab={tab} onTab={goto} dot={gates(s).length > 0} />

        <div className={`modal${modal ? ' show' : ''}`}>{renderModal()}</div>
        {rankUp && (
          <RankUp
            concept={s.concept}
            from={rankUp.from}
            to={rankUp.to}
            onClose={() => {
              setRankUp(null);
              sfx('close');
            }}
          />
        )}
        {game && (
          <div className="pq show">
            <PenaltyGame
              week={game.week}
              tries={TRIES_PER_TICKET}
              muted={!soundOn}
              onMute={(m) => setSound(!m)}
              onLaunch={onLaunch}
              onRescued={onRescued}
              onQuit={onQuit}
            />
          </div>
        )}
      </div>

      <DemoPanel onDemo={onDemo} onReset={fullReset} autoWalk={autoWalk} onAutoWalk={setAutoWalk} locked={!!game} />
    </>
  );
}

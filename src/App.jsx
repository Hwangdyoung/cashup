import { useCallback, useEffect, useRef, useState } from 'react';
import { hunterArt } from './lib/characters.js';
import { awakened, fresh, gates, openSavings } from './lib/savings.js';
import * as act from './lib/actions.js';
import { bgmSet, installSfx, sfx, sfxOn, sfxSet } from './lib/sfx.js';
import { TRIES_PER_TICKET } from './lib/rules.js';
import Header, { SoundButton } from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import SysToast from './components/SysToast.jsx';
import DemoPanel, { DemoRemote } from './components/DemoPanel.jsx';
import WelcomeIntro from './components/WelcomeIntro.jsx';
import RankUp from './components/RankUp.jsx';
import StatusWindow from './components/StatusWindow.jsx';
import ResultWindow from './components/ResultWindow.jsx';
import AwakenScene from './components/AwakenScene.jsx';
import { GateConfirm, RepayWindow } from './components/PenaltyWindows.jsx';
import { KbToast, StatusBar, TopBar } from './components/Shell.jsx';
import BankHome from './screens/BankHome.jsx';
import Benefits from './screens/Benefits.jsx';
import Collab from './screens/Collab.jsx';
import Join from './screens/Join.jsx';
import JoinDone from './screens/JoinDone.jsx';
import Home from './screens/Home.jsx';
import Rate from './screens/Rate.jsx';
import Walk from './screens/Walk.jsx';
import Guild from './screens/Guild.jsx';
import PenaltyGame from './game/PenaltyGame.jsx';

const SYS_MS = 2800; // 시스템 알림이 떠 있는 시간
const KB_MS = 1800; // 카카오뱅크식 안내가 떠 있는 시간
const RANKUP_DELAY = 900; // 납입 알림을 보여 준 뒤 승급 연출
/* 던전 BGM을 트는 화면 (콜라보 적금 페이지부터) */
const DUNGEON = new Set(['collab', 'join', 'done', 'savings']);

/* 앱 전체 상태와 화면 동선
   route: 'bank' 카카오뱅크 홈 → 'benefit' 혜택(이벤트) → 'collab' 콜라보 적금 페이지 → 'join' 가입 → 'done' 개설 완료 → 'savings' 적금 상세
   s: 적금 상태 (lib/savings.js). 바꿀 때는 run(행동, ...) 으로 lib/actions.js 함수를 부른다 */
export default function App() {
  const [s, setS] = useState(() => fresh());
  const sRef = useRef(s);
  const [route, setRoute] = useState('bank');
  const [tab, setTab] = useState('home'); // 적금 상세 안 탭
  const [toast, setToast] = useState(null); // 원작풍 시스템 알림
  const [kbToast, setKbToast] = useState(null); // 카카오뱅크식 가벼운 안내
  const [modal, setModal] = useState(null); // { kind: 'welcome'|'status'|'gate'|'repay'|'result', week? }
  const [rankUp, setRankUp] = useState(null);
  const [awaken, setAwaken] = useState(false); // 히든 각성 연출 대기 (승급 연출이 닫힌 뒤 보여 줌)
  const [game, setGame] = useState(null); // { week, used }
  const [pop, setPop] = useState(0);
  const [soundOn, setSoundOn] = useState(sfxOn);
  const [autoWalk, setAutoWalk] = useState(true);
  const [remote, setRemote] = useState(false); // 폰 안 시연 리모컨 서랍
  const [proj, setProj] = useState('keep');
  const [joinKey, setJoinKey] = useState(0); // 가입 화면을 처음부터 다시 그릴 때

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
  const kbTimer = useRef(null);
  const showKb = useCallback((text) => {
    setKbToast({ text, id: Date.now() + Math.random() });
    clearTimeout(kbTimer.current);
    kbTimer.current = setTimeout(() => setKbToast(null), KB_MS);
    sfx('deny');
  }, []);
  const soon = () => showKb('시연에서는 홈 · 혜택 · 콜라보 적금만 열려요');

  const openModal = (m) => {
    setToast(null);
    setModal(m);
  };

  const showResult = () => {
    openModal({ kind: 'result' });
    sfx('result');
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
          if (awakened(sRef.current)) setAwaken(true);
          else showResult();
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

  /* ───── 소리 ───── */
  useEffect(() => {
    installSfx(() => showSys('[{효과음}이 브라우저에서 막혀 있습니다]\n화면을 한 번 더 누르거나 사이트 설정에서 소리를 허용해 주세요', 'warn', 'none'));
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
  /* 던전 BGM: 콜라보 페이지부터 켜고, 카카오뱅크 홈·혜택이나 페널티 게임(자체 BGM) 중에는 끔 */
  useEffect(() => {
    bgmSet(DUNGEON.has(route) && !game);
  }, [route, game]);
  useEffect(() => () => bgmSet(false), []);

  /* ───── 모달 ───── */
  const closeModal = () => {
    sfx('close');
    setModal(null);
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && modal && modal.kind !== 'repay') closeModal();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  /* ───── 화면 이동 ───── */
  const go = (r) => {
    sfx('tap');
    setToast(null);
    setRoute(r);
  };
  const onBankTab = (id) => {
    if (id === 'home') go('bank');
    else if (id === 'benefit') go('benefit');
    else soon();
  };
  const startJoin = () => {
    if (sRef.current.joined) {
      go('savings');
      return;
    }
    setJoinKey((k) => k + 1);
    go('join');
  };
  const openAccount = (draft) => {
    replace(openSavings(draft));
    sfx('coin');
    setRoute('done');
  };
  const confirmDone = () => {
    setTab('home');
    setRoute('savings');
    openModal({ kind: 'welcome' });
    sfx('sys');
  };
  const fullReset = () => {
    clearTimers();
    setGame(null);
    setRankUp(null);
    setAwaken(false);
    setModal(null);
    setToast(null);
    setKbToast(null);
    replace(fresh());
    setProj('keep');
    setTab('home');
    setRoute('bank');
    sfx('reset');
  };
  const goTab = (id) => {
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

  /* ───── 시연 컨트롤 (가입 후에만) ───── */
  const onDemo = (id) => {
    if (!sRef.current.joined) {
      showKb('먼저 혜택 → 나 혼자만 캐시업에서 가입해 주세요');
      return;
    }
    if (route !== 'savings') setRoute('savings');
    const opts = { autoWalk };
    if (id === 'day') run(act.nextDay, opts);
    else if (id === 'week') run(act.demoWeek, opts);
    else if (id === 'five') run(act.demoFive, opts);
    else if (id === 'miss') run(act.demoMiss);
    else if (id === 'mate') run(act.addMates, 1);
    else if (id === 'mate5') run(act.addMates, 5);
    else if (id === 'to25') run(act.demoTo25, opts);
    else if (id === 'finish') {
      setRemote(false); // 승급·각성 연출을 서랍이 가리지 않게
      run(act.demoFinish);
    }
  };

  const copyCode = () => {
    // 복사가 막혀도(권한·포커스) 알림은 띄움. 거절된 Promise도 조용히 처리
    navigator.clipboard?.writeText(s.guildCode).catch(() => {});
    showSys('[{초대 코드}를 복사했습니다]\n친구가 이 코드로 가입하면 길드원이 늘어요', '', 'coin');
  };

  const renderModal = () => {
    if (!modal) return null;
    switch (modal.kind) {
      case 'welcome':
        return <WelcomeIntro base={s.base} onClose={closeModal} />;
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

  const renderRoute = () => {
    switch (route) {
      case 'benefit':
        return <Benefits onCollab={() => go('collab')} onTab={onBankTab} onSoon={soon} />;
      case 'collab':
        return <Collab joined={s.joined} onClose={() => go('benefit')} onApply={startJoin} />;
      case 'join':
        return <Join key={joinKey} sound={sfx} onExit={() => go('collab')} onOpen={openAccount} />;
      case 'done':
        return <JoinDone s={s} onConfirm={confirmDone} />;
      case 'savings':
        return (
          <div className="view sav">
            <TopBar title="나 혼자만 캐시업" onLeft={() => go('bank')} right={<SoundButton on={soundOn} onClick={() => setSound(!soundOn)} />} />
            <Header s={s} onRate={() => goTab('rate')} />
            <div className="scroll" key={tab}>
              <div className="screen">
                {tab === 'home' && (
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
                    onTab={goTab}
                  />
                )}
                {tab === 'rate' && (
                  <Rate
                    s={s}
                    proj={proj}
                    onProj={(p) => {
                      sfx('tap');
                      setProj(p);
                    }}
                    onTab={goTab}
                  />
                )}
                {tab === 'walk' && <Walk s={s} onWalk={(n) => run(act.walk, n)} />}
                {tab === 'guild' && <Guild s={s} onCopy={copyCode} onJoin={() => run(act.addMates, 1)} />}
              </div>
            </div>
            <TabBar
              tab={tab}
              onTab={goTab}
              dot={gates(s).length > 0}
            />
          </div>
        );
      default:
        return <BankHome s={s} onPromo={() => go('collab')} onSavings={() => go('savings')} onTab={onBankTab} onSoon={soon} />;
    }
  };

  return (
    <>
      <div className="phone">
        <StatusBar />
        {renderRoute()}
        <SysToast
          toast={toast}
          life={SYS_MS}
          onClose={() => {
            setToast(null);
            sfx('close');
          }}
        />
        <KbToast toast={kbToast} />
        <div className={`modal${modal ? ' show' : ''}`}>{renderModal()}</div>
        {rankUp && (
          <RankUp
            from={rankUp.from}
            to={rankUp.to}
            onClose={() => {
              setRankUp(null);
              sfx('close');
            }}
          />
        )}
        {awaken && !rankUp && (
          <AwakenScene
            s={s}
            onDone={() => {
              setAwaken(false);
              showResult();
            }}
          />
        )}
        {!game && !awaken && modal?.kind !== 'welcome' && (
          <DemoRemote
            open={remote}
            onToggle={() => {
              sfx(remote ? 'close' : 'tap');
              setRemote(!remote);
            }}
            onDemo={onDemo}
            onReset={fullReset}
            autoWalk={autoWalk}
            onAutoWalk={setAutoWalk}
          />
        )}
        {game && (
          <div className="pq">
            <PenaltyGame week={game.week} tries={TRIES_PER_TICKET} art={hunterArt(s.grade)} muted={!soundOn} onMute={(m) => setSound(!m)} onLaunch={onLaunch} onRescued={onRescued} onQuit={onQuit} />
          </div>
        )}
      </div>

      <DemoPanel onDemo={onDemo} onReset={fullReset} autoWalk={autoWalk} onAutoWalk={setAutoWalk} locked={!!game} />
    </>
  );
}

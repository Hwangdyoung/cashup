import { useState } from 'react';
import { DungeonArt, TopBar } from '../components/Shell.jsx';
import { CheckIcon } from '../components/Icons.jsx';
import TierList from '../components/TierList.jsx';
import { AMTS, BASE_RATE, DEMO_GUILD_CODE, GUILD_CODE_RE, GUILD_MAX, MAX_RATE, PAY_DAYS, S_BONUS, TOTAL } from '../lib/rules.js';
import { HUNTER, SHADOWS, SHADOW_ART, hunterArt } from '../lib/characters.js';
import { fmt, pct, pp, won } from '../lib/format.js';
import { makeGuildCode, maturityPrincipal } from '../lib/savings.js';
import { DEMO_ACCOUNT } from './BankHome.jsx';

/* 약관 (카카오뱅크 26주적금 개설 화면 구성. 시연용 제목만, 내용 없음) */
const TERMS = [
  { id: 'doc', t: '나 혼자만 캐시업 상품설명서', items: [] },
  { id: 'prod', t: '상품 이용약관', items: ['예금거래기본약관', '적립식예금 약관', '자동이체(출금) 약관', '나 혼자만 캐시업 특약 (콜라보 IF 세계관 안내 포함)'] },
  { id: 'pre', t: '금융상품 가입 전 안내', items: ['중요사항 설명 안내', '불이익사항 안내', '금융소비자 권리사항 안내'] },
  { id: 'law', t: '불법·탈법 차명거래 금지 설명 확인', items: [] },
];
const STEPS = ['hunter', 'terms', 'amount', 'debit', 'guild', 'summary'];

/* 가입 단계. 마치면 onOpen({ base, payDay, guild }) */
export default function Join({ onExit, onOpen, sound }) {
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState({ doc: false, prod: false, pre: false, law: false });
  const [amount, setAmount] = useState(null);
  const [payDay, setPayDay] = useState(1);
  const [guildMode, setGuildMode] = useState('create');
  const [code, setCode] = useState('');
  const [myCode] = useState(makeGuildCode);

  const id = STEPS[step];
  const allAgreed = Object.values(agree).every(Boolean);
  const codeOk = GUILD_CODE_RE.test(code.trim().toUpperCase());
  const canNext = id === 'terms' ? allAgreed : id === 'amount' ? amount !== null : id === 'guild' ? guildMode === 'create' || codeOk : true;
  const guild = guildMode === 'create' ? { mode: 'create', code: myCode } : { mode: 'join', code: code.trim().toUpperCase() };

  const next = () => {
    if (!canNext) return;
    sound('tap');
    if (step < STEPS.length - 1) setStep(step + 1);
    else onOpen({ base: amount, payDay, guild });
  };
  const back = () => {
    sound('close');
    if (step === 0) onExit();
    else setStep(step - 1);
  };
  const toggle = (k) => {
    sound('tap');
    setAgree((a) => ({ ...a, [k]: !a[k] }));
  };
  const toggleAll = () => {
    sound('tap');
    const v = !allAgreed;
    setAgree({ doc: v, prod: v, pre: v, law: v });
  };

  return (
    <div className="view join">
      <TopBar title={id === 'hunter' ? '' : '나 혼자만 캐시업 개설'} onLeft={back} right="취소" onRight={onExit} />
      <div className="scroll">
        <div className="join-body">

          {id === 'hunter' && (
            <>
              <h2>
                {TOTAL}주 동안 함께 성장할
                <br />
                헌터를 소개할게요
              </h2>
              <p className="lead">가입자는 헌터 협회의 특별 성장 프로젝트에 참여해 {HUNTER.n}을 E급에서 S급까지 키워요.</p>
              <div className="hunter-card">
                <DungeonArt className="art" grade={0} />
                <div className="info">
                  <b>{HUNTER.n}</b>
                  <small>{HUNTER.title}</small>
                  <p>곡괭이를 든 E급 신입 헌터로 시작해요. 등급이 오를 때마다 그림자 병사가 한 명씩 합류해요.</p>
                  <p className="shadow-line">
                    {SHADOWS.map((n, i) => (
                      <span key={n}>
                        <img src={SHADOW_ART[i]} alt="" />
                        <b className="hol">{'DCBAS'[i]}</b> {n}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </>
          )}

          {id === 'terms' && (
            <>
              <h2>
                약관과 상품설명서를
                <br />
                확인해주세요
              </h2>
              <div className="terms">
                <button type="button" className="all" onClick={toggleAll} aria-pressed={allAgreed}>
                  <Ck on={allAgreed} /> 약관 전체 확인
                </button>
                {TERMS.map((g) => (
                  <div className="tgroup" key={g.id}>
                    <button type="button" onClick={() => toggle(g.id)} aria-pressed={agree[g.id]}>
                      <Ck on={agree[g.id]} /> {g.t}
                    </button>
                    {g.items.length > 0 && (
                      <ul>
                        {g.items.map((it) => (
                          <li key={it}>
                            <Ck on={agree[g.id]} /> {it}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {id === 'amount' && (
            <>
              <h2>
                {TOTAL}주 도전 금액을
                <br />
                선택해주세요
              </h2>
              <p className="lead">1주차에 고른 금액을 넣고, 매주 그만큼씩 늘려서 넣어요.</p>
              <div className="amt-art">
                <img src={hunterArt(0)} alt="" />
              </div>
              <div className="amt-pick">
                {AMTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={a === amount ? 'on' : undefined}
                    aria-pressed={a === amount}
                    onClick={() => {
                      sound('tap');
                      setAmount(a);
                    }}
                  >
                    <i className="radio" aria-hidden="true" />
                    <b>{fmt(a)}원</b>
                    <span>만기 원금 {won(maturityPrincipal(a))}</span>
                  </button>
                ))}
              </div>
              {amount !== null && (
                <p className="amt-flow">
                  매주 납입액 1주차 <b>{won(amount)}</b> → {TOTAL}주차 <b>{won(amount * TOTAL)}</b>
                </p>
              )}
            </>
          )}

          {id === 'debit' && (
            <>
              <h2>
                매주 자동이체할
                <br />
                요일과 계좌를 확인해주세요
              </h2>
              <p className="field-l">자동이체 요일</p>
              <div className="day-pick">
                {PAY_DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    className={i === payDay ? 'on' : undefined}
                    aria-pressed={i === payDay}
                    onClick={() => {
                      sound('tap');
                      setPayDay(i);
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="field-l">출금 계좌</p>
              <div className="acct-pick">
                <span className="ic">kb</span>
                <span>
                  <b>
                    {DEMO_ACCOUNT.name}({DEMO_ACCOUNT.tail})
                  </b>
                  <span>잔액 {won(DEMO_ACCOUNT.balance)} · 시연용 가짜 계좌</span>
                </span>
              </div>
              <p className="small" style={{ marginTop: 14 }}>
                매주 {PAY_DAYS[payDay]}요일에 그 주 납입액이 자동으로 빠져나가요. 납입에 성공할 때마다 EXP를 받아요.
              </p>
            </>
          )}

          {id === 'guild' && (
            <>
              <h2>
                함께할 길드를
                <br />
                정해주세요
              </h2>
              <p className="lead">인원이 늘수록 길드원 모두의 우대금리가 올라가요 (최대 {pp(GUILD_MAX)}). 공개 길드는 없고 초대 코드로만 함께해요.</p>
              <div className="guild-pick">
                <button
                  type="button"
                  className={`gopt${guildMode === 'create' ? ' on' : ''}`}
                  aria-pressed={guildMode === 'create'}
                  onClick={() => {
                    sound('tap');
                    setGuildMode('create');
                  }}
                >
                  <i className="radio" aria-hidden="true" />
                  <b>새 길드 만들기</b>
                  <span>내 초대 코드({myCode})가 생겨요. 친구에게 보내 함께해요.</span>
                </button>
                <div
                  className={`gopt${guildMode === 'join' ? ' on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={guildMode === 'join'}
                  onClick={() => {
                    if (guildMode !== 'join') sound('tap');
                    setGuildMode('join');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setGuildMode('join')}
                >
                  <i className="radio" aria-hidden="true" />
                  <b>받은 초대 코드로 참여</b>
                  <span>친구가 보낸 코드를 넣어요.</span>
                  {guildMode === 'join' && (
                    <>
                      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="HUNTER-0000" maxLength={11} aria-label="초대 코드" autoComplete="off" />
                      {code && !codeOk && <p className="err">HUNTER-로 시작하는 8자리 코드를 넣어 주세요</p>}
                      <button type="button" className="fill" onClick={() => setCode(DEMO_GUILD_CODE)}>
                        <span className="demo-chip">시연</span> 예시 코드 넣기 ({DEMO_GUILD_CODE})
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="field-l">인원별 길드 우대금리</p>
              <TierList current={-1} />
            </>
          )}

          {id === 'summary' && amount !== null && (
            <>
            <h2>
              가입 내용을
              <br />
              확인해주세요
            </h2>
            <div className="sum-card">
              <div className="top">
                <span>만기 예상원금</span>
                <b>{won(maturityPrincipal(amount))}</b>
              </div>
              <div className="sum-rows">
                {[1, 2, 3].map((w) => (
                  <div key={w}>
                    <span>{w}주차 입금액</span>
                    <b>{won(amount * w)}</b>
                  </div>
                ))}
                <div className="dots">⋮</div>
                <div>
                  <span>{TOTAL}주차 입금액</span>
                  <b>{won(amount * TOTAL)}</b>
                </div>
              </div>
              <div className="sum-rows">
                <div>
                  <span>최고 적용금리</span>
                  <b className="hl">{pct(MAX_RATE)}</b>
                </div>
                <div>
                  <span>기본 금리</span>
                  <b>{pct(BASE_RATE)}</b>
                </div>
                <div>
                  <span>가입기간</span>
                  <b>{TOTAL}주 (6개월)</b>
                </div>
                <div>
                  <span>자동이체</span>
                  <b>매주 {PAY_DAYS[payDay]}요일</b>
                </div>
                <div>
                  <span>길드</span>
                  <b>{guild.mode === 'create' ? '새 길드 ' + guild.code : '참여 ' + guild.code}</b>
                </div>
                <div>
                  <span>헌터</span>
                  <b>
                    {HUNTER.n} · E급
                  </b>
                </div>
              </div>
              <p className="sum-foot">
                최고 {pct(MAX_RATE)} = 기본 {BASE_RATE.toFixed(1)}% + 길드 우대 최대 {pp(GUILD_MAX)} + S급 달성({TOTAL}주 완납) {pp(S_BONUS)}
              </p>
            </div>
            </>
          )}
        </div>
      </div>
      <div className="bottom-cta">
        <button type="button" className="kb-btn" disabled={!canNext} onClick={next}>
          {id === 'hunter' ? `${HUNTER.n}와 시작하기` : id === 'summary' ? '가입하기' : '다음'}
        </button>
      </div>
    </div>
  );
}

function Ck({ on }) {
  return (
    <span className={`ck${on ? ' on' : ''}`}>
      <CheckIcon />
    </span>
  );
}

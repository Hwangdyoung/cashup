import { ChevronRight, DemoIcon, ResetIcon } from './Icons.jsx';
import { fmt } from '../lib/format.js';
import { WALK_GOAL } from '../lib/rules.js';

/* 목적별 묶음: 시간을 넘기는 버튼 · 상황을 만드는 버튼 · 연출 바로 보기 */
const GROUPS = [
  [
    '시간 넘기기',
    [
      ['day', '다음 날', '걸음 초기화'],
      ['week', '다음 주', '이번 주 납입'],
      ['five', '5주 빠르게'],
      ['to25', '25주로 이동'],
    ],
  ],
  [
    '상황 만들기',
    [
      ['miss', '이번 주 미납'],
      ['mate', '길드원 +1명'],
      ['mate5', '길드원 +5명'],
    ],
  ],
];

/* 시연 버튼 묶음 (데스크톱 옆 패널과 폰 안 리모컨 서랍이 같이 씀) */
function DemoControls({ onDemo, onReset, autoWalk, onAutoWalk }) {
  return (
    <>
      <button type="button" className="ctl-hero" onClick={() => onDemo('finish')}>
        <b>만기 · 히든 각성 바로 보기</b>
        <small>승급 → 히든 각성 → 수료 결과</small>
      </button>
      {GROUPS.map(([title, buttons]) => (
        <div className="ctl-group" key={title}>
          <p className="ctl-t">{title}</p>
          <div className="ctl">
            {buttons.map(([id, label, sub]) => (
              <button key={id} type="button" onClick={() => onDemo(id)}>
                {label}
                {sub && <small>{sub}</small>}
              </button>
            ))}
          </div>
          {title === '시간 넘기기' && (
            <label className="chk">
              <input type="checkbox" checked={autoWalk} onChange={(e) => onAutoWalk(e.target.checked)} />
              건너뛴 날은 {fmt(WALK_GOAL)}보 걸은 것으로
            </label>
          )}
        </div>
      ))}
      <button type="button" className="ctl-reset" onClick={onReset}>
        <ResetIcon />
        전체 초기화 · 카카오뱅크 홈부터
      </button>
    </>
  );
}

/* 폰 화면 밖 시연 컨트롤 (발표용, 데스크톱 폭). 게임 중에는 버튼을 잠근다 */
export default function DemoPanel({ onDemo, onReset, autoWalk, onAutoWalk, locked }) {
  return (
    <aside className={`side${locked ? ' pq-open' : ''}`}>
      <div className="panel">
        <h2>시연 컨트롤</h2>
        <div>
          <p>가입한 뒤 26주를 빠르게 체험할 수 있어요.</p>
          <DemoControls onDemo={onDemo} onReset={onReset} autoWalk={autoWalk} onAutoWalk={onAutoWalk} />
          <p className="small" style={{ marginTop: 8 }}>
            소리(효과음·BGM)는 적금 화면 위쪽 스피커 버튼이나 M 키로 켜고 꺼요.
          </p>
          <hr />
          <h4>동선</h4>
          <p>카카오뱅크 홈 → 혜택 → 콜라보 적금 페이지 → 가입(헌터 선택·약관·금액·자동이체·길드·요약) → 개설 완료 → 적금 상세(홈·우대금리·걷기·길드) · 페널티 퀘스트 · 승급 연출 · 만기 결과</p>
          <small>이 세계관은 콜라보 한정 IF 설정이에요.</small>
        </div>
      </div>
    </aside>
  );
}

/* 폰 안 리모컨 서랍: 오른쪽 가장자리 '시연' 손잡이를 누르면 밀려 나오고, 화살표로 다시 들어간다.
   열어 둔 채 버튼을 연달아 누를 수 있고, 왼쪽 화면에서 결과(알림·승급 연출)를 바로 본다 */
export function DemoRemote({ open, onToggle, onDemo, onReset, autoWalk, onAutoWalk }) {
  return (
    <div className={`remote${open ? ' open' : ''}`}>
      <button type="button" className="remote-tab" aria-expanded={open} aria-controls="remote-in" aria-label={open ? '시연 컨트롤 닫기' : '시연 컨트롤 열기'} onClick={onToggle}>
        {open ? (
          <ChevronRight />
        ) : (
          <>
            <DemoIcon />
            <span>시연</span>
          </>
        )}
      </button>
      <div className="remote-in" id="remote-in" role="region" aria-label="시연 컨트롤" {...(open ? {} : { inert: '' })}>
        <div className="remote-hd">
          <b>시연 컨트롤</b>
          <span className="demo-chip">발표용</span>
        </div>
        <DemoControls onDemo={onDemo} onReset={onReset} autoWalk={autoWalk} onAutoWalk={onAutoWalk} />
      </div>
    </div>
  );
}

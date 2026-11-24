import { CloseIcon, ResetIcon } from './Icons.jsx';
import { fmt } from '../lib/format.js';
import { WALK_GOAL } from '../lib/rules.js';

const BUTTONS = [
  ['day', '다음 날', '걸음 초기화'],
  ['week', '다음 주', '이번 주 납입'],
  ['five', '5주 빠르게'],
  ['miss', '이번 주 미납'],
  ['mate', '길드원 +1명'],
  ['mate5', '길드원 +5명'],
  ['to25', '25주로 이동', null, true],
];

/* 시연 버튼 묶음 (데스크톱 옆 패널과 휴대폰 아래 시트가 같이 씀) */
function DemoControls({ onDemo, onReset, autoWalk, onAutoWalk }) {
  return (
    <>
      <div className="ctl">
        {BUTTONS.map(([id, label, sub, wide]) => (
          <button key={id} type="button" className={wide ? 'wide' : undefined} onClick={() => onDemo(id)}>
            {label}
            {sub && <small>{sub}</small>}
          </button>
        ))}
        <button type="button" className="wide danger" onClick={onReset}>
          <ResetIcon />
          전체 초기화 (카카오뱅크 홈부터 다시)
        </button>
      </div>
      <label className="chk">
        <input type="checkbox" checked={autoWalk} onChange={(e) => onAutoWalk(e.target.checked)} />
        건너뛴 날은 {fmt(WALK_GOAL)}보를 걸은 것으로
      </label>
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
          <p>카카오뱅크 홈 → 혜택 → 콜라보 적금 페이지 → 가입(헌터 소개·약관·금액·자동이체·길드·요약) → 개설 완료 → 적금 상세(홈·우대금리·걷기·길드) · 페널티 퀘스트 · 승급 연출 · 만기 결과</p>
          <small>이 세계관은 콜라보 한정 IF 설정이에요.</small>
        </div>
      </div>
    </aside>
  );
}

/* 휴대폰 폭에서는 옆 패널 대신 적금 하단 탭 '시연'으로 여는 아래 시트.
   버튼을 누르면 시트를 닫아 무대·알림·승급 연출이 바로 보이게 한다 (체크박스는 닫지 않음) */
export function DemoSheet({ open, onClose, onDemo, onReset, autoWalk, onAutoWalk }) {
  if (!open) return null;
  const done = (fn) => (...a) => {
    onClose();
    fn(...a);
  };
  return (
    <div className="dsheet" onClick={onClose}>
      <div className="dsheet-in" role="dialog" aria-label="시연 컨트롤" onClick={(e) => e.stopPropagation()}>
        <div className="dsheet-hd">
          <b>시연 컨트롤</b>
          <span className="demo-chip">발표용</span>
          <button type="button" className="dsheet-x" aria-label="닫기" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <DemoControls onDemo={done(onDemo)} onReset={done(onReset)} autoWalk={autoWalk} onAutoWalk={onAutoWalk} />
      </div>
    </div>
  );
}

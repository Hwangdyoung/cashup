import { ResetIcon } from './Icons.jsx';
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

/* 폰 화면 밖 시연 컨트롤 (발표용). 게임 중에는 버튼을 잠근다 */
export default function DemoPanel({ onDemo, onReset, autoWalk, onAutoWalk, locked }) {
  return (
    <aside className={`side${locked ? ' pq-open' : ''}`}>
      <div className="panel">
        <h2>시연 컨트롤</h2>
        <div>
          <p>가입한 뒤 26주를 빠르게 체험할 수 있어요.</p>
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
          <p className="small" style={{ marginTop: 8 }}>
            소리(효과음·BGM)는 적금 화면 위쪽 스피커 버튼이나 M 키로 켜고 꺼요.
          </p>
          <hr />
          <h4>동선</h4>
          <p>카카오뱅크 홈 → 혜택 → 콜라보 적금 페이지 → 가입(헌터 소개·약관·금액·자동이체·길드·요약) → 개설 완료 → 적금 상세(홈·우대금리·걷기·길드) · 페널티 퀘스트 · 승급 연출 · 만기 결과</p>
          <small>헌터 그림은 자리표시용이에요. 상품 전용 캐릭터 그림이 정해지면 교체해요. 이 세계관은 콜라보 한정 IF 설정이에요.</small>
        </div>
      </div>
    </aside>
  );
}

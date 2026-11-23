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
          <p>26주를 빠르게 체험할 수 있어요.</p>
          <div className="ctl">
            {BUTTONS.map(([id, label, sub, wide]) => (
              <button key={id} type="button" className={wide ? 'wide' : undefined} onClick={() => onDemo(id)}>
                {label}
                {sub && <small>{sub}</small>}
              </button>
            ))}
            <button type="button" className="wide danger" onClick={onReset}>
              <ResetIcon />
              전체 초기화 (캐릭터 다시 고르기)
            </button>
          </div>
          <label className="chk">
            <input type="checkbox" checked={autoWalk} onChange={(e) => onAutoWalk(e.target.checked)} />
            건너뛴 날은 {fmt(WALK_GOAL)}보를 걸은 것으로
          </label>
          <p className="small" style={{ marginTop: 8 }}>
            효과음은 휴대폰 위쪽 스피커 버튼이나 M 키로 켜고 끌 수 있어요.
          </p>
          <hr />
          <h4>구현된 화면</h4>
          <p>
            캐릭터 선택 · 홈(만기 예상 금리 · 등급 바) · 우대금리(S급 달성 · 길드 · 26주 현황 · 만기 수령액) · 걷기(히든 각성) · 길드 초대 · 미납 유예권과 페널티 퀘스트 · 승급 연출 · 만기 결과
          </p>
          <small>헌터 이미지는 자리표시용입니다. 기획안의 라이언 콜라보 캐릭터 아트는 승인 후 교체합니다. 이 세계관은 콜라보 한정 IF 설정입니다.</small>
        </div>
      </div>
    </aside>
  );
}

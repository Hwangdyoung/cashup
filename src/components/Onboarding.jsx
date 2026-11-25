/* 첫 방문 안내 (카카오뱅크 홈 위 아래 시트)
   본 적 있는지는 이 브라우저에만 기억한다. 저장이 막힌 환경이면 매번 다시 떠도 동작에는 문제없다 */
const KEY = 'cashup-onboard';

export function onboardSeen() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
export function markOnboardSeen() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* 저장 불가: 무시 */
  }
}

const STEPS = [
  ['콜라보 적금 찾기', '홈 맨 위 배너나 혜택 탭에서 들어가요'],
  ['헌터를 고르고 가입', '약관 · 금액 · 자동이체 · 길드 순서로 진행해요'],
  ['26주를 빠르게', '오른쪽 가장자리 시연 리모컨으로 승급 · 미납 · 만기까지'],
];

export default function Onboarding({ onStart, onClose }) {
  return (
    <div className="onb" role="dialog" aria-modal="true" aria-labelledby="onb-t">
      <div className="onb-in">
        <span className="demo-chip">시연용 프로토타입</span>
        <h2 id="onb-t">
          나 혼자만 캐시업,
          <br />
          이렇게 체험해 보세요
        </h2>
        <ol className="onb-steps">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <b className="hol">{i + 1}</b>
              <span>
                <strong>{t}</strong>
                {d}
              </span>
            </li>
          ))}
        </ol>
        <p className="onb-note">계좌 · 잔액 등 모든 정보는 시연용 가짜 데이터예요.</p>
        <button type="button" className="kb-btn" onClick={onStart}>
          바로 시작하기
        </button>
        <button type="button" className="onb-skip" onClick={onClose}>
          둘러볼게요
        </button>
      </div>
    </div>
  );
}

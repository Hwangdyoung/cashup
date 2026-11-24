import SystemWindow, { Rich } from './SystemWindow.jsx';

/* 화면 맨 위에 잠깐 뜨는 원작풍 '알림' 창 (작은 변형)
   text: 첫 줄 '[...]' 제목(끝에 마침표를 붙임) · 다음 줄 설명
   life: 떠 있는 시간(ms). 아래 막대가 그만큼 줄어들며 저절로 사라짐을 보여 준다. 창을 누르면 바로 닫힘 */
export default function SysToast({ toast, life = 2800, onClose }) {
  if (!toast) return null;
  const lines = String(toast.text).split('\n');
  const head = lines.shift();
  const m = head.match(/^\[(.+)\]$/);
  const variant = toast.kind === 'warn' ? 'red' : toast.kind === 'gold' ? 'gold' : '';
  return (
    <div id="sys" role="status" aria-live="polite" key={toast.id} onClick={onClose} style={{ '--life': life + 'ms' }}>
      <SystemWindow variant={`${variant} toast`} title="알림" alert dialog={false} style={{ '--cs': '28px', '--kw': '64px' }}>
        <p className="swmsg">{m ? <>[<Rich text={m[1]} />.]</> : <Rich text={head} />}</p>
        {lines.map((l, i) => (
          <p className="swsub" key={i}>
            {l}
          </p>
        ))}
      </SystemWindow>
    </div>
  );
}

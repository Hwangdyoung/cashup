import SystemWindow, { Rich } from './SystemWindow.jsx';

/* 화면 위쪽에 잠깐 뜨는 시스템 알림
   text: 첫 줄 '[...]' 제목(끝에 마침표를 붙임) · 다음 줄부터 설명 */
export default function SysToast({ toast, onClose }) {
  if (!toast) return null;
  const lines = String(toast.text).split('\n');
  const head = lines.shift();
  const m = head.match(/^\[(.+)\]$/);
  const variant = toast.kind === 'warn' ? 'red' : toast.kind === 'gold' ? 'gold' : '';
  return (
    <div id="sys" role="status" aria-live="polite" style={{ display: 'block' }} key={toast.id}>
      <SystemWindow variant={variant} title="알림" alert onClose={onClose} dialog={false} style={{ '--cs': '40px', '--kw': '100px' }}>
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

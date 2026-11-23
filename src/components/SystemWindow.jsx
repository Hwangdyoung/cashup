import { AlertIcon } from './Icons.jsx';

/* 원작풍 시스템 창: 파란 창 + 장식 모서리 + 제목 띠
   variant: '' 파랑 · 'gold' 보상 · 'red' 경고 */
export default function SystemWindow({ variant = '', title, alert = false, onClose, style, children, dialog = true }) {
  return (
    <div className={`sw ${variant}`} style={style} role={dialog ? 'dialog' : undefined} aria-modal={dialog || undefined} aria-label={title}>
      <i className="swc tl" />
      <i className="swc tr" />
      <i className="swc bl" />
      <i className="swc br" />
      <i className="swk" />
      {onClose && (
        <span className="swctl">
          <button type="button" className="swx" aria-label="닫기" onClick={onClose}>
            — X
          </button>
        </span>
      )}
      <div className="swband">
        {alert && <AlertIcon />}
        {title}
      </div>
      <div className="swbd">{children}</div>
    </div>
  );
}

/* '{강조}' 를 <em>으로 */
export function Rich({ text }) {
  return String(text)
    .split(/(\{.+?\})/)
    .map((part, i) => (part.startsWith('{') && part.endsWith('}') ? <em key={i}>{part.slice(1, -1)}</em> : part));
}

/* 원작 말투 한 줄: [ ... ] */
export function SysLine({ children }) {
  return <p className="swmsg">[{children}]</p>;
}

/* 창 안 키-값 목록 */
export function KV({ rows, style }) {
  return (
    <dl className="kv" style={style}>
      {rows.map(([k, v]) => [<dt key={k + 'k'}>{k}</dt>, <dd key={k + 'v'}>{v}</dd>])}
    </dl>
  );
}

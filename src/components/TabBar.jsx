import { DemoIcon, GuildIcon, HomeIcon, RateIcon, WalkIcon } from './Icons.jsx';

/* 하단 탭 4개: 홈 · 우대금리 · 걷기 · 길드 */
export const TABS = [
  { id: 'home', label: '홈', Icon: HomeIcon },
  { id: 'rate', label: '우대금리', Icon: RateIcon },
  { id: 'walk', label: '걷기', Icon: WalkIcon },
  { id: 'guild', label: '길드', Icon: GuildIcon },
];

/* dot: 우대금리 탭에 빨간 점 (페널티 게이트가 열려 있을 때)
   onDemo: 휴대폰 폭에서만 보이는 다섯 번째 '시연' 버튼 (CSS .nav-demo 로 데스크톱에서는 숨김) */
export default function TabBar({ tab, onTab, dot, onDemo }) {
  return (
    <nav className="nav" aria-label="하단 메뉴">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} type="button" className={tab === id ? 'on' : undefined} aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
          <Icon />
          {label}
          {id === 'rate' && dot && <i className="dot" />}
        </button>
      ))}
      {onDemo && (
        <button type="button" className="nav-demo" onClick={onDemo}>
          <DemoIcon />
          시연
        </button>
      )}
    </nav>
  );
}

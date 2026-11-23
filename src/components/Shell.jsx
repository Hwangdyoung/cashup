import { useMemo } from 'react';
import { scene } from '../lib/scene.js';
import { hunterArt } from '../lib/characters.js';
import { BackIcon, ChartIcon, CloseIcon, GiftIcon, HomeIcon, MenuIcon, SparkIcon } from './Icons.jsx';

/* 폰 화면 틀에서 여러 화면이 같이 쓰는 조각
   StatusBar 휴대폰 상태 표시줄 · TopBar 뒤로/제목/오른쪽 · BankTabBar 카카오뱅크 하단 탭 · DungeonArt 던전 무대 그림 · KbToast 가벼운 안내 */

export function StatusBar({ dark }) {
  return (
    <div className="statusbar" style={dark ? { '--sb-bg': '#1A1440', color: '#fff' } : undefined} aria-hidden="true">
      <span>9:41</span>
      <span className="r">
        LTE <i className="bat" />
      </span>
    </div>
  );
}

/* left: 'back' | 'close' | null · right: 버튼 글자(예: '취소') 또는 JSX */
export function TopBar({ title, left = 'back', onLeft, right, onRight, dark }) {
  return (
    <header className={`topbar${dark ? ' dark' : ''}`}>
      {left ? (
        <button type="button" className="ib" aria-label={left === 'close' ? '닫기' : '뒤로'} onClick={onLeft}>
          {left === 'close' ? <CloseIcon /> : <BackIcon />}
        </button>
      ) : (
        <span />
      )}
      <h1>{title}</h1>
      {typeof right === 'string' ? (
        <button type="button" className="txt" onClick={onRight}>
          {right}
        </button>
      ) : (
        right ?? <span />
      )}
    </header>
  );
}

const BANK_TABS = [
  { id: 'home', label: '홈', Icon: HomeIcon },
  { id: 'benefit', label: '혜택', Icon: GiftIcon },
  { id: 'ai', label: 'AI', Icon: SparkIcon },
  { id: 'invest', label: '투자', Icon: ChartIcon },
  { id: 'all', label: '전체', Icon: MenuIcon },
];

/* 카카오뱅크 하단 탭. 시연에서는 홈·혜택만 열린다 */
export function BankTabBar({ tab, onTab }) {
  return (
    <nav className="kbnav" aria-label="카카오뱅크 메뉴">
      {BANK_TABS.map(({ id, label, Icon }) => (
        <button key={id} type="button" className={tab === id ? 'on' : undefined} aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
          <Icon />
          {label}
        </button>
      ))}
    </nav>
  );
}

/* 던전 무대 배경 + 헌터 (콜라보 배너·상품 페이지·가입 화면의 나혼렙 포인트) */
export function DungeonArt({ grade = 0, className = '', children, hunter = true }) {
  const bg = useMemo(() => scene(grade), [grade]);
  return (
    <div className={className}>
      <div className="bgsvg" dangerouslySetInnerHTML={{ __html: bg }} />
      {hunter && <img src={hunterArt(grade)} alt="" />}
      {children}
    </div>
  );
}

export function KbToast({ toast }) {
  if (!toast) return null;
  return (
    <div className="kb-toast" role="status" key={toast.id}>
      {toast.text}
    </div>
  );
}

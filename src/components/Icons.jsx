/* 화면에서 쓰는 선 아이콘 모음 (하단 탭 · 효과음 · 게이트 · 알림) */

export function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function RateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 15l6-6" />
      <circle cx="9.3" cy="9.3" r=".9" />
      <circle cx="14.7" cy="14.7" r=".9" />
    </svg>
  );
}

export function WalkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4.5a1.8 1.8 0 1 0 0 .1" />
      <path d="M8 21l2-6 3 2v4M10 15l-1-5 4-1 2 4 3 1" />
      <path d="M9 10l-3 3" />
    </svg>
  );
}

export function GuildIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 3v5.2c0 4.4-3 8-7 9.8-4-1.8-7-5.4-7-9.8V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function GateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#FFB3C1" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 21V9a7 7 0 0 1 14 0v12" />
      <path d="M3 21h18M12 13v3" />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  );
}

/* 시스템 창 제목 앞 느낌표 */
export function AlertIcon() {
  return (
    <svg className="swic" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth="2" />
      <path d="M12 6.5v7" stroke="#FF6F8A" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="12" cy="17.4" r="1.6" fill="#FF6F8A" />
    </svg>
  );
}

/* ───── 카카오뱅크 화면용 ───── */
export function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6 0 6-1.5S14 5 12 9z" />
    </svg>
  );
}

export function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M7.5 15l3.5-4 3 2.5 3.5-4.5" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

export function ChevronRight() {
  return (
    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/* 시연(빨리 감기) */
export function DemoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.5l7 5.5-7 5.5zM12.5 6.5l7 5.5-7 5.5z" />
    </svg>
  );
}

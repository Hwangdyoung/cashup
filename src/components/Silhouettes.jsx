/* 시즌 2 예고용 헌터 실루엣 (검은색 한 덩어리)
   성진우 그림(src/assets/character/hunter-e.png, 434 x 600)과 같은 비율·머리 크기로 그려
   선택 화면에서 같은 높이로 나란히 세운다 */

const INK = '#0B0918';

/* 차해인: 높이 묶은 긴 머리 · 날씬한 코트 · 아래로 내려 든 장검 */
export function HaeinSilhouette({ className }) {
  return (
    <svg className={className} viewBox="0 0 434 600" aria-hidden="true">
      <g fill={INK}>
        {/* 장검 (오른손에서 비스듬히 아래로) */}
        <path d="M322 398 L338 392 L398 578 L386 586 Z" />
        <rect x="298" y="388" width="58" height="12" rx="6" transform="rotate(-18 327 394)" />
        {/* 긴 머리 뒤쪽 · 묶은 머리 */}
        <ellipse cx="217" cy="212" rx="150" ry="152" />
        <ellipse cx="352" cy="150" rx="46" ry="112" transform="rotate(28 352 150)" />
        <circle cx="318" cy="66" r="28" />
        {/* 얼굴 */}
        <circle cx="217" cy="172" r="132" />
        {/* 코트 (아래로 퍼지는 모양) */}
        <path d="M168 296 L266 296 L306 452 Q217 470 128 452 Z" />
        {/* 팔 · 손 */}
        <path d="M172 312 L148 322 L118 420 L142 430 Z" />
        <circle cx="130" cy="428" r="23" />
        <path d="M262 312 L286 322 L324 404 L300 414 Z" />
        <circle cx="318" cy="410" r="23" />
        {/* 다리 · 부츠 */}
        <rect x="176" y="440" width="36" height="128" rx="14" />
        <rect x="222" y="440" width="36" height="128" rx="14" />
        <ellipse cx="190" cy="574" rx="32" ry="19" />
        <ellipse cx="246" cy="574" rx="32" ry="19" />
      </g>
    </svg>
  );
}

/* 백윤호: 뻗친 짧은 머리 · 넓은 어깨 · 발톱 달린 큰 건틀릿 */
export function YunhoSilhouette({ className }) {
  return (
    <svg className={className} viewBox="0 0 434 600" aria-hidden="true">
      <g fill={INK}>
        {/* 뻗친 머리 */}
        <path d="M92 168 L96 78 L142 104 L160 26 L208 80 L246 14 L274 76 L326 36 L330 104 L376 88 L352 170 Z" />
        {/* 얼굴 */}
        <circle cx="217" cy="176" r="128" />
        {/* 넓은 상체 */}
        <path d="M128 290 Q217 272 306 290 L334 334 L314 462 L120 462 L100 334 Z" />
        {/* 굵은 팔 */}
        <path d="M112 312 L74 330 L72 428 L120 432 Z" />
        <path d="M322 312 L360 330 L362 428 L314 432 Z" />
        {/* 건틀릿 + 발톱 */}
        <rect x="56" y="408" width="84" height="66" rx="24" />
        <rect x="294" y="408" width="84" height="66" rx="24" />
        <path d="M66 468 L74 500 L84 470 Z M90 470 L98 506 L108 470 Z M114 468 L122 498 L130 466 Z" />
        <path d="M304 466 L312 498 L320 468 Z M326 470 L336 506 L344 470 Z M350 470 L360 500 L368 468 Z" />
        {/* 다리 · 신발 (넓게 선 자세) */}
        <rect x="146" y="450" width="54" height="116" rx="18" />
        <rect x="234" y="450" width="54" height="116" rx="18" />
        <ellipse cx="166" cy="574" rx="42" ry="20" />
        <ellipse cx="268" cy="574" rx="42" ry="20" />
      </g>
    </svg>
  );
}

import { RC } from './characters.js';

/* 무대 그림 (SVG 문자열)
   - TOOLS: 승급 연출에 나오는 무기 아이콘
   - scene(등급): 홈 무대 배경. 등급 색으로 포털·마법진이 빛난다 */
export const TOOLS={
 pick:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M30 18 L48 58" stroke="#8B5A2B" stroke-width="6" stroke-linecap="round"/><path d="M8 20 Q30 2 56 14 Q34 12 30 22 Q22 16 8 20Z" fill="#B9C1D6" stroke="#5F6680" stroke-width="2"/></svg>',
 dagger:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4 L38 36 L32 42 L26 36Z" fill="#2A2440" stroke="#B9A6FF" stroke-width="2"/><rect x="20" y="40" width="24" height="5" rx="2.5" fill="#6B4FD6"/><rect x="29" y="45" width="6" height="14" rx="2" fill="#1C1630"/></svg>',
 sword:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 2 L37 40 L27 40Z" fill="#F4F6FF" stroke="#C9A64A" stroke-width="2"/><path d="M18 40 H46 L42 46 H22Z" fill="#FFD23F"/><rect x="29" y="46" width="6" height="14" rx="2" fill="#3A2A10"/></svg>',
 fist:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 30 Q16 18 26 18 H44 Q52 18 52 28 V40 Q52 54 38 56 H28 Q16 56 16 44Z" fill="#C9CFE0" stroke="#5F6680" stroke-width="2.5"/><path d="M26 18 V30 M35 18 V30 M44 19 V30" stroke="#5F6680" stroke-width="2"/><path d="M22 40 H44" stroke="#5F6680" stroke-width="2"/></svg>'
};

export function scene(r){
  var c=RC[r];
  var s='<svg class="bg" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'
   +'<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A1242"/><stop offset=".62" stop-color="#2B1752"/><stop offset="1" stop-color="#140D2C"/></linearGradient>'
   +'<radialGradient id="hazeA" cx="80%" cy="16%" r="55%"><stop offset="0" stop-color="#B3477E" stop-opacity=".4"/><stop offset="1" stop-color="#B3477E" stop-opacity="0"/></radialGradient>'
   +'<radialGradient id="hazeB" cx="12%" cy="30%" r="45%"><stop offset="0" stop-color="#5B3FBF" stop-opacity=".35"/><stop offset="1" stop-color="#5B3FBF" stop-opacity="0"/></radialGradient>'
   +'<radialGradient id="portG" cx="50%" cy="66%" r="62%"><stop offset="0" stop-color="'+c+'" stop-opacity=".95"/><stop offset=".42" stop-color="'+c+'" stop-opacity=".36"/><stop offset="1" stop-color="#0D0A24" stop-opacity="0"/></radialGradient>'
   +'<linearGradient id="stoneG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#463F7C"/><stop offset="1" stop-color="#1D1838"/></linearGradient>'
   +'<radialGradient id="floorG" cx="50%" cy="0%" r="70%"><stop offset="0" stop-color="'+c+'" stop-opacity=".3"/><stop offset="1" stop-color="#0B0920" stop-opacity="0"/></radialGradient>'
   +'<filter id="runeGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
   +'</defs>'
   +'<rect width="400" height="250" fill="url(#skyG)"/><rect width="400" height="250" fill="url(#hazeA)"/><rect width="400" height="250" fill="url(#hazeB)"/>';
  [[30,30,1.2],[62,64,.9],[96,22,1],[300,40,1.3],[336,82,.8],[362,26,1],[270,16,.9],[46,108,.8],[356,122,.9],[128,52,.7],[244,58,.7],[384,64,.8],[18,150,.7]].forEach(function(p,i){s+='<circle class="tw" style="animation-delay:'+(i*0.37).toFixed(2)+'s" cx="'+p[0]+'" cy="'+p[1]+'" r="'+p[2]+'" fill="#F3EEFF"/>';});
  s+='<path d="M0 196 L40 176 L74 188 L112 168 L150 184 L190 172 L230 186 L272 166 L312 182 L352 170 L400 186 L400 250 L0 250Z" fill="#171033" opacity=".92"/>';
  s+='<path d="M146 214 L146 100 A54 54 0 0 1 254 100 L254 214Z" fill="#0D0A24"/>';
  s+='<path class="portal" d="M146 214 L146 100 A54 54 0 0 1 254 100 L254 214Z" fill="url(#portG)"/>';
  s+='<g class="swirl" opacity=".5"><ellipse cx="200" cy="150" rx="34" ry="48" fill="none" stroke="'+c+'" stroke-width="1" stroke-dasharray="3 7"/><ellipse cx="200" cy="150" rx="21" ry="31" fill="none" stroke="'+c+'" stroke-width="1" stroke-dasharray="2 6"/></g>';
  s+='<path d="M122 214 L122 100 A78 78 0 0 1 278 100 L278 214 L254 214 L254 100 A54 54 0 0 0 146 100 L146 214Z" fill="url(#stoneG)" stroke="#5D5596" stroke-width="1.4"/>';
  s+='<path d="M122 150 L146 150 M254 150 L278 150 M122 184 L146 184 M254 184 L278 184" stroke="#262046" stroke-width="2"/>';
  s+='<path d="M189 20 L211 20 L207 44 L193 44Z" fill="#544C8E" stroke="#6E66AC" stroke-width="1.2"/>';
  s+='<rect y="212" width="400" height="38" fill="#0E0A22"/><ellipse cx="200" cy="214" rx="200" ry="10" fill="url(#floorG)"/>';
  s+='<ellipse cx="200" cy="222" rx="70" ry="12" fill="none" stroke="'+c+'" stroke-opacity=".55" stroke-width="1.4"/><ellipse class="mcs" cx="200" cy="222" rx="56" ry="9" fill="none" stroke="'+c+'" stroke-opacity=".5" stroke-width="1" stroke-dasharray="5 6"/>';
  [[150,206,0],[176,214,1.2],[226,210,2.1],[252,204,3],[200,198,.6]].forEach(function(m){s+='<circle class="mote" style="animation-delay:'+m[2]+'s" cx="'+m[0]+'" cy="'+m[1]+'" r="1.6" fill="'+c+'"/>';});
  return s+'</svg>';
}

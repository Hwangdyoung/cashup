/* 게임 선택 · 결과 화면 (원작풍 붉은 시스템 창, 문자열로 그림)
   한 화면에서 두 게임을 카드로 보여 주고(기준 점수·조작법 포함) 카드를 누르면 바로 시작한다.
   결과는 '내 점수 / 기준 점수'를 큰 숫자와 막대로 보여 준다. */
/* env: PenaltyGame.jsx가 넘겨주는 연결 고리
   $(id) 게임 안 요소 찾기 · on(대상, 이벤트, 함수, 옵션) 전역 이벤트 등록(게임을 닫으면 자동 해제)
   alive() 게임 화면이 아직 떠 있는지 · SND 배경음 엔진 · HUB 게임 선택 화면 */
var ICON_RUN='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 38h40" stroke-opacity=".5"/><circle cx="17" cy="10" r="3.5"/><path d="M16 15l-3 10 7 4 2 9M13 25l-6 6M16 15l8 4 5-3"/><path d="M33 38v-8l3-3 3 3v8" stroke="#FFD23F"/></svg>';
var ICON_DODGE='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 40h40" stroke-opacity=".5"/><path d="M12 6v8M24 4v6M36 8v9" stroke="#FFD23F"/><circle cx="12" cy="17" r="2.5" fill="currentColor"/><circle cx="36" cy="20" r="2.5" fill="currentColor"/><circle cx="24" cy="29" r="3"/><path d="M24 32v4M20 40l4-4 4 4M18 34h12"/></svg>';
export function createHub(env){
var $=env.$;var G1=env.G1,G2=env.G2,SNDX=env.SND;
var CHANCES=env.tries; /* 유예권 1장당 도전 횟수 (lib/rules.js TRIES_PER_TICKET) */
var chances=CHANCES;
var GM={
 1:{name:'던전 러닝',ctl:'탭하면 점프 · 길게 누르면 높이 점프',formula:'달린 거리 × 마나 결정',pass:function(){return G1.pass},icon:ICON_RUN},
 2:{name:'독충 회피',ctl:'좌우로 끌어서 떨어지는 독충을 피하기',formula:'버틴 시간(초) × 마나 결정',pass:function(){return G2.pass},icon:ICON_DODGE}};
var cur=1;
var fmt=function(n){return Number(n).toLocaleString('ko-KR')};
function sw(cls,title,body){return '<div class="sw '+cls+'" role="dialog" aria-label="'+title+'"><i class="swc tl"></i><i class="swc tr"></i><i class="swc bl"></i><i class="swc br"></i><i class="swk"></i><div class="swband">'+title+'</div><div class="swbd">'+body+'</div></div>'}
function show(h){$('hub').innerHTML=h;$('hub').classList.add('show')}
function hide(){$('hub').classList.remove('show')}
function view(n){$('pz1').style.display=n===1?'':'none';$('pz2').style.display=n===2?'':'none';G1.on(n===1);G2.on(n===2)}
function card(i){var m=GM[i];return '<button class="gcard" data-a="g:'+i+'"><span class="gi">'+m.icon+'</span><span class="gt"><b>'+m.name+'</b><span>'+m.ctl+'</span><small>기준 '+fmt(m.pass())+'점 · '+m.formula+'</small></span></button>'}
/* 게임 고르기 (입장 안내 · 규칙 포함) */
function choose(){if(chances<=0)return out();view(1);G1.idle();G2.idle();SNDX.mode('intro');
 var left=chances<CHANCES;
 show(sw('red','페널티 퀘스트',
 '<p class="swmsg">'+env.weekLabel+' <em>납입일</em>을 놓쳤어요</p><p class="swsub">30초 안에 기준 점수를 넘기면 재납입할 수 있어요</p>'+
 '<div class="gcards">'+card(1)+card(2)+'</div>'+
 '<p class="pz-meta">'+(left?'남은 도전 '+chances+'번':'유예권 1장으로 '+CHANCES+'번 도전')+' · 체력 4칸, 쓰러져도 점수가 넘으면 통과</p>'+
 '<button class="btn sub" data-a="later">나중에 하기</button>'))}
function out(){view(1);G1.idle();G2.idle();SNDX.mode('intro');show(sw('red','도전 기회 소진','<p class="swmsg">이번 도전 기회를 모두 썼어요</p><p class="swsub">남은 유예권이 있으면 페널티 게이트에서 다시 도전할 수 있어요</p><button class="btn" data-a="back">적금 화면으로</button>'))}
function launch(){if(chances<=0)return out();chances--;env.onLaunch();var m=GM[cur];hide();view(cur);SNDX.mode(cur===1?'count':'quiet');
 (cur===1?G1:G2).begin(m.name)}
/* 결과: 내 점수 / 기준 점수 */
function finish(id,r){var ok=r.score>=r.pass;SNDX.mode(ok?'win':'fail');
 var msg=ok?'<em>기준 점수</em>를 넘었어요':(r.win?'끝까지 버텼어요. 조금만 더!':'체력이 모두 떨어졌어요');
 var pct=Math.max(2,Math.min(100,r.score/r.pass*100));
 var detail=r.rows[0][0]+' '+r.rows[0][1]+' · '+r.rows[1][0]+' '+r.rows[1][1];
 var sub=ok?'재납입하면 완납으로 인정돼요':(chances>0?'남은 도전 '+chances+'번 · 게임을 바꿔도 돼요':(r.weak?'마나 결정을 많이 모을수록 점수가 커져요':'도전 기회를 모두 썼어요'));
 var b=ok?'<button class="btn" data-a="pay">재납입하러 가기</button>':(chances>0?'<button class="btn" data-a="enter">다시 도전</button>':'<button class="btn" data-a="out">확인</button>');
 show(sw(ok?'gold':'red',ok?'재납입 기회 획득':'도전 실패',
  '<p class="swmsg">'+msg+'</p>'+
  '<div class="score'+(ok?' ok':'')+'"><b>'+fmt(r.score)+'</b><span>/ 기준 '+fmt(r.pass)+'점</span></div>'+
  '<div class="sbar"><i style="width:'+pct+'%"></i></div>'+
  '<p class="pz-meta">'+detail+'</p><p class="swsub">'+sub+'</p>'+b))}
env.on($('hub'),'click',function(e){var b=e.target.closest('[data-a]');if(!b||b.disabled)return;SNDX.click();var a=b.dataset.a;
 if(a==='enter')choose();
 else if(a.indexOf('g:')===0){cur=+a.slice(2);launch()}
 else if(a==='out')out();
 else if(a==='pay')env.onRescued();
 else if(a==='later'||a==='back')env.onQuit();});
var api={finish:finish,quit:function(){choose()}};
choose();
return api;
}

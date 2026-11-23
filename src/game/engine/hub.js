/* 게임 선택 · 규칙 · 결과 화면 (시스템 창은 문자열로 그림) */
/* env: PenaltyGame.jsx가 넘겨주는 연결 고리
   $(id) 게임 안 요소 찾기 · on(대상, 이벤트, 함수, 옵션) 전역 이벤트 등록(게임을 닫으면 자동 해제)
   alive() 게임 화면이 아직 떠 있는지 · SND 배경음 엔진 · HUB 게임 선택 화면 */
export function createHub(env){
var $=env.$;var G1=env.G1,G2=env.G2,SNDX=env.SND;
var CHANCES=env.tries; /* 유예권 1장당 도전 횟수 (lib/rules.js TRIES_PER_TICKET) */
var chances=CHANCES;
var GM={
 1:{name:'던전 러닝',desc:'30초 · 점프로 장애물을 넘으며 달려요',formula:'달린 거리(m) × 모은 마나 결정',pass:function(){return G1.pass},
  rules:['화면을 탭(클릭)하면 점프, 길게 누르면 더 높이 뜁니다','파란 마나 결정을 모을수록 점수가 커져요','체력은 4칸. 중간에 쓰러져도 점수가 넘으면 통과예요']},
 2:{name:'독충 회피',desc:'30초 · 떨어지는 독충을 좌우로 피해요',formula:'생존 시간(초) × 모은 마나 결정',pass:function(){return G2.pass},
  rules:['마우스를 움직이거나 화면을 드래그해 좌우로 이동해요','떨어지는 마나 결정을 받을수록 점수가 커져요','체력은 4칸. 중간에 쓰러져도 점수가 넘으면 통과예요']}};
var cur=1;
function sw(cls,title,body){return '<div class="sw '+cls+'" role="dialog" aria-label="'+title+'"><i class="swc tl"></i><i class="swc tr"></i><i class="swc bl"></i><i class="swc br"></i><i class="swk"></i><div class="swband">'+title+'</div><div class="swbd">'+body+'</div></div>'}
function show(h){$('hub').innerHTML=h;$('hub').classList.add('show')}
function hide(){$('hub').classList.remove('show')}
function view(n){$('pz1').style.display=n===1?'':'none';$('pz2').style.display=n===2?'':'none';G1.on(n===1);G2.on(n===2)}
function rules(l){return '<ul class="pz-rules">'+l.map(function(t,i){return '<li><i>'+(i+1)+'</i>'+t+'</li>'}).join('')+'</ul>'}
function intro(){view(1);G1.idle();G2.idle();SNDX.mode('intro');show(sw('red','페널티 퀘스트',
 '<p class="swmsg">'+env.weekLabel+' <em>납입일</em>을 놓쳤어요</p><p class="swsub">게임에서 기준 점수를 넘기면 재납입 기회를 드려요</p><div class="swdiv"></div>'+
 rules(['게임 2종 중 하나를 골라 도전해요','유예권 1장으로 <b>'+CHANCES+'번</b> 도전할 수 있어요'+(CHANCES>1?' (두 게임이 함께 써요)':''),'벌칙이 아니라 구제 장치예요. 쉽게 만들었으니 편하게 하세요'])+
 '<button class="btn" data-a="enter">게임 고르기</button><button class="btn sub" data-a="later">나중에 하기</button>'))}
function pick(){if(chances<=0)return out();view(1);G1.idle();G2.idle();SNDX.mode('intro');
 var c=[1,2].map(function(i){return '<button class="btn" data-a="g:'+i+'">'+GM[i].name+'<small>'+GM[i].desc+'</small></button>'}).join('');
 show(sw('red','게임 선택','<p class="swmsg">도전할 게임을 골라 주세요</p><p class="swsub">남은 페널티 기회 <em>'+chances+' / '+CHANCES+'</em>회</p><div class="swdiv"></div>'+c))}
function rulesScr(i){cur=i;var m=GM[i];show(sw('red',m.name,
 '<p class="swmsg">기준 점수 <em>'+m.pass().toLocaleString()+'점</em>을 넘기면 재납입 기회!</p><p class="swsub">점수 = '+m.formula+'</p><div class="swdiv"></div>'+rules(m.rules)+
 '<button class="btn" data-a="go">확인하고 시작</button><button class="btn sub" data-a="enter">게임 다시 고르기</button>'))}
function out(){view(1);G1.idle();G2.idle();SNDX.mode('intro');show(sw('red','페널티 기회 소진','<p class="swmsg">이번 페널티 기회를 모두 사용했어요</p><p class="swsub">미납 유예권 1장이 사용되었어요. 남은 유예권이 있으면 다시 도전할 수 있어요</p><button class="btn" data-a="back">적금 화면으로 돌아가기</button>'))}
function launch(){if(chances<=0)return out();chances--;env.onLaunch();var m=GM[cur];hide();view(cur);SNDX.mode(cur===1?'count':'quiet');
 (cur===1?G1:G2).begin(m.name+' · 남은 기회 '+chances+'/'+CHANCES)}
function finish(id,r){var ok=r.score>=r.pass;SNDX.mode(ok?'win':'fail');
 var msg=ok?'<em>기준 점수</em>를 넘었어요!':(r.win?'끝까지 해냈어요. 조금만 더 모으면 통과예요':'체력이 모두 소진되었어요');
 var sub=ok?'재납입 기회를 드립니다':(chances>0?(r.weak?'마나 결정을 더 모아 보세요':'거의 다 왔어요')+' · 남은 기회 '+chances+'회':'페널티 기회를 모두 사용했어요');
 var st='<div class="stats">'+r.rows.map(function(a,i){return '<span>'+a[0]+'</span><b'+(i===3?' class="xp"':'')+'>'+a[1]+'</b>'}).join('')+'</div>';
 var b=ok?'<button class="btn" data-a="pay">재납입하러 가기</button>':(chances>0?'<button class="btn" data-a="enter">다시 도전 ('+chances+'회 남음) · 게임 바꾸기 가능</button>':'<button class="btn" data-a="out">확인</button>');
 show(sw(ok?'gold':'red',ok?'재납입 기회 획득':'도전 실패','<div class="picbox"><img src="'+$('pgHero').src+'" alt=""></div><p class="swmsg">'+msg+'</p><p class="swsub">'+sub+'</p>'+st+b))}
env.on($('hub'),'click',function(e){var b=e.target.closest('[data-a]');if(!b||b.disabled)return;SNDX.click();var a=b.dataset.a;
 if(a==='enter')pick();
 else if(a.indexOf('g:')===0)rulesScr(+a.slice(2));
 else if(a==='go')launch();
 else if(a==='out')out();
 else if(a==='pay')env.onRescued();
 else if(a==='later'||a==='back')env.onQuit();});
var api={finish:finish,quit:function(){intro()}};
intro();
return api;
}

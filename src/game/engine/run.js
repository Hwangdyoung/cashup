/* 게임 1 · 던전 러닝: 탭하면 점프, 30초 동안 장애물을 넘고 마나 결정을 모은다 */
import { scorp } from './shared.js';
/* env: PenaltyGame.jsx가 넘겨주는 연결 고리
   $(id) 게임 안 요소 찾기 · on(대상, 이벤트, 함수, 옵션) 전역 이벤트 등록(게임을 닫으면 자동 해제)
   alive() 게임 화면이 아직 떠 있는지 · SND 배경음 엔진 · HUB 게임 선택 화면 */
export function createRun(env){
var W=370,H=620,G=490,HH=72,HW=29;
var $=env.$;
var cv=$('cv'),x=cv.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2);
cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
var HERO=$('pgHero');
var SC=new Image();SC.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(scorp());
var FONT='"HeirOfLight","Noto Serif KR","Nanum Myeongjo",serif';
var PASS=1500,MAXHP=4,on=true;
var passed=false,gnd=0,jumped=false,buf=0;
var st='intro',t=0,dist=0,hp=4,inv=0,crys=0,hits=0,py=0,vy=0,hold=0,hx=90,obs=[],items=[],gap=0,potion=false,shake=0,flash=0,retries=1,best=0,tm=0,last=0,keys={l:0,r:0,u:0,d:0};
var SND=env.SND;
function spd(){return t<10?240:t<20?240+(t-10)/10*50:290+(t-20)/10*30}
function meters(){return Math.floor(dist/40)}
function score(){return meters()*crys}
var HEART='<path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.4 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z"/>';
function hearts(){var s='';for(var i=0;i<MAXHP;i++)s+='<svg viewBox="0 0 24 24" class="'+(i<hp?'':'off')+'">'+HEART+'</svg>';SND.hp(hp);$('hp').innerHTML=s;$('hp').setAttribute('aria-label','생명 '+hp)}
function sw(cls,title,body){return '<div class="sw '+cls+'" role="dialog" aria-label="'+title+'"><i class="swc tl"></i><i class="swc tr"></i><i class="swc bl"></i><i class="swc br"></i><i class="swk"></i><div class="swband">'+title+'</div><div class="swbd">'+body+'</div></div>'}
function reset(){t=0;dist=0;hp=MAXHP;inv=0;crys=0;hits=0;py=0;vy=0;hold=0;hx=90;obs=[];items=[];gap=0;potion=false;shake=0;flash=0;tm=0;passed=false;gnd=0;jumped=false;buf=0;$('ttl').textContent='페널티 퀘스트 · 던전 러닝';hearts();upHud()}
function begin(label){reset();$('ttl').textContent=label;st='count';tm=3.99;SND.mode('count')}
function canJump(){return !jumped&&(py<=.5||gnd<=.1)}
function doJump(){vy=620;hold=0;jumped=true;buf=0;SND.jump()}
function jump(){if(st!=='play')return;if(canJump())doJump();else buf=.1}
function setK(k,v){if(k==='u'&&v&&!keys.u)jump();keys[k]=v;}
var KM={ArrowUp:'u',Space:'u'};function kk(e){return KM[e.code]||KM[e.key]||(e.key===' '?'u':null)}
env.on(window,'keydown',function(e){var k=kk(e);var g=$('hub').classList.contains('show')&&$('hub').querySelector('[data-a="go"]');if(g&&(k||e.code==='Enter')){e.preventDefault();g.click();return}if(k){e.preventDefault();setK(k,1)}},true);
function foc(){try{env.root.focus({preventScroll:true})}catch(err){}}
foc();
env.on(window,'keyup',function(e){var k=kk(e);if(k){e.preventDefault();setK(k,0)}},true);
env.on(window,'blur',function(){for(var k in keys)setK(k,0)});
function spawn(){
 var kinds=['scorp','cactus'];if(t>=12)kinds.push('pit','scorp');if(t>=20)kinds.push('wasp');if(t>=25)kinds.push('combo');
 var k=kinds[Math.floor(Math.random()*kinds.length)],X=W+40,w=0,ex=0;
 if(k==='scorp'){obs.push({k:k,x:X,w:46,h:32});w=46}
 else if(k==='cactus'){obs.push({k:k,x:X,w:24,h:40});w=24}
 else if(k==='wasp'){ex=Math.round(spd()*.9);X+=ex;obs.push({k:k,x:X,w:30,h:24,y:G-92});w=30}
 else if(k==='pit'){w=Math.round(spd()*.4);obs.push({k:k,x:X,w:w,h:0})}
 else{obs.push({k:'scorp',x:X,w:46,h:32});obs.push({k:'scorp',x:X+84,w:46,h:32});w=130}
 if(Math.random()<.7&&k!=='wasp'){for(var i=0;i<3;i++)items.push({k:'c',x:X+w/2-30+i*30,y:G-104+(i===1?-12:0)})}
 gap=w+ex+spd()*(t<10?1.6:(1.2+Math.random()*.3))}
function hit(o){if(inv>0||o.hit)return;o.hit=true;hp--;hits++;inv=1.2;shake=.25;flash=.3;SND.hit();hearts();if(hp<=0)end(false)}
function end(win){if(st==='result')return;st='result';var m=meters(),sc=score();
 env.HUB().finish(1,{win:win,score:sc,pass:PASS,rows:[['달린 거리',m.toLocaleString()+'m'],['마나 결정',crys+'개'],['최종 점수',sc.toLocaleString()+'점'],['기준 점수',PASS.toLocaleString()+'점']],weak:crys<8})}
env.on($('quit'),'click',function(){SND.click();env.HUB().quit()});
var pzEl=$('pz1');
env.on(pzEl,'pointerdown',function(e){if(e.target.closest('#quit,#snd'))return;setK('u',1)});
['pointerup','pointercancel'].forEach(function(n){env.on(window,n,function(){setK('u',0)})});
function upHud(){var r=Math.max(0,Math.ceil(30-t));var s=Math.floor(r/60)+':'+('0'+r%60).slice(-2);var e=$('tm');if(e.textContent!==s)e.textContent=s;e.classList.toggle('low',r<=10&&st==='play');
 $('bar').style.transform='scaleX('+Math.min(1,t/30)+')';$('steps').textContent=meters().toLocaleString()+'m';$('crys').textContent='마나 결정 '+crys;
 var sc=score(),gt=$('gtxt'),tx=sc>=PASS?'통과 확정! '+sc.toLocaleString()+'점':sc.toLocaleString()+' / '+PASS.toLocaleString()+'점';
 $('gbar').style.transform='scaleX('+Math.min(1,sc/PASS)+')';if(gt.textContent!==tx)gt.textContent=tx;$('goal').classList.toggle('ok',sc>=PASS);
 if(st==='play'&&!passed&&sc>=PASS){passed=true;SND.goal()}}
var lastCnt=0;
function update(dt){
 if(st==='count'){tm-=dt;var n=Math.ceil(tm);if(n!==lastCnt){lastCnt=n;var c=$('cnt');c.classList.remove('show','word');void c.offsetWidth;if(n>0){c.textContent=n}else{c.textContent='달려라!';c.classList.add('word')}c.classList.add('show');if(n>0)SND.count(n);else SND.go()}if(tm<=0){st='play';lastCnt=0;SND.mode('play')}return}
 if(st==='intro'){dist+=60*dt;return}
 if(st!=='play')return;
 t+=dt;SND.phase(t<10?1:t<20?2:3);var s=spd();dist+=s*dt;if(inv>0)inv-=dt;if(shake>0)shake-=dt;if(flash>0)flash-=dt;
 hx=90;
 if(py>0||vy!==0){hold+=dt;var g=keys.d?5200:(keys.u&&hold<.3&&vy>0)?1200:2400;vy-=g*dt;py+=vy*dt;if(py<=0){if(vy<-250)SND.land();py=0;vy=0}}
 if(py<=0){gnd=0;jumped=false}else gnd+=dt;
 if(buf>0){buf-=dt;if(canJump())doJump()}
 gap-=s*dt;if(t>=1.1&&gap<=0&&t<27.5)spawn();
 if(!potion&&t>12){potion=true;items.push({k:'p',x:W+40,y:G-30})}
 var hb={x:hx-9,y:G-62-py,w:18,h:60};
 obs.forEach(function(o){o.x-=s*dt;
  if(o.k==='pit'){if(py<2&&hx>o.x+8&&hx<o.x+o.w-8&&!o.hit){hit(o);if(hp>0){vy=520;jumped=true}}}
  else{var oy=o.y||G-o.h,ix=o.w*.075,iy=o.h*.075;if(hb.x<o.x+o.w-ix&&hb.x+hb.w>o.x+ix&&hb.y<oy+o.h-iy&&hb.y+hb.h>oy+iy)hit(o)}});
 obs=obs.filter(function(o){return o.x+o.w>-20});
 items.forEach(function(it){it.x-=s*dt;if(it.got)return;var dx=it.x-hx,dy=it.y-(G-36-py);if(dx*dx+dy*dy<900){it.got=true;if(it.k==='c'){crys++;SND.crystal()}else{hp=Math.min(MAXHP,hp+1);hearts();SND.heal()}}});
 items=items.filter(function(i){return i.x>-20&&!i.got});
 upHud();if(t>=30){t=30;upHud();end(true)}}
function dune(off,per,amp,base,col){x.fillStyle=col;x.beginPath();x.moveTo(0,G);for(var i=0;i<=W;i+=6)x.lineTo(i,base+Math.sin((i+off)/per)*amp);x.lineTo(W,G);x.fill()}
function bg(){
 var gr=x.createLinearGradient(0,0,0,G);gr.addColorStop(0,'#3A0E22');gr.addColorStop(.5,'#6E3226');gr.addColorStop(1,'#B9784A');x.fillStyle=gr;x.fillRect(0,0,W,H);
 var sg=x.createRadialGradient(290,120,4,290,120,80);sg.addColorStop(0,'rgba(255,143,106,.9)');sg.addColorStop(1,'rgba(255,93,120,0)');x.fillStyle=sg;x.fillRect(190,40,180,170);
 x.fillStyle='#FF8F6A';x.beginPath();x.arc(290,120,16,0,7);x.fill();
 dune(dist*.05,70,22,G-80,'#7A4428');dune(dist*.14,46,14,G-36,'#A8673A');
 var g2=x.createLinearGradient(0,G,0,H);g2.addColorStop(0,'#B9784A');g2.addColorStop(1,'#7A4428');x.fillStyle=g2;x.fillRect(0,G,W,H-G);
 x.fillStyle='#E0A070';x.fillRect(0,G,W,2);
 x.fillStyle='rgba(60,18,10,.25)';var o1=dist%90,o2=(dist*1.1)%130,o3=(dist*1.25)%70;
 for(var k=-1;k<6;k++){x.fillRect(k*90-o1,G+26,34,3);x.fillRect(k*130-o2+20,G+62,46,3);x.fillRect(k*70-o3,G+96,26,3)}
 obs.forEach(function(p){if(p.k==='pit'){var pg=x.createLinearGradient(0,G,0,H);pg.addColorStop(0,'#1A0610');pg.addColorStop(1,'#2A0814');x.fillStyle=pg;x.fillRect(p.x,G,p.w,H-G);x.fillStyle='#E0A070';x.fillRect(p.x-3,G,3,3);x.fillRect(p.x+p.w,G,3,3)}})}
function draw(){
 x.save();if(shake>0)x.translate((Math.random()-.5)*8,(Math.random()-.5)*8);
 bg();
 obs.forEach(function(p){
  if(p.k==='scorp'){if(SC.complete){x.save();x.translate(p.x+p.w/2,G);x.scale(-1,1);x.drawImage(SC,-30,-40+Math.sin(performance.now()/90+p.x)*1.5,60,45);x.restore()}}
  else if(p.k==='cactus'){x.fillStyle='#4A1230';x.strokeStyle='#FF8FA6';x.lineWidth=1.5;x.beginPath();x.roundRect?x.roundRect(p.x+7,G-p.h,11,p.h,5):x.rect(p.x+7,G-p.h,11,p.h);x.fill();x.stroke();
   x.fillRect(p.x,G-34,7,16);x.fillRect(p.x+18,G-28,7,14);x.fillRect(p.x,G-22,16,6);x.fillRect(p.x+10,G-18,15,5)}
  else if(p.k==='wasp'){var f=Math.sin(performance.now()/40)*5;x.fillStyle='rgba(255,236,250,.65)';x.beginPath();x.ellipse(p.x+12,p.y+4-f,10,5,-.4,0,7);x.fill();x.beginPath();x.ellipse(p.x+20,p.y+4-f,10,5,.4,0,7);x.fill();
   x.fillStyle='#FFD23F';x.beginPath();x.ellipse(p.x+15,p.y+15,14,8,0,0,7);x.fill();x.fillStyle='#2A0A12';x.fillRect(p.x+9,p.y+8,3,14);x.fillRect(p.x+16,p.y+8,3,14);x.beginPath();x.moveTo(p.x+1,p.y+15);x.lineTo(p.x-6,p.y+19);x.lineTo(p.x+2,p.y+19);x.fill()}});
 items.forEach(function(i){if(i.k==='c'){x.save();x.shadowColor='#63D2FF';x.shadowBlur=10;x.fillStyle='#63D2FF';x.beginPath();x.moveTo(i.x,i.y-9);x.lineTo(i.x+7,i.y);x.lineTo(i.x,i.y+9);x.lineTo(i.x-7,i.y);x.fill();x.restore()}
  else{x.save();x.shadowColor='#FF5D78';x.shadowBlur=10;x.fillStyle='#FF5D78';x.translate(i.x-10,i.y-10);x.scale(.85,.85);x.fill(new Path2D('M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.4 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z'));x.restore()}});
 obs.forEach(function(p){if(p.k==='wasp'&&p.x>W-2){var a2=.55+.45*Math.sin(performance.now()/90);x.save();x.globalAlpha=a2;x.fillStyle='#FFD23F';x.beginPath();x.moveTo(W-24,p.y-6);x.lineTo(W-6,p.y+24);x.lineTo(W-42,p.y+24);x.closePath();x.fill();x.fillStyle='#2A0A12';x.font='700 18px '+FONT;x.textAlign='center';x.fillText('!',W-24,p.y+21);x.restore()}});
 var bl=inv>0&&Math.floor(inv*20)%2===0;
 x.fillStyle='rgba(0,0,0,'+(.28-py*.0012)+')';x.beginPath();x.ellipse(hx,G+2,15-py*.05,4,0,0,7);x.fill();
 if(!bl&&HERO.complete){var run=st==='play'&&py<=0?Math.abs(Math.sin(performance.now()/70))*3:0;x.save();x.shadowColor='rgba(255,255,255,.5)';x.shadowBlur=6;x.drawImage(HERO,hx-HW/2,G-py-HH-run,HW,HH);x.restore()}
 x.restore();
 var vg=x.createRadialGradient(W/2,H/2,H*.22,W/2,H/2,H*.78);var a=.5;if(t>=20&&st==='play')a=.62+.18*Math.sin(t*8);vg.addColorStop(0,'rgba(90,0,30,0)');vg.addColorStop(1,'rgba(90,0,30,'+a+')');x.fillStyle=vg;x.fillRect(0,0,W,H);
 if(flash>0){x.fillStyle='rgba(255,60,90,'+flash+')';x.fillRect(0,0,W,H)}
 if(t>=20&&t<22.5&&st==='play'){x.textAlign='center';x.fillStyle='#FFE3A0';x.font='700 20px '+FONT;x.shadowColor='#FF5D78';x.shadowBlur=12;x.fillText('경고: 페널티 구역 심화',W/2,96);x.shadowBlur=0}}
function loop(ms){if(!env.alive())return;var dt=Math.min(.033,(ms-last)/1000||0);last=ms;if(on){update(dt);draw()}requestAnimationFrame(loop)}
st='intro';reset();requestAnimationFrame(loop);
return{begin:begin,pass:PASS,idle:function(){st='intro';reset()},on:function(v){on=v}};
}

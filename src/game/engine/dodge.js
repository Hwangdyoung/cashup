/* 게임 2 · 독충 회피: 좌우로 움직여 떨어지는 독충을 피하고 마나 결정을 받는다 */
import { scorp } from './shared.js';
/* env: PenaltyGame.jsx가 넘겨주는 연결 고리
   $(id) 게임 안 요소 찾기 · on(대상, 이벤트, 함수, 옵션) 전역 이벤트 등록(게임을 닫으면 자동 해제)
   alive() 게임 화면이 아직 떠 있는지 · SND 배경음 엔진 · HUB 게임 선택 화면 */
export function createDodge(env){
var W=370,H=620,G=540,HH=72,HW=29,PASS=240,MAXHP=4,on=false;
var $=env.$;
var cv=$('cv2'),x=cv.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2);
cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
var HERO=$('pgHero');
var SC=new Image();SC.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(scorp());
var FONT='"HeirOfLight","Noto Serif KR","Nanum Myeongjo",serif';
var st='intro',t=0,hp=4,inv=0,crys=0,hits=0,hx=185,tx=185,objs=[],warns=[],nextS=2.5,nextC=1,nextV=22,potion=false,shake=0,flash=0,retries=1,best=0,tm=0,last=0,lastCnt=0,bgT=0,graze=0,shield=0,floats=[],nextW=12,nextB=20,nextSh=6,passed=false;
function fl(X,s,Y){floats.push({x:X,y:Y||G-90,s:s,a:1.2})}
var AC=null;
function ac(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function tone(f,d,ty,v,f2){try{var a=ac(),o=a.createOscillator(),g=a.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,a.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+d);g.gain.setValueAtTime(v||.05,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(mst());o.start();o.stop(a.currentTime+d)}catch(e){}}
function noise(d,v,fq){try{var a=ac(),n=a.sampleRate*d|0,b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(var i=0;i<n;i++)c[i]=Math.random()*2-1;var s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=fq||1200;g.gain.setValueAtTime(v||.1,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);s.connect(fl);fl.connect(g);g.connect(mst());s.start()}catch(e){}}
var drone=null,parts=[],hbT=0,M=null;function isMuted(){return env.SND.muted()}
function mst(){if(!M){var a=ac();M=a.createGain();M.gain.value=isMuted()?0:3;var c=a.createDynamicsCompressor();M.connect(c);c.connect(a.destination)}return M}
function unlock(){try{ac();mst()}catch(e){}}
env.on(window,'pointerdown',unlock);env.on(window,'keydown',unlock);env.on(document,'visibilitychange',function(){try{if(AC){if(document.hidden)AC.suspend();else AC.resume()}}catch(e){}});
var BG=null,bgm=null,CH=[[57,60,64],[53,57,60],[50,53,57],[52,56,59]],ARP=[0,1,2,1,0,1,2,1];
function mf(n){return 440*Math.pow(2,(n-69)/12)}
function bus(){if(!BG){BG=ac().createGain();BG.gain.value=.55;BG.connect(mst())}return BG}
function nt(f,t0,d,ty,v,fc){var a=AC,o=a.createOscillator(),g=a.createGain(),l=a.createBiquadFilter();o.type=ty;o.frequency.value=f;l.type='lowpass';l.frequency.value=fc||2000;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(l);l.connect(g);g.connect(bus());o.start(t0);o.stop(t0+d+.05)}
function kick(t0){var a=AC,o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t0);o.frequency.exponentialRampToValueAtTime(42,t0+.14);g.gain.setValueAtTime(.5,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.2);o.connect(g);g.connect(bus());o.start(t0);o.stop(t0+.22)}
function nz(t0,d,v,hp){var a=AC,n=a.sampleRate*d|0,b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(var i=0;i<n;i++)c[i]=Math.random()*2-1;var sr=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();sr.buffer=b;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);sr.connect(f);f.connect(g);g.connect(bus());sr.start(t0)}
function bstep(i,t0,sd){var bar=Math.floor(i/8)%4,k=i%8,c=CH[bar],hot=t>=10;
 if(k%2===0)nt(mf(c[0]-24),t0,sd*1.8,'sawtooth',.2,320);
 if(k===0)for(var q=0;q<3;q++)nt(mf(c[q]),t0,sd*7.5,'sawtooth',.035,700);
 if(k===0||k===4||(hot&&k===6))kick(t0);
 if(k===2||k===6)nz(t0,.14,.22,1500);
 if(k%2===1)nz(t0,.05,.1,7000);
 nt(mf(c[ARP[k]]+12),t0,sd*.9,'square',.05,1800);
 if(hot&&(k===0||k===3||k===5||k===7))nt(mf(c[(bar+k)%3]+24),t0,sd*2.2,'triangle',.12,3000)}
function droneOn(){try{if(bgm)return;var a=ac();bgm={i:0,nx:a.currentTime+.15};bgm.h=setInterval(function(){if(!bgm)return;var sd=60/(104+t*.8)/2;while(bgm.nx<a.currentTime+.25){bstep(bgm.i++,bgm.nx,sd);bgm.nx+=sd}},50)}catch(e){}}
function droneOff(){if(bgm){clearInterval(bgm.h);bgm=null}}
function burst(X,Y,n,col,sp,life,g){for(var i=0;i<n;i++){var a=Math.random()*6.283,v=(.3+Math.random())*sp;parts.push({x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*.3,l:life*(.6+Math.random()*.6),m:life,c:col,g:g==null?300:g,r:2.5+Math.random()*3.5})}}
function ring(X,Y,col){parts.push({x:X,y:Y,ring:1,l:.35,m:.35,c:col,r:10})}
function warnSnd(){tone(880,.12,'square',.04);setTimeout(function(){tone(660,.12,'square',.04)},140)}
var HEART='<path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.4 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z"/>';
function hearts(){var s='';for(var i=0;i<MAXHP;i++)s+='<svg viewBox="0 0 24 24" class="'+(i<hp?'':'off')+'">'+HEART+'</svg>';$('hp2').innerHTML=s;$('hp2').setAttribute('aria-label','생명 '+hp)}
function reset(){t=0;hp=MAXHP;inv=0;crys=0;hits=0;hx=185;tx=185;objs=[];warns=[];nextS=2.5;nextC=1;nextV=22;potion=false;shake=0;flash=0;tm=0;graze=0;shield=0;floats=[];parts=[];hbT=0;nextW=12;nextB=20;nextSh=6;passed=false;hearts();upHud()}
function begin(label){reset();$('ttl2').textContent=label;st='count';tm=3.99;on=true;tone(440,.15,'sine');droneOn()}
var arena=$('pz2').querySelector('.pz-arena');
function px(e){var r=cv.getBoundingClientRect();return Math.max(20,Math.min(W-20,(e.clientX-r.left)/r.width*W))}
env.on(arena,'pointermove',function(e){tx=px(e)});
env.on(arena,'pointerdown',function(e){if(e.target.closest('#win'))return;tx=px(e)});
function score(){return Math.floor(t)*crys}
function spawn(){
 var lv=t/30,kinds=['scorp','scorp','rock'];if(t>=12)kinds.push('wasp','wasp');
 var k=kinds[Math.floor(Math.random()*kinds.length)],v=150+lv*100,bx=24+Math.random()*(W-48);
 if(k==='scorp')objs.push({k:k,x:bx,bx:bx,y:-40,v:v,r:17,rot:Math.random()*6});
 else if(k==='rock')objs.push({k:k,x:bx,bx:bx,y:-30,v:v*1.25,r:13,rot:Math.random()*6});
 else objs.push({k:k,x:bx,bx:bx,y:-30,v:v*.85,r:13,ph:Math.random()*6,rot:0});tone(300,.3,'sawtooth',.02,220)}
function hit(o){if(inv>0)return;o.dead=1;if(shield>0){shield=0;inv=.6;flash=.15;tone(300,.15,'sine',.06);fl(o.x,'방어!');ring(hx,G-36,'#A9E8FF');burst(hx,G-36,12,'#A9E8FF',200,.5,0);noise(.2,.08,3000);return}hp--;hits++;inv=1.2;shake=.25;flash=.3;tone(120,.25,'sawtooth',.08,50);burst(hx,G-30,34,'#FF5D78',380,.7);ring(hx,G-30,'#FF5D78');noise(.3,.15,900);hearts();if(hp<=0)end(false)}
function end(win){if(st==='result')return;st='result';droneOff();var sc=score();env.HUB().finish(2,{win:win,score:sc,pass:PASS,rows:[['생존 시간',Math.floor(t)+'초'],['마나 결정',crys+'개'],['최종 점수',sc.toLocaleString()+'점'],['기준 점수',PASS.toLocaleString()+'점']],weak:crys<8})}
env.on($('quit2'),'click',function(){env.HUB().quit()});
env.on($('snd2'),'click',function(){env.SND.toggle()});
function upHud(){var r=Math.max(0,Math.ceil(30-t));var s=Math.floor(r/60)+':'+('0'+r%60).slice(-2);var e=$('tm2');if(e.textContent!==s)e.textContent=s;e.classList.toggle('low',r<=10&&st==='play');
 $('bar2').style.transform='scaleX('+Math.min(1,t/30)+')';$('steps2').textContent='생존 '+Math.floor(t)+'초';$('crys2').textContent='마나 결정 '+crys;
 var sc=score(),gt=$('gtxt2'),tx2=sc>=PASS?'통과 확정! '+sc.toLocaleString()+'점':sc.toLocaleString()+' / '+PASS.toLocaleString()+'점';
 $('gbar2').style.transform='scaleX('+Math.min(1,sc/PASS)+')';if(gt.textContent!==tx2)gt.textContent=tx2;$('goal2').classList.toggle('ok',sc>=PASS);
 if(st==='play'&&!passed&&sc>=PASS){passed=true;env.SND.goal()}}
function update(dt){
 bgT+=dt;parts.forEach(function(p){p.l-=dt;if(p.ring)return;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt});parts=parts.filter(function(p){return p.l>0});
 if(st==='count'){tm-=dt;var n=Math.ceil(tm);if(n!==lastCnt){lastCnt=n;var c=$('cnt2');c.classList.remove('show','word');void c.offsetWidth;if(n>0){c.textContent=n}else{c.textContent='피하라!';c.classList.add('word')}c.classList.add('show');tone(n>0?330:660,.12,'sine')}if(tm<=0){st='play';lastCnt=0}return}
 if(st!=='play')return;
 var lv=t/30;t+=dt;if(drone)drone.l.frequency.value=180+t*8;hbT-=dt;if(hp===1&&hbT<=0){hbT=.8;tone(60,.12,'sine',.12);setTimeout(function(){tone(52,.12,'sine',.09)},150)}if(inv>0)inv-=dt;if(shake>0)shake-=dt;if(flash>0)flash-=dt;
 var m=460*dt;hx+=Math.max(-m,Math.min(m,tx-hx));if(Math.abs(tx-hx)>25&&Math.random()<.35)burst(hx,G-2,1,'#D9A070',70,.4,250);
 nextS-=dt;if(nextS<=0&&t<27.5){spawn();nextS=Math.max(.8,1.3-lv*.4)*(.8+Math.random()*.4)}
 nextC-=dt;if(nextC<=0&&t<27.5){objs.push({k:'c',x:30+Math.random()*(W-60),y:-20,v:130,r:14});nextC=1.1+Math.random()*.7}
 if(t>=nextV&&t<27){var xs=[];for(var i=0;i<3;i++)xs.push(40+Math.random()*(W-80));warns.push({xs:xs,t:1.2});warnSnd();nextV+=6}
 if(t>=nextB&&t<27){warns.push({xs:[60+Math.random()*(W-120)],t:1.4,big:1});warnSnd();nextB+=9}
 if(t>=nextW&&t<27){var gx=60+Math.random()*(W-120),ws=[];for(var X=22;X<W;X+=44){if(Math.abs(X-gx)>95)ws.push(X)}warns.push({xs:ws,t:1.3,wave:1});warnSnd();fl(W/2,'낙하 파도! 빈 틈을 찾아라',150);nextW+=13}
 if(t>=nextSh&&t<26){objs.push({k:'s',x:40+Math.random()*(W-80),y:-20,v:150,r:12});nextSh+=10}
 if(!potion&&t>12){potion=true;objs.push({k:'p',x:40+Math.random()*(W-80),y:-20,v:140,r:12})}
 warns.forEach(function(w){w.t-=dt;if(w.t<=0&&!w.done){w.done=1;noise(.35,.07,2500);w.xs.forEach(function(X){if(w.big)objs.push({k:'boulder',x:X,bx:X,y:-60,v:280,r:34,rot:0});else if(w.wave)objs.push({k:'rock',x:X,bx:X,y:-30,v:200,r:14,rot:Math.random()*6});else objs.push({k:'scorp',x:X,bx:X,y:-40,v:230,r:17,rot:Math.random()*6})})}});
 warns=warns.filter(function(w){return !w.done});
 var x0=hx-9,x1=hx+9,y0=G-62,y1=G;
 objs.forEach(function(o){o.y+=o.v*dt;o.rot+=dt*2;if(o.k==='wasp'){if(o.y<G-200)o.bx+=Math.max(-30*dt,Math.min(30*dt,hx-o.bx));o.x=o.bx+Math.sin(t*4+o.ph)*20}
  if(o.k==='scorp'&&o.y>=G-14){burst(o.x,G,14,'#E0A070',200,.6,500);ring(o.x,G,'#FFB07A');tone(90,.08,'sine',.06);if(Math.abs(o.x-hx)<200)noise(.12,.05,400);o.dead=1;o.y=G+40}
  if((o.k==='rock'||o.k==='boulder')&&o.y>=G-6&&!o.landed){o.landed=1;burst(o.x,G,o.k==='boulder'?40:9,'#C08A60',o.k==='boulder'?320:160,.7,500);ring(o.x,G,'#FFB07A');if(o.k==='boulder'){shake=Math.max(shake,.2);noise(.3,.15,250);tone(60,.25,'sine',.12,35)}else tone(110,.05,'sine',.03)}
  if(o.k==='crawl'){o.life-=dt;o.x+=Math.sign(hx-o.x)*(100+lv*60)*dt;if(o.life<=0)o.dead=1}
  var cx=Math.max(x0,Math.min(x1,o.x)),cy=Math.max(y0,Math.min(y1,o.y)),dx=o.x-cx,dy=o.y-cy,rr=o.r+((o.k==='c'||o.k==='p'||o.k==='s')?8:-6);
  if(dx*dx+dy*dy<rr*rr){if(o.k==='c'){o.dead=1;crys++;tone(880,.08,'sine',.05);setTimeout(function(){tone(1320,.12,'sine',.04)},60);burst(o.x,o.y,18,'#63D2FF',220,.6,0);ring(o.x,o.y,'#63D2FF')}else if(o.k==='p'){o.dead=1;hp=Math.min(MAXHP,hp+1);hearts();[523,659,784].forEach(function(f,i){setTimeout(function(){tone(f,.2,'sine',.05)},i*70)});burst(o.x,o.y,24,'#FF8FA6',240,.8,0);ring(o.x,o.y,'#FF8FA6')}else if(o.k==='s'){o.dead=1;shield=1;tone(500,.25,'sine',.06,900);ring(hx,G-36,'#A9E8FF');fl(hx,'그림자 방어막')}else hit(o)}else if(!o.graze&&o.k!=='c'&&o.k!=='p'&&o.k!=='s'&&dx*dx+dy*dy<(rr+20)*(rr+20)){o.graze=1;graze++;fl(o.x,'아슬아슬!',G-100);tone(700,.05,'sine',.03)}});
 objs=objs.filter(function(o){return !o.dead&&o.y<G+30});
 floats.forEach(function(f){f.y-=30*dt;f.a-=dt*1.2});floats=floats.filter(function(f){return f.a>0});
 upHud();if(t>=30){t=30;upHud();end(true)}}
function dune(off,per,amp,base,col){x.fillStyle=col;x.beginPath();x.moveTo(0,G);for(var i=0;i<=W;i+=6)x.lineTo(i,base+Math.sin((i+off)/per)*amp);x.lineTo(W,G);x.fill()}
function bg(){
 var gr=x.createLinearGradient(0,0,0,G);gr.addColorStop(0,'#3A0E22');gr.addColorStop(.5,'#6E3226');gr.addColorStop(1,'#B9784A');x.fillStyle=gr;x.fillRect(0,0,W,H);
 var sg=x.createRadialGradient(290,150,4,290,150,80);sg.addColorStop(0,'rgba(255,143,106,.9)');sg.addColorStop(1,'rgba(255,93,120,0)');x.fillStyle=sg;x.fillRect(190,60,180,180);
 x.fillStyle='#FF8F6A';x.beginPath();x.arc(290,150,16,0,7);x.fill();
 dune(bgT*6,70,22,G-80,'#7A4428');dune(bgT*14,46,14,G-36,'#A8673A');
 var g2=x.createLinearGradient(0,G,0,H);g2.addColorStop(0,'#B9784A');g2.addColorStop(1,'#7A4428');x.fillStyle=g2;x.fillRect(0,G,W,H-G);
 x.fillStyle='#E0A070';x.fillRect(0,G,W,2);x.fillStyle='rgba(60,18,10,.25)';
 for(var k=0;k<5;k++){x.fillRect(k*90+10,G+26,34,3);x.fillRect(k*130-10,G+50,46,3)}
 x.fillStyle='rgba(255,170,110,.55)';for(var q=0;q<26;q++){x.globalAlpha=Math.max(0,.25+.3*Math.sin(bgT*3+q));x.fillRect((q*97+bgT*(8+q%5*3))%W,H-((q*61+bgT*(18+q%7*6))%(G+40)),2,2)}x.globalAlpha=1}
function draw(){
 x.save();if(shake>0)x.translate((Math.random()-.5)*8,(Math.random()-.5)*8);
 bg();
 warns.forEach(function(w){var a=.16+.14*Math.sin(bgT*20);w.xs.forEach(function(X){x.fillStyle='rgba(255,60,90,'+a+')';var ww=w.big?44:18;x.fillRect(X-ww,0,ww*2,G);x.fillStyle='#FFE3A0';x.font='700 22px '+FONT;x.textAlign='center';x.fillText('!',X,70)})});
 objs.forEach(function(o){if(o.k==='c'||o.k==='p'||o.k==='s'||o.k==='crawl'||o.y<0)return;var tl=o.v*.08;var tg=x.createLinearGradient(0,o.y-tl,0,o.y);tg.addColorStop(0,'rgba(255,140,110,0)');tg.addColorStop(1,o.k==='boulder'?'rgba(255,200,140,.55)':'rgba(255,150,120,.4)');x.strokeStyle=tg;x.lineWidth=o.k==='boulder'?o.r*1.2:o.r*.8;x.beginPath();x.moveTo(o.x,o.y-tl);x.lineTo(o.x,o.y);x.stroke()});
 objs.forEach(function(o){if(o.k==='c'||o.k==='p'||o.k==='s'||o.k==='crawl'||o.y<0)return;var k=Math.min(1,o.y/G);x.fillStyle='rgba(30,8,10,'+(.1+.3*k)+')';x.beginPath();x.ellipse(o.x,G+3,(o.r+4)*(.6+.6*k),(o.r/4+2)*(.6+.6*k),0,0,7);x.fill()});
 objs.forEach(function(o){x.save();x.translate(o.x,o.y);
  if(o.k==='scorp'){if(SC.complete){x.rotate(Math.sin(o.rot)*.25+1.57);x.scale(-1,1);x.drawImage(SC,-30,-23,60,45)}}
  else if(o.k==='crawl'){if(SC.complete){x.scale(hx<o.x?-1:1,1);x.drawImage(SC,-30,-30,60,45)}}
  else if(o.k==='boulder'){x.rotate(o.rot*.5);x.fillStyle='#3A0E22';x.strokeStyle='#FF8FA6';x.lineWidth=2.5;x.beginPath();for(var j=0;j<10;j++){var b=j*.628,rb=j%2?30:37;x.lineTo(Math.cos(b)*rb,Math.sin(b)*rb)}x.closePath();x.fill();x.stroke()}
  else if(o.k==='rock'){x.rotate(o.rot);x.fillStyle='#4A1230';x.strokeStyle='#FF8FA6';x.lineWidth=1.5;x.beginPath();for(var i=0;i<6;i++){var a=i*1.047,r=i%2?10:14;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.stroke()}
  else if(o.k==='wasp'){var f=Math.sin(performance.now()/40)*5;x.fillStyle='rgba(255,236,250,.65)';x.beginPath();x.ellipse(-9,-6-f,10,5,-.4,0,7);x.fill();x.beginPath();x.ellipse(9,-6-f,10,5,.4,0,7);x.fill();x.fillStyle='#FFD23F';x.beginPath();x.ellipse(0,2,8,13,0,0,7);x.fill();x.fillStyle='#2A0A12';x.fillRect(-8,-3,16,3);x.fillRect(-8,4,16,3)}
  else if(o.k==='c'){x.shadowColor='#63D2FF';x.shadowBlur=10;x.fillStyle='#63D2FF';x.beginPath();x.moveTo(0,-10);x.lineTo(7,0);x.lineTo(0,10);x.lineTo(-7,0);x.fill()}
  else if(o.k==='s'){x.shadowColor='#A9E8FF';x.shadowBlur=12;x.strokeStyle='#A9E8FF';x.lineWidth=2.5;x.beginPath();x.arc(0,0,9,0,7);x.stroke();x.fillStyle='rgba(169,232,255,.3)';x.fill()}
  else{x.shadowColor='#FF5D78';x.shadowBlur=10;x.fillStyle='#FF5D78';x.translate(-10,-10);x.scale(.85,.85);x.fill(new Path2D('M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.4 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z'))}
  x.restore()});
 x.globalCompositeOperation='lighter';parts.forEach(function(p){var k=p.l/p.m;x.globalAlpha=Math.max(0,k);if(p.ring){x.strokeStyle=p.c;x.lineWidth=4;x.beginPath();x.arc(p.x,p.y,p.r+(1-k)*60,0,7);x.stroke()}else{x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r*k+.5,0,7);x.fill()}});x.globalAlpha=1;x.globalCompositeOperation='source-over';
 var bl=inv>0&&Math.floor(inv*20)%2===0;
 x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(hx,G+2,15,4,0,0,7);x.fill();
 var ag=x.createRadialGradient(hx,G-36,4,hx,G-36,60);ag.addColorStop(0,'rgba(120,220,255,'+(.22+.08*Math.sin(bgT*5))+')');ag.addColorStop(1,'rgba(120,220,255,0)');x.fillStyle=ag;x.fillRect(hx-60,G-96,120,120);
 if(shield>0){x.strokeStyle='rgba(169,232,255,'+(.6+.3*Math.sin(bgT*8))+')';x.lineWidth=2.5;x.beginPath();x.arc(hx,G-36,34,0,7);x.stroke()}
 if(!bl&&HERO.complete){var mv=Math.min(1,Math.abs(tx-hx)/40),run=st==='play'?Math.abs(Math.sin(performance.now()/70))*3*mv:0;x.save();x.shadowColor='rgba(255,255,255,.5)';x.shadowBlur=6;x.translate(hx,G-run);x.rotate((tx-hx)*.0012);x.drawImage(HERO,-HW/2,-HH,HW,HH);x.restore()}
 x.restore();
 floats.forEach(function(f){x.globalAlpha=Math.max(0,Math.min(1,f.a));x.fillStyle='#FFE3A0';x.font='700 16px '+FONT;x.textAlign='center';x.fillText(f.s,Math.max(70,Math.min(W-70,f.x)),f.y);x.globalAlpha=1});
 var vg=x.createRadialGradient(W/2,H/2,H*.22,W/2,H/2,H*.78),a=.5;if(t>=20&&st==='play')a=.62+.18*Math.sin(t*8);if(hp===1&&st==='play')a=Math.max(a,.7+.15*Math.sin(bgT*7));vg.addColorStop(0,'rgba(90,0,30,0)');vg.addColorStop(1,'rgba(90,0,30,'+a+')');x.fillStyle=vg;x.fillRect(0,0,W,H);
 if(flash>0){x.fillStyle='rgba(255,60,90,'+flash+')';x.fillRect(0,0,W,H)}
 if(t>=20&&t<22.5&&st==='play'){x.textAlign='center';x.fillStyle='#FFE3A0';x.font='700 20px '+FONT;x.shadowColor='#FF5D78';x.shadowBlur=12;x.fillText('경고: 낙하 구역 심화',W/2,110);x.shadowBlur=0}}
function loop(ms){if(!env.alive())return;var dt=Math.min(.033,(ms-last)/1000||0);last=ms;if(M)M.gain.value=isMuted()?0:3;$('snd2').classList.toggle('muted',isMuted());if(on){update(dt);draw()}requestAnimationFrame(loop)}
reset();requestAnimationFrame(loop);
return{begin:begin,pass:PASS,idle:function(){st='intro';droneOff();reset()},on:function(v){on=v},
 /* 게임을 닫을 때: 배경음 타이머와 오디오 정리 */
 destroy:function(){droneOff();try{AC&&AC.close()}catch(e){}}};
}

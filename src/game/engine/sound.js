/* 던전 러닝 BGM · 효과음 엔진 (M 키 음소거는 앱이 맡음) */
/* host: PenaltyGame.jsx가 넘겨주는 연결 고리 (이 파일 안의 env()는 음량 엔벨로프 함수라 이름을 다르게 씀)
   $(id) 게임 안 요소 찾기 · on(대상, 이벤트, 함수, 옵션) 전역 이벤트 등록(게임을 닫으면 자동 해제)
   alive() 게임 화면이 아직 떠 있는지 · SND 배경음 엔진 · HUB 게임 선택 화면 */
/* ================= SOUND ENGINE (WebAudio 합성 · 외부 음원 파일 없음) =================
   BGM : D 프리지안 도미넌트 · 안달루시안 카덴스(Dm–C–B♭–A) · 3단계 레이어 (1단계 긴장 → 2단계 질주 → 3단계 페널티 심화)
   SFX : 점프/착지/마나결정(콤보 음계)/피격/포션/카운트다운/경고/클리어/실패
   볼륨 조절은 아래 세 상수만 바꾸면 됩니다. */
export function createSound(host){
var MASTER=.8,MUSIC_VOL=.58,SFX_VOL=.95;
var ctx=null,ready=false,unlocked=false,muted=false,want='intro',cur=null,prev=null;
muted=!!host.muted;
var master,comp,mus,musF,sfx,sx,revIn,dlyIn,dly,nb,windG,droneG,B={};
var mode='off',step=0,nextT=0,bpm=60,phase=1,pend=0,pendT=0,hpNow=4,timer=null,comboN=0,comboT=0,baseF=19000,opt={};
var BPM={1:118,2:124,3:132};

/* ---- 음악 데이터 ---- */
var PROG=[
 {r:38,pad:[50,57,62,65],arp:[62,65,69,74]},   /* Dm */
 {r:36,pad:[48,55,60,64],arp:[60,64,67,72]},   /* C  */
 {r:34,pad:[46,53,58,62],arp:[58,62,65,70]},   /* B♭ */
 {r:33,pad:[45,52,57,61],arp:[57,61,64,69]}    /* A  (C♯ = 하모닉 마이너 리딩톤) */
];
var WINP=[
 {r:38,pad:[50,57,62,66],arp:[62,66,69,74]},   /* D  */
 {r:35,pad:[47,54,59,62],arp:[59,62,66,71]},   /* Bm */
 {r:31,pad:[43,50,55,59],arp:[55,59,62,67]},   /* G  */
 {r:33,pad:[45,52,57,61],arp:[57,61,64,69]}    /* A  */
];
var LEAD=[
 [[0,74,4],[4,77,2],[6,76,2],[8,74,4],[12,72,2],[14,69,2]],
 [[0,72,4],[4,76,2],[6,79,2],[8,77,4],[12,76,2],[14,74,2]],
 [[0,74,4],[4,77,2],[6,74,2],[8,72,4],[12,70,4]],
 [[0,73,2],[2,74,2],[4,76,4],[8,74,2],[10,73,2],[12,73,4]]
];
function P(l){var a=[];for(var i=0;i<16;i++)a.push(0);l.forEach(function(i){a[i]=1});return a}
var KP={1:P([0,6,10]),2:P([0,4,8,12]),3:P([0,4,8,10,12,15])};
var SP={1:P([12]),2:P([4,12]),3:P([4,12])};
var DK={0:'D',3:'k',4:'T',6:'k',8:'D',10:'D',12:'T',14:'k',15:'T'};
var BP={
 1:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
 2:[1,0,1,0,1,0,2,1,1,0,1,0,1,0,2,0],
 3:[1,1,0,1,1,0,2,1,1,1,0,1,1,0,2,3]};
var PING=[69,74,75,78,81];

function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function now(){return ctx.currentTime}
function R(){return ready&&unlocked&&!muted&&ctx.state==='running'}

/* ---- 노드 헬퍼 ---- */
function O(type,f,t,d){var o=ctx.createOscillator();o.type=type;o.frequency.value=f;o.start(t);o.stop(t+d);return o}
function G(v){var g=ctx.createGain();g.gain.value=v==null?1:v;return g}
function F(type,f,q){var n=ctx.createBiquadFilter();n.type=type;n.frequency.value=f;n.Q.value=q==null?.7:q;return n}
function env(p,t,a,v,d){p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(v,t+a);p.exponentialRampToValueAtTime(.0001,t+a+d)}
function swell(p,t,dur,v,att,rel){att=Math.min(att,dur*.5);p.setValueAtTime(.0001,t);p.linearRampToValueAtTime(v,t+att);p.setValueAtTime(v,t+dur);p.exponentialRampToValueAtTime(.0001,t+dur+rel)}
function N(t,d,type,f0,f1,q,v,dest,a){
 a=a||.002;var s=ctx.createBufferSource();s.buffer=nb;s.loop=true;
 var f=F(type,f0,q);f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+d);
 var g=G(.0001);env(g.gain,t,Math.min(a,d*.9),v,Math.max(.01,d-a));
 s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random()*1.5);s.stop(t+d+.05)}
function IR(sec,decay){var n=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(2,n,ctx.sampleRate);
 for(var c=0;c<2;c++){var d=b.getChannelData(c),lp=0;for(var i=0;i<n;i++){var k=i/n,r=(Math.random()*2-1)*Math.pow(1-k,decay);lp+=(r-lp)*(.55-.45*k);d[i]=lp*1.6}}return b}
function bus(g,rev,dl){var n=G(g);n.connect(mus);if(rev){var s=G(rev);n.connect(s);s.connect(revIn)}if(dl){var d=G(dl);n.connect(d);d.connect(dlyIn)}return n}

/* ---- 그래프 구성 ---- */
function build(){
 master=G(muted?0:MASTER);
 comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=20;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.24;
 master.connect(comp);comp.connect(ctx.destination);
 musF=F('lowpass',19000,.5);mus=G(MUSIC_VOL);mus.connect(musF);musF.connect(master);
 sfx=G(SFX_VOL);sfx.connect(master);
 var cv=ctx.createConvolver();cv.buffer=IR(2.8,2.6);revIn=G(1);revIn.connect(cv);var rv=G(.85);cv.connect(rv);rv.connect(master);
 dlyIn=G(1);dly=ctx.createDelay(1.5);dly.delayTime.value=.37;var fb=G(.4),dl=F('lowpass',2800,.5),dr=G(.7);
 dlyIn.connect(dly);dly.connect(dl);dl.connect(fb);fb.connect(dly);dl.connect(dr);dr.connect(master);
 sx=G(1);sx.connect(sfx);var sr=G(.28);sx.connect(sr);sr.connect(revIn);
 B.drum=bus(1,.1,0);B.bass=bus(.95,0,0);B.pad=bus(.8,.55,0);B.arp=bus(.7,.22,.42);B.lead=bus(.62,.34,.34);B.fx=bus(.8,.4,0);B.amb=bus(.7,.6,.2);
 nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);var d=nb.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 /* 사막 바람 */
 var ws=ctx.createBufferSource();ws.buffer=nb;ws.loop=true;var wf=F('bandpass',520,.6),wl=O('sine',.11,0,36000),wlg=G(240);wl.connect(wlg);wlg.connect(wf.frequency);
 var wf2=F('highpass',200,.5);windG=G(0);ws.connect(wf);wf.connect(wf2);wf2.connect(windG);windG.connect(mus);ws.start(0);
 /* 저음 드론 */
 droneG=G(0);var dlp=F('lowpass',190,.8);
 var d1=O('sine',36.71,0,36000),d2=O('sawtooth',73.42,0,36000),d3=O('sine',73.42,0,36000),g2=G(.35);d2.detune.value=7;
 d1.connect(droneG);d3.connect(droneG);d2.connect(dlp);dlp.connect(g2);g2.connect(droneG);droneG.connect(B.amb);
 var tl=O('sine',.17,0,36000),tg=G(.06);tl.connect(tg);tg.connect(droneG.gain);
 ready=true;
 timer=setInterval(tick,25);
}
function mk(){if(ctx)return true;var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 try{ctx=new AC({latencyHint:'interactive'})}catch(e){try{ctx=new AC()}catch(e2){return false}}
 build();return true}

/* ---- 악기 ---- */
function kick(t,v){var o=O('sine',150,t,.34),g=G(.0001);o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);env(g.gain,t,.002,v,.28);o.connect(g);g.connect(B.drum);
 N(t,.025,'highpass',3200,null,.7,v*.22,B.drum,.001)}
function snare(t,v,big){N(t,.2,'bandpass',1900,null,.8,v,B.drum,.001);N(t,.1,'highpass',5200,null,.7,v*.45,B.drum,.001);
 var o=O('triangle',210,t,.12),g=G(.0001);o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(120,t+.08);env(g.gain,t,.001,v*.55,.1);o.connect(g);g.connect(B.drum);
 if(big){N(t+.012,.12,'bandpass',1300,null,1,v*.5,B.drum,.001);N(t+.024,.2,'bandpass',1500,null,1,v*.5,B.drum,.001)}}
function hat(t,v,open){N(t,open?.2:.045,'highpass',open?7000:8200,null,.6,v,B.drum,.001)}
function darb(t,k,v){
 if(k==='D'){var o=O('sine',210,t,.22),g=G(.0001);o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(92,t+.12);env(g.gain,t,.002,v*.75,.18);o.connect(g);g.connect(B.drum);N(t,.03,'bandpass',900,null,1,v*.2,B.drum,.001)}
 else if(k==='T'){N(t,.07,'bandpass',3300,null,3,v*.7,B.drum,.001);var o2=O('sine',780,t,.06),g2=G(.0001);env(g2.gain,t,.001,v*.25,.05);o2.connect(g2);g2.connect(B.drum)}
 else{N(t,.05,'bandpass',2400,null,2.5,v*.4,B.drum,.001)}}
function taiko(t,v,dest){dest=dest||B.drum;var o=O('sine',125,t,.8),g=G(.0001);o.frequency.setValueAtTime(125,t);o.frequency.exponentialRampToValueAtTime(52,t+.2);env(g.gain,t,.003,v,.6);o.connect(g);g.connect(dest);
 N(t,.12,'lowpass',700,160,.8,v*.5,dest,.002)}
function tom(t,v,dest){var o=O('sine',170,t,.2),g=G(.0001);o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(95,t+.1);env(g.gain,t,.002,v,.13);o.connect(g);g.connect(dest)}
function crash(t,v,dest){N(t,1.7,'highpass',6200,null,.5,v,dest||B.fx,.003)}
function thump(t,v){var o=O('sine',95,t,.25),g=G(.0001);o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(40,t+.14);env(g.gain,t,.004,v,.18);o.connect(g);g.connect(B.amb)}
function bass(t,m,len,v){var f=mtof(m),o=O('sawtooth',f,t,len+.2),s=O('sine',f,t,len+.2),lp=F('lowpass',f*8,4),g=G(.0001),sg=G(.8),ag=G(.65);
 lp.frequency.setValueAtTime(f*9,t);lp.frequency.exponentialRampToValueAtTime(f*1.9,t+len*.9);env(g.gain,t,.006,v,len);
 o.connect(ag);ag.connect(lp);lp.connect(g);s.connect(sg);sg.connect(g);g.connect(B.bass)}
function pad(t,notes,dur,v,br){var lp=F('lowpass',500,.9),g=G(.0001);lp.frequency.setValueAtTime(420,t);lp.frequency.linearRampToValueAtTime(br,t+dur*.55);lp.frequency.linearRampToValueAtTime(br*.6,t+dur);
 swell(g.gain,t,dur,v/Math.sqrt(notes.length*3),Math.min(.7,dur*.3),.9);
 notes.forEach(function(m){[-10,0,10].forEach(function(c){var o=O('sawtooth',mtof(m),t,dur+1);o.detune.value=c+(Math.random()-.5)*5;o.connect(lp)})});lp.connect(g);g.connect(B.pad)}
function choir(t,notes,dur,v,dark){var out=G(.0001);swell(out.gain,t,dur,v/Math.sqrt(notes.length),Math.min(1.4,dur*.4),1.2);
 notes.forEach(function(m){var o=O('sawtooth',mtof(m),t,dur+1.5),l=O('sine',5+Math.random()*.7,t,dur+1.5),lg=G(8);l.connect(lg);lg.connect(o.detune);
  var f1=F('bandpass',620,7),f2=F('bandpass',1050,9),f3=F('bandpass',2500,10),a2=G(.6),a3=G(.28);
  f1.frequency.setValueAtTime(dark?480:620,t);f1.frequency.linearRampToValueAtTime(dark?420:800,t+dur);
  f2.frequency.setValueAtTime(1050,t);f2.frequency.linearRampToValueAtTime(dark?800:1180,t+dur);
  o.connect(f1);o.connect(f2);o.connect(f3);f1.connect(out);f2.connect(a2);a2.connect(out);f3.connect(a3);a3.connect(out)});
 out.connect(B.amb)}
function pluck(t,m,v,br,dest,type){var o=O(type||'sawtooth',mtof(m),t,.34),lp=F('lowpass',br,1.4),g=G(.0001);
 lp.frequency.setValueAtTime(br,t);lp.frequency.exponentialRampToValueAtTime(380,t+.2);env(g.gain,t,.003,v,.24);o.connect(lp);lp.connect(g);g.connect(dest)}
function lead(t,m,len,v,br){var f=mtof(m),lp=F('lowpass',br,2.2),g=G(.0001),vb=G(.0001);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.025);g.gain.exponentialRampToValueAtTime(v*.6,t+len);g.gain.exponentialRampToValueAtTime(.0001,t+len+.16);
 [-8,8].forEach(function(c){var o=O('sawtooth',f,t,len+.25);o.detune.setValueAtTime(c-35,t);o.detune.linearRampToValueAtTime(c,t+.05);o.connect(lp);
  var l=O('sine',5.6,t,len+.25),lg=G(0);lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(14,t+len*.8);l.connect(lg);lg.connect(o.detune)});
 var sq=O('square',f/2,t,len+.25),sg=G(.35);sq.connect(sg);sg.connect(lp);
 lp.connect(g);g.connect(B.lead)}
function bell(t,m,v,dest,dec){dec=dec||1.3;var f=mtof(m),c=O('sine',f,t,dec+.2),mo=O('sine',f*3.5,t,dec+.2),mg=G(1),g=G(.0001);
 mg.gain.setValueAtTime(f*1.5,t);mg.gain.exponentialRampToValueAtTime(f*.04,t+dec*.55);mo.connect(mg);mg.connect(c.frequency);
 env(g.gain,t,.002,v,dec);c.connect(g);g.connect(dest);
 var h=O('sine',f*2,t,dec*.5),hg=G(.0001);env(hg.gain,t,.002,v*.3,dec*.4);h.connect(hg);hg.connect(dest)}
function brass(t,notes,dur,v,dest,br){var lp=F('lowpass',br*.3,1.2),g=G(.0001);
 lp.frequency.setValueAtTime(br*.3,t);lp.frequency.linearRampToValueAtTime(br,t+.14);lp.frequency.exponentialRampToValueAtTime(br*.45,t+dur);
 swell(g.gain,t,dur,v/Math.sqrt(notes.length*2),.05,.3);
 notes.forEach(function(m){[-7,7].forEach(function(c){var o=O('sawtooth',mtof(m),t,dur+.5);o.detune.value=c;o.connect(lp)})});lp.connect(g);g.connect(dest)}
function riser(d){var t=now();N(t,d+.05,'bandpass',220,7500,1.6,.34,B.fx,d*.97);
 var o=O('sawtooth',110,t,d+.1),lp=F('lowpass',500,1),g=G(.0001);o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(440,t+d);lp.frequency.setValueAtTime(500,t);lp.frequency.exponentialRampToValueAtTime(3500,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+d*.97);g.gain.exponentialRampToValueAtTime(.0001,t+d+.05);o.connect(lp);lp.connect(g);g.connect(B.fx)}

/* ---- 시퀀서 ---- */
function sd(){return 60/bpm/4}
function tick(){
 if(!ready||mode==='off'||!unlocked||ctx.state!=='running')return;
 var c=ctx.currentTime,lim=c+.14,g=0;
 if(nextT<c-.4)nextT=c+.05;
 while(nextT<lim&&g++<8){if(!muted){if(mode==='play')sPlay(step,nextT);else if(mode==='amb')sAmb(step,nextT);else if(mode==='win')sWin(step,nextT)}nextT+=sd();step++}}
function sPlay(s,t){
 var bs=s%16,bar=Math.floor(s/16)%4,ch=PROG[bar],dur=sd();
 if(bs===0&&pend&&t>=pendT){phase=pend;pend=0;bpm=BPM[phase];dur=sd();dly.delayTime.setTargetAtTime(60/bpm*.75,t,.05);droneG.gain.setTargetAtTime(phase===3?.2:0,t,.4);
  if(phase>=2){taiko(t,.9);crash(t,.32)}}
 var p=phase,beatAcc=bs%4===0;
 if(bs===0){
  pad(t,ch.pad,dur*16,p===1?.5:p===2?.42:.38,p===1?900:p===2?1500:2300);
  if(p===3)choir(t,[ch.pad[1]+12,ch.pad[2]+12,ch.pad[3]+12],dur*16,.55,false);
  if(bar===0&&s>0&&p>=2)crash(t,.2)}
 /* 킥/스네어/하이햇/다르부카 */
 if(KP[p][bs])kick(t,bs===0?.85:.75);
 if(SP[p][bs])snare(t,p===1?.28:.5,p===3);
 if(p===1){if(bs===4||bs===12)darb(t,'T',.35);if(bs%2===0)hat(t,.07,false)}
 else{var hv=bs%4===2?.15:bs%2===0?.1:.055;if(p===3||bs%2===0||bs%4===3)hat(t,hv,false);if(p===3&&(bs===6||bs===14))hat(t,.12,true);
  var dk=DK[bs];if(dk)darb(t,dk,p===2?.5:.42);if(bs===0)taiko(t,p===2?.4:.5)}
 if(bar===3&&bs>=12&&p>=2){snare(t,.2+(bs-12)*.1,false)}
 /* 베이스 */
 var bv=BP[p][bs];if(bv){var m=ch.r+(bv===2?12:bv===3?7:0);bass(t,m,dur*(p===1?3:p===2?1.7:1.4),p===1?.5:.58)}
 /* 아르페지오 */
 var ai;
 if(p===1){var ix=[0,3,6,8,11,14].indexOf(bs);if(ix>=0)pluck(t,ch.arp[[0,2,1,3,2,1][ix]],.12,1300,B.arp,'triangle')}
 else if(p===2){if(bs%2===0)pluck(t,ch.arp[[0,1,2,3,2,1,2,3][bs/2]],.2,2600,B.arp,'sawtooth')}
 else{pluck(t,ch.arp[[0,2,1,3,2,3,1,2,3,2,1,2,3,1,2,0][bs]]+12,.19,4200,B.arp,'sawtooth')}
 /* 리드 멜로디 */
 if(p>=2){LEAD[bar].forEach(function(n){if(n[0]===bs)lead(t,n[1],n[2]*sd(),p===2?.18:.25,p===2?1900:3800)})}
 /* 체력 1: 심장 박동 */
 if(hpNow<=1&&(bs===2||bs===3))thump(t,bs===2?.7:.45)}
function sAmb(s,t){
 var bs=s%16,ch=PROG[Math.floor(s/16)%4],b=bs%4;
 if(bs===0)choir(t,ch.pad.slice(1),sd()*16,opt.dark?.6:1,!!opt.dark);
 if(opt.heart&&(b===0||b===1))thump(t,b?.3:.5);
 if(opt.ping&&bs%4===2&&Math.random()<.4)bell(t,PING[Math.floor(Math.random()*PING.length)],.07,B.amb,2.6)}
function sWin(s,t){
 var bs=s%16,ch=WINP[Math.floor(s/16)%4],dur=sd();
 if(bs===0){pad(t,ch.pad,dur*16,.34,1700);choir(t,ch.pad.slice(1),dur*16,.6,false)}
 if(bs%2===0){var ix=(bs/2+(Math.floor(s/16)%2))%4;bell(t,ch.arp[ix]+(bs%4===0?12:0),.07,B.amb,1.8)}}

/* ---- 모드 전환 ---- */
function fadeMus(){var t=now();mus.gain.cancelScheduledValues(t);mus.gain.setTargetAtTime(.0001,t,.06)}
function restore(delay,tc){var c=now()+(delay||0);mus.gain.cancelScheduledValues(c);mus.gain.setTargetAtTime(MUSIC_VOL,c,tc||.12)}
function cut(){fadeMus();restore(.18,.12)}
function setBase(f){baseF=f;var t=now();musF.frequency.cancelScheduledValues(t);musF.frequency.setTargetAtTime(f,t,.3)}
function amb(w,d){var t=now();windG.gain.setTargetAtTime(w,t,.5);droneG.gain.setTargetAtTime(d,t,.6)}
function apply(m){
 if(!(ready&&unlocked))return;
 var t=now();prev=cur;cur=m;
 if(m==='intro'){if(mode!=='amb')cut();else restore(0,.3);setBase(19000);if(mode!=='amb'){mode='amb';step=0;nextT=t+.2}bpm=60;opt={heart:true,ping:true,dark:false};amb(.45,.5);if(prev&&prev!=='intro')sys()}
 else if(m==='count'){if(mode!=='amb')cut();else restore(0,.2);setBase(19000);if(mode!=='amb'){mode='amb';step=0;nextT=t+.2}bpm=60;opt={heart:false,ping:false,dark:false};amb(.3,.45);if(R())riser(3.85)}
 else if(m==='play'){restore(0,.05);phase=1;pend=0;bpm=BPM[1];mode='play';step=0;nextT=t+.04;amb(.07,0);dly.delayTime.setTargetAtTime(60/bpm*.75,t,.02);setBase(hpNow<=1?5200:19000)}
 else if(m==='win'){fadeMus();amb(.1,0);setBase(19000);if(R())fanfare();restore(2.4,.4);mode='win';bpm=84;step=0;nextT=t+2.7;opt={}}
 else if(m==='quiet'){fadeMus();amb(.04,0);mode='off'}
 else if(m==='fail'){fadeMus();amb(.15,.1);if(R())failSfx();restore(.8,.4);setBase(19000);mode='amb';bpm=60;step=0;nextT=t+1;opt={heart:false,ping:true,dark:false}}}
function setMode(m){want=m;if(ready&&unlocked)apply(m)}

/* ---- 효과음 ---- */
function jump(){if(!R())return;var t=now(),o=O('triangle',320,t,.2),g=G(.0001);
 o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(780,t+.13);env(g.gain,t,.005,.2,.14);o.connect(g);g.connect(sx);
 N(t,.14,'bandpass',900,3400,1.2,.13,sx,.01)}
function land(){if(!R())return;var t=now(),o=O('sine',150,t,.12),g=G(.0001);o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(58,t+.08);env(g.gain,t,.002,.2,.09);o.connect(g);g.connect(sx);
 N(t,.06,'lowpass',1400,300,.8,.12,sx,.001)}
function crystal(){if(!R())return;var t=now();if(t-comboT>1.2)comboN=0;comboT=t;
 var sc=[74,77,79,81,84,86,89,91],m=sc[comboN%8];comboN++;
 bell(t,m,.3,sx,1.1);var o=O('triangle',mtof(m+12),t,.15),g=G(.0001);env(g.gain,t,.002,.07,.12);o.connect(g);g.connect(sx)}
function heal(){if(!R())return;var t=now();[74,78,81,86,90].forEach(function(m,i){bell(t+i*.06,m,.25,sx,1.5);var o=O('triangle',mtof(m),t+i*.06,.25),g=G(.0001);env(g.gain,t+i*.06,.005,.07,.2);o.connect(g);g.connect(sx)});
 N(t,.5,'highpass',6000,9000,.6,.05,sx,.2)}
function duck(){var t=now();musF.frequency.cancelScheduledValues(t);musF.frequency.setValueAtTime(420,t);musF.frequency.setTargetAtTime(baseF,t+.12,.22);
 mus.gain.cancelScheduledValues(t);mus.gain.setValueAtTime(MUSIC_VOL*.35,t);mus.gain.setTargetAtTime(MUSIC_VOL,t+.1,.2)}
function hit(){if(!R())return;var t=now();duck();
 var o=O('sine',170,t,.5),g=G(.0001);o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(38,t+.35);env(g.gain,t,.003,.9,.4);o.connect(g);g.connect(sx);
 N(t,.4,'lowpass',5000,180,.7,.5,sx,.002);
 var a=O('sawtooth',233,t,.5),b=O('sawtooth',329,t,.5),lp=F('lowpass',1800,1),gb=G(.0001);
 a.frequency.setValueAtTime(233,t);a.frequency.exponentialRampToValueAtTime(90,t+.4);b.frequency.setValueAtTime(329,t);b.frequency.exponentialRampToValueAtTime(120,t+.4);
 a.connect(lp);b.connect(lp);lp.connect(gb);gb.connect(sx);env(gb.gain,t,.004,.16,.38);
 N(t,.08,'highpass',6000,null,.7,.22,sx,.001)}
function count(n){if(!R())return;var t=now(),f=62+(4-n)*14,o=O('sine',f*2.2,t,.4),g=G(.0001);
 o.frequency.setValueAtTime(f*2.2,t);o.frequency.exponentialRampToValueAtTime(f,t+.12);env(g.gain,t,.003,.8,.32);o.connect(g);g.connect(sx);
 N(t,.15,'lowpass',900,200,.8,.3,sx,.002);
 var h=O('sine',1500+(4-n)*180,t,.1),hg=G(.0001);env(hg.gain,t,.002,.08,.07);h.connect(hg);hg.connect(sx)}
function go(){if(!R())return;var t=now()+.04,o=O('sine',100,t,1.3),g=G(.0001);
 o.frequency.setValueAtTime(100,t);o.frequency.exponentialRampToValueAtTime(28,t+.9);env(g.gain,t,.004,.95,1.1);o.connect(g);g.connect(sx);
 crash(t,.26,sx);N(t,.4,'bandpass',300,4500,.9,.18,sx,.2);
 brass(t,[50,57,62,65],.55,.7,sx,2800)}
function warn(){if(!R())return;var t=now(),o=O('sawtooth',560,t,.95),lp=F('lowpass',1700,1),g=G(.0001);
 for(var i=0;i<6;i++)o.frequency.setValueAtTime(i%2?420:560,t+i*.15);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.13,t+.03);g.gain.setValueAtTime(.13,t+.8);g.gain.exponentialRampToValueAtTime(.0001,t+.95);o.connect(lp);lp.connect(g);g.connect(sx);
 var b=O('sine',90,t,.7),bg=G(.0001);b.frequency.setValueAtTime(90,t);b.frequency.exponentialRampToValueAtTime(34,t+.5);env(bg.gain,t,.004,.7,.55);b.connect(bg);bg.connect(sx)}
function fanfare(){var t=now()+.03;
 [62,66,69,74,78,81,86].forEach(function(m,i){var tt=t+i*.065;pluck(tt,m,.2,5000,sx,'sawtooth');pluck(tt,m+12,.07,6000,sx,'triangle')});
 for(var i=0;i<9;i++)tom(t+.02+i*.05,.18+i*.04,sx);
 var c=t+.55;
 brass(c,[50,57,62,66,69],2.3,.85,sx,3900);brass(c,[38,45],2.3,.5,sx,1400);
 taiko(c,1,sx);crash(c,.38,sx);
 [86,90,93,98].forEach(function(m,i){bell(c+.1+i*.11,m,.11,sx,2.3)})}
function failSfx(){var t=now()+.02;[69,65,62].forEach(function(m,i){bell(t+i*.16,m,.16,sx,1.2)});var o=O('triangle',330,t,.6),g=G(.0001);o.frequency.setValueAtTime(330,t);o.frequency.exponentialRampToValueAtTime(165,t+.5);env(g.gain,t,.01,.14,.5);o.connect(g);g.connect(sx)}
function goal(){if(!R())return;var t=now();bell(t,86,.22,sx,1.2);bell(t+.1,93,.2,sx,1.6)}
function sys(){if(!R())return;var t=now()+.02;bell(t,81,.2,sx,1.7);bell(t+.13,86,.22,sx,2.3);bell(t+.13,74,.09,sx,2.3);N(t,.3,'bandpass',2200,6500,1.5,.05,sx,.16)}
function click(){if(!R())return;var t=now(),o=O('triangle',1250,t,.08),g=G(.0001);env(g.gain,t,.002,.07,.05);o.connect(g);g.connect(sx);
 var o2=O('sine',2100,t+.018,.06),g2=G(.0001);env(g2.gain,t+.018,.002,.04,.04);o2.connect(g2);g2.connect(sx)}

/* ---- 외부 인터페이스 ---- */
function setPhase(p){
 if(!ready||!unlocked||mode!=='play')return;var tgt=pend||phase;if(p<=tgt)return;
 var c=now(),left=(16-(step%16))%16,d=(nextT-c)+left*sd();if(d<.7)d+=16*sd();
 pend=p;pendT=c+d-.03;if(R()){riser(Math.max(.5,d-.04));if(p===3)warn()}}
function setHp(h){hpNow=h;if(ready&&unlocked&&cur==='play')setBase(h<=1?5200:19000)}
/* 음소거 바꾸기. 사용자가 게임 안 버튼으로 바꾼 경우에만 앱에 알림 */
function setMuted(m,fromParent){m=!!m;if(m!==muted){muted=m;
 if(ctx){master.gain.setTargetAtTime(muted?0:MASTER,ctx.currentTime,.05)}}ui();
 if(!fromParent)host.onMute(muted)}
function toggle(){setMuted(!muted)}
var btn=null;
function ui(){if(!btn)return;btn.classList.toggle('muted',muted);btn.setAttribute('aria-pressed',muted?'true':'false');btn.setAttribute('aria-label',muted?'사운드 켜기':'사운드 끄기')}
function unlock(){
 try{if(!ctx&&!mk())return;
  if(ctx.state!=='running'){var p=ctx.resume();if(p&&p.then)p.then(fin,function(){});else fin()}else fin()}catch(e){}}
function fin(){if(ctx.state!=='running'||unlocked)return;unlocked=true;apply(want)}
['pointerdown','pointerup','touchstart','touchend','click','keydown','mousedown'].forEach(function(n){host.on(window,n,function(){if(ctx&&ctx.state==='running'&&unlocked)return;unlock()},{capture:true,passive:true})});
host.on(document,'visibilitychange',function(){if(!ctx||!unlocked)return;if(document.hidden)ctx.suspend();else ctx.resume()});
btn=host.$('snd');
if(btn){host.on(btn,'click',function(e){e.stopPropagation();toggle()});ui()}
return{mode:setMode,phase:setPhase,hp:setHp,jump:jump,land:land,crystal:crystal,heal:heal,hit:hit,count:count,go:go,click:click,toggle:toggle,set:setMuted,goal:goal,muted:function(){return muted},
 /* 게임을 닫을 때: 박자 타이머와 오디오를 정리 */
 destroy:function(){clearInterval(timer);timer=null;ready=false;try{ctx&&ctx.close()}catch(e){}}}
}

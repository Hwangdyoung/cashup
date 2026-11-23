/* 효과음: Web Audio로 직접 합성 (외부 음원 파일 없음)
   installSfx()를 앱 시작 때 한 번 부르면, 첫 터치·클릭에 오디오를 연다(브라우저 자동재생 정책). */
const SFX={ac:null,out:null,rev:null,nb:null,curve:null,on:true,vol:.9,k:1,last:{}};
try{if(localStorage.getItem('cashup-sfx')==='0')SFX.on=false}catch(e){}
let onBlocked=()=>{};
const hz=m=>440*Math.pow(2,(m-69)/12);
function sfxGraph(ac){
 /* 상태 없는 소프트 리미터: 큰 소리만 부드럽게 눌러 찌그러짐을 막음 */
 const lim=ac.createWaveShaper(),lc=new Float32Array(2048);
 for(let i=0;i<2048;i++){const x=i/2047*2-1,a=Math.abs(x);lc[i]=Math.sign(x)*(a<.6?a:.6+.4*Math.tanh((a-.6)/.4))}
 lim.curve=lc;lim.oversample='2x';
 const out=ac.createGain();out.connect(lim);lim.connect(ac.destination);
 const sr=ac.sampleRate,n=Math.floor(sr*1.6),ir=ac.createBuffer(2,n,sr);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}
 const conv=ac.createConvolver();conv.buffer=ir;const rev=ac.createGain();rev.gain.value=.45;rev.connect(conv);conv.connect(out);
 const nb=ac.createBuffer(1,sr*2,sr),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const curve=new Float32Array(1024);for(let i=0;i<1024;i++)curve[i]=Math.tanh((i/511.5-1)*3.2);
 return {ac,out,rev,nb,curve};
}
function sfxUnlock(){
 if(!SFX.ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  try{Object.assign(SFX,sfxGraph(new C()));SFX.out.gain.value=SFX.on?SFX.vol:0}catch(e){SFX.ac=null;return}}
 const ac=SFX.ac;
 if(ac.state!=='running'&&ac.resume){try{const r=ac.resume();if(r&&r.catch)r.catch(()=>{})}catch(e){}}
 /* Safari·iOS: 사용자 동작 안에서 무음을 한 번 재생해야 오디오가 열림 */
 if(!SFX.primed){try{const b=ac.createBuffer(1,1,ac.sampleRate),s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start(0);SFX.primed=true}catch(e){}}
 setTimeout(bgmWake,0);
 if(!SFX.checked){SFX.checked=true;setTimeout(()=>{if(SFX.on&&SFX.ac&&SFX.ac.state!=='running')onBlocked()},1500)}
}
let installed=false;
/* blocked: 오디오가 브라우저에서 막혔을 때 부를 함수 (안내 알림용) */
export function installSfx(blocked){
 if(blocked)onBlocked=blocked;
 if(installed)return;installed=true;
 ['pointerdown','pointerup','mousedown','touchstart','touchend','keydown','click'].forEach(t=>addEventListener(t,sfxUnlock,{capture:true,passive:true}));
 /* 다른 탭으로 가면 소리도 멈춤 */
 document.addEventListener('visibilitychange',()=>{if(!SFX.ac)return;try{if(document.hidden)SFX.ac.suspend();else SFX.ac.resume()}catch(e){}});
}

/* 소리 재료: 음 · 잡음 · 종소리 */
function sOut(n,o,t,end){
 const {ac,out,rev,curve}=SFX;
 if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,t);if(o.lp2)f.frequency.exponentialRampToValueAtTime(o.lp2,end);f.Q.value=o.lq||.8;n.connect(f);n=f}
 if(o.dist){const w=ac.createWaveShaper();w.curve=curve;n.connect(w);n=w}
 if(o.p!==undefined&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.setValueAtTime(o.p,t);if(o.p2!==undefined)p.pan.linearRampToValueAtTime(o.p2,end);n.connect(p);n=p}
 n.connect(out);if(o.r){const s=ac.createGain();s.gain.value=o.r;n.connect(s);s.connect(rev)}
}
function sT(o){
 const ac=SFX.ac,t=ac.currentTime+(o.t||0),a=o.a||.004,d=o.d||.2,pk=(o.g||.15)*SFX.k,end=t+a+d;
 const osc=ac.createOscillator(),g=ac.createGain();
 osc.type=o.w||'sine';osc.frequency.setValueAtTime(o.f,t);
 if(o.f2)osc.frequency.exponentialRampToValueAtTime(o.f2,t+(o.gl||a+d));
 if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.vib;lg.gain.value=o.f*.015;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(end+.05)}
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,end);
 osc.connect(g);sOut(g,o,t,end);osc.start(t);osc.stop(end+.05);
}
function sN(o){
 const ac=SFX.ac,t=ac.currentTime+(o.t||0),a=o.a||.004,d=o.d||.2,pk=(o.g||.15)*SFX.k,end=t+a+d;
 const src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
 src.buffer=SFX.nb;src.loop=true;f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);
 if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+(o.gl||a+d));f.Q.value=o.q||1;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,end);
 src.connect(f);f.connect(g);sOut(g,o,t,end);src.start(t,Math.random()*1.5);src.stop(end+.05);
}
function sB(f,t,d,g,r){sT({f,t,d,g,r});sT({f:f*2.756,t,d:d*.45,g:g*.35,r});sT({f:f*5.404,t,d:d*.22,g:g*.12,r})}

/* 효과음 목록: 던전 톤 (D단조 · 낮은 음 · 긴 잔향). 카카오뱅크 화면의 버튼 소리는 짧고 조용하게 */
const SND={
 /* 카카오뱅크 기본 조작 */
 tap(){sN({ft:'lowpass',f:1600,q:.7,d:.035,g:.05});sT({f:420,f2:300,d:.05,g:.035})},
 close(){sT({f:520,f2:260,d:.08,g:.04})},
 deny(){sT({w:'triangle',f:196,d:.12,g:.09,lp:900});sT({w:'triangle',f:185,t:.02,d:.12,g:.07,lp:900})},
 step(){for(let i=0;i<2;i++)sN({ft:'lowpass',f:i?260:340,q:1.6,d:.09,g:.28,t:i*.16,r:.3})},
 /* 시스템 창: 낮은 종 + 먼 울림 */
 sys(){sB(hz(74),0,1.1,.07,.75);sB(hz(77),.11,1.3,.06,.8);sT({f:hz(38),a:.05,d:.9,g:.12,r:.4});sN({ft:'bandpass',f:2400,f2:900,q:2,a:.05,d:.5,g:.02,r:.8})},
 status(){sT({f:300,f2:900,a:.02,d:.35,g:.03,r:.8});sB(hz(74),.08,1,.05,.8)},
 /* 납입 · 퀘스트 완료: D단조 아르페지오 */
 level(){[62,65,69,74].forEach((m,i)=>sB(hz(m),i*.09,.9,.07,.65));sT({f:hz(38),f2:hz(26),d:.5,g:.18,r:.3})},
 coin(){sB(hz(81),0,.7,.05,.7);sB(hz(86),.07,.9,.04,.75);sN({ft:'highpass',f:5000,a:.01,d:.25,g:.015,r:.8})},
 gold(){[50,57,62,65].forEach(m=>sT({w:'triangle',f:hz(m),a:.03,d:1.2,g:.045,lp:1600,r:.6}));sB(hz(81),.12,1.4,.05,.8);sB(hz(86),.24,1.4,.04,.8)},
 /* 경고: 낮은 뿔피리 두 번 + 울림 */
 warn(){for(let i=0;i<2;i++){sT({w:'sawtooth',f:147,t:i*.34,a:.03,d:.24,g:.05,lp:800,r:.4});sT({w:'sawtooth',f:139,t:i*.34,a:.03,d:.24,g:.04,lp:800})}sT({f:70,f2:38,d:.6,g:.3,r:.3})},
 /* 승급: 북 · 합창 같은 패드 · 상승하는 종 */
 rank(){
  sT({f:72,f2:34,d:.7,g:.5,r:.3});sN({ft:'lowpass',f:700,f2:120,d:.5,g:.12});
  [50,57,62,65].forEach(m=>sT({w:'sawtooth',f:hz(m),t:.15,a:.25,d:1.6,g:.03,lp:400,lp2:2600,lq:2,r:.7}));
  [62,65,69,72,74,77].forEach((m,i)=>sB(hz(m),.3+i*.11,1,.05,.7));
 },
 boss(){
  sN({ft:'lowpass',f:3600,f2:140,a:.01,d:.9,g:.35});sT({f:120,f2:34,d:.6,g:.5});
  [50,57,62,65].forEach(m=>sT({w:'triangle',f:hz(m+12),t:.3,a:.01,d:.9,g:.05,r:.5}));sB(hz(81),.36,1,.06,.7);sB(hz(86),.44,1,.05,.7);
 },
 /* 만기 결과: Dm → B♭ → C → D 진행, 마지막에 밝아짐 */
 result(){
  [[50,53,57],[46,50,53],[48,52,55],[50,54,57]].forEach((c,i)=>{c.forEach(m=>sT({w:'triangle',f:hz(m+12),t:i*.5,a:.02,d:i<3?.48:1.8,g:.05,lp:2400,r:.6}));sT({f:hz(c[0]-12),f2:hz(c[0]-12)*.6,t:i*.5,d:.4,g:.32})});
  [74,77,81,86].forEach((m,i)=>sB(hz(m),i*.5+.05,i<3?.6:1.6,.05,.7));
 },
 reset(){sT({w:'sawtooth',f:600,f2:90,d:.6,g:.05,lp:1400,r:.5});sN({ft:'bandpass',f:1600,f2:200,d:.6,g:.05})},
 /* 페널티 구역 입장 · 통과 · 실패 */
 pzEnter(){sT({f:70,f2:38,a:.02,d:1.1,g:.35});sN({ft:'lowpass',f:900,f2:120,a:.05,d:1,g:.12});sB(hz(65),.12,1.4,.06,.7);sB(hz(66),.15,1.4,.05,.7)},
 clear(){[62,65,69,74,77,81].forEach((m,i)=>sB(hz(m),i*.08,.9,.06,.6));[50,54,57,62].forEach(m=>sT({w:'triangle',f:hz(m),t:.5,a:.03,d:1.3,g:.045,r:.6}))},
 fail(){[69,65,62,57].forEach((m,i)=>sT({w:'triangle',f:hz(m),t:i*.22,d:.3,g:.1,lp:1500,vib:5,r:.5}));sT({f:80,f2:38,t:.9,d:.5,g:.3})},
};
/* 믹스 레벨 (소리별 음량 배율) */
const SFX_LV={tap:2.6,close:2.6,deny:2.2,step:2.8,sys:2,status:2.6,level:2.2,coin:2.4,gold:2.2,warn:1.3,rank:2.2,boss:.7,result:1.5,reset:3,pzEnter:.8,clear:2,fail:1.1};
/* 같은 소리가 겹쳐 터지지 않도록 최소 간격(초) */
const SFX_GAP={};
export function sfx(n,...a){
 if(!SFX.on||!SND[n])return;
 if(!SFX.ac)sfxUnlock();
 if(!SFX.ac)return;
 if(SFX.ac.state!=='running'){
  /* 아직 오디오가 열리는 중이면 열린 직후에 재생 (0.4초 넘게 걸리면 버림) */
  const asked=performance.now();
  try{const r=SFX.ac.resume();if(r&&r.then)r.then(()=>{if(performance.now()-asked<400&&SFX.ac.state==='running')sfx(n,...a)}).catch(()=>{})}catch(e){}
  return;
 }
 const now=SFX.ac.currentTime,gap=n in SFX_GAP?SFX_GAP[n]:.04;
 if(gap&&SFX.last[n]!==undefined&&now-SFX.last[n]<gap)return;
 SFX.last[n]=now;SFX.k=SFX_LV[n]||1;try{SND[n](...a)}catch(e){}SFX.k=1;
}

export const sfxOn=()=>SFX.on;
export function sfxSet(on){
 SFX.on=on;try{localStorage.setItem('cashup-sfx',on?'1':'0')}catch(e){}
 if(SFX.ac){const t=SFX.ac.currentTime;SFX.out.gain.cancelScheduledValues(t);SFX.out.gain.setTargetAtTime(on?SFX.vol:0,t,.03)}
 if(on){sfxUnlock();setTimeout(()=>sfx('tap'),40)}
}

/* ───── 던전 BGM (콜라보 적금 페이지부터) ─────
   D단조(Dm–B♭–Gm–A) 느린 패드 + 낮은 드론 + 먼 북소리 + 가끔 울리는 종 + 바람.
   효과음과 같은 출력(SFX.out)을 지나서 스피커 버튼·M 키로 함께 꺼진다. */
const BGM={want:false,on:false,g:null,drone:[],wind:null,timer:null,step:0,next:0};
const BGM_VOL=.5,BGM_BPM=66;
const BGM_CHORDS=[[38,50,53,57],[34,46,50,53],[31,43,46,50],[33,45,49,52]]; // 근음 + 패드 3음
const BGM_BELL=[62,65,67,69,72,74];
function bgmPad(t,notes,dur){
 const {ac}=SFX,lp=ac.createBiquadFilter(),g=ac.createGain();
 lp.type='lowpass';lp.frequency.setValueAtTime(380,t);lp.frequency.linearRampToValueAtTime(900,t+dur*.5);lp.frequency.linearRampToValueAtTime(420,t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+dur*.35);g.gain.setValueAtTime(.05,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0001,t+dur+1.2);
 notes.forEach(m=>[-8,0,8].forEach(c=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);o.detune.value=c;o.connect(lp);o.start(t);o.stop(t+dur+1.3)}));
 lp.connect(g);g.connect(BGM.g);const s=ac.createGain();s.gain.value=.5;g.connect(s);s.connect(SFX.rev);
}
function bgmDrum(t,v){
 const {ac}=SFX,o=ac.createOscillator(),g=ac.createGain();
 o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(36,t+.35);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.9);
 o.connect(g);g.connect(BGM.g);const s=ac.createGain();s.gain.value=.4;g.connect(s);s.connect(SFX.rev);o.start(t);o.stop(t+1);
}
function bgmBell(t,m){
 const {ac}=SFX;[[1,.025,2.4],[2.756,.009,1.1]].forEach(([k,v,d])=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=hz(m)*k;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);const s=ac.createGain();s.gain.value=.9;g.connect(s);s.connect(SFX.rev);g.connect(BGM.g);o.start(t);o.stop(t+d+.1)});
}
function bgmTick(){
 if(!BGM.on||!SFX.ac)return;
 const ac=SFX.ac,beat=60/BGM_BPM;
 if(BGM.next<ac.currentTime)BGM.next=ac.currentTime+.1;
 while(BGM.next<ac.currentTime+.6){
  const t=BGM.next,i=BGM.step,bar=Math.floor(i/4)%4,b=i%4,ch=BGM_CHORDS[bar];
  if(b===0)bgmPad(t,ch.slice(1),beat*4);
  if(b===0&&(bar===0||bar===2))bgmDrum(t,.32);
  if(b===2&&bar===3)bgmDrum(t,.18);
  if(b===2&&(bar===1||bar===3)&&Math.random()<.7)bgmBell(t,BGM_BELL[Math.floor(Math.random()*BGM_BELL.length)]);
  BGM.step++;BGM.next+=beat;
 }
}
function bgmStart(){
 if(BGM.on||!SFX.ac||SFX.ac.state!=='running')return;
 const ac=SFX.ac,t=ac.currentTime;BGM.on=true;
 BGM.g=ac.createGain();BGM.g.gain.setValueAtTime(.0001,t);BGM.g.gain.exponentialRampToValueAtTime(BGM_VOL,t+2.5);BGM.g.connect(SFX.out);
 /* 낮은 드론: D1 사인 + D2 톱니(저역 통과) */
 const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;lp.connect(BGM.g);
 [[hz(26),'sine',.09],[hz(38),'sawtooth',.03],[hz(38)*1.003,'sawtooth',.03]].forEach(([f,w,v])=>{const o=ac.createOscillator(),g=ac.createGain();o.type=w;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(lp);o.start(t);BGM.drone.push(o)});
 /* 바람 */
 const n=ac.createBufferSource(),bp=ac.createBiquadFilter(),wg=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();
 n.buffer=SFX.nb;n.loop=true;bp.type='bandpass';bp.frequency.value=500;bp.Q.value=.7;wg.gain.value=.018;
 lfo.frequency.value=.09;lg.gain.value=260;lfo.connect(lg);lg.connect(bp.frequency);
 n.connect(bp);bp.connect(wg);wg.connect(BGM.g);n.start(t);lfo.start(t);BGM.drone.push(n,lfo);
 BGM.step=0;BGM.next=t+.3;BGM.timer=setInterval(bgmTick,120);bgmTick();
}
function bgmStop(){
 if(!BGM.on)return;BGM.on=false;clearInterval(BGM.timer);BGM.timer=null;
 const ac=SFX.ac,t=ac.currentTime,g=BGM.g,nodes=BGM.drone;BGM.drone=[];BGM.g=null;
 try{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(Math.max(.0001,g.gain.value),t);g.gain.exponentialRampToValueAtTime(.0001,t+1.2);nodes.forEach(o=>o.stop(t+1.3));setTimeout(()=>{try{g.disconnect()}catch(e){}},1500)}catch(e){}
}
/* App이 화면에 따라 부름: 콜라보 페이지 이후면 true, 카카오뱅크 홈·게임 중이면 false */
export function bgmSet(want){
 BGM.want=want;
 if(!want){bgmStop();return}
 if(!SFX.ac)return; // 첫 터치에서 오디오가 열리면 bgmWake가 이어서 켠다
 if(SFX.ac.state!=='running'){try{SFX.ac.resume().then(()=>{if(BGM.want)bgmStart()}).catch(()=>{})}catch(e){}return}
 bgmStart();
}
function bgmWake(){if(BGM.want&&!BGM.on)bgmSet(true)}

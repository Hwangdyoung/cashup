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

/* 효과음 목록 */
const SND={
 tap(){sT({f:1300,f2:820,d:.045,g:.05})},
 close(){sT({f:880,f2:520,d:.07,g:.05})},
 deny(){sT({w:'triangle',f:330,f2:300,d:.08,g:.1});sT({w:'triangle',f:262,f2:240,t:.11,d:.13,g:.1})},
 sys(){sB(hz(88),0,.55,.09,.45);sB(hz(95),.085,.8,.1,.5);sN({ft:'highpass',f:7000,a:.02,d:.3,g:.02,r:.6})},
 level(){[72,76,79,84].forEach((m,i)=>sB(hz(m+12),i*.065,.55,.085,.45));sT({f:hz(108),t:.27,d:.7,g:.022,r:.8})},
 rank(){
  [60,64,67,72,76,79,84,88].forEach((m,i)=>sB(hz(m+12),i*.055,.6,.07,.45));
  [48,55,60,64].forEach(m=>sT({w:'sawtooth',f:hz(m),t:.4,a:.08,d:1.1,g:.035,lp:500,lp2:3200,lq:2,r:.4}));
  for(let i=0;i<6;i++)sT({f:hz(96+(i*5)%12),t:.5+i*.09,d:.3,g:.02,r:.8});
 },
 warn(){for(let i=0;i<2;i++){sT({w:'square',f:880,t:i*.26,d:.11,g:.045,lp:2600});sT({w:'square',f:622,t:i*.26+.13,d:.11,g:.045,lp:2600})}sT({f:110,f2:50,d:.35,g:.22})},
 gold(){[60,64,67,72].forEach(m=>sT({w:'triangle',f:hz(m+12),a:.01,d:.7,g:.055}));sB(hz(96),.06,.9,.075,.5);sB(hz(100),.14,.9,.06,.5)},
 coin(){sT({w:'triangle',f:hz(84),d:.06,g:.11});sT({w:'triangle',f:hz(91),t:.07,d:.32,g:.11});sB(hz(103),.07,.3,.025,.4)},
 buy(){sN({ft:'bandpass',f:5200,q:2.5,d:.07,g:.08});SND.coin();sB(hz(96),.16,.6,.06,.5)},
 step(){for(let i=0;i<3;i++)sN({ft:'lowpass',f:i%2?520:380,q:1.4,d:.08,g:.3,t:i*.13})},
 hit(){sT({f:170,f2:46,d:.17,g:.4});sN({ft:'bandpass',f:1700,q:.9,d:.08,g:.2});sT({w:'square',f:95,f2:60,d:.07,g:.05,lp:900})},
 boss(){
  sN({ft:'lowpass',f:3600,f2:140,a:.01,d:.9,g:.35});sT({f:120,f2:34,d:.6,g:.5});
  [60,64,67,72].forEach(m=>sT({w:'triangle',f:hz(m+12),t:.3,a:.01,d:.8,g:.05}));sB(hz(96),.36,.9,.07,.5);sB(hz(100),.44,.9,.06,.5);
 },
 mStart(){sT({w:'triangle',f:hz(72),f2:hz(84),d:.22,g:.08});sB(hz(96),.18,.4,.04,.5)},
 mPop(){sT({f:250,f2:520,d:.07,g:.045})},
 mHit(n){const k=(n||0)%8;sT({w:'triangle',f:hz(76+k),f2:hz(88+k),gl:.04,d:.09,g:.11});sB(hz(95+k),.025,.28,.045,.4);sN({ft:'highpass',f:4500,d:.04,g:.035})},
 tick(hi){sT({f:hi?2300:1700,d:.028,g:.07});sN({ft:'highpass',f:3200,d:.018,g:.03})},
 summon(){sN({ft:'bandpass',f:180,f2:2600,q:1.6,a:.32,d:.45,g:.11,r:.4});[57,64,69,76].forEach((m,i)=>sB(hz(m+12),.42+i*.06,.65,.065,.6))},
 status(){sT({f:1400,f2:2300,d:.22,g:.035,r:.8});sB(hz(91),.05,.6,.05,.7)},
 result(){
  [[60,64,67],[65,69,72],[67,71,74],[72,76,79]].forEach((c,i)=>{c.forEach(m=>sT({w:'triangle',f:hz(m),t:i*.42,a:.01,d:i<3?.38:1.4,g:.05}));sT({f:hz(c[0]-24),f2:hz(c[0]-24)*.7,t:i*.42,d:.3,g:.3})});
  [79,81,83,84].forEach((m,i)=>sB(hz(m+12),i*.42+.05,i<3?.4:1.2,.06,.5));
  for(let i=0;i<8;i++)sT({f:hz(96+(i*7)%12),t:1.3+i*.07,d:.35,g:.018,r:.9});
 },
 reset(){sT({w:'sawtooth',f:1500,f2:170,d:.5,g:.05,lp:2400});sN({ft:'bandpass',f:2200,f2:280,d:.5,g:.05})},
 pzEnter(){sT({f:70,f2:38,a:.02,d:1.1,g:.35});sN({ft:'lowpass',f:900,f2:120,a:.05,d:1,g:.12});sB(hz(77),.12,1.2,.06,.6);sB(hz(78),.15,1.2,.05,.6)},
 count(){sT({w:'square',f:660,d:.09,g:.05,lp:3000})},
 go(){sT({w:'square',f:1320,d:.22,g:.055,lp:3600});sT({w:'square',f:990,d:.22,g:.03,lp:3000});sN({ft:'highpass',f:3000,d:.15,g:.03})},
 beat(k){const g=.14+.1*(k||0);sT({f:74,f2:44,d:.11,g});sT({f:66,f2:40,t:.17,d:.1,g:g*.75})},
 dashWarn(p){for(let i=0;i<2;i++)sT({w:'square',f:1046,t:i*.11,d:.05,g:.12,lp:4000,p})},
 dashGo(p0,p1){sN({ft:'bandpass',f:500,f2:2600,q:1.2,a:.05,d:.42,g:.5,p:p0,p2:p1})},
 strikeWarn(d,p){sT({f:300,f2:1150,gl:d,a:d*.85,d:.08,g:.028,p})},
 strike(p){sT({f:150,f2:40,d:.22,g:.32,p});sN({ft:'lowpass',f:2400,f2:280,d:.3,g:.2,p})},
 hurt(){sT({w:'square',f:260,f2:105,d:.18,g:.08,dist:1,lp:2200});sN({ft:'bandpass',f:900,q:.8,d:.14,g:.16});sT({f:90,f2:45,d:.2,g:.3})},
 banner(){sB(hz(84),0,.4,.06,.5);sB(hz(88),.09,.5,.06,.5)},
 clear(){[72,76,79,84,88,91,96].forEach((m,i)=>sB(hz(m),i*.06,.6,.07,.45));[60,64,67,72].forEach(m=>sT({w:'triangle',f:hz(m),t:.42,a:.02,d:1,g:.05}));sT({f:hz(96),t:.42,d:1.2,g:.03,r:.8})},
 fail(){[67,64,60,55].forEach((m,i)=>sT({w:'triangle',f:hz(m),t:i*.2,d:.26,g:.11,lp:1800,vib:6}));sT({f:90,f2:40,t:.8,d:.4,g:.3})},
};
/* 믹스 레벨 (소리별 음량 배율) */
const SFX_LV={"tap":3.54,"close":2.89,"mPop":3.21,"mStart":2.72,"tick":3.86,"count":2.65,"deny":2.21,"step":4.25,"mHit":2.39,"reset":3.65,"go":2.21,"dashWarn":3.1,"strikeWarn":3.24,"coin":2.08,"sys":1.7,"level":1.87,"status":2.92,"banner":2.71,"warn":1.02,"dashGo":3.49,"strike":1.15,"beat":1.53,"gold":2.03,"rank":2.57,"summon":2.5,"buy":2.62,"clear":2.18,"hit":0.97,"hurt":0.89,"boss":0.68,"result":1.32,"pzEnter":0.76,"fail":1.13};
/* 같은 소리가 겹쳐 터지지 않도록 최소 간격(초) */
const SFX_GAP={beat:0,tick:0,count:0,strikeWarn:0,strike:0,dashWarn:0,dashGo:0,mHit:0,mPop:.05};
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

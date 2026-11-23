import { useState } from 'react';
import hunterImg from '../assets/hunter.png';
import logoImg from '../assets/kakaobank-logo.png';

/* 첫 화면: 카카오 로그인 모양 버튼 (시연용, 계정 정보는 받지 않음) */
export default function Login({ onStart }) {
  const [leaving, setLeaving] = useState(false);
  const start = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onStart, 380);
  };
  return (
    <section className={`login${leaving ? ' hide' : ''}`} aria-label="시작 화면">
      <div className="logo-slot">
        <img src={logoImg} alt="카카오뱅크" />
      </div>
      <div className="gl">
        <img src={hunterImg} alt="" />
      </div>
      <h1>나 혼자만 캐시업</h1>
      <p className="sub">
        26주 동안 매주 모으고 걸으며
        <br />
        E급 헌터에서 S급 헌터로
      </p>
      <div className="grow" />
      <button type="button" className="kbtn" onClick={start}>
        카카오계정으로 로그인
      </button>
      <p className="demo">
        시연용 화면이에요. 버튼을 누르면 바로 시작하며,
        <br />
        계정 정보는 입력받거나 저장하지 않아요.
      </p>
    </section>
  );
}

import { useEffect, useState } from 'react';
import SystemWindow from './SystemWindow.jsx';
import { SHARE_URL, drawShareCard, shareText } from '../lib/shareCard.js';
import { sfx } from '../lib/sfx.js';

/* 만기 결과 카드 공유 (결과 창 안에서 열림)
   휴대폰: 기기 공유 시트(카카오톡·인스타그램 등)로 이미지 전송
   공유 시트에 이미지를 못 넘기는 기기: 이미지 저장 + 링크 복사 */
const FILE = 'cashup-result.png';

export default function ShareCard({ s, onBack, onNotice }) {
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let made = '';
    drawShareCard(s)
      .then((b) => {
        if (!alive || !b) return;
        made = URL.createObjectURL(b);
        setBlob(b);
        setUrl(made);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
    };
    // 결과 창이 떠 있는 동안 적금 상태는 바뀌지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const file = blob ? new File([blob], FILE, { type: 'image/png' }) : null;
  const canShare = !!file && !!navigator.canShare?.({ files: [file] });

  const share = async () => {
    sfx('tap');
    try {
      await navigator.share({ files: [file], title: '나 혼자만 캐시업', text: shareText(s) + ' ' + SHARE_URL });
    } catch (e) {
      if (e?.name !== 'AbortError') onNotice('공유하지 못했어요. 이미지를 저장해서 올려 주세요');
    }
  };
  const save = () => {
    sfx('tap');
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE;
    a.click();
    onNotice('결과 카드 이미지를 저장했어요');
  };
  const copy = () => {
    sfx('tap');
    const text = shareText(s) + ' ' + SHARE_URL;
    const done = () => onNotice('공유 문구와 링크를 복사했어요');
    /* 클립보드 API가 막힌 브라우저는 예전 방식(숨긴 입력칸 선택 후 복사)으로 */
    const old = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      ok ? done() : onNotice('복사하지 못했어요');
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, old);
    else old();
  };

  return (
    <SystemWindow variant="gold" title="결과 카드">
      <div className="shc-frame">
        {url ? <img src={url} alt="나 혼자만 캐시업 수료 결과 카드" /> : <span>{failed ? '카드를 만들지 못했어요' : '카드를 만드는 중…'}</span>}
      </div>
      <p className="shc-note">받는 금액은 카드에 넣지 않았어요.</p>
      <button type="button" className="btn" disabled={!url} onClick={canShare ? share : save}>
        {canShare ? '공유하기' : '이미지 저장'}
      </button>
      <div className="foot2">
        <button type="button" className="btn sub" onClick={onBack}>
          돌아가기
        </button>
        {canShare ? (
          <button type="button" className="btn sub" disabled={!url} onClick={save}>
            이미지 저장
          </button>
        ) : (
          <button type="button" className="btn sub" onClick={copy}>
            링크 복사
          </button>
        )}
      </div>
    </SystemWindow>
  );
}

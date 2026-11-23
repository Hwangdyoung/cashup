import hunterImg from '../assets/hunter.png';
import SystemWindow, { KV, SysLine } from '../components/SystemWindow.jsx';
import { AMTS, BASE_RATE, MAX_RATE, TOTAL } from '../lib/rules.js';
import { CONCEPTS } from '../lib/characters.js';
import { amtLabel, pct, won } from '../lib/format.js';

/* 온보딩 3단계 (모달 안): 0 헌터 협회 초대 → 1 헌터 고르기 → 2 첫 주 납입액 */
export default function Onboarding({ step, pick, amount, onStep, onPick, onAmount, onStart }) {
  if (step === 0)
    return (
      <SystemWindow title="헌터 협회" alert>
        <SysLine>
          <em>특별 성장 프로젝트</em>에 초대되었습니다.
        </SysLine>
        <p className="swsub">{TOTAL}주 동안 매주 납입하고 걸으며 내 헌터를 E급에서 S급까지 키워요. 26주를 모두 채워 S급이 되거나 길드를 키우면 우대금리를 받아요.</p>
        <p className="ifnote">이 상품의 스토리는 원작과 별개인 콜라보 한정 IF(만약에) 세계관입니다.</p>
        <div className="foot2">
          <button type="button" className="btn" onClick={() => onStep(1)}>
            헌터 고르기
          </button>
        </div>
      </SystemWindow>
    );

  if (step === 1)
    return (
      <SystemWindow title="헌터 선택">
        <SysLine>
          함께 성장할 <em>헌터</em>를 고르세요.
        </SysLine>
        <div className="picks">
          {Object.entries(CONCEPTS).map(([k, c]) => (
            <button key={k} type="button" className={`pick${k === pick ? ' on' : ''}`} style={{ '--pc': c.c }} aria-pressed={k === pick} onClick={() => onPick(k)}>
              <span className="av">
                <img src={hunterImg} alt="" />
              </span>
              <span>
                <b>{c.n}</b>
                <small>{c.who}</small>
                <span>{c.d}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="ifnote">모든 헌터는 E급에서 곡괭이를 들고 시작해 D급에서 각자의 무기로 바뀌어요. 이미지는 자리표시용이에요.</p>
        <div className="foot2">
          <button type="button" className="btn" onClick={() => onStep(2)}>
            다음
          </button>
        </div>
      </SystemWindow>
    );

  return (
    <SystemWindow title="적금 설정">
      <SysLine>
        <em>첫 주 납입액</em>을 정하세요.
      </SysLine>
      <p className="swsub">매주 이 금액만큼 늘려 {TOTAL}주 동안 모아요.</p>
      <div className="amts">
        {AMTS.map((a) => (
          <button key={a} type="button" className={a === amount ? 'on' : undefined} onClick={() => onAmount(a)}>
            {amtLabel(a)}
          </button>
        ))}
      </div>
      <KV
        style={{ marginTop: 8 }}
        rows={[
          [TOTAL + '주차 납입액', won(amount * TOTAL)],
          ['만기 원금', won((amount * TOTAL * (TOTAL + 1)) / 2)],
          ['기본 금리', pct(BASE_RATE)],
          ['우대 포함 최고', <span style={{ color: 'var(--y)' }}>{pct(MAX_RATE)}</span>],
        ]}
      />
      <div className="foot2">
        <button type="button" className="btn sub" onClick={() => onStep(1)}>
          이전
        </button>
        <button type="button" className="btn" onClick={onStart}>
          프로젝트 시작
        </button>
      </div>
    </SystemWindow>
  );
}

import { DungeonArt, TopBar } from '../components/Shell.jsx';
import { AWAKEN_EXP, BASE_RATE, EXP_PAY, EXP_REQ, EXP_WALK, GUILD_MAX, MAX_RATE, RANK, S_BONUS, TICKETS, TOTAL, WALK_GOAL, WK_REQ } from '../lib/rules.js';
import { AWAKEN_REWARD, GRADE_REWARD, GRADE_STORY, HUNTER, RC, RT } from '../lib/characters.js';
import { fmt, pct, pp, won } from '../lib/format.js';
import { maturityPrincipal } from '../lib/savings.js';

const HOWTO = [
  ['매주 자동이체', `납입 성공 시 EXP +${fmt(EXP_PAY)}`, `${TOTAL}주`],
  [`하루 ${fmt(WALK_GOAL)}보 걷기`, `일일 퀘스트 · 보너스 EXP +${fmt(EXP_WALK)}`, 'EXP'],
  ['길드원 초대', '초대 코드로 길드를 만들거나 참여', `최대 ${pp(GUILD_MAX)}`],
  [`${TOTAL}주 완납 · S급 달성`, 'EXP와 완납 주차를 함께 채우면 승급', pp(S_BONUS)],
  ['미납하면 페널티 게이트', `미납 유예권 ${TICKETS}장 · 미니게임 후 재납입`, '구제'],
];

/* 콜라보 적금 상품 페이지 (카카오뱅크 26주적금 상품 안내 화면 구성)
   여기부터 던전 BGM이 흐른다 */
export default function Collab({ joined, onClose, onApply }) {
  return (
    <div className="view prod">
      <TopBar title="나 혼자만 캐시업" left="close" onLeft={onClose} />
      <div className="scroll">
        <div className="prod-hero">
          <span className="ai-chip">✦ 카카오뱅크 × 나 혼자만 레벨업 콜라보</span>
          <h1>
            카카오뱅크
            <em>나 혼자만 캐시업</em>
          </h1>
          <div className="prod-rates">
            <div>
              <i style={{ background: '#EDE6FF', color: '#6B4FD6' }}>↑</i>최고 {pct(MAX_RATE)}
              <small>
                {TOTAL}주 완납 + 길드 {GUILD_MAX.toFixed(1)}%p 시
              </small>
            </div>
            <div>
              <i style={{ background: '#FFF4B8', color: '#8A6A00' }}>✓</i>기본 {pct(BASE_RATE)}
              <small>시작부터 적용</small>
            </div>
          </div>
        </div>

        <DungeonArt className="prod-stage" grade={0}>
          <div className="cap">[ 헌터 협회 특별 성장 프로젝트 ]</div>
        </DungeonArt>

        <section className="prod-sec">
          <h2>이렇게 키워요</h2>
          <div className="howto">
            {HOWTO.map(([t, d, v], i) => (
              <div key={t}>
                <span className="ic">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <b>{t}</b>
                  <span>{d}</span>
                </span>
                <em>{v}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="prod-sec">
          <h2>
            {HUNTER.n}의 {TOTAL}주 성장
          </h2>
          <div className="ladder">
            <div className="lad aw">
              <span className="g" style={{ background: 'transparent', color: '#FFD23F' }}>
                ★
              </span>
              <span>
                <b>히든 각성 · 최종 연출</b>
                <span>{AWAKEN_REWARD}</span>
              </span>
              <small>
                만기 · 걷기 보너스
                <br />
                EXP {fmt(AWAKEN_EXP)}
              </small>
            </div>
            {RANK.map((r, i) => i)
              .reverse()
              .map((i) => (
                <div className="lad" key={i}>
                  <span className="g" style={{ background: RC[i], color: RT[i] }}>
                    {RANK[i]}
                  </span>
                  <span>
                    <b>{GRADE_STORY[i]}</b>
                    <span>{i === 0 ? '시작' : '그림자 병사 ' + i + '명'}</span>
                  </span>
                  <small>
                    {WK_REQ[i] ? WK_REQ[i] + '주 완납' : '0주'}
                    <br />
                    EXP {fmt(EXP_REQ[i])}
                  </small>
                </div>
              ))}
          </div>
          <div className="reward">
            <span>
              등급 달성 리워드 <b>{GRADE_REWARD}</b>
            </span>
          </div>
        </section>

        <section className="prod-sec">
          <h2>상품 안내</h2>
          <div className="sum-rows" style={{ padding: 0 }}>
            <div>
              <span>기간</span>
              <b>{TOTAL}주</b>
            </div>
            <div>
              <span>시작 금액</span>
              <b>1천~1만 원 · 매주 같은 금액씩 증액</b>
            </div>
            <div>
              <span>만기 원금</span>
              <b>
                {won(maturityPrincipal(1000))} ~ {won(maturityPrincipal(10000))}
              </b>
            </div>
            <div>
              <span>금리</span>
              <b>
                기본 {BASE_RATE.toFixed(1)}% + 길드 {pp(GUILD_MAX)} + S급 {pp(S_BONUS)}
              </b>
            </div>
          </div>
        </section>
        <p className="if-note">
          이 상품의 스토리는 원작과 별개인 콜라보 한정 IF(만약에) 세계관이에요. 금리·리워드는 기획 제안 예시이며 실제 상품과 다를 수 있어요. 시연용 화면이에요.
        </p>
      </div>
      <div className="bottom-cta">
        <button type="button" className="kb-btn black" onClick={onApply}>
          {joined ? '내 적금 보러 가기' : '나 혼자만 캐시업 신청하기'}
        </button>
      </div>
    </div>
  );
}

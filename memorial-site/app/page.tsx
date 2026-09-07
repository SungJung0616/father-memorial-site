const milestones = [
  { year: '1957', label: '서울 용산구 후암동 출생' },
  { year: '1981', label: '서울대학교 약학대학 제약학과 학사' },
  { year: '1983', label: '서울대학교 약학대학 약학과 석사' },
  { year: '1989', label: '미국 UCLA 화학과 박사' },
  { year: '1990', label: 'Harvard 박사후연구원 · 동덕여대 조교수' },
  { year: '1993', label: '성균관대학교 약학대학 교수 부임' },
  { year: '2013–19', label: '대한약학회와 한국유기합성학회 봉사' },
  { year: '2016–18', label: '경기도경제과학진흥원 바이오센터 센터장' },
  { year: '2023', label: '성균관대 명예교수 · 덕성여대 대우교수' },
  { year: '2024', label: '삼오제약 품질관리약사 고문' },
  { year: '2026', label: '8월 24일 오후 8시 40분(한국 시간), 사랑하는 이들의 곁을 떠나 영면' },
];

const albums = [
  { title: '가족과 함께', subtitle: 'Family', tone: 'warm' },
  { title: '친구들과의 시간', subtitle: 'Friends', tone: 'blue' },
  { title: '가르침과 연구', subtitle: 'Teaching & Research', tone: 'green' },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="home">
        <header className="site-header">
          <a className="wordmark" href="#home" aria-label="홈으로 이동">
            <span className="wordmark-ko">故 정영훈님</span>
            <span className="wordmark-en">In loving memory</span>
          </a>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            <a href="#life">교수님의 삶</a><a href="#teaching">가르침과 연구</a>
            <a href="/photos">사진첩</a><a href="#directions">묘소·성묘 안내</a><a href="/community">추억 이야기</a>
          </nav>
          <a className="language-button" href="/en" aria-label="영어로 보기">EN</a>
        </header>
        <HeroCarousel />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">In loving memory</p>
          <h1>故 정영훈님</h1>
          <p className="dates">1957. 10. 17. — 2026. 8. 24.</p>
          <blockquote>평생 학문과 가르침에 헌신하신 아버님의 따뜻한 마음과 빛나는 발자취를 오래도록 기억하겠습니다.</blockquote>
          <div className="hero-actions"><a className="primary-action" href="/community">추억 보기</a><a className="secondary-action" href="/contribute">사진 올리기</a></div>
        </div>
        <a className="scroll-cue" href="#life" aria-label="다음 내용으로 이동"><span />천천히 내려보기</a>
      </section>

      <section className="intro section-shell" id="life">
        <p className="section-kicker">A life of scholarship and devotion</p>
        <div className="intro-grid">
          <h2>후암동에서 시작해<br />평생 이어진 배움과 가르침</h2>
          <div><p>1957년 10월 17일 서울 용산구 후암동에서 태어난 정영훈 교수는 서울대학교 약학대학에서 학문을 시작해 미국 UCLA에서 화학 박사학위를 받았습니다. Harvard대학교에서 연구를 이어간 뒤 동덕여자대학교와 성균관대학교 강단에서 오랜 세월 연구와 교육에 헌신했습니다. 정년 뒤에도 명예교수와 대우교수, 산업 현장의 고문으로 활동하며 배움과 책임의 길을 이어갔습니다.</p><a className="text-link" href="#teaching">가르침과 연구 보기 <span>→</span></a></div>
        </div>
        <div className="milestones" aria-label="주요 생애 연보">
          {milestones.map((item) => <article key={item.year}><strong>{item.year}</strong><span>{item.label}</span></article>)}
        </div>
      </section>

      <section className="photo-section" id="photos"><div className="section-shell">
        <div className="section-heading"><div><p className="section-kicker">Life in photos</p><h2>사진으로 보는 삶</h2></div><a className="text-link" href="/photos">사진첩 보기 <span>→</span></a></div>
        <div className="album-grid">{albums.map((album,index) => <article className={`album-card ${album.tone}`} key={album.title}><div className="album-placeholder" aria-label={`${album.title} 사진 자리`}><span>사진 {index+1}</span></div><p>{album.subtitle}</p><h3>{album.title}</h3></article>)}</div>
      </div></section>

      <section className="legacy section-shell" id="teaching"><div className="legacy-mark" aria-hidden="true">學</div><div><p className="section-kicker">Teaching &amp; research</p><h2>가르침과 연구의 발자취</h2><p>새로운 유기반응과 효율적인 합성 경로를 탐구하며 약학과 유기합성 분야의 발전에 기여했습니다. 논문과 저서뿐 아니라 제자들의 기억 속 가르침도 함께 기록합니다.</p></div></section>
      <section className="directions section-shell" id="directions">
        <div><p className="section-kicker">Visiting his resting place</p><h2>아버님을 찾아가는 길</h2><p>묘소 위치와 성묘 안내는 가족이 공개 범위를 확인한 뒤 이곳에 표시합니다.</p></div>
        <article className="directions-card"><p className="example-label">예시 정보 · 아직 공개되지 않음</p><h3>묘소·성묘 안내</h3><address>관리자가 주소를 입력하면 표시됩니다</address><dl><div><dt>방문 안내</dt><dd>성묘 가능 시간과 만나는 장소</dd></div><div><dt>대중교통</dt><dd>가까운 역과 이동 방법</dd></div><div><dt>주차 안내</dt><dd>주차 위치와 유의사항</dd></div></dl><a href="#directions">안내 확인하기</a></article>
      </section>
      <section className="memory-invitation" id="memories"><p className="section-kicker">Share a memory</p><h2>교수님과의 기억을 들려주세요</h2><p>친구와 제자, 동료 여러분의 사진과 이야기가 이 공간을 더욱 깊게 만듭니다. 회원가입 없이 간단히 보내실 수 있습니다.</p><a className="memory-button" href="/contribute">추억과 사진 보내기</a></section>
      <footer><span>故 정영훈님</span><span>한국어 · English</span></footer><MobileNav language="ko" />
    </main>
  );
}
import MobileNav from './components/MobileNav';
import HeroCarousel from './components/HeroCarousel';

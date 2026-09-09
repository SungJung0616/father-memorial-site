import HomeMemories from './components/HomeMemories';
import TeachingResearch from './components/TeachingResearch';

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
  { year: '2026', label: '8월 24일, 사랑하는 이들의 곁을 떠나 영면' },
];

export default function Home() {
  return (
    <main className="memory-home">
      <section className="hero" id="home">
        <header className="site-header">
          <a className="wordmark" href="#home" aria-label="홈으로 이동">
            <span className="wordmark-ko">故 정영훈님</span>
            <span className="wordmark-en">In loving memory</span>
          </a>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            <a href="#shared-memories">추억 이야기</a><a href="#life">아버님의 삶</a><a href="#teaching">가르침과 연구</a>
            <a href="/photos">사진첩</a><a href="/visiting">아버님 찾아가는 길</a>
          </nav>
          <div className="header-actions"><a className="desktop-login" href="/admin">로그인</a><a className="language-button" href="/en" aria-label="영어로 보기">EN</a></div>
        </header>
        <HeroCarousel />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">In loving memory</p>
          <h1>故 정영훈님</h1>
          <p className="dates">1957. 10. 17. — 2026. 8. 24.</p>
          <blockquote>기억은 함께 나눌수록 오래 남습니다.</blockquote><p className="hero-support">가족과 친구, 제자와 동료가 기억하는 정영훈 교수님의 이야기를 함께 나눕니다.</p>
          <div className="hero-actions"><a className="primary-action" href="#shared-memories">추억 읽기</a><a className="secondary-action" href="/contribute">추억 나누기</a></div>
        </div>
        <a className="scroll-cue" href="#shared-memories" aria-label="다음 내용으로 이동"><span />천천히 내려보기</a>
      </section>

      <HomeMemories />

      <section className="intro section-shell" id="life">
        <p className="section-kicker">A life of scholarship and devotion</p>
        <div className="intro-grid">
          <h2>학문을 향한 열정과<br />사람을 향한 따뜻함</h2>
          <div><p>1957년 10월 17일 서울 용산구 후암동에서 태어난 정영훈 교수는 서울대학교 약학대학에서 학문을 시작해 미국 UCLA에서 화학 박사학위를 받았습니다. Harvard대학교에서 연구를 이어간 뒤 동덕여자대학교와 성균관대학교 강단에서 오랜 세월 연구와 교육에 헌신했습니다. 정년 뒤에도 명예교수와 대우교수, 산업 현장의 고문으로 활동하며 배움과 책임의 길을 이어갔습니다.</p><p className="school-history"><strong>학창 시절</strong><span>선림중학교 22회 · 경기고등학교 72회 · 서울대학교 약학대학 35회</span></p><a className="text-link" href="#teaching">가르침과 연구 보기 <span>→</span></a></div>
        </div>
        <div className="milestones" aria-label="주요 생애 연보">
          {milestones.map((item) => <article key={item.year}><strong>{item.year}</strong><span>{item.label}</span></article>)}
        </div>
      </section>



      <TeachingResearch />
      <section className="directions section-shell home-visiting" id="directions">
        <div><p className="section-kicker">Visiting his resting place</p><h2>아버님 찾아가는 길</h2><p>천안공원 <strong>무학지구입구</strong>로 들어와 주세요.</p><p>입구 → 호수 → 백합 안내판 → 백합 38</p></div>
        <article className="directions-card"><p className="home-visit-label">찾아오실 입구</p><h3>천안공원 무학지구입구</h3><p className="home-visit-destination">아버님 계신 곳 · <strong>백합 38</strong></p><a href="/visiting">사진으로 길 안내 보기 →</a></article>
      </section>
      <section className="memory-invitation closing-invitation" id="memories"><h2>당신이 기억하는 이야기도 이곳에 함께 남겨주세요.</h2><p>사진이 없어도 괜찮습니다.</p><a className="memory-button" href="/contribute">추억 나누기 →</a></section>
      <footer><span>故 정영훈님</span><span>한국어 · English</span></footer><MobileNav language="ko" />
    </main>
  );
}
import MobileNav from './components/MobileNav';
import HeroCarousel from './components/HeroCarousel';

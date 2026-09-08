import HomePhotos from '../components/HomePhotos';
const milestones = [
  { year: '1957', label: 'Born in Huam-dong, Yongsan-gu, Seoul' },
  { year: '1981', label: 'B.S., Seoul National University College of Pharmacy' },
  { year: '1983', label: 'M.S., Seoul National University College of Pharmacy' },
  { year: '1989', label: 'Ph.D. in Chemistry, UCLA' },
  { year: '1990', label: 'Postdoctoral researcher at Harvard; joined Dongduk Women’s University' },
  { year: '1993', label: 'Joined Sungkyunkwan University College of Pharmacy' },
  { year: '2013–19', label: 'Leadership and service in Korea’s pharmaceutical and organic synthesis societies' },
  { year: '2016–18', label: 'Director, Bio Center at Gyeonggido Business & Science Accelerator' },
  { year: '2023', label: 'Professor Emeritus at SKKU; faculty appointment at Duksung Women’s University' },
  { year: '2024', label: 'Quality-management pharmacist adviser at Samoh Pharmaceutical' },
  { year: '2026', label: 'Passed away on August 24, remembered by family, friends, colleagues, and students' },
];

export default function EnglishHome(){
  return <main>
    <section className="hero" id="home"><header className="site-header"><a className="wordmark" href="/en"><span className="wordmark-ko">Professor Young Hoon Jung</span><span className="wordmark-en">In loving memory</span></a><nav className="desktop-nav" aria-label="Main navigation"><a href="#life">His Life</a><a href="#teaching">Teaching &amp; Research</a><a href="#photos">Life in Photos</a><a href="#directions">Resting Place</a><a href="#memories">Share a Memory</a></nav><div className="header-actions"><Link className="desktop-login" href="/admin">Sign In</Link><Link className="language-button" href="/" aria-label="한국어로 보기">한국어</Link></div></header><HeroCarousel language="en"/><div className="hero-shade"/><div className="hero-content"><p className="eyebrow">In loving memory</p><h1>Professor<br/>Young Hoon Jung</h1><p className="dates">October 17, 1957 — August 24, 2026</p><blockquote>A beloved father, teacher, scholar, and mentor whose warmth and dedication continue to inspire us.</blockquote><div className="hero-actions"><a className="primary-action" href="#life">His Life</a><a className="secondary-action" href="#memories">Share a Memory</a></div></div></section>
    <section className="intro section-shell" id="life"><p className="section-kicker">A life of scholarship and devotion</p><div className="intro-grid"><h2>A passion for scholarship.<br/>A warmth for people.</h2><div><p>Born on October 17, 1957, in Huam-dong, Seoul, Professor Young Hoon Jung began his academic journey at Seoul National University College of Pharmacy and earned his Ph.D. in Chemistry at UCLA. After continuing his research at Harvard, he devoted decades to research and education at Dongduk Women’s University and Sungkyunkwan University. Even after retirement, he continued serving students, academia, and industry as a professor emeritus, faculty member, and adviser.</p><p className="school-history"><strong>School communities</strong><span>Sunlim Middle School, Class 22 · Kyunggi High School, Class 72 · Seoul National University College of Pharmacy, Class 35</span></p><a className="text-link" href="#teaching">Teaching and research <span>→</span></a></div></div><div className="milestones">{milestones.map(item=><article key={item.year}><strong>{item.year}</strong><span>{item.label}</span></article>)}</div></section>
    <HomePhotos language="en" />
    <TeachingResearch language="en" />
    <section className="directions section-shell home-visiting" id="directions"><div><p className="section-kicker">Visiting his resting place</p><h2>Visiting His Resting Place</h2><p>Please use the <strong>Muhak District Entrance</strong> at Cheonan Park.</p><p>Entrance → Lake → Baekhap sign → Baekhap 38</p></div><article className="directions-card"><p className="home-visit-label">Entrance to use</p><h3>Cheonan Park · Muhak District Entrance</h3><p lang="ko">천안공원 무학지구입구</p><p className="home-visit-destination">His resting place · <strong>Baekhap 38</strong></p><a href="/en/visiting">View the photo directions →</a></article></section>
    <section className="memory-invitation" id="memories"><p className="section-kicker">Share a memory</p><h2>Help Us Remember Him</h2><p>Share a photograph, a story, or a lesson you carry with you. Submissions are reviewed by the family before publication.</p><a className="memory-button" href="/contribute">Share a Memory</a></section><footer><span>In Loving Memory of Professor Young Hoon Jung</span><span>한국어 · English</span></footer><MobileNav language="en" />
  </main>;
}
import MobileNav from '../components/MobileNav';
import TeachingResearch from '../components/TeachingResearch';
import HeroCarousel from '../components/HeroCarousel';
import Link from 'next/link';

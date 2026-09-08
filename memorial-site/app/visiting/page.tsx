import Link from 'next/link';
import './visiting.css';

const steps = [
  { id: 'entrance', title: '천안공원 무학지구입구', image: 'entrance', alt: '천안공원 돌 표지와 주황색 안내소', text: '반드시 ‘천안공원 무학지구입구’로 들어와 주세요. 큰 돌에 적힌 ‘천안공원’과 주황색 안내소를 확인할 수 있습니다. 지도는 입구까지 안내합니다.' },
  { id: 'lake', title: '호수를 끼고 돌아가기', image: 'lake', alt: '호수와 호수 주변 도로가 보이는 가족 제공 지도 캡처', text: '입구로 들어온 뒤 호수를 끼고 돌아가세요. 호수를 돌아 진행하면 다음 사진의 ‘백합’ 안내판이 나옵니다. 현장의 통행 방향과 안내 표지를 따라 이동해 주세요.' },
  { id: 'inside', title: '‘백합’ 안내를 따라', image: 'sign', alt: '백합을 포함한 공원 구역 안내판', text: '호수를 돌아 만나는 파란 안내판에서 ‘백합’을 확인하고, 백합 방향으로 이동해 주세요.' },
  { id: 'marker', title: '백합 38 표지 확인', image: 'marker', alt: '양쪽 면에 백합 38과 39가 표시된 돌 표지', text: '이 돌 표지에는 38과 39가 함께 적혀 있습니다. 아버님이 계신 곳은 ‘백합 38’입니다. 위치를 찾기 어려우시면 공원 안내소에 ‘백합 38’을 말씀해 주세요.' },
  { id: 'arrival', title: '아버님이 계신 곳', image: 'resting-place', alt: '가족이 방문하여 촬영한 아버님 묘소와 석물', text: '가족이 방문했을 때 촬영한 모습입니다. 꽃과 주변 물건은 달라질 수 있으니, 석물과 비석을 함께 확인해 주세요.' },
];
export default function VisitingPage() {
  return <main className="visit-page">
    <header className="visit-header"><Link href="/">← 故 정영훈님</Link><Link href="/community">추억 이야기</Link></header>
<section className="visit-intro"><p className="visit-eyebrow">VISITING HIS RESTING PLACE</p><h1>아버님 찾아가는 길</h1><p className="visit-destination">천안공원 무학지구입구 <span>백합 38</span></p><p>찾아오시는 발걸음에 도움이 되도록,<br/>가족이 직접 찍은 사진으로 안내합니다.</p><div className="visit-actions"><a href="https://www.google.com/maps/search/?api=1&query=%EC%B2%9C%EC%95%88%EA%B3%B5%EC%9B%90%20%EB%AC%B4%ED%95%99%EC%A7%80%EA%B5%AC%EC%9E%85%EA%B5%AC" target="_blank" rel="noopener noreferrer">지도에서 입구 찾기 ↗</a><a href="#lake">공원 안에서 찾아가기 ↓</a></div><p className="visit-note">지도 검색명: 천안공원 무학지구입구 · 도착 후 백합 38을 확인해 주세요.</p></section>
    <nav className="visit-nav" aria-label="찾아가는 길 단계"><a href="#entrance">① 입구</a><a href="#lake">② 호수</a><a href="#inside">③ 안내판</a><a href="#marker">④ 백합 38</a><a href="#arrival">⑤ 도착</a></nav>
    <div className="visit-steps">{steps.map((step, index) => { const src = `/visiting/${step.image}.${step.id === 'lake' ? 'png' : 'jpg'}`; return <section className="visit-step" id={step.id} key={step.id}><div className="visit-copy"><span className="visit-number">0{index + 1}</span><h2>{step.title}</h2><p>{step.text}</p><a href={src} target="_blank" rel="noopener noreferrer" aria-label={`${step.title} 사진 크게 보기`}>사진 크게 보기 ↗</a></div><a className={`visit-photo${step.id === 'lake' ? ' visit-map' : ''}`} href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={step.alt} loading="lazy" width={step.id === 'lake' ? 274 : 1368} height={step.id === 'lake' ? 223 : 1824} /></a></section>; })}</div>
    <aside className="visit-help"><h2>주차 및 현장 안내</h2><p>가족 방문 경험상 양쪽 길가에 주차할 수 있습니다. <strong>묘소로 들어가는 입구는 막지 않도록</strong> 해 주세요. 현장 주차 안내와 통행 상황을 우선해 주세요.</p><p>찾기 어려우시면 공원 안내소에서도 ‘백합 38’ 위치를 안내받으실 수 있습니다.</p></aside>
    <footer className="visit-footer"><Link href="/">홈으로 돌아가기</Link><span>고마운 마음으로, 가족 드림</span></footer>
  </main>;
}

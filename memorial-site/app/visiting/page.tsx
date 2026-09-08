import Link from 'next/link';
import './visiting.css';

const steps = [
  { id: 'entrance', title: '천안공원 입구', image: 'entrance', alt: '천안공원 돌 표지와 주황색 안내소', text: '큰 돌에 적힌 ‘천안공원’과 주황색 안내소를 확인해 주세요. 지도 검색 결과는 입구 안내이며, 묘소의 정확한 위치는 아닙니다.' },
  { id: 'inside', title: '‘백합’ 안내를 따라', image: 'sign', alt: '백합을 포함한 공원 구역 안내판', text: '공원 안의 파란 안내판에서 ‘백합’을 확인해 주세요. 가족이 방문한 경로는 호수 옆 도로를 따라 백합 38로 향하는 길입니다. 현장의 통행 방향과 안내 표지를 우선해 주세요.' },
  { id: 'marker', title: '백합 38 표지 확인', image: 'marker', alt: '양쪽 면에 백합 38과 39가 표시된 돌 표지', text: '이 돌 표지에는 38과 39가 함께 적혀 있습니다. 아버님이 계신 곳은 ‘백합 38’입니다. 표지 이후의 정확한 도보 방향과 주차 위치는 추가 안내 예정입니다.' },
  { id: 'arrival', title: '아버님이 계신 곳', image: 'resting-place', alt: '가족이 방문하여 촬영한 아버님 묘소와 석물', text: '가족이 방문했을 때 촬영한 모습입니다. 꽃과 주변 물건은 달라질 수 있으니, 석물과 비석을 함께 확인해 주세요.' },
];
export default function VisitingPage() {
  return <main className="visit-page">
    <header className="visit-header"><Link href="/">← 故 정영훈님</Link><Link href="/community">추억 이야기</Link></header>
    <section className="visit-intro"><p className="visit-eyebrow">VISITING HIS RESTING PLACE</p><h1>아버님 찾아가는 길</h1><p className="visit-destination">천안공원 <span>백합 38</span></p><p>찾아오시는 발걸음에 도움이 되도록,<br/>가족이 직접 찍은 사진으로 안내합니다.</p><div className="visit-actions"><a href="https://www.google.com/maps/search/?api=1&query=%EC%B2%9C%EC%95%88%EA%B3%B5%EC%9B%90%20%EB%AC%B4%ED%95%99%EC%A7%80%EA%B5%AC%EC%9E%85%EA%B5%AC" target="_blank" rel="noopener noreferrer">지도에서 입구 찾기 ↗</a><a href="#inside">공원 안에서 찾아가기 ↓</a></div><p className="visit-note">지도 검색명: 천안공원 무학지구입구 · 도착 후 백합 38을 확인해 주세요.</p></section>
    <nav className="visit-nav" aria-label="찾아가는 길 단계"><a href="#entrance">① 입구</a><a href="#inside">② 공원 내부</a><a href="#marker">③ 백합 38</a><a href="#arrival">④ 도착</a></nav>
    <div className="visit-steps">{steps.map((step, index) => <section className="visit-step" id={step.id} key={step.id}><div className="visit-copy"><span className="visit-number">0{index + 1}</span><h2>{step.title}</h2><p>{step.text}</p><a href={`/visiting/${step.image}.jpg`} target="_blank" rel="noopener noreferrer" aria-label={`${step.title} 사진 크게 보기`}>사진 크게 보기 ↗</a></div><a className="visit-photo" href={`/visiting/${step.image}.jpg`} target="_blank" rel="noopener noreferrer"><img src={`/visiting/${step.image}.jpg`} alt={step.alt} loading="lazy" width="1368" height="1824" /></a></section>)}</div>
    <aside className="visit-help"><h2>방문 전 확인해 주세요</h2><p>주차 위치, 방문 가능 시간, 표지에서 묘소까지의 도보 경로는 아직 확인 중입니다. 처음 방문하실 때는 가족 또는 공원 안내소에 ‘백합 38’을 말씀하고 안내를 받아 주세요.</p></aside>
    <footer className="visit-footer"><Link href="/">홈으로 돌아가기</Link><span>고마운 마음으로, 가족 드림</span></footer>
  </main>;
}

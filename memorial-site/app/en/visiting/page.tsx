import Link from 'next/link';
import '../../visiting/visiting.css';

const steps = [
  { id: 'entrance', title: 'Use the Muhak District Entrance', image: 'entrance.jpg', text: 'Enter through 천안공원 무학지구입구 (Cheonan Park, Muhak District Entrance). Look for the large stone sign and orange information booth. Google Maps directs you to the entrance, not the gravesite.' },
  { id: 'lake', title: 'Follow the road around the lake', image: 'lake.png', text: 'After entering, follow the road around the lake. Continue until you reach the blue Baekhap sign shown below. Follow the posted traffic directions.' },
  { id: 'inside', title: 'Follow the Baekhap signs', image: 'sign.jpg', text: 'After going around the lake, look for 백합 (Baekhap) on the blue sign and follow that direction.' },
  { id: 'marker', title: 'Look for Baekhap 38', image: 'marker.jpg', text: 'The stone marker shows both 38 and 39. His resting place is in 백합 38 (Baekhap 38). If you need help, ask the park information booth for Baekhap 38.' },
  { id: 'arrival', title: 'His resting place', image: 'resting-place.jpg', text: 'This photograph was taken during a family visit. Flowers and other items may change; use the stonework and headstone to help identify the site.' },
];
export default function VisitingEnglish() {
  return <main className="visit-page" lang="en">
    <header className="visit-header"><Link href="/en">← In Memory of Professor Jung</Link><Link href="/visiting" lang="ko">한국어</Link></header>
    <section className="visit-intro"><p className="visit-eyebrow">VISITING HIS RESTING PLACE</p><h1>Visiting His Resting Place</h1><p className="visit-destination">Cheonan Park · Muhak District Entrance <span>Baekhap 38 · 백합 38</span></p><p>A step-by-step guide with photographs taken by the family.</p><div className="visit-actions"><a href="https://www.google.com/maps/search/?api=1&query=%EC%B2%9C%EC%95%88%EA%B3%B5%EC%9B%90%20%EB%AC%B4%ED%95%99%EC%A7%80%EA%B5%AC%EC%9E%85%EA%B5%AC" target="_blank" rel="noopener noreferrer">Find the entrance on Google Maps ↗</a><a href="#lake">Directions inside the park ↓</a></div><p className="visit-note">Map search: 천안공원 무학지구입구. Once inside, follow this guide to Baekhap 38.</p></section>
    <nav className="visit-nav" aria-label="Directions by step"><a href="#entrance">① Entrance</a><a href="#lake">② Lake</a><a href="#inside">③ Sign</a><a href="#marker">④ Baekhap 38</a><a href="#arrival">⑤ Arrival</a></nav>
    <div className="visit-steps">{steps.map((step, index) => <section className="visit-step" id={step.id} key={step.id}><div className="visit-copy"><span className="visit-number">0{index + 1}</span><h2>{step.title}</h2><p>{step.text}</p>{step.id === 'inside' && <figure className="visit-route"><a href="/visiting/baekhap-route.png" target="_blank" rel="noopener noreferrer"><img src="/visiting/baekhap-route.png" width="278" height="408" loading="lazy" alt="Family-provided map highlighting the route from the lake toward Baekhap in yellow" /></a><figcaption>Route marked by the family · Select the map to enlarge.</figcaption></figure>}<a href={`/visiting/${step.image}`} target="_blank" rel="noopener noreferrer">View full image ↗</a></div><a className={`visit-photo${step.id === 'lake' ? ' visit-map' : ''}`} href={`/visiting/${step.image}`} target="_blank" rel="noopener noreferrer"><img src={`/visiting/${step.image}`} alt={step.title} loading="lazy" width={step.id === 'lake' ? 274 : 1368} height={step.id === 'lake' ? 223 : 1824} /></a></section>)}</div>
    <aside className="visit-help"><h2>Parking and assistance</h2><p>On family visits, parking has been available along both sides of the road. <strong>Please keep entrances to gravesites clear</strong> and follow on-site parking instructions and traffic conditions.</p><p>The park information booth can also help you locate 백합 38 (Baekhap 38).</p></aside>
    <footer className="visit-footer"><Link href="/en">Back to home</Link><span>With gratitude, the family</span></footer>
  </main>;
}

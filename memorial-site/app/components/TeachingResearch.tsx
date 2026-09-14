import './teaching-research.css';

// Family-CV records are retained for review; only the verified selection renders.
// The 2021 title spelling is corrected against its original publication record.
type PublicationRecord = { year: string; journal: string; title: string; source?: string; authors?: string };
const publications: PublicationRecord[] = [
  { year: '2023', journal: 'Bioorg. Med. Chem.', title: 'Synthesis and biological evaluation of novel N-benzyltriazolyl-hydroxamate derivatives as selective histone deacetylase 6 inhibitors', authors: 'Sun Ju Kong; Gibeom Nam; Pulla Reddy Boggu; Gi Min Park; Ji Eun Kang; Hyun-Ju Park; Young Hoon Jung', source: 'https://doi.org/10.1016/j.bmc.2023.117154' },
  { year: '2022', journal: 'Tetrahedron', title: 'Total synthesis of a-1-C-propyl-3,6-di-epi-nojirimycin and polyhydroxyindolizidine alkaloids via regio- and diastereoselective amination of anomeric acetals' },
  { year: '2021', journal: 'Bioorg. Med. Chem.', title: 'Synthesis and biological evaluation of novel purinyl quinazolinone derivatives as PI3Kδ-specific inhibitors for the treatment of hematologic malignancies', authors: 'Yeon Su Kim; Min Gyeong Cheon; Pulla Reddy Boggu; Su Youn Koh; Gi Min Park; Gahee Kim; Seo Hyun Park; Sung Lyea Park; Chi Woo Lee; Jong Woo Kim; Young Hoon Jung', source: 'https://doi.org/10.1016/j.bmc.2021.116312' },
  { year: '2020', journal: 'Tetrahedron Lett.', title: 'Total synthesis of chromanol 293B and cromakalim via stereoselective amination of chiral benzylic ethers' },
  { year: '2017', journal: 'Tetrahedron', title: 'Total synthesis of (-)-codonopsinine via regioselective and diastereoselective amination using chlorosulfonyl isocyanate' },
  { year: '2011', journal: 'J. Org. Chem.', title: 'Stereoselective Amination of Chiral Benzylic Ethers Using Chlorosulfonyl Isocyanate: Total Synthesis of (+)-Sertraline.' },
  { year: '2007', journal: 'J. Org. Chem.', title: 'Palladium(II)-Catalyzed Isomerization of Olefins with Tributyltin Hydride.' },
  { year: '2006', journal: 'Org. Lett.', title: 'Regioselective and Diastereoselective Amination of Polybenzyl ethers using chlorosulfonyl isocyanate: Total synthesis of 1,4-Dideoxy-1,4-imino-D-arabinitol and (-)-Lentiginosine', authors: 'In Su Kim; Ok Pyo Zee; Young Hoon Jung', source: 'https://doi.org/10.1021/ol061614x' },
  { year: '2003', journal: 'J. Org. Chem.', title: 'Regioselective and Diastereoselective Allylic Amination Using Chlorosulfonyl Isocyanate. A Novel Asymmetric Synthesis of Unsaturated Aromatic 1,2-Amino Alcohols.' },
  { year: '2000', journal: 'Tetrahedron Lett.', title: 'Novel synthetic method for N-allylcarbamates from allyl ethers using chlorosulfonyl isocyanate.' },
  { year: '2023', journal: 'Carbohydr Res', title: 'Synthesis and evaluation of ent-Conduramine C-1 derivatives as α-glucosidase inhibitors via CSI-mediated amination reaction', authors: 'Gi Min Park; Sun Ju Kong; Jae Hyeon Park; Ji Eun Kang; Sung Hwan An; Hyung Sik Kim; In Su Kim; Pulla Reddy Boggu; Young Hoon Jung', source: 'https://doi.org/10.1016/j.carres.2023.108746' },
  { year: '2022', journal: 'Molecules', title: 'Total Synthesis of Eliglustat via Diastereoselective Amination of Chiral para-Methoxycinnamyl Benzyl Ether', authors: 'Younggyu Kong; Pulla Reddy Boggu; Gi Min Park; Yeon Su Kim; Seong Hwan An; In Su Kim; Young Hoon Jung', source: 'https://doi.org/10.3390/molecules27082603' },
];
// Correspondence verified in linked records: Jung included, In Su Kim not a
// corresponding author. Ordinary coauthor credits remain unchanged.
const selected = [7, 2, 11, 0, 10];
const featured = [7, 11, 0];
const patents = [
  { year: '2020', date: '2020-02-19', number: 'KR102078528B1', country: 'KR', title: '신규한 HDAC6 억제제를 이용한 치매 또는 인지장애 예방 또는 치료용 약학적 조성물', englishTitle: 'Pharmaceutical Composition for preventing or treating dementia or cognitive disorder using novel HDAC6 inhibitors', source: 'https://patents.google.com/patent/KR102078528B1/ko' },
  { year: '2004', date: '2004-12-14', number: 'US6831061B2', country: 'US', title: 'Apicidin-derivatives, their synthetic methods and anti-tumor compositions containing them', source: 'https://patents.google.com/patent/US6831061B2/en' },
  { year: '2001', date: '2001-07-03', number: 'US6255517B1', country: 'US', title: 'Thymol derivatives having anti-tumor activity, and anti-cancer agent comprising the same', source: 'https://patents.google.com/patent/US6255517B1/en' },
];
const chapters = [
  { years: '2000–2011', title: '분자를 만드는 새로운 방법', field: '유기합성 방법론', body: '분자의 어느 위치에, 어떤 입체적 방향으로 반응이 일어나게 할지 탐구했습니다. 선택적으로 아민기를 도입하는 합성법을 연구하고 복잡한 화합물을 만드는 데 적용했습니다.' },
  { years: '2017–2022', title: '합성법에서 생리활성 화합물로', field: '천연물과 생리활성 화합물의 전합성', body: '축적한 합성 방법을 바탕으로 천연물과 생리활성 화합물의 전체 구조를 만들어 가는 전합성을 연구했습니다. Codonopsinine과 여러 알칼로이드 등의 합성으로 연구를 이어갔습니다.' },
  { years: '2021–2023', title: '새로운 치료 가능성을 탐구하며', field: '의약화학과 치료 후보물질', body: 'PI3Kδ와 HDAC6를 표적으로 하는 억제제의 합성과 생물학적 평가에 참여했습니다. 새로운 치료 후보물질의 가능성을 탐구한 연구이며, 의약품의 승인이나 치료 효과 확정을 의미하지는 않습니다.' },
];
function Publication({ index, en }: { index: number; en: boolean }) {
  const item = publications[index];
  return <li className="research-publication"><span className="research-year">{item.year}</span><div><h4 lang="en">{item.title}</h4><p lang="en"><cite>{item.journal}</cite> · {item.year}</p>{item.authors && <p className="research-authors" lang="en">{item.authors}</p>}{item.source && <a className="research-record-link" href={item.source} target="_blank" rel="noopener noreferrer">{en ? 'Original publication ↗' : '논문 원문 ↗'}</a>}</div></li>;
}
const englishChapters = [
  { years: '2000–2011', field: '', title: 'Advancing Synthetic Methodology', body: 'Development of regioselective and stereoselective amination methods, including the use of chlorosulfonyl isocyanate in organic synthesis.' },
  { years: '2017–2022', field: '', title: 'Total Synthesis of Bioactive Molecules', body: 'Application of synthetic methodology to complex natural products and biologically active compounds, including codonopsinine, chromanol 293B, cromakalim, and nojirimycin derivatives.' },
  { years: '2021–2023', field: '', title: 'Expanding into Medicinal Chemistry', body: 'Research on novel therapeutic candidates, including PI3Kδ-specific and HDAC6 inhibitors.' },
];
export default function TeachingResearch({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const en = language === 'en';
  return <section className="legacy section-shell research-section" id="teaching" lang={language}>
    <div className="legacy-mark" aria-hidden="true">學</div>
    <div className="research-intro"><p className="section-kicker">{en ? 'TEACHING & RESEARCH' : 'Teaching & research'}</p><h2>{en ? 'A Legacy of Teaching and Research' : '가르침과 연구의 발자취'}</h2><p>{en ? 'Professor Jung devoted his academic career to organic and medicinal chemistry, with a particular focus on stereoselective synthesis, total synthesis of biologically active compounds, and the development of new therapeutic candidates. Through both research and teaching, he contributed to the advancement of pharmaceutical science while mentoring generations of students and young researchers.' : '새로운 유기반응과 입체선택적 합성법을 연구하고, 이를 천연물과 생리활성 화합물의 전합성에 적용했습니다. 이후 의약화학으로 연구 영역을 넓혀 새로운 치료 후보물질을 탐구하며, 연구와 교육을 통해 다음 세대의 약학 연구자들과 지식을 나누었습니다.'}</p></div>
    <div className="research-story"><h3>{en ? 'A Research Journey' : '연구가 이어온 길'}</h3><p className="research-context">{en ? 'Selected publications trace these overlapping strands of his research.' : '대표 논문으로 살펴본 연구의 흐름입니다. 각 분야는 시기를 겹치며 함께 이어졌습니다.'}</p><ol className="research-timeline">{(en ? englishChapters : chapters).map(chapter => <li key={chapter.years}><span className="research-years">{chapter.years}</span>{chapter.field && <p className="research-field">{chapter.field}</p>}<h4>{chapter.title}</h4><p>{chapter.body}</p></li>)}</ol>
      <div className="research-publications"><p className="section-kicker">Selected Publications</p><h3>{en ? 'Selected Publications' : '대표 논문'}</h3><p className="research-context">{en ? 'Three selected papers introduce these strands of his work.' : '세 연구 흐름을 보여주는 선별 논문을 먼저 소개합니다.'}</p><ul>{featured.map(index => <Publication key={index} index={index} en={en} />)}</ul><details><summary><span className="research-expand">{en ? `View all ${selected.length} selected publications` : `대표 논문 전체 보기 · ${selected.length}편`}</span><span className="research-collapse">{en ? 'Show fewer publications' : '추가 논문 접기'}</span></summary><p className="research-context">{en ? 'Further verified papers from the selection. This is not a complete bibliography.' : '교신저자 기록을 확인한 추가 논문입니다. 전체 논문 목록이 아닌 선별 기록입니다.'}</p><ul>{selected.map(index => featured.includes(index) ? null : <Publication key={index} index={index} en={en} />)}</ul></details><p className="research-source">{en ? 'Selected studies listing Young Hoon Jung as a corresponding author. Original author credits are preserved.' : '정영훈 교수님이 교신저자로 확인되는 연구를 선별했습니다. 공동 연구의 저자 표기를 존중합니다.'}</p></div>
      <div className="research-publications research-patents"><p className="section-kicker">Selected Patents</p><h3>{en ? 'Selected Patents' : '특허로 남은 연구'}</h3><p className="research-context">{en ? 'Selected patent records naming Young Hoon Jung as a co-inventor. Titles describe the inventions, not approved treatments.' : '정영훈 교수님이 공동발명자로 확인되는 특허 기록입니다. 특허명은 발명의 내용을 나타내며, 의약품의 승인이나 치료 효과 확정을 의미하지 않습니다.'}</p><ul>{patents.map(item => <li className="research-publication" key={item.number}><span className="research-year">{item.year}</span><div><h4 lang={item.country === 'KR' && !en ? 'ko' : 'en'}>{en && item.englishTitle ? item.englishTitle : item.title}</h4><p lang="en">{item.country} · {item.number}</p><p>{en ? 'Grant publication' : '등록공보 발행'} · <time dateTime={item.date}>{item.date}</time></p><a className="research-record-link" href={item.source} target="_blank" rel="noopener noreferrer">{en ? 'Patent record ↗' : '특허 원문 ↗'}</a></div></li>)}</ul><p className="research-source">{en ? 'Source: published patent documents. Co-inventor lists are available in the linked records.' : '자료: 특허 공보. 전체 공동발명자 명단은 각 원문에서 확인할 수 있습니다.'}</p></div>
    </div>
  </section>;
}

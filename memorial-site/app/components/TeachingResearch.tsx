import './teaching-research.css';

// Transcribed from the family's supplied CV, page 2. Titles are not paraphrased.
const publications = [
  { year: '2023', journal: 'Bioorg. Med. Chem.', title: 'Synthesis and biological evaluation of novel N-benzyltriazolyl-hydroxamate derivatives as selective histone deacetylase 6 inhibitors' },
  { year: '2022', journal: 'Tetrahedron', title: 'Total synthesis of a-1-C-propyl-3,6-di-epi-nojirimycin and polyhydroxyindolizidine alkaloids via regio- and diastereoselective amination of anomeric acetals' },
  { year: '2021', journal: 'Bioorg. Med. Chem.', title: 'Synthesis and biological evaluation of novel purinyl quinazoline derivatives as PI3Kδ-specific inhibitors for the treatment of hematologic malignancies' },
  { year: '2020', journal: 'Tetrahedron Lett.', title: 'Total synthesis of chromanol 293B and cromakalim via stereoselective amination of chiral benzylic ethers' },
  { year: '2017', journal: 'Tetrahedron', title: 'Total synthesis of (-)-codonopsinine via regioselective and diastereoselective amination using chlorosulfonyl isocyanate' },
  { year: '2011', journal: 'J. Org. Chem.', title: 'Stereoselective Amination of Chiral Benzylic Ethers Using Chlorosulfonyl Isocyanate: Total Synthesis of (+)-Sertraline.' },
  { year: '2007', journal: 'J. Org. Chem.', title: 'Palladium(II)-Catalyzed Isomerization of Olefins with Tributyltin Hydride.' },
  { year: '2006', journal: 'Org. Lett.', title: 'Regioselective and Diastereoselective Amination of Polybenzyl ethers using chlorosulfonyl isocyanate: Total synthesis of 1,4-Dideoxy-1,4-imino-D-arabinitol and (-)-Lentiginosine' },
  { year: '2003', journal: 'J. Org. Chem.', title: 'Regioselective and Diastereoselective Allylic Amination Using Chlorosulfonyl Isocyanate. A Novel Asymmetric Synthesis of Unsaturated Aromatic 1,2-Amino Alcohols.' },
  { year: '2000', journal: 'Tetrahedron Lett.', title: 'Novel synthetic method for N-allylcarbamates from allyl ethers using chlorosulfonyl isocyanate.' },
];
const featured = [9, 4, 0];
const chapters = [
  { years: '2000–2011', title: '분자를 만드는 새로운 방법', field: '유기합성 방법론', body: '분자의 어느 위치에, 어떤 입체적 방향으로 반응이 일어나게 할지 탐구했습니다. 선택적으로 아민기를 도입하는 합성법을 연구하고 복잡한 화합물을 만드는 데 적용했습니다.' },
  { years: '2017–2022', title: '합성법에서 생리활성 화합물로', field: '천연물과 생리활성 화합물의 전합성', body: '축적한 합성 방법을 바탕으로 천연물과 생리활성 화합물의 전체 구조를 만들어 가는 전합성을 연구했습니다. Codonopsinine과 여러 알칼로이드 등의 합성으로 연구를 이어갔습니다.' },
  { years: '2021–2023', title: '새로운 치료 가능성을 탐구하며', field: '의약화학과 치료 후보물질', body: 'PI3Kδ와 HDAC6를 표적으로 하는 억제제의 합성과 생물학적 평가에 참여했습니다. 새로운 치료 후보물질의 가능성을 탐구한 연구이며, 의약품의 승인이나 치료 효과 확정을 의미하지는 않습니다.' },
];
function Publication({ index }: { index: number }) {
  const item = publications[index];
  return <li className="research-publication"><span className="research-year">{item.year}</span><div><h4 lang="en">{item.title}</h4><p lang="en"><cite>{item.journal}</cite> · {item.year}</p></div></li>;
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
      <div className="research-publications"><p className="section-kicker">Selected Publications</p><h3>{en ? 'Selected Publications' : '대표 논문'}</h3><p className="research-context">{en ? 'Three papers from the family-held CV introduce these strands of his work.' : '가족이 보관한 이력서에서, 세 연구 흐름을 보여주는 논문을 먼저 소개합니다.'}</p><ul>{featured.map(index => <Publication key={index} index={index} />)}</ul><details><summary><span className="research-expand">{en ? 'View all 10 selected publications' : '대표 논문 전체 보기 · 10편'}</span><span className="research-collapse">{en ? 'Show fewer publications' : '추가 논문 접기'}</span></summary><p className="research-context">{en ? 'The remaining seven publications listed in his CV.' : '위 3편 외 이력서에 수록된 나머지 7편입니다.'}</p><ul>{publications.map((_, index) => featured.includes(index) ? null : <Publication key={index} index={index} />)}</ul></details><p className="research-source">{en ? 'Source: CV provided by the family · 10 selected publications' : '자료: 가족 제공 이력서 · 대표논문 10편'}</p></div>
    </div>
  </section>;
}

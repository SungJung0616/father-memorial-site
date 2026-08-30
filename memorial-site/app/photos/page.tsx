const albums=[
  {period:'1970년대',title:'학창 시절',count:128,tone:'warm',confidence:'촬영 정보 확인'},
  {period:'1980–1989',title:'서울약대와 UCLA',count:86,tone:'blue',confidence:'AI 정리 · 검토 완료'},
  {period:'1990–1999',title:'교수로서의 첫걸음',count:214,tone:'green',confidence:'AI 정리 · 일부 확인 필요'},
  {period:'2000년대',title:'가르침과 연구의 시간',count:347,tone:'blue',confidence:'촬영 정보 확인'},
  {period:'시기 미상',title:'함께 확인해주세요',count:42,tone:'warm',confidence:'친구와 제자의 도움이 필요해요'},
];

export default function PhotosPage(){return <main className="photos-page"><header><a href="/">← 故 정영훈님</a><div><p className="section-kicker">사진으로 보는 삶</p><h1>사진첩</h1><p>AI가 촬영 정보와 사진 내용을 바탕으로 시기별로 정리한 앨범입니다. 가족과 검토 매니저가 확인한 뒤 공개됩니다.</p></div><a href="/contribute">사진 보내기</a></header><nav className="photo-tabs" aria-label="사진 보기 방식"><button className="selected">앨범</button><button>추천 사진</button><button>전체 사진</button><button>사람·모임</button></nav><section className="archive-grid">{albums.map((album,index)=><article key={album.title}><div className={`archive-cover ${album.tone}`}><span>앨범 사진 {index+1}</span></div><div className="archive-info"><p>{album.period}</p><h2>{album.title}</h2><span>{album.count}장의 사진</span><small>{album.confidence}</small></div></article>)}</section></main>}

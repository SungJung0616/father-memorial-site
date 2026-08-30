'use client';
import { useState } from 'react';

const posts=[
  {group:'경기고 친구',name:'김○○',time:'방금 전',title:'1970년대 수학여행 사진을 찾았습니다',body:'사진 속 장소와 함께 계신 분들의 성함을 아시는 분은 알려주세요.',hearts:34,comments:4,photo:true},
  {group:'성균관대 제자',name:'이○○',time:'어제',title:'연구실에서 늘 해주시던 말씀',body:'결과보다 과정이 중요하다고 말씀하시던 교수님의 가르침을 아직도 기억합니다.',hearts:58,comments:12,photo:false},
  {group:'후암동 친구',name:'박○○',time:'2일 전',title:'봄날에 함께 걸었던 후암동 골목',body:'오래된 사진을 정리하다 교수님과 친구들이 함께 웃는 모습을 발견했습니다.',hearts:27,comments:8,photo:true},
  {group:'가족',name:'가족 기록',time:'3일 전',title:'가족과 함께한 따뜻한 오후',body:'사진 한 장에 담긴 아버님의 웃음을 함께 나눕니다.',hearts:42,comments:6,photo:true},
];

export default function CommunityPage(){
  const [liked,setLiked]=useState<Record<number,boolean>>({});
  const [visible,setVisible]=useState(3);
  return <main className="community-page">
    <header><a href="/">← 故 정영훈님</a><div><p className="section-kicker">함께 기억합니다</p><h1>추억 이야기</h1><p>사진과 이야기를 편하게 보고, 아시는 내용을 함께 보태주세요.</p></div><a className="community-write" href="/contribute">추억 보내기</a></header>
    <section className="family-notices" id="notices" aria-label="중요한 소식">
      <article className="family-notice"><span>📌 가족이 전하는 소식</span><h2>함께 기억해 주시는 모든 분께 감사드립니다</h2><p>사진과 추억은 가족이 확인한 뒤 정성껏 이 공간에 담겠습니다.</p><button>내용 보기</button></article>
      <article className="meeting-notice"><span>📅 다음 모임</span><h2>가을 성묘 모임 준비 중</h2><p>날짜와 장소는 가족 확인 후 알려드리겠습니다.</p><button>소식 받기</button></article>
    </section>
    <div className="feed-heading"><h2>최근 추억</h2><a href="/photos">사진첩 보기</a></div>
    <section className="community-feed">{posts.slice(0,visible).map((post,index)=><article key={post.title}>
      <div className="post-meta"><span>{post.group}</span><span>{post.name} · {post.time}</span></div>
      {post.photo&&<div className={`feed-photo feed-photo-${index+1}`}><span>사진 자리</span></div>}
      <h2>{post.title}</h2><p>{post.body}</p>
      <div className="post-footer"><button className={liked[index]?'heart-button liked':'heart-button'} onClick={()=>setLiked(current=>({...current,[index]:!current[index]}))} aria-pressed={!!liked[index]}>♥ <span>함께 기억합니다 {post.hearts+(liked[index]?1:0)}</span></button><a href="#comments">댓글 {post.comments}</a></div>
    </article>)}</section>
    {visible<posts.length&&<button className="load-more" onClick={()=>setVisible(posts.length)}>추억 더 보기</button>}
    <a className="community-mobile-write" href="/contribute">＋ 추억 보내기</a>
  </main>;
}

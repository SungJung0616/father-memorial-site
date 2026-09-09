// Local-only visual QA for five memories. Not imported by the application or deployed.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('out');
const memories = [
  { title: '조용히 건네주시던 한마디', body: '모두가 바쁘게 지나가던 오후에도 교수님은 잠시 걸음을 멈추고 이야기를 들어주셨습니다. 그 따뜻했던 시간을 오래 기억합니다.', group: '제자', photos: [], isPinned: true },
  { title: '함께 음악을 나누던 날', body: '연주를 마치고 서로를 바라보며 웃던 순간이 떠오릅니다.', group: '친구', photos: [{ url: '/images/hero/jung-young-hoon-02.jpg' }] },
  { title: 'The kindness I remember', body: 'He made time for the smallest questions. Years later, it is that generosity I remember most.', group: '동료', photos: [] },
  { title: '함께 걸었던 길', body: '특별한 날보다 함께했던 평범한 하루가 더 선명하게 남아 있습니다.', group: '가족', photos: [{ url: '/images/hero/jung-young-hoon-01.jpg' }] },
  { title: '배움은 일상 속에도 있었습니다', body: '답을 알려주시기보다 스스로 생각할 수 있도록 기다려 주셨습니다.', group: '제자', photos: [] },
].map((x, i) => ({ id: `00000000-0000-4000-8000-00000000000${i}`, submittedAt: `2026-09-0${8-i}`, likeCount: i + 2, category: '', ...x }));
let apiRequests = 0;
createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  if (path === '/api/memories') { apiRequests++; console.log(`memories request ${apiRequests}`); res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ memories })); return; }
  if (path === '/api/site-settings') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ heroes: [{ url: '/images/hero/jung-young-hoon-01.jpg', labelKo: '정영훈 교수님', labelEn: 'Professor Young Hoon Jung', focalX: 64, focalY: 34 }] })); return; }
  const target = resolve(root, '.' + (path === '/' ? '/index.html' : extname(path) ? path : path + '.html'));
  if (!target.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  try { const data = await readFile(target); res.setHeader('content-type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' })[extname(target)] || 'application/octet-stream'); res.end(data); } catch { res.writeHead(404); res.end(); }
}).listen(4317, '127.0.0.1', () => console.log('Local QA: http://127.0.0.1:4317'));

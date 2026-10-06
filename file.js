document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- navbar scroll state ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', ()=>{ navbar.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});

/* ---------- mobile menu ---------- */
const hamburger = document.getElementById('hamburger');
const mmenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', ()=>{
  const open = mmenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
  mmenu.classList.remove('open'); hamburger.classList.remove('open');
  document.body.style.overflow='';
}));

/* ---------- hero title reveal ---------- */
requestAnimationFrame(()=> document.getElementById('heroTitle').classList.add('in'));
/* ---------- hero rotating services ---------- */
(function(){
  const items = [
    {w:'Website', s:'Development'},
    {w:'Application', s:'Development'},
    {w:'Software', s:'Development'},
    {w:'Cybersecurity', s:'Services'},
    {w:'AI & Automation', s:'Services'},
    {w:'Cloud & DevOps', s:'Services'}
  ];
  const wEl = document.getElementById('rotWord');
  const sEl = document.getElementById('rotSuffix');
  if(!wEl || !sEl) return;
  const wSlot = wEl.parentElement, sSlot = sEl.parentElement;
  let i = 0;
  function swap(slot, el, text){
    slot.classList.add('out');
    setTimeout(()=>{
      el.textContent = text;
      slot.classList.remove('out');
      slot.classList.add('pre');
      void slot.offsetWidth;
      slot.classList.remove('pre');
    }, 550);
  }
  setInterval(()=>{
    const prev = items[i];
    i = (i + 1) % items.length;
    const next = items[i];
    swap(wSlot, wEl, next.w);
    if(next.s !== prev.s) swap(sSlot, sEl, next.s);
  }, 2400);
})();

/* ---------- scroll reveal (reversible: replays both scroll directions) ---------- */
const revealEls = document.querySelectorAll('.reveal, .process-item');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ e.target.classList.toggle('in', e.isIntersecting); });
},{threshold:0.15, rootMargin:'0px 0px -8% 0px'});
revealEls.forEach(el=>io.observe(el));

/* ---------- tech carousel: auto right-to-left, infinite loop ---------- */
(function(){
  const track = document.getElementById('techTrack');
  const dotsWrap = document.getElementById('techDots');
  if(!track) return;
  const realSlides = Array.from(track.children);
  const count = realSlides.length;

  // clone first slide to end for seamless loop
  const clone = realSlides[0].cloneNode(true);
  track.appendChild(clone);

  // build dots
  realSlides.forEach((_, i)=>{
    const d = document.createElement('span');
    d.className = 'tech-dot' + (i===0 ? ' active' : '');
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);

  let index = 0;
  const reduceMotionTech = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setDots(i){
    dots.forEach((d,di)=> d.classList.toggle('active', di === i));
  }
  function goTo(i, animate){
    track.style.transition = animate ? 'transform .85s cubic-bezier(0.65,0,0.35,1)' : 'none';
    track.style.transform = 'translateX(-' + (i*100) + '%)';
  }
  goTo(0, false);

  track.addEventListener('transitionend', ()=>{
    if(index === count){
      index = 0;
      goTo(0, false);
      void track.offsetWidth; // force reflow before re-enabling transition
    }
  });

  if(!reduceMotionTech){
    setInterval(()=>{
      index++;
      goTo(index, true);
      setDots(index % count);
    }, 3600);
  }
})();

/* ---------- start-a-project modal ---------- */
(function(){
  const overlay = document.getElementById('projectModal');
  const openBtns = document.querySelectorAll('.start-project-trigger');
  const closeBtn = document.getElementById('modalClose');
  const form = document.getElementById('projectForm');
  if(!overlay || !openBtns.length || !form) return;

  function openModal(){
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  openBtns.forEach(btn=> btn.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); }));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  // This must be a server you control — never call the Notion API directly from the browser.
  const NOTION_PROXY_URL = 'https://brutiit-notion-proxy.pages.dev/';
  const submitBtn = document.getElementById('formSubmitBtn');
  const statusEl = document.getElementById('formStatus');

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.textContent = '';
    statusEl.className = 'modal-status';

    try{
      const res = await fetch(NOTION_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      if(!res.ok) throw new Error('Request failed');

      statusEl.textContent = "Thanks — we've received your request and will be in touch shortly.";
      statusEl.classList.add('ok');
      form.reset();
      setTimeout(closeModal, 1800);
    }catch(err){
      console.error('Notion proxy submission failed:', err);
      statusEl.textContent = "Something went wrong sending your request. Please try again in a moment.";
      statusEl.classList.add('err');
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Inquiry →';
    }
  });
})();

/* ---------- service detail pages (in-page, full-screen slide) ---------- */
function initServicePage(pageId, openBtnId, closeBtnId, backLogoId){
  const page = document.getElementById(pageId);
  const openBtn = document.getElementById(openBtnId);
  const closeBtn = document.getElementById(closeBtnId);
  const backLogo = document.getElementById(backLogoId);
  if(!page || !openBtn || !closeBtn) return;

  function openPage(){
    page.classList.add('open');
    page.setAttribute('aria-hidden','false');
    page.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closePage(){
    page.classList.remove('open');
    page.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  openBtn.addEventListener('click', (e)=>{ e.preventDefault(); openPage(); });
  closeBtn.addEventListener('click', closePage);
  if(backLogo) backLogo.addEventListener('click', (e)=>{ e.preventDefault(); closePage(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && page.classList.contains('open')) closePage(); });
}
initServicePage('webDevModal', 'webDevDetailBtn', 'webDevModalClose', 'webDevBackLogo');
initServicePage('appDevModal', 'appDevDetailBtn', 'appDevModalClose', 'appDevBackLogo');
initServicePage('swDevModal', 'swDevDetailBtn', 'swDevModalClose', 'swDevBackLogo');
initServicePage('cyberModal', 'cyberDetailBtn', 'cyberModalClose', 'cyberBackLogo');
initServicePage('aiModal', 'aiDetailBtn', 'aiModalClose', 'aiBackLogo');
initServicePage('cloudModal', 'cloudDetailBtn', 'cloudModalClose', 'cloudBackLogo');
initServicePage('websiteSecurityModal', 'websiteSecurityBtn', 'websiteSecurityModalClose', 'websiteSecurityBackLogo');
initServicePage('choichoModal', 'choichoDetailBtn', 'choichoModalClose', 'choichoBackLogo');
initServicePage('cyberLabsModal', 'cyberLabsDetailBtn', 'cyberLabsModalClose', 'cyberLabsBackLogo');
initServicePage('commerceModal', 'commerceDetailBtn', 'commerceModalClose', 'commerceBackLogo');

/* ---------- security terminal: live threat log simulation ---------- */
(function(){
  const body = document.getElementById('secTerminalBody');
  if(!body) return;
  const logs = [
    {t:'Incoming request from 185.23.11.4 — SQL injection pattern detected', blocked:true},
    {t:'Firewall rule triggered — request blocked', blocked:true},
    {t:'Port scan detected on 203.0.113.9', blocked:false},
    {t:'Scan blocked automatically', blocked:true},
    {t:'Login attempt failed x5 from 91.198.4.12', blocked:false},
    {t:'IP temporarily banned', blocked:true},
    {t:'Malware signature match in uploaded file', blocked:false},
    {t:'File quarantined', blocked:true},
    {t:'Unauthorized access attempt to /admin', blocked:false},
    {t:'Access denied — session terminated', blocked:true},
    {t:'Unusual traffic spike detected', blocked:false},
    {t:'Rate limiting engaged', blocked:true},
    {t:'SSL handshake anomaly on connection #4471', blocked:false},
    {t:'Connection dropped', blocked:true}
  ];
  const reduceMotionSec = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_LINES = 6;
  let i = 0;

  function timestamp(){
    const d = new Date();
    return '[' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0') + ']';
  }
  function addLine(){
    const entry = logs[i % logs.length];
    i++;
    const line = document.createElement('div');
    line.className = 'tl' + (entry.blocked ? ' blocked' : '');
    line.textContent = timestamp() + ' ' + entry.t;
    body.appendChild(line);
    while(body.children.length > MAX_LINES){ body.removeChild(body.firstChild); }
    body.scrollTop = body.scrollHeight;
  }
  const cursor = document.createElement('span');
  cursor.className = 'term-cursor';

  let started = false;
  new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !started){
        started = true;
        if(reduceMotionSec){ for(let k=0;k<4;k++) addLine(); return; }
        addLine();
        setInterval(addLine, 1500);
      }
    });
  },{threshold:0.25}).observe(body);
})();

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i=> i.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

/* ---------- work tabs: New Work / All Work sliding indicator ---------- */
(function(){
  const tabsWrap = document.getElementById('workTabs');
  if(!tabsWrap) return;
  const tabs = Array.from(tabsWrap.querySelectorAll('.work-tab'));
  const indicator = tabsWrap.querySelector('.work-tab-indicator');
  const panels = document.querySelectorAll('.work-tab-panel');

  function moveIndicator(btn){
    if(!btn) return;
    indicator.style.width = btn.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
  }
  function activate(tabName){
    tabs.forEach(t=> t.classList.toggle('active', t.dataset.tab === tabName));
    panels.forEach(p=>{
      if(p.dataset.panel === tabName){
        p.hidden = false;
        p.querySelectorAll('.work-card').forEach((card,i)=>{
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = 'workCardIn .6s cubic-bezier(0.16,0.84,0.44,1) ' + (i*0.08) + 's both';
        });
      } else {
        p.hidden = true;
      }
    });
  }
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      moveIndicator(btn);
      activate(btn.dataset.tab);
    });
  });
  requestAnimationFrame(()=> moveIndicator(tabsWrap.querySelector('.work-tab.active')));
  window.addEventListener('resize', ()=> moveIndicator(tabsWrap.querySelector('.work-tab.active')));
})();

/* ---------- work cards: expand/collapse toggle ---------- */
document.querySelectorAll('.work-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.closest('.work-card').classList.toggle('expanded');
  });
});

/* ---------- stat counters ---------- */
const counters = document.querySelectorAll('[data-count]');
const cio = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target; const target = parseInt(el.dataset.count,10); const suffix = el.dataset.suffix||'';
    let start=0; const dur=1200; const t0=performance.now();
    function step(t){ const p=Math.min((t-t0)/dur,1); const val=Math.floor(p*target); el.textContent = val+suffix; if(p<1) requestAnimationFrame(step); else el.textContent=target+suffix; }
    requestAnimationFrame(step);
    cio.unobserve(el);
  });
},{threshold:0.5});
counters.forEach(el=>cio.observe(el));

const reduceMotionPref = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- hero parallax on scroll ---------- */
const heroVisualEl = document.querySelector('.hero-visual');
const heroTextEl = document.querySelector('.hero-text');
const heroSectionEl = document.getElementById('hero');
function updateHeroParallax(){
  if(reduceMotionPref) return;
  const rect = heroSectionEl.getBoundingClientRect();
  const progress = Math.min(Math.max(-rect.top / (rect.height*0.9), 0), 1);
  heroVisualEl.style.transform = `translateY(${progress*40}px) scale(${1-progress*0.06})`;
  heroTextEl.style.transform = `translateY(${progress*70}px)`;
  heroTextEl.style.opacity = String(1 - progress*1.1);
}

/* ---------- nav links collapse as their section scrolls past ---------- */
const navLinkEls = Array.from(document.querySelectorAll('.nav-links a'));
const navLinksBox = document.querySelector('.nav-links');
function updateNavLinksWidth(){
  if(!navLinksBox || window.innerWidth < 900) return;
  const visible = navLinkEls.filter(a=>!a.classList.contains('nav-item-hidden'));
  let total = 60; // horizontal padding (30 + 30)
  visible.forEach((a,i)=>{
    total += a.scrollWidth;
    if(i < visible.length-1) total += 34; // margin-right between visible items
  });
  navLinksBox.style.width = Math.max(total, 60) + 'px';
}
function updateNavLinkCollapse(){
  const navH = navbar.offsetHeight + 20;
  navLinkEls.forEach(a=>{
    const sec = document.getElementById(a.getAttribute('href').slice(1));
    if(!sec) return;
    const rect = sec.getBoundingClientRect();
    const passed = rect.bottom < navH;
    a.classList.toggle('nav-item-hidden', passed);
  });
  updateNavLinksWidth();
}
window.addEventListener('resize', updateNavLinksWidth);

/* ---------- mobile: current-section label in header ---------- */
const mobileLabelEl = document.getElementById('mobileSectionLabel');
const mobileLabelSections = [
  {id:'services', label:'Services'},
  {id:'why', label:'Solutions'},
  {id:'work', label:'Work'},
  {id:'security', label:'Security'},
  {id:'about', label:'About'},
  {id:'footer-contact', label:'Contact'}
];
let mobileLabelCurrent = '';
let mobileLabelSwapTimer = null;
function updateMobileSectionLabel(){
  if(!mobileLabelEl || window.innerWidth >= 900) return;
  const threshold = navbar.offsetHeight + 12;
  let active = '';
  mobileLabelSections.forEach(s=>{
    const el = document.getElementById(s.id);
    if(!el) return;
    if(el.getBoundingClientRect().top <= threshold) active = s.label;
  });
  if(active === mobileLabelCurrent) return;
  mobileLabelCurrent = active;
  mobileLabelEl.classList.remove('show');
  clearTimeout(mobileLabelSwapTimer);
  mobileLabelSwapTimer = setTimeout(()=>{
    mobileLabelEl.textContent = active;
    if(active) mobileLabelEl.classList.add('show');
  }, 320);
}

let scrollTicking = false;
window.addEventListener('scroll', ()=>{
  if(!scrollTicking){
    requestAnimationFrame(()=>{ updateHeroParallax(); updateNavLinkCollapse(); updateMobileSectionLabel(); scrollTicking=false; });
    scrollTicking = true;
  }
}, {passive:true});
updateHeroParallax(); updateNavLinkCollapse(); updateMobileSectionLabel();
requestAnimationFrame(updateNavLinksWidth);

/* ================= THREE.JS SCENES ================= */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

function buildNodeSphere(count, radius){
  const group = new THREE.Group();
  const pts = [];
  const geo = new THREE.SphereGeometry(1,1,1); // dummy, replaced below
  const positions = [];
  for(let i=0;i<count;i++){
    const phi = Math.acos(-1 + (2*i)/count);
    const theta = Math.sqrt(count*Math.PI) * phi;
    const x = radius*Math.cos(theta)*Math.sin(phi);
    const y = radius*Math.sin(theta)*Math.sin(phi);
    const z = radius*Math.cos(phi);
    positions.push(x,y,z);
    pts.push(new THREE.Vector3(x,y,z));
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
  const pMat = new THREE.PointsMaterial({ color:0x8fb8ff, size: radius*0.045, transparent:true, opacity:0.9 });
  group.add(new THREE.Points(pGeo, pMat));

  // sparse connecting lines
  const lineGeo = new THREE.BufferGeometry();
  const lineVerts = [];
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      if(pts[i].distanceTo(pts[j]) < radius*0.62 && Math.random()>0.86){
        lineVerts.push(pts[i].x,pts[i].y,pts[i].z, pts[j].x,pts[j].y,pts[j].z);
      }
    }
  }
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts,3));
  const lineMat = new THREE.LineBasicMaterial({ color:0x5f7ba8, transparent:true, opacity:0.35 });
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius*0.94, 1),
    new THREE.MeshBasicMaterial({ color:0xe7e9ed, wireframe:true, transparent:true, opacity:0.12 })
  );
  group.add(wire);
  group.userData.wire = wire;
  return group;
}

/* ---- SERVICES NODE VISUAL ---- */
/* ---- SERVICES VISUAL: DIGITAL SHIELD + DATA FLOW ---- */
/* ---- SERVICES VISUAL: PLAYABLE VIDEO ---- */
(function initServicesVideo(){
  const video = document.getElementById('servicesVideo');
  if(!video) return;
  video.play().catch(()=>{});
  const dots = Array.from(document.querySelectorAll('#vcardDots i'));
  if(dots.length){
    video.addEventListener('timeupdate', ()=>{
      if(!video.duration) return;
      const idx = Math.min(dots.length-1, Math.floor(video.currentTime / video.duration * dots.length));
      dots.forEach((d,i)=> d.classList.toggle('on', i === idx));
    });
  }
})();

/* ---- CTA BACKDROP ---- */
(function initCTA(){
  const canvas = document.getElementById('cta-canvas');
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.z = 6;
  const sphere = buildNodeSphere(isMobile?50:110, 2.6);
  scene.add(sphere);

  function resize(){
    const el = canvas.parentElement;
    renderer.setSize(el.clientWidth, el.clientHeight);
    camera.aspect = el.clientWidth/el.clientHeight; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let raf, visible=false;
  function animate(){
    raf = requestAnimationFrame(animate);
    sphere.rotation.y += reduceMotion?0:0.0018;
    renderer.render(scene,camera);
  }
  new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !visible){ visible=true; animate(); }
      else if(!e.isIntersecting && visible){ visible=false; cancelAnimationFrame(raf); }
    });
  },{threshold:0.1}).observe(canvas);
})();

/* ---------- chat icon: living particle cloud ---------- */
(function(){
  const cv = document.getElementById('cbBlobCanvas');
  const launcher = document.getElementById('cbLauncher');
  if(!cv || !launcher) return;
  const ctx = cv.getContext('2d');
  const S = 58, R = 27, dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = cv.height = S * dpr;
  ctx.scale(dpr, dpr);

  // random particles inside a unit ball
  const N = 650, P = [];
  while(P.length < N){
    const x = Math.random()*2-1, y = Math.random()*2-1, z = Math.random()*2-1;
    if(x*x + y*y + z*z <= 1) P.push({x, y, z, a: Math.random()*6.283, b: Math.random()*6.283});
  }
  const sm = (a, b, v) => { const k = Math.min(1, Math.max(0, (v-a)/(b-a))); return k*k*(3-2*k); };

  function draw(ms){
    const t = ms/1000;
    ctx.clearRect(0,0,S,S);

    // crisp, perfectly round dark disc
    ctx.fillStyle = '#0E0F11';
    ctx.beginPath(); ctx.arc(S/2, S/2, S/2 - 0.5, 0, 6.2832); ctx.fill();

    // central void breathes open and closed
    const v = 0.2 + 0.13*Math.sin(t*0.8) + 0.05*Math.sin(t*1.7 + 1);
    const ringAmp = 0.35 + 0.65*sm(0.04, 0.3, v);
    const ca = Math.cos(t*0.18), sa = Math.sin(t*0.18), cx = Math.cos(t*0.11), sx = Math.sin(t*0.11);

    for(let i=0;i<N;i++){
      const p = P[i];
      // each particle drifts a little so the cloud shimmers
      const X = p.x + 0.03*Math.sin(t*0.9 + p.a);
      const Y = p.y + 0.03*Math.sin(t*0.8 + p.b);
      const Z = p.z + 0.03*Math.sin(t*1.1 + p.a + p.b);
      const x1 = X*ca + Z*sa, z1 = -X*sa + Z*ca;
      const nx = x1, ny = Y*cx - z1*sx;
      const r = Math.hypot(nx, ny);
      if(r > 1) continue;

      // bright wavy ring around the void
      const th = Math.atan2(ny, nx);
      const wob = 0.09*Math.sin(3*th + t*0.9) + 0.06*Math.sin(5*th - t*1.3) + 0.04*Math.sin(2*th + t*0.6);
      const g1 = r - (v + 0.24 + wob);
      const ring = Math.exp(-(g1*g1)/0.0035) * ringAmp;
      // thin drifting filaments
      const sv = Math.sin(nx*5.1 + Math.sin(ny*3.3 + t*0.8)*2 + t*0.5) * Math.sin(ny*4.7 + Math.sin(nx*2.9 - t*0.7)*2);
      const streak = Math.exp(-(sv*sv)/0.012) * 0.55;

      const voidA = sm(v*0.6, v + 0.1, r);
      const edge = 1 - sm(0.78, 1, r);
      const a = (0.22 + ring*0.75 + streak*0.45) * voidA * edge;
      if(a < 0.02) continue;

      ctx.fillStyle = 'rgba(235,240,250,' + a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(S/2 + nx*R, S/2 + ny*R, 0.42 + 0.36*Math.min(1, ring + streak), 0, 6.2832);
      ctx.fill();
    }
  }

  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ draw(1500); return; }
  function loop(ms){
    if(launcher.classList.contains('show')) draw(ms);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------- AI chatbot ---------- */
(function(){
  const CHAT_PROXY_URL = 'https://brutiit-chat-proxy.adilkp579.workers.dev';
  const WHATSAPP_URL = 'https://wa.me/919207271076?text=' + encodeURIComponent('Hi BRUTIIT, I would like to discuss a project.');
  const MEMORY_KEY = 'brutiit_chat_v2';
  const CLIENT_KEY = 'brutiit_client_id_v2';
  const launcher = document.getElementById('cbLauncher');
  const panel = document.getElementById('cbPanel');
  const body = document.getElementById('cbBody');
  const form = document.getElementById('cbForm');
  const input = document.getElementById('cbInput');
  const quick = document.getElementById('cbQuick');
  const history = [];
  let greeted = false, userInteracted = false, busy = false;

  function getClientId(){
    try{
      let id = localStorage.getItem(CLIENT_KEY);
      if(!id){ id = crypto.randomUUID ? crypto.randomUUID() : ('c_' + Date.now() + '_' + Math.random().toString(36).slice(2)); localStorage.setItem(CLIENT_KEY,id); }
      return id;
    }catch(e){ return 'guest_' + Math.random().toString(36).slice(2); }
  }
  const clientId = getClientId();

  function saveLocal(){
    try{
      localStorage.setItem(MEMORY_KEY, JSON.stringify({
        version:2,
        updatedAt:Date.now(),
        messages:history.slice(-20)
      }));
    }catch(e){}
  }
  function loadLocal(){
    try{
      const saved = JSON.parse(localStorage.getItem(MEMORY_KEY) || 'null');
      if(!saved || !Array.isArray(saved.messages)) return;
      saved.messages.slice(-12).forEach(m=>{
        if(m && (m.role==='user'||m.role==='assistant') && typeof m.content==='string' && m.content.trim()){
          history.push({role:m.role,content:m.content.slice(0,1000)});
        }
      });
    }catch(e){}
  }

  function add(text, who){
    const m = document.createElement('div');
    m.className = 'cb-msg ' + who;
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function openProject(){
    const trigger = document.querySelector('.start-project-trigger');
    if(trigger) trigger.click();
  }
  function openChat(){
    panel.classList.add('open'); panel.setAttribute('aria-hidden','false');
    launcher.classList.remove('show');
    if(!greeted){
      greeted = true;
      if(history.length){
        add("Welcome back 👋 I remember this conversation on this device. What would you like to continue with?", 'bot');
      }else{
        add("Hi! 👋 I’m the BRUTIIT assistant. Tell me what you’re planning to build, and I’ll help you figure out the right solution.", 'bot');
      }
    }
    if(matchMedia('(hover:hover) and (pointer:fine)').matches) setTimeout(()=> input.focus({preventScroll:true}), 650);
  }
  function closeChat(){
    panel.classList.remove('open'); panel.setAttribute('aria-hidden','true');
    launcher.classList.add('show');
    const b = launcher.querySelector('.cb-badge'); if(b) b.style.display = 'none';
  }

  function fallback(q){
    q = q.toLowerCase();
    if(/price|cost|pricing|rate|quote/.test(q)) return "Pricing depends on the scope and features. If you tell me what you want to build, I can explain what affects the cost and you can request a quote from the BRUTIIT team.";
    if(/web|website|web app/.test(q)) return "BRUTIIT builds modern, fast and secure websites and web apps, including business websites, e-commerce platforms and custom portals. If you tell me what the website should do, I can suggest a suitable approach.";
    if(/app|android|ios|mobile/.test(q)) return "We develop Android and iOS applications with modern interfaces, secure backends and production-ready architecture. Tell me the app idea and its main features, and I’ll help you scope it.";
    if(/secur|pentest|vulnerab|owasp/.test(q)) return "BRUTIIT provides vulnerability assessments, penetration testing and OWASP-aligned security reviews. If you describe the system you want assessed, I can explain the usual engagement process.";
    if(/ai|bot|automat/.test(q)) return "We build AI chatbots, AI applications and workflow automation for businesses. Tell me which repetitive task or customer workflow you want to improve, and we can explore a solution.";
    if(/cloud|devops|deploy|aws|ci\/cd/.test(q)) return "BRUTIIT handles cloud deployment, CI/CD, monitoring and scaling. Tell me what you are running today and what you want to deploy, and I can outline the next step.";
    if(/start|project|contact|talk|whatsapp|call/.test(q)) return "Absolutely. You can open the Start a Project form here, or message the BRUTIIT team directly on WhatsApp at +91 92072 71076.";
    if(/service/.test(q)) return "BRUTIIT provides Web Development, App Development, Software Development, Cybersecurity, AI & Automation, and Cloud & DevOps. Which one are you interested in?";
    return "I’m the BRUTIIT website assistant, so I can help with BRUTIIT services, project planning, timelines, pricing approach, security, AI, cloud and how to contact the team.";
  }

  async function reply(){
    if(busy) return;
    busy = true;
    const typing = add('', 'bot'); typing.classList.add('cb-typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    let text;
    try{
      const res = await fetch(CHAT_PROXY_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({clientId, messages:history.slice(-12)})
      });
      if(!res.ok) throw new Error('bad');
      const data = await res.json();
      text = data.reply;
      if(!text) throw new Error('empty');
    }catch(e){
      await new Promise(r=>setTimeout(r,350));
      text = fallback(history[history.length-1]?.content || '');
    }
    typing.remove();
    add(text, 'bot');
    history.push({role:'assistant', content:text});
    saveLocal();
    busy = false;
  }

  function send(text){
    text = text.trim(); if(!text || busy) return;
    userInteracted = true;
    quick.style.display = 'none';
    add(text, 'user');
    history.push({role:'user', content:text});
    saveLocal();
    input.value = '';
    reply();
  }

  loadLocal();
  form.addEventListener('submit', e=>{ e.preventDefault(); send(input.value); });
  quick.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const action = b.dataset.chatAction;
      if(action === 'project'){ openProject(); return; }
      if(action === 'whatsapp'){ window.open(WHATSAPP_URL, '_blank', 'noopener'); return; }
      send(b.textContent);
    });
  });
  launcher.addEventListener('click', ()=>{ userInteracted = true; openChat(); });
  document.getElementById('cbClose').addEventListener('click', closeChat);

  // Show the launcher after the existing intro animation; keep the original page design unchanged.
  setTimeout(()=>{
    if(userInteracted || document.querySelector('.modal-overlay.open')) launcher.classList.add('show');
    else openChat();
  }, 6000);
})();

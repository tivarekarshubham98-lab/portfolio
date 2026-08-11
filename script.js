const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

window.addEventListener("load", () => {
  const loader = $(".loader"), line = $(".loader-line span"), percent = $(".loader-percent");
  let n = 0;
  const timer = setInterval(() => {
    n += Math.floor(Math.random()*9)+4;
    if(n >= 100){ n=100; clearInterval(timer); setTimeout(()=>{loader.style.transition="opacity .7s ease"; loader.style.opacity="0"; setTimeout(()=>loader.remove(),700)},250); }
    line.style.width=n+"%"; percent.textContent=String(n).padStart(2,"0")+"%";
  }, 45);
});

const header = $(".site-header");
window.addEventListener("scroll",()=>header.classList.toggle("scrolled",scrollY>40));

const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add("visible"); observer.unobserve(e.target)}});
},{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

const menuBtn=$(".menu-toggle"), mobileMenu=$(".mobile-menu");
menuBtn?.addEventListener("click",()=>mobileMenu.classList.toggle("open"));
$$(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>mobileMenu.classList.remove("open")));

const cursor=$(".cursor"), dot=$(".cursor-dot");
let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
window.addEventListener("mousemove",e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+"px"; dot.style.top=my+"px";
});
(function cursorLoop(){
  cx+=(mx-cx)*.14; cy+=(my-cy)*.14;
  cursor.style.left=cx+"px"; cursor.style.top=cy+"px";
  requestAnimationFrame(cursorLoop);
})();
$$("[data-cursor]").forEach(el=>{
  el.addEventListener("mouseenter",()=>document.body.classList.add("cursor-"+el.dataset.cursor));
  el.addEventListener("mouseleave",()=>document.body.classList.remove("cursor-"+el.dataset.cursor));
});

$$(".magnetic").forEach(el=>{
  el.addEventListener("mousemove",e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.18, y=(e.clientY-r.top-r.height/2)*.18;
    el.style.transform=`translate(${x}px,${y}px)`;
  });
  el.addEventListener("mouseleave",()=>el.style.transform="");
});

const heroTitle=$(".hero-title");
window.addEventListener("mousemove",e=>{
  if(!heroTitle || innerWidth<900) return;
  const x=(e.clientX/innerWidth-.5)*10, y=(e.clientY/innerHeight-.5)*7;
  heroTitle.style.transform=`translate(${x}px,${y}px)`;
});

const sections=$$("section[id]");
const navLinks=$$(".desktop-nav a");
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(a=>a.style.color=a.getAttribute("href")==="#"+entry.target.id?"#a9ff68":"");
    }
  });
},{rootMargin:"-35% 0px -55% 0px"});
sections.forEach(s=>sectionObserver.observe(s));

$$(".skill").forEach(skill=>{
  skill.addEventListener("mouseenter",()=>{
    $$(".skill").forEach(x=>x.style.opacity=x===skill?"1":".45");
  });
  skill.addEventListener("mouseleave",()=>$$(".skill").forEach(x=>x.style.opacity=""));
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape") mobileMenu?.classList.remove("open");
});

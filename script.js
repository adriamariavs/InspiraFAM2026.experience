/* =========================================================
   INSPIRA FAM EXPERIENCE 2026 — SCRIPT NOVO
========================================================= */
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

/* MENU MOBILE */
const menuToggle=$(".menu-toggle");
menuToggle?.addEventListener("click",()=>{
  const open=document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded",String(open));
});
$$(".nav-links a").forEach(a=>a.addEventListener("click",()=>document.body.classList.remove("menu-open")));

/* REVEAL — funciona em desktop e mobile */
const reveals=$$(".reveal");
if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
    });
  },{threshold:.08,rootMargin:"0px 0px -30px"});
  reveals.forEach(el=>observer.observe(el));
}else reveals.forEach(el=>el.classList.add("visible"));

/* PROGRAMAÇÃO */
$$(".schedule-tab").forEach(tab=>tab.addEventListener("click",()=>{
  $$(".schedule-tab").forEach(x=>x.classList.toggle("active",x===tab));
  $$(".schedule-panel").forEach(panel=>panel.classList.toggle("active",panel.dataset.schedulePanel===tab.dataset.schedule));
}));

/* EXPERIÊNCIAS */
const experienceModal=$("#experience-modal");
$$("[data-experience]").forEach(card=>{
  const activate=()=>card.classList.add("touch-active");
  const deactivate=()=>setTimeout(()=>card.classList.remove("touch-active"),160);
  card.addEventListener("touchstart",activate,{passive:true});
  card.addEventListener("touchend",deactivate,{passive:true});
  card.addEventListener("click",()=>{
    const [title,text]=(card.dataset.experience||"|").split("|");
    if(!experienceModal)return;
    $("#modal-title").textContent=title;
    $("#modal-text").textContent=text;
    experienceModal.showModal();
  });
});
$(".modal-close")?.addEventListener("click",()=>experienceModal?.close());
experienceModal?.addEventListener("click",e=>{if(e.target===experienceModal)experienceModal.close()});

/* INSCRIÇÕES: visitantes usam o link da Sympla no HTML. */
/* Gallery: touch, keyboard and accessible enlargement */
const track=$('.gallery-track'), cards=$$('[data-gallery]'), galleryDialog=$('#gallery-modal');
let galleryIndex=0;
function moveGallery(direction){track?.scrollBy({left:direction*(track.querySelector('.memory-card')?.offsetWidth+24||300),behavior:'smooth'})}
$('.gallery-prev')?.addEventListener('click',()=>moveGallery(-1));
$('.gallery-next')?.addEventListener('click',()=>moveGallery(1));
track?.addEventListener('keydown',e=>{if(e.target===track&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveGallery(e.key==='ArrowLeft'?-1:1)}});
function showGallery(index){galleryIndex=(index+cards.length)%cards.length;const copy=cards[galleryIndex].cloneNode(true);copy.removeAttribute('data-gallery');copy.removeAttribute('aria-label');copy.setAttribute('tabindex','-1');$('#gallery-detail').replaceChildren(copy)}
cards.forEach((card,i)=>card.addEventListener('click',()=>{showGallery(i);galleryDialog.showModal()}));
$('.gallery-close')?.addEventListener('click',()=>galleryDialog.close());
$('.detail-prev')?.addEventListener('click',()=>showGallery(galleryIndex-1));
$('.detail-next')?.addEventListener('click',()=>showGallery(galleryIndex+1));
galleryDialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')showGallery(galleryIndex-1);if(e.key==='ArrowRight')showGallery(galleryIndex+1)});
galleryDialog?.addEventListener('click',e=>{if(e.target===galleryDialog)galleryDialog.close()});
function closeMenu(){document.body.classList.remove('menu-open');menuToggle?.setAttribute('aria-expanded','false');menuToggle?.setAttribute('aria-label','Abrir menu')}
$$('.nav-links a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
menuToggle?.addEventListener('click',()=>menuToggle.setAttribute('aria-label',document.body.classList.contains('menu-open')?'Fechar menu':'Abrir menu'));
window.matchMedia('(min-width:760px)').addEventListener('change',e=>{if(e.matches)closeMenu()});


/* =========================================================
   RETORNO / NAVEGAÇÃO
   O alvo #top fica no body, não no cabeçalho fixo.
   O link continua funcionando mesmo sem JavaScript.
========================================================= */
$$('[data-back-top], .brand-link[href="#top"]').forEach(link=>{
  link.addEventListener('click',event=>{
    event.preventDefault();
    closeMenu();
    window.scrollTo({top:0,left:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    history.replaceState(null,'',location.pathname+location.search+'#top');
  });
});
$$('[data-back-event]').forEach(link=>{
  // Resolução relativa: funciona tanto na pasta local quanto no site publicado.
  link.href=new URL('./index.html',document.baseURI).href;
});

/* FOTOS DA SEÇÃO SOBRE — deslizar, navegar e ampliar */
const aboutTrack=$('.about-photo-track'), aboutPhotos=$$('[data-about-photo]'), aboutLightbox=$('#about-lightbox');
let aboutPhotoIndex=0;
function scrollAbout(direction){aboutTrack?.scrollBy({left:direction*(aboutTrack.clientWidth+12),behavior:'smooth'})}
$('[data-about-prev]')?.addEventListener('click',()=>scrollAbout(-1));
$('[data-about-next]')?.addEventListener('click',()=>scrollAbout(1));
aboutTrack?.addEventListener('keydown',e=>{if(e.target===aboutTrack&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();scrollAbout(e.key==='ArrowLeft'?-1:1)}});
function displayAboutPhoto(index){
 aboutPhotoIndex=(index+aboutPhotos.length)%aboutPhotos.length;
 const source=$('img',aboutPhotos[aboutPhotoIndex]);
 $('#about-full-photo').src=source.getAttribute('src');
 $('#about-full-photo').alt=source.alt;
 $('#about-photo-count').textContent=`${aboutPhotoIndex+1} / ${aboutPhotos.length}`;
}
aboutPhotos.forEach((photo,index)=>photo.addEventListener('click',()=>{displayAboutPhoto(index);aboutLightbox.showModal()}));
$('.about-photo-close')?.addEventListener('click',()=>aboutLightbox.close());
$('[data-full-prev]')?.addEventListener('click',()=>displayAboutPhoto(aboutPhotoIndex-1));
$('[data-full-next]')?.addEventListener('click',()=>displayAboutPhoto(aboutPhotoIndex+1));
aboutLightbox?.addEventListener('click',e=>{if(e.target===aboutLightbox)aboutLightbox.close()});
aboutLightbox?.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();displayAboutPhoto(aboutPhotoIndex+(e.key==='ArrowLeft'?-1:1))}});


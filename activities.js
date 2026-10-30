(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statuses={abertas:'INSCRIÇÕES ABERTAS',esgotadas:'VAGAS ESGOTADAS',encerradas:'INSCRIÇÕES ENCERRADAS',em_breve:'INSCRIÇÕES EM BREVE'};
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch{return ''}};
const validSympla=value=>{const u=safeUrl(value);try{return new URL(u).hostname.endsWith('.sympla.com.br')||new URL(u).hostname==='sympla.com.br'}catch{return false}};
const text=(obj,k,fallback='A confirmar')=>String(obj?.[k]||fallback);
// Sequência fixa: todos os cinco mascotes aparecem antes de qualquer repetição.
// A ordem acompanha a lista dos sete workshops em activities.json.
const stickers=['mascote-estrela.png','mascote-triangulo.png','mascote-quadrado.png','mascote-explosao.png','mascote-arco.png'];
const workshopOrder=['formas','design','lettering','3d-ia','croche','shadowbox','escrita'];
const stickerFor=item=>stickers[Math.max(0,workshopOrder.indexOf(item.id))%stickers.length];
const image=item=>item.tipo==='palestras'
  ? '<img class="activity-speakers-photo" src="ativos/brand/palestras/palestrantes-experience.png" alt="Arte com os quatro convidados das palestras Experience" loading="lazy">'
  : `<img class="activity-sticker" src="ativos/brand/${stickerFor(item)}" alt="" loading="lazy">`;
let data=[];
const card=(item,i)=>`<article class="activity-card reveal visible"><div class="activity-card-art">${image(item)}</div><div class="activity-card-content"><span class="activity-card-kicker">${item.tipo==='palestras'?'PALESTRAS • 11 NOV':`WORKSHOP ${String(i).padStart(2,'0')} • 12 NOV`}</span><h3>${esc(item.titulo)}</h3><p>${esc(item.responsaveis)}</p><span class="activity-card-date">${esc(item.horario||'Horário a confirmar')} • ${esc(item.local||'Local a confirmar')}</span><span class="activity-exclusive">EXCLUSIVO ALUNOS FAM</span><button class="button button-pink" type="button" data-open-activity="${esc(item.id)}">SAIBA MAIS ↗</button></div></article>`;
function render(items){data=items;const lecture=$('#lecture-grid'),work=$('#workshop-grid');if(!lecture||!work)return;lecture.innerHTML=items.filter(x=>x.tipo==='palestras').map((x,i)=>card(x,i+1)).join('')||'<p>Informações em breve.</p>';work.innerHTML=items.filter(x=>x.tipo==='workshop').map((x,i)=>card(x,i+1)).join('')||'<p>Informações em breve.</p>'}
function open(item){const dialog=$('#activity-modal'),content=$('#activity-modal-content');if(!dialog||!content)return;const status=statuses[item.status]||statuses.em_breve;const enabled=item.status==='abertas'&&validSympla(item.sympla);const speakers=item.tipo==='palestras'?`<div class="speaker-list"><div><strong>Celise Rey e Mila Barros</strong><p>Criatividade e estratégia para conectar marcas e pessoas.</p></div><div><strong>Kaio Veiga</strong><p>Valor dos negócios e construção de marcas desejadas.</p></div><div><strong>Will Rizzati</strong><p>Produção de vídeos com celular e possibilidades no audiovisual.</p></div></div><p class="activity-conversation">Após as apresentações e os cases, uma roda de conversa com os convidados, mediada pela equipe organizadora, Simon e Gustavo.</p>`:'';
content.innerHTML=`<div class="activity-modal-visual">${image(item)}</div><span class="kicker">${item.tipo==='palestras'?'PALESTRAS EXPERIENCE':'WORKSHOP EXPERIENCE'}</span><h2 id="activity-modal-title">${esc(item.titulo)}</h2><p class="activity-presenter">${esc(item.responsaveis)}</p><p>${esc(item.descricao)}</p>${speakers}<div class="activity-facts"><p><strong>DATA</strong><span>${esc(text(item,'data'))}</span></p><p><strong>HORÁRIO</strong><span>${esc(text(item,'horario'))}</span></p><p><strong>LOCAL</strong><span>${esc(text(item,'local'))}</span></p><p><strong>DURAÇÃO</strong><span>${esc(text(item,'duracao'))}</span></p><p><strong>PÚBLICO</strong><span>${esc(text(item,'publico'))}</span></p>${item.vagas?`<p><strong>VAGAS PREVISTAS</strong><span>${esc(item.vagas)}</span></p>`:''}</div><p class="activity-warning">Atividade exclusiva para alunos da FAM. Faça sua inscrição pelo Sympla. ${item.tipo==='workshop'?'Todos os workshops começam às 19h30.':''}</p>${enabled?(`<a class="button button-pink" href="${esc(item.sympla)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir Sympla e selecionar ingresso ${esc(item.titulo)}">GARANTIR MINHA VAGA ↗</a><p class="activity-ticket-help"><strong>Ingresso no Sympla:</strong> ${esc(item.titulo)}. Na página do Sympla, selecione esse ingresso na lista. Exclusivo para alunos FAM.</p>`):`<div class="activity-disabled" role="status">${item.status==='abertas'?statuses.em_breve:status}</div>`}`;
dialog.showModal();}
document.addEventListener('click',e=>{const button=e.target.closest('[data-open-activity]');if(button){const item=data.find(x=>x.id===button.dataset.openActivity);if(item)open(item)}});
const dialog=$('#activity-modal');dialog?.querySelector('.activity-modal-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
async function load(){
 if(!$('#workshop-grid'))return;
 const endpoint='';
 const note=$('#activity-sync-note');
 async function getItems(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const raw=await response.json();
  const items=Array.isArray(raw)?raw:raw.atividades;
  if(!Array.isArray(items)||!items.length)throw Error('Dados vazios');
  return items.filter(x=>x&&x.id&&x.tipo);
 }
 try{
  const items=await getItems(endpoint||'activities.json');
  render(items);
  if(note)note.textContent=endpoint?'Informações atualizadas pela organização.':'Inscrições abertas no Sympla. Escolha o ingresso correspondente à atividade.';
 }catch(err){
  console.warn('Não foi possível consultar a planilha; tentando dados locais:',err);
  try{
   render(await getItems('activities.json'));
   if(note)note.textContent='Exibindo informações locais. A atualização automática da planilha está temporariamente indisponível; confira as vagas no Sympla.';
  }catch(localError){
   if(note)note.textContent='Não foi possível carregar as atividades. Tente novamente em instantes.';
   console.warn('Falha ao carregar atividades locais:',localError);
  }
 }
}
load();if($('#workshop-grid'))setInterval(load,120000);
})();

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
content.innerHTML=`<div class="activity-modal-visual">${image(item)}</div><span class="kicker">${item.tipo==='palestras'?'PALESTRAS EXPERIENCE':'WORKSHOP EXPERIENCE'}</span><h2 id="activity-modal-title">${esc(item.titulo)}</h2><p class="activity-presenter">${esc(item.responsaveis)}</p><p>${esc(item.descricao)}</p>${speakers}<div class="activity-facts"><p><strong>DATA</strong><span>${esc(text(item,'data'))}</span></p><p><strong>HORÁRIO</strong><span>${esc(text(item,'horario'))}</span></p><p><strong>LOCAL</strong><span>${esc(text(item,'local'))}</span></p><p><strong>DURAÇÃO</strong><span>${esc(text(item,'duracao'))}</span></p><p><strong>PÚBLICO</strong><span>${esc(text(item,'publico'))}</span></p>${item.vagas?`<p><strong>VAGAS PREVISTAS</strong><span>${esc(item.vagas)}</span></p>`:''}</div><p class="activity-warning">Atividade exclusiva para alunos da FAM. Utilize seu e-mail institucional @fam.edu.br. ${item.tipo==='workshop'?'Todos os workshops começam às 19h30.':''}</p>${enabled?(false?`<button class="button button-pink activity-apply" type="button" data-verify-activity="${esc(item.id)}">VALIDAR E-MAIL FAM PARA INSCREVER-SE ↗</button>`:`<a class="button button-pink" href="${esc(item.sympla)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir Sympla e selecionar ingresso ${esc(item.titulo)}">GARANTIR MINHA VAGA ↗</a><p class="activity-ticket-help"><strong>Ingresso no Sympla:</strong> ${esc(item.titulo)}. Na página do Sympla, selecione esse ingresso na lista. Exclusivo para alunos FAM.</p>`):`<div class="activity-disabled" role="status">${item.status==='abertas'?statuses.em_breve:status}</div>`}`;
dialog.showModal();}
document.addEventListener('click',e=>{const button=e.target.closest('[data-open-activity]');if(button){const item=data.find(x=>x.id===button.dataset.openActivity);if(item)open(item)}});
const dialog=$('#activity-modal');dialog?.querySelector('.activity-modal-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
/* Validação por código: o servidor envia e confere o código. Nunca validar OTP no navegador. */
const verifyDialog=$('#verification-modal');
const verifyForm=$('#verification-form');
const verifyEmail=$('#verification-email');
const verifyCode=$('#verification-code');
const verifyMessage=$('#verification-message');
const verifySubmit=$('#verification-submit');
let verifyingItem=null, verificationStage='request';
const emailValid=email=>/^[^\s@]+@fam\.edu\.br$/i.test(email.trim());
const setVerifyMessage=(message)=>{if(verifyMessage)verifyMessage.textContent=message};
function setVerificationStage(stage){verificationStage=stage;const codeWrap=$('#verification-code-wrap');if(codeWrap)codeWrap.hidden=stage!=='verify';if(verifySubmit)verifySubmit.textContent=stage==='request'?'ENVIAR CÓDIGO':'CONFIRMAR CÓDIGO';}
async function verificationRequest(payload){
  const endpoint=window.INSPIRA_VERIFICATION_ENDPOINT?.trim();
  if(!endpoint)throw Error('A verificação ainda não foi configurada pela organização.');
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
  if(!res.ok)throw Error('Não foi possível contatar o serviço de verificação.');
  const json=await res.json();if(!json.ok)throw Error(json.message||'Não foi possível validar o e-mail.');return json;
}
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-verify-activity]');if(!button)return;
 const item=data.find(x=>x.id===button.dataset.verifyActivity);if(!item||item.status!=='abertas'||!validSympla(item.sympla))return;
 verifyingItem=item;verifyForm?.reset();setVerificationStage('request');setVerifyMessage('Enviaremos um código de seis dígitos ao seu e-mail institucional.');
 $('#activity-modal')?.close();verifyDialog?.showModal();verifyEmail?.focus();
});
verifyForm?.addEventListener('submit',async e=>{
 e.preventDefault();if(!verifyingItem)return;
 const email=verifyEmail.value.trim().toLowerCase();
 if(!emailValid(email)){setVerifyMessage('Use seu e-mail institucional com final @fam.edu.br.');return}
 verifySubmit.disabled=true;setVerifyMessage('Aguarde...');
 try{
   if(verificationStage==='request'){
     await verificationRequest({action:'request',email,activityId:verifyingItem.id});
     setVerificationStage('verify');setVerifyMessage('Confira seu e-mail. O código expira em 10 minutos.');verifyCode?.focus();
   }else{
     const code=verifyCode.value.trim();if(!/^\d{6}$/.test(code))throw Error('Digite o código de seis dígitos.');
     const result=await verificationRequest({action:'verify',email,code,activityId:verifyingItem.id});
     if(result.verified){
       setVerifyMessage('E-mail confirmado! Abrindo inscrição no Sympla...');
       /* A URL pública do Sympla pode ser compartilhada. Este passo NÃO restringe o Sympla. */
       const link=document.createElement('a');link.href=verifyingItem.sympla;link.target='_blank';link.rel='noopener noreferrer';link.textContent='ABRIR INSCRIÇÃO NO SYMPLA ↗';link.className='button button-pink';
       const area=$('#verification-success');area.replaceChildren(link);area.hidden=false;link.focus();
     }
   }
 }catch(err){setVerifyMessage(err.message||'Erro na verificação. Tente novamente.')}finally{verifySubmit.disabled=false}
});
verifyDialog?.querySelector('.verification-close')?.addEventListener('click',()=>verifyDialog.close());
verifyDialog?.addEventListener('click',e=>{if(e.target===verifyDialog)verifyDialog.close()});
verifyDialog?.addEventListener('close',()=>{const area=$('#verification-success');if(area){area.hidden=true;area.replaceChildren()}setVerificationStage('request')});

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

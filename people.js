/* IdeaHub People page: search + QR, expandable rows with private notes,
   full profile view, profile-views counter on the Me page.
   Loads after profile.js and before patch.js. Overrides vPeople() and paintPeople(). */
(function(){
const svgI=p=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I={
  search:svgI('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  chev:svgI('<path d="M6 9l6 6 6-6"/>'),
  back:svgI('<path d="M15 6l-6 6 6 6"/>'),
  qr:svgI('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1"/>')
};

const st=document.createElement('style');
st.textContent=`
.psearch{display:flex;gap:12px;align-items:center}
.sbx{position:relative;flex:1}
.sbx svg{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--mu)}
.sbx input{margin:0;border-radius:99px;padding:15px 18px 15px 46px;background:var(--card);font-size:16px}
.qrb{width:54px;height:54px;border-radius:50%;border:0;background:#111;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}
.plab{font-weight:700;letter-spacing:.05em;color:var(--mu);font-size:13px;margin:22px 4px 8px}
.pcard{background:var(--card);border:1px solid var(--bd);border-radius:28px;overflow:hidden}
.prow+.prow{border-top:1px solid var(--bd)}
.phead{display:flex;align-items:center;gap:14px;padding:12px 18px;cursor:pointer}
.phead .av,.pcard .av{width:44px;height:44px;font-size:18px}
.phead .sp{min-width:0}
.phead b{font-size:17px;display:block}.phead .mu{font-size:14px}
.chev{color:var(--mu);transition:transform .2s;flex:none;display:grid}
.prow.open .chev{transform:rotate(180deg)}
.pbody{padding:0 18px 16px}
.pnote{border-radius:24px;padding:14px 18px;background:var(--bg);min-height:110px;margin-bottom:10px}
.pfoot{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.pfoot a{font-weight:700;color:var(--tx);text-decoration:none}
.lnk{border:0;background:none;color:var(--mu);font:inherit;cursor:pointer;padding:4px}
.pbig{width:196px;margin:8px auto 0}
.pbig .av{width:196px;height:196px;font-size:78px}
.ps{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bd);background:var(--card);color:var(--tx);border-radius:99px;padding:9px 16px;font-weight:600;text-decoration:none;font-size:15px}
.psr{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:14px 0}
.pbio2{max-width:520px;margin:16px auto 0;font-size:17px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word}
.wk{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--bd);border-radius:24px;padding:14px;margin-bottom:12px;color:var(--tx);text-decoration:none}
.wk b{font-size:17px;display:block}
.wki{width:56px;height:56px;border-radius:14px;object-fit:contain;background:var(--bg);padding:8px;flex:none}
.wk>span:last-child{color:var(--mu);font-size:22px}
.btn.pcta{position:fixed;left:50%;transform:translateX(-50%);bottom:98px;z-index:19;width:min(360px,calc(100% - 32px));padding:16px;font-size:18px;box-shadow:0 10px 30px #0003}
`;
document.head.appendChild(st);

/* ---------- helpers ---------- */
const PAL=['#0d9488','#7c4a3a','#475569','#7c3aed','#db2777','#2563eb','#ca8a04','#16a34a'];
const colorOf=id=>{let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return PAL[h%PAL.length]};
const name=p=>(p&&(p.full_name||nm(p)))||'Someone';
const avatar=p=>p.avatar_url?`<img class="av" src="${esc(p.avatar_url)}" alt="">`:`<div class="av" style="background:${colorOf(p.id)}">${esc(((p.full_name||p.username||'?')[0]).toUpperCase())}</div>`;
const rolesOf=p=>Array.isArray(p.roles)&&p.roles.length?p.roles:String(p.role||'').split(/\s*,\s*/).filter(Boolean);
const cn=c=>String(c||'').replace(/^united states of america$/i,'United States');
const fmt=t=>{const d=new Date(t);return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' \u00b7 '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})};
const rel=id=>fr.find(x=>(x.a===me.id&&x.b===id)||(x.b===me.id&&x.a===id));
const stat=id=>{const f=rel(id);return!f?'none':f.status==='accepted'?'friend':f.a===me.id?'sent':'incoming'};
const hay=p=>[p.full_name,p.username,p.role,(p.roles||[]).join(' '),p.headline,p.bio,p.city,p.country,notes[p.id]].filter(Boolean).join(' ').toLowerCase();
const noteFocused=()=>document.activeElement&&document.activeElement.classList&&document.activeElement.classList.contains('pnote');

let notes={},saved={},notesLoaded=false,openId=null,viewing=null;
const tmr={},seen=new Set();

/* ---------- private notes ---------- */
async function loadNotes(){
  const{data,error}=await sb.from('people_notes').select('person,note');
  if(error){console.error(error);return}
  saved={};(data||[]).forEach(r=>saved[r.person]=r.note);
  notes=Object.assign({},saved,notes);notesLoaded=true;
  if(tab==='people')paintPeople();
}
async function flushNote(id){
  const val=(notes[id]||'').trim().slice(0,1000);
  if(val===(saved[id]||''))return;
  const r=val?await sb.from('people_notes').upsert({owner:me.id,person:id,note:val,updated_at:new Date().toISOString()}):await sb.from('people_notes').delete().eq('owner',me.id).eq('person',id);
  if(r.error)return toast(r.error.message);
  if(val)saved[id]=val;else delete saved[id];
}

/* ---------- list ---------- */
function row(p){
  const id=p.id,s=stat(id),f=rel(id),open=openId===id;
  const sub=[rolesOf(p).slice(0,2).join(', '),p.city,f&&f.created_at?fmt(f.created_at):''].filter(Boolean).join(' \u00b7 ');
  const side=s==='incoming'?`<button class="btn" data-act="acc" data-id="${id}">Accept</button>`:s==='none'?`<button class="btn" data-act="add" data-id="${id}">Add</button>`:s==='sent'?'<span class="mu">Sent</span>':'';
  const rm=s==='friend'?'Remove':s==='incoming'?'Decline':s==='sent'?'Cancel request':'';
  return `<div class="prow${open?' open':''}"><div class="phead" data-pp="toggle" data-id="${id}">${avatar(p)}<div class="sp"><b>${esc(name(p))}</b><div class="mu">${esc(sub||nm(p))}</div></div>${side}<span class="chev">${I.chev}</span></div>
  ${open?`<div class="pbody"><textarea class="pnote" data-id="${id}" maxlength="1000" placeholder="Note, only you see this">${esc(notes[id]||'')}</textarea>
  <div class="pfoot"><a href="#" data-pp="profile" data-id="${id}">Profile &rarr;</a><span class="mu">@${esc(p.username||'')}</span><span class="sp"></span>${s==='friend'?`<button class="btn g" data-act="dm" data-id="${id}">Message</button>`:''}${rm?`<button class="lnk" data-pp="remove" data-id="${id}">${rm}</button>`:''}</div></div>`:''}</div>`;
}

window.vPeople=function vPeople(){
  viewing=null;
  $('#main').innerHTML=`<div class="psearch"><div class="sbx">${I.search}<input id="sq" placeholder="Search people, notes" value="${esc(q)}" autocomplete="off"></div><button class="qrb" data-pa="qr" aria-label="My QR code">${I.qr}</button></div>
  <div class="card row" data-act="comm" style="cursor:pointer;margin-top:14px"><span style="font-size:26px">&#128172;</span><div class="sp"><b>Community chat</b><div class="mu">Talk with everyone</div></div><span>&rsaquo;</span></div>
  <div id="plist"></div>`;
  paintPeople();
  if(!notesLoaded)loadNotes();
};

window.paintPeople=function paintPeople(){
  if(viewing){renderPerson();return}
  const l=$('#plist');if(!l||noteFocused())return;
  const ql=q.toLowerCase().trim(),ok=p=>!ql||hay(p).includes(ql);
  const g={incoming:[],friend:[],sent:[],none:[]};
  Object.values(people).filter(p=>p.id!==me.id&&ok(p)).forEach(p=>g[stat(p.id)].push(p));
  const byDate=(a,b)=>{const x=(rel(a.id)||{}).created_at||'',y=(rel(b.id)||{}).created_at||'';return x<y?1:x>y?-1:0};
  g.incoming.sort(byDate);g.friend.sort(byDate);
  const disc=[...g.sent,...g.none].sort((a,b)=>(b.created_at||'')>(a.created_at||'')?1:-1);
  const sec=(t,a,max)=>a.length?`<div class="plab">${t}</div><div class="pcard">${a.slice(0,max||999).map(row).join('')}</div>`:'';
  l.innerHTML=(sec('REQUESTS',g.incoming)+sec('MY PEOPLE',g.friend)+sec('DISCOVER',disc,40))||`<p class="mu" style="margin-top:18px">${ql?'No one found.':'No one else has joined yet.'}</p>`;
};

/* ---------- full profile of another person ---------- */
const SI={
  instagram:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
  x_handle:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>'
};
function workCard(u){
  let host=u;try{host=new URL(u).hostname}catch(e){}
  const dom=host.replace(/^www\./,''),t=dom.split('.')[0]||dom;
  return `<a class="wk" href="${esc(u)}" target="_blank" rel="noopener noreferrer"><img class="wki" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(dom)}&sz=128" alt="" onerror="this.style.visibility='hidden'"><div class="sp"><b>${esc(t.charAt(0).toUpperCase()+t.slice(1))}</b><div class="mu">${esc(dom)}</div></div><span>&rsaquo;</span></a>`;
}
function renderPerson(){
  const m=$('#main');if(!m||noteFocused())return;
  const p=people[viewing];if(!p){viewing=null;return window.vPeople()}
  const id=p.id,s=stat(id),roles=rolesOf(p),place=[p.city,cn(p.country)].filter(Boolean).join(', ');
  const line=[roles.join(', '),p.city].filter(Boolean).join(' \u00b7 ');
  const soc=[['instagram','https://instagram.com/'],['x_handle','https://x.com/'],['youtube','https://youtube.com/@']].filter(x=>p[x[0]]).map(x=>`<a class="ps" href="${esc(x[1]+p[x[0]])}" target="_blank" rel="noopener noreferrer">${SI[x[0]]}@${esc(p[x[0]])}</a>`).join('');
  const work=(p.links||[]).filter(u=>/^https?:\/\//i.test(u)).map(workCard).join('');
  const cta=s==='friend'?`<button class="btn pcta" data-act="dm" data-id="${id}">Message</button>`
    :s==='incoming'?`<button class="btn pcta" data-act="acc" data-id="${id}">Accept request</button>`
    :s==='sent'?'<button class="btn pcta" disabled style="opacity:.6">Request sent</button>'
    :`<button class="btn pcta" data-act="add" data-id="${id}">Add to my people</button>`;
  const rmTxt=s==='friend'?'Remove from my people':s==='incoming'?'Decline request':s==='sent'?'Cancel request':'';
  m.innerHTML=`<div class="row"><button class="btn g" data-pp="back">${I.back} Back</button></div>
  <div class="pm"><div class="pbig">${avatar(p)}</div>
    <h1 class="big" style="font-size:36px;margin:18px 0 6px">${esc(name(p))}</h1>
    ${line?`<div class="mu" style="font-size:19px">${esc(line)}</div>`:`<div class="mu" style="font-size:16px">${esc(nm(p))}</div>`}
    ${p.headline?`<div class="hl">${esc(p.headline)}</div>`:''}
    ${p.open_to_work?'<div class="otw">&#9679; Open to work</div>':''}
    ${soc?`<div class="psr">${soc}</div>`:''}
    ${p.bio?`<p class="pbio2">${esc(p.bio)}</p>`:''}
    ${place?`<div style="margin-top:14px"><span class="pillx">&#128205; ${esc(place)}</span></div>`:''}
  </div>
  ${work?`<h3 style="text-align:center;margin:30px 0 14px;font-size:20px">Work</h3>${work}`:''}
  <h3 style="margin:24px 0 8px">Private note</h3><textarea class="pnote" data-id="${id}" maxlength="1000" placeholder="Note, only you see this">${esc(notes[id]||'')}</textarea>
  ${rmTxt?`<div class="center" style="padding:6px"><button class="lnk" data-pp="remove" data-id="${id}">${rmTxt}</button></div>`:''}
  <div style="height:90px"></div>${cta}`;
}
function openPerson(id){viewing=id;renderPerson();scrollTo(0,0);bump(id)}
async function bump(id){
  if(id===me.id||seen.has(id))return;seen.add(id);
  try{if(sessionStorage.getItem('pv_'+id))return;sessionStorage.setItem('pv_'+id,'1')}catch(e){}
  const r=await sb.rpc('bump_profile_view',{pid:id});if(r.error)console.error(r.error);
}

/* ---------- remove / decline / cancel ---------- */
async function removeRel(id){
  const s=stat(id),p=people[id];
  const msg=s==='friend'?'Remove '+name(p)+' from your people?':s==='incoming'?'Decline this request?':'Cancel this request?';
  if(!confirm(msg))return;
  const r=await sb.from('friendships').delete().or(`and(a.eq.${me.id},b.eq.${id}),and(a.eq.${id},b.eq.${me.id})`);
  if(r.error)return toast(r.error.message);
  fr=fr.filter(x=>!((x.a===me.id&&x.b===id)||(x.b===me.id&&x.a===id)));
  if(openId===id)openId=null;
  toast(s==='friend'?'Removed':s==='incoming'?'Declined':'Request cancelled');
  if(viewing){viewing=null;window.vPeople()}else paintPeople();
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-pp]');if(!t)return;
  const k=t.dataset.pp,id=t.dataset.id;
  if(k==='toggle'){if(e.target.closest('[data-act]'))return;openId=openId===id?null:id;paintPeople();return}
  if(t.tagName==='A')e.preventDefault();
  if(k==='profile')openPerson(id);
  else if(k==='back'){window.vPeople();scrollTo(0,0)}
  else if(k==='remove')removeRel(id).catch(err=>toast(err.message||'Something went wrong'));
});
document.addEventListener('input',e=>{
  const t=e.target;if(!t.classList||!t.classList.contains('pnote'))return;
  const id=t.dataset.id;notes[id]=t.value;clearTimeout(tmr[id]);tmr[id]=setTimeout(()=>flushNote(id),700);
});
document.addEventListener('focusout',e=>{
  const t=e.target;if(!t.classList||!t.classList.contains('pnote'))return;
  const id=t.dataset.id;clearTimeout(tmr[id]);flushNote(id);
});

/* ---------- profile views on the Me page ---------- */
const baseMe=window.vMe;
window.vMe=function vMe(){baseMe();showViews()};
async function showViews(){
  if(!document.querySelector('.pm'))return;
  const r=await sb.from('profiles').select('views').eq('id',me.id).maybeSingle();
  const n=(r.data&&r.data.views)||0,pm=document.querySelector('.pm');
  if(!pm||document.getElementById('pviews'))return;
  const el=[...pm.querySelectorAll('.mu')].find(x=>/idea.*friend/.test(x.textContent));
  if(el)el.insertAdjacentHTML('afterend',`<div class="mu" id="pviews" style="margin-top:2px">${n} profile view${n===1?'':'s'}</div>`);
}
})();

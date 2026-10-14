/* IdeaHub Plus: profile upgrade + People page in ONE file.
   Load after app3.js and before patch.js:
   <script src="ideahub.js?v=3"></script> */
/* IdeaHub profile upgrade: richer Me page + full Edit profile screen.
   Loads after app3.js and before patch.js. Overrides vMe() only. */
(function(){
const ROLES=['Videographer','Photographer','Video editor','Motion designer','3D artist','Illustrator','Designer','Product designer','Brand designer','Engineer','AI engineer','No-code builder','Creator','Streamer','Podcaster','Writer','Founder','Marketer','Growth','Community','Sound designer','Musician','Investor','Student','Other'];
const SOC=[['instagram','Instagram','https://instagram.com/'],['x_handle','X','https://x.com/'],['youtube','YouTube','https://youtube.com/@']];
const MAXLINKS=8;
const svg=p=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I={
  copy:svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'),
  share:svg('<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'),
  qr:svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1"/>')
};

const st=document.createElement('style');
st.textContent=`
.pm{text-align:center;padding:12px 0 4px}
.avw{position:relative;margin:0 auto}
.avb{position:absolute;right:-2px;bottom:-2px;width:34px;height:34px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;cursor:pointer;border:3px solid var(--bg);font-size:15px}
.hl{font-size:16px;margin:8px 0 2px}
.rl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}
.otw{display:inline-flex;align-items:center;gap:6px;background:#16a34a22;color:#16a34a;border-radius:99px;padding:4px 12px;font-weight:700;font-size:13px;margin:6px 0}
.bio{max-width:520px;margin:12px auto 0;white-space:pre-wrap;word-wrap:break-word}
.soc{display:inline-block;border:1px solid var(--bd);background:var(--card);color:var(--tx);border-radius:99px;padding:7px 16px;font-weight:600;text-decoration:none;font-size:14px}
.ib{border:0;background:none;color:var(--mu);cursor:pointer;padding:2px 6px;vertical-align:middle}
.acts{display:flex;gap:10px;margin:18px 0}
.acts .btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px}
.pedit .lbl{display:flex;justify-content:space-between;align-items:baseline;font-weight:700;margin:20px 0 8px}
.pedit .lbl span{font-weight:500;color:var(--mu);font-size:13px}
.pedit input:not([type=checkbox]):not([type=file]){border-radius:99px;padding:13px 18px;background:var(--card);margin-bottom:0}
.pedit textarea{border-radius:24px;padding:14px 18px;background:var(--card);min-height:120px;margin-bottom:0}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.g3 .lbl{margin-top:20px}
.rchips{display:flex;flex-wrap:wrap;gap:8px}
.rchips .chip{padding:10px 16px;font:inherit}
.owr{display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid var(--bd);border-radius:99px;padding:13px 18px;font-weight:700;margin-top:20px;cursor:pointer}
.owr input{width:22px;height:22px;margin:0;accent-color:var(--or)}
.qro{position:fixed;inset:0;background:#0009;z-index:80;display:grid;place-items:center;padding:20px}
.qbox{background:var(--card);border-radius:24px;padding:22px;text-align:center;width:min(320px,100%);display:flex;flex-direction:column;gap:12px;align-items:center}
.qrs{background:#fff;color:#111;padding:10px;border-radius:12px;width:220px;min-height:220px;display:grid;place-items:center}
.qrs svg{width:100%;height:auto;display:block}
`;
document.head.appendChild(st);

/* ---------- helpers ---------- */
const pl=(n,w)=>n+' '+w+(n===1?'':'s');
const cn=c=>String(c||'').replace(/^united states of america$/i,'United States');
const cleanH=s=>String(s||'').trim().replace(/^https?:\/\/[^/]+\//i,'').replace(/^@/,'').replace(/[^\w.\-]/g,'').slice(0,40);
const rolesOf=p=>Array.isArray(p.roles)&&p.roles.length?p.roles:String(p.role||'').split(/\s*,\s*/).filter(Boolean);
const avBig=(p,size,badge)=>`<div class="avw" id="pavw" style="width:${size}px;height:${size}px"><div class="av" style="width:100%;height:100%;font-size:${Math.round(size*.4)}px;background:var(--or);overflow:hidden">${p.avatar_url?`<img src="${esc(p.avatar_url)}" style="width:100%;height:100%;object-fit:cover" alt="">`:esc((nm(p)[1]||'?').toUpperCase())}</div>${badge}</div>`;
let pEditing=false;

/* ---------- views ---------- */
function viewHTML(){
  const p=prof,n=posts.filter(x=>x.user_id===me.id).length,f=friends().length,roles=rolesOf(p);
  const place=[p.city,cn(p.country)].filter(Boolean).join(', ')||'unknown';
  const soc=SOC.filter(s=>p[s[0]]).map(s=>`<a class="soc" href="${esc(s[2]+p[s[0]])}" target="_blank" rel="noopener noreferrer">${s[1]}</a>`).join('');
  return `<div class="row"><b style="font-size:28px" class="sp">Me</b><button class="btn g" data-pa="edit">Edit</button></div>
  <div class="pm">${avBig(p,120,'')}
    <h1 class="big" style="font-size:34px;margin:14px 0 4px">${esc(p.full_name||'')}</h1>
    <div class="mu" style="font-size:16px">${esc(nm(p))}<button class="ib" data-act="share" aria-label="Share">${I.share}</button></div>
    ${p.headline?`<div class="hl">${esc(p.headline)}</div>`:''}
    ${roles.length?`<div class="rl">${roles.map(r=>`<span class="pillx">${esc(r)}</span>`).join('')}</div>`:''}
    ${p.open_to_work?'<div class="otw">&#9679; Open to work</div>':''}
    <div class="mu" style="margin-top:6px">${pl(n,'idea')} &middot; ${pl(f,'friend')}</div>
    <div style="margin-top:8px">Posting from <b>${esc(place)}</b> <a href="#" data-pa="edit" style="color:var(--or);font-weight:700;text-decoration:none">change</a></div>
    ${p.bio?`<p class="bio">${esc(p.bio)}</p>`:''}
    ${soc?`<div class="rl">${soc}</div>`:''}
  </div>
  <h3 style="margin-top:20px">Work</h3>
  <div class="row"><input id="wl" placeholder="Paste a link to your work&hellip;" style="margin:0"><button class="btn g" data-act="addlink">Add</button></div><div id="wlist"></div>
  <div class="acts"><button class="btn g" data-act="invite">${I.copy} Copy</button><button class="btn g" data-act="share">${I.share} Share</button><button class="btn g" data-pa="qr">${I.qr} QR</button></div>
  <div class="center" style="padding:10px"><a href="#" data-act="out" style="color:var(--mu)">Log out</a></div>`;
}

function editHTML(){
  const p=prof,parts=(p.full_name||'').trim().split(/\s+/),first=parts.shift()||'',last=parts.join(' ');
  const mine=new Set(rolesOf(p));
  const lbl=(t,o)=>`<div class="lbl">${t}${o?`<span>${o}</span>`:''}</div>`;
  const cities=CITIES.map(c=>`<option value="${esc(c[0])}"></option>`).join('');
  return `<div class="pedit">
  <div class="row"><b style="font-size:28px" class="sp">Edit profile</b><button class="btn g" data-pa="save">Done</button></div>
  <div style="margin:18px 0 0">${avBig(p,96,'<label class="avb" title="Change photo">&#9998;<input type="file" id="pav" accept="image/*" hidden></label>')}</div>
  <div class="g2"><div>${lbl('First name')}<input id="pfn" maxlength="30" value="${esc(first)}"></div><div>${lbl('Last name')}<input id="pln" maxlength="30" value="${esc(last)}"></div></div>
  ${lbl('Username','your @handle')}<input id="pun" maxlength="20" autocapitalize="none" value="${esc(p.username||'')}">
  ${lbl('Headline','optional')}<input id="phl" maxlength="80" placeholder="Videographer for brands that move" value="${esc(p.headline||'')}">
  ${lbl('What you do')}<div class="rchips">${ROLES.map(r=>`<button type="button" class="chip${mine.has(r)?' on':''}" data-pr="${esc(r)}">${esc(r)}</button>`).join('')}</div>
  ${lbl('City','empty = auto')}<input id="pci" list="pcl" autocomplete="off" placeholder="Search a city" value="${esc(p.city||'')}"><datalist id="pcl">${cities}</datalist>
  ${lbl('Country')}<input id="pco" maxlength="60" value="${esc(cn(p.country))}">
  ${lbl('About')}<textarea id="pab" maxlength="500" placeholder="A few lines about you">${esc(p.bio||'')}</textarea>
  <div class="g3">${SOC.map(s=>`<div>${lbl(s[1])}<input id="ps_${s[0]}" maxlength="40" autocapitalize="none" placeholder="handle" value="${esc(p[s[0]]||'')}"></div>`).join('')}</div>
  <label class="owr">Open to work<input type="checkbox" id="pow" ${p.open_to_work?'checked':''}></label>
  ${lbl('Your work','up to '+MAXLINKS+' links')}
  <div class="row"><input id="wl" placeholder="Paste a link&hellip;" style="margin:0"><button class="btn g" data-act="addlink">Add</button></div><div id="wlist"></div>
  <button class="btn cta" data-pa="save" style="margin-top:22px">Save</button>
  </div>`;
}

window.vMe=function vMe(){
  $('#main').innerHTML=pEditing?editHTML():viewHTML();
  paintLinks();
};

/* ---------- save ---------- */
async function save(){
  const v=i=>(($('#'+i)||{}).value||'').trim();
  const first=v('pfn'),last=v('pln'),un=v('pun').toLowerCase().replace(/^@/,'');
  if(!first)return toast('Enter your first name');
  if(!/^[a-z0-9_]{3,20}$/.test(un))return toast('Username: 3-20 letters, numbers or _');
  const roles=[...document.querySelectorAll('.rchips .chip.on')].map(c=>c.dataset.pr);
  const ct=v('pci');let loc;
  if(!ct){const i=await ipinfo();loc={city:i.city||prof.city||null,lat:i.lat??prof.lat??null,lng:i.lng??prof.lng??null}}
  else{const ci=CITIES.find(x=>x[0].toLowerCase()===ct.toLowerCase());if(!ci)return toast('Pick a city from the list, or clear it for auto');loc={city:ci[0],lat:ci[1],lng:ci[2]}}
  const body={full_name:[first,last].filter(Boolean).join(' '),username:un,headline:v('phl')||null,roles,role:roles.join(', ')||null,bio:v('pab')||null,country:v('pco')||null,
    instagram:cleanH(v('ps_instagram'))||null,x_handle:cleanH(v('ps_x_handle'))||null,youtube:cleanH(v('ps_youtube'))||null,
    open_to_work:!!($('#pow')||{}).checked,...loc};
  const r=await sb.from('profiles').update(body).eq('id',me.id);
  if(r.error)return toast(r.error.code==='23505'?'@'+un+' is already taken':r.error.message);
  await loadPeople();prof=people[me.id]||{...prof,...body};
  pEditing=false;paintDock();vMe();scrollTo(0,0);toast('Saved');
}

/* ---------- QR ---------- */
async function showQR(){
  const o=document.createElement('div');o.id='qro';o.className='qro';o.dataset.pa='qrx';
  o.innerHTML=`<div class="qbox"><b>Scan to join ${esc(APP)}</b><div id="qrs" class="qrs">&hellip;</div><div class="mu" style="word-break:break-all">${esc(LINK())}</div><button class="btn g" data-pa="qrx">Close</button></div>`;
  document.body.appendChild(o);
  try{
    if(!window.qrcode)await ld('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js');
    const qr=qrcode(0,'M');qr.addData(LINK());qr.make();
    const s=$('#qrs');if(s)s.innerHTML=qr.createSvgTag(6,2);
  }catch(err){const s=$('#qrs');if(s)s.textContent='Could not load QR'}
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-pa]');
  if(a){
    const k=a.dataset.pa;if(a.tagName==='A')e.preventDefault();
    if(k==='edit'){pEditing=true;vMe();scrollTo(0,0)}
    else if(k==='save')save().catch(err=>toast(err.message||'Something went wrong'));
    else if(k==='qr')showQR();
    else if(k==='qrx'){if(e.target===a||a.tagName==='BUTTON'){const o=$('#qro');if(o)o.remove()}}
    return;
  }
  const c=e.target.closest('[data-pr]');if(c)c.classList.toggle('on');
});
/* capture phase: enforce the 8-link limit before the old handler runs */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act="addlink"]');
  if(t&&prof&&(prof.links||[]).length>=MAXLINKS){e.stopPropagation();toast('Up to '+MAXLINKS+' links')}
},true);
/* avatar upload */
document.addEventListener('change',async e=>{
  if(e.target.id!=='pav')return;const f=e.target.files&&e.target.files[0];if(!f)return;
  const u=await up(f);if(!u)return;
  const r=await sb.from('profiles').update({avatar_url:u}).eq('id',me.id);if(r.error)return toast(r.error.message);
  prof.avatar_url=u;if(people[me.id])people[me.id].avatar_url=u;
  const w=$('#pavw .av');if(w)w.innerHTML=`<img src="${esc(u)}" style="width:100%;height:100%;object-fit:cover" alt="">`;
  toast('Photo updated');
});
})();

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
.pm{text-align:center}
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
.phead b{font-size:17px;display:block}.phead .sp{cursor:pointer}.pav{display:grid;flex:none;cursor:pointer}
.igl{display:inline-flex;align-items:center;gap:5px;color:var(--mu);font-size:14px;text-decoration:underline;text-underline-offset:3px}.phead .mu{font-size:14px}
.chev{color:var(--mu);transition:transform .2s;flex:none;display:grid}
.prow.open .chev{transform:rotate(180deg)}
.pbody{padding:0 18px 16px}
.pnote{border-radius:24px;padding:14px 18px;background:var(--bg);min-height:110px;margin-bottom:10px}
.pfoot{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.pfoot a{font-weight:700;color:var(--tx);text-decoration:none}
.lnk{border:0;background:none;color:var(--mu);font:inherit;cursor:pointer;padding:4px}
.pbig{width:112px;margin:8px auto 0}
.pbig .av{width:112px;height:112px;font-size:44px}
.ps{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--bd);background:var(--card);color:var(--tx);border-radius:99px;padding:9px 16px;font-weight:600;text-decoration:none;font-size:15px}
.psr{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:14px 0}
.pbio2{max-width:520px;margin:16px auto 0;font-size:15px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word}
.wk{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--bd);border-radius:24px;padding:12px 16px;margin-bottom:12px;color:var(--tx);text-decoration:none}
.wk b{font-size:17px;display:block}
.wki{width:48px;height:48px;border-radius:12px;object-fit:contain;background:var(--bg);padding:8px;flex:none}
.wk>span:last-child{color:var(--mu);font-size:22px}
.btn.pcta{position:fixed;left:50%;transform:translateX(-50%);bottom:98px;z-index:19;width:auto;max-width:calc(100% - 32px);padding:16px 40px;font-size:17px;white-space:nowrap;box-shadow:0 10px 30px #0003}
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
const LK='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
function handleLink(p){
  const lbl='@'+esc(p.username||''),ext='target="_blank" rel="noopener noreferrer"';
  if(p.instagram)return `<a class="igl" href="https://instagram.com/${encodeURIComponent(p.instagram)}" ${ext}>${SI.instagram.replace('width="20" height="20"','width="14" height="14"')}${lbl}</a>`;
  if(p.x_handle)return `<a class="igl" href="https://x.com/${encodeURIComponent(p.x_handle)}" ${ext}>${LK}${lbl}</a>`;
  if(p.youtube)return `<a class="igl" href="https://youtube.com/@${encodeURIComponent(p.youtube)}" ${ext}>${LK}${lbl}</a>`;
  const w=(p.links||[]).find(u=>/^https?:\/\//i.test(u));
  if(w)return `<a class="igl" href="${esc(w)}" ${ext}>${LK}${lbl}</a>`;
  return `<a class="igl" href="#" data-pp="profile" data-id="${p.id}">${lbl}</a>`;
}
function row(p){
  const id=p.id,s=stat(id),f=rel(id),open=openId===id;
  const sub=[rolesOf(p).slice(0,2).join(', '),p.city,f&&f.created_at?fmt(f.created_at):''].filter(Boolean).join(' \u00b7 ');
  const side=s==='incoming'?`<button class="btn" data-act="acc" data-id="${id}">Accept</button>`:s==='none'?`<button class="btn" data-act="add" data-id="${id}">Add</button>`:s==='sent'?'<span class="mu">Sent</span>':'';
  const rm=s==='friend'?'Remove':s==='incoming'?'Decline':s==='sent'?'Cancel request':'';
  return `<div class="prow${open?' open':''}"><div class="phead" data-pp="toggle" data-id="${id}"><span class="pav" data-pp="profile" data-id="${id}">${avatar(p)}</span><div class="sp" data-pp="profile" data-id="${id}"><b>${esc(name(p))}</b><div class="mu">${esc(sub||nm(p))}</div></div>${side}<span class="chev">${I.chev}</span></div>
  ${open?`<div class="pbody"><textarea class="pnote" data-id="${id}" maxlength="1000" placeholder="Note, only you see this">${esc(notes[id]||'')}</textarea>
  <div class="pfoot"><a href="#" data-pp="profile" data-id="${id}">Profile &rarr;</a>${handleLink(p)}<span class="sp"></span>${s==='friend'?`<button class="btn g" data-act="dm" data-id="${id}">Message</button>`:''}${rm?`<button class="lnk" data-pp="remove" data-id="${id}">${rm}</button>`:''}</div></div>`:''}</div>`;
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
    <h1 class="big" style="font-size:28px;margin:16px 0 4px">${esc(name(p))}</h1>
    ${line?`<div class="mu" style="font-size:17px">${esc(line)}</div>`:`<div class="mu" style="font-size:16px">${esc(nm(p))}</div>`}
    ${p.headline?`<div class="hl">${esc(p.headline)}</div>`:''}
    ${p.open_to_work?'<div class="otw">&#9679; Open to work</div>':''}
    ${soc?`<div class="psr">${soc}</div>`:''}
    ${p.bio?`<p class="pbio2">${esc(p.bio)}</p>`:''}
    ${place?`<div style="margin-top:14px"><span class="pillx">&#128205; ${esc(place)}</span></div>`:''}
  </div>
  ${work?`<h3 style="text-align:center;margin:28px 0 14px;font-size:18px">Work</h3>${work}`:''}
  <h3 style="margin:24px 0 8px">Private note</h3><textarea class="pnote" data-id="${id}" maxlength="1000" placeholder="Note, only you see this">${esc(notes[id]||'')}</textarea>
  ${rmTxt?`<div class="center" style="padding:6px"><button class="lnk" data-pp="remove" data-id="${id}">${rmTxt}</button></div>`:''}
  <div style="height:90px"></div>${cta}`;
}
function openPerson(id){viewing=id;renderPerson();scrollTo(0,0);bump(id)}
async function bump(id){
  if(id===me.id)return;
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
window.vMe=function vMe(){baseMe();refreshViews()};
async function refreshViews(){
  if(!document.querySelector('.pm')||!me)return;
  const r=await sb.from('profiles').select('views').eq('id',me.id).maybeSingle();
  if(r.error||!r.data)return;
  const n=r.data.views||0,txt=n+' profile view'+(n===1?'':'s'),pm=document.querySelector('.pm');
  if(!pm)return;
  let el=document.getElementById('pviews');
  if(!el){
    const ref=[...pm.querySelectorAll('.mu')].find(x=>/idea.*friend/.test(x.textContent));
    const html=`<div class="mu" id="pviews" style="margin-top:2px"></div>`;
    if(ref)ref.insertAdjacentHTML('afterend',html);else pm.insertAdjacentHTML('beforeend',html);
    el=document.getElementById('pviews');
  }
  if(el)el.textContent=txt;
}
setInterval(()=>{if(document.getElementById('pviews'))refreshViews()},8000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.querySelector('.pm'))refreshViews()});
})();

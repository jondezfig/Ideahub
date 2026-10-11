(function(){
const st=document.createElement('style');
st.textContent='.prog{height:6px;border-radius:99px;background:var(--bd);margin:0 0 24px;overflow:hidden}.prog i{display:block;height:100%;background:var(--or);transition:width .4s}.ob{max-width:460px;margin:0 auto;animation:up .4s both}.ok{color:#16a34a}.no{color:#dc2626}';
document.head.appendChild(st);
let step=1,pic=null,timer;
const upd=async f=>{const r=await sb.from('profiles').update(f).eq('id',me.id);if(!r.error)prof={...prof,...f};return r};
window.claimView=function(){step=1;obView()};
async function obView(){
  $('#hd').innerHTML=`<span class="logo">💡 ${esc(APP)}</span><button class="btn g" style="margin-left:auto" data-act="out">Sign out</button>`;
  const w=$('#main'),bar=`<div class="prog"><i style="width:${step*33.3}%"></i></div>`,h=t=>`<h1 class="big" style="font-size:34px">${t}</h1>`;
  if(step===1){const n=prof.full_name||'';
    w.innerHTML=`<div class="ob">${bar}${h('Is this you?')}<div class="row" style="margin:14px 0">${av(prof)}<div><b>${esc(n||'New member')}</b><div class="mu">${esc(me.email||'')}</div></div></div><input id="obn" placeholder="Your name" maxlength="60" value="${esc(n)}"><input id="obun" placeholder="Pick a unique @username" maxlength="20" autocapitalize="none" value="${esc(prof.username||'')}"><div id="obm" class="mu" style="margin:-4px 0 10px">3-20 letters, numbers or _</div><button class="btn cta" data-ob="n1">Continue →</button></div>`}
  if(step===2){const p=await ipinfo();if(step!==2)return;const c=CITIES.find(x=>x[0].toLowerCase()===(p.city||'').toLowerCase());
    w.innerHTML=`<div class="ob">${bar}${h('Where are you?')}<p class="mu">We guessed from your connection. Change it if it is wrong.</p><input id="obc" placeholder="Country" value="${esc(prof.country||p.country)}"><select id="obt"><option value="">${p.city?'Use '+esc(p.city):'Use my connection'}</option>${CITIES.map(x=>`<option ${(prof.city?prof.city===x[0]:c&&c[0]===x[0])?'selected':''}>${x[0]}</option>`).join('')}</select><button class="btn cta" data-ob="n2">Continue →</button><button class="btn g cta" data-ob="b2">Back</button></div>`}
  if(step===3)w.innerHTML=`<div class="ob">${bar}${h('Post your first idea')}<p class="mu">Share something you are thinking about. You can skip this.</p><input id="obti" maxlength="120" placeholder="Idea title"><textarea id="obtx" maxlength="2000" placeholder="Describe your idea…"></textarea><input id="obtg" maxlength="24" placeholder="Tag (e.g. tech, art)"><div class="row" style="margin-bottom:8px"><label class="btn g" style="cursor:pointer">📷 Image<input type="file" id="obf" accept="image/*" hidden></label><span class="mu" id="obfn"></span></div><button class="btn cta" data-ob="n3">Share idea →</button><button class="btn g cta" data-ob="skip">Skip for now</button></div>`;
}
async function finish(){await upd({signup_step:3});started=null;start({user:me})}
document.addEventListener('click',async e=>{const t=e.target.closest('[data-ob]');if(!t)return;const k=t.dataset.ob,v=i=>(($('#'+i)||{}).value||'').trim();
  try{
  if(k==='n1'){const un=v('obun').toLowerCase(),name=v('obn');if(!name)return toast('Enter your name');if(!/^[a-z0-9_]{3,20}$/.test(un))return toast('Username: 3-20 letters, numbers or _');
    const r=await upd({full_name:name,username:un,signup_step:1});if(r.error)return toast(r.error.code==='23505'?'@'+un+' is already taken':r.error.message);step=2;obView()}
  if(k==='n2'){const ci=CITIES.find(x=>x[0]===v('obt')),p=await ipinfo(),loc=ci?{city:ci[0],lat:ci[1],lng:ci[2]}:{city:p.city||null,lat:p.lat,lng:p.lng};
    const r=await upd({country:v('obc')||null,...loc,signup_step:2});if(r.error)return toast(r.error.message);step=3;obView()}
  if(k==='b2'){step=1;obView()}
  if(k==='n3'){if(!v('obti')||!v('obtx'))return toast('Add a title and description, or tap Skip');
    const r=await sb.from('posts').insert({title:v('obti'),body:v('obtx'),tag:v('obtg').toLowerCase().replace(/^#/,'')||null,image_url:pic||null});if(r.error)return toast(r.error.message);pic=null;finish()}
  if(k==='skip')finish();
  }catch(err){toast(err.message||'Something went wrong')}
});
document.addEventListener('change',async e=>{if(e.target.id!=='obf'||!e.target.files[0])return;const f=e.target.files[0],u=await up(f);if(u){pic=u;$('#obfn').textContent='📎 '+f.name}});
document.addEventListener('input',e=>{if(e.target.id!=='obun')return;clearTimeout(timer);const n=e.target.value.trim().toLowerCase(),m=$('#obm');
  if(!/^[a-z0-9_]{3,20}$/.test(n)){m.className='mu';m.textContent='3-20 letters, numbers or _';return}
  timer=setTimeout(async()=>{const r=await sb.from('profiles').select('id').eq('username',n).maybeSingle();const i=$('#obun');
    if(i&&i.value.trim().toLowerCase()===n){const free=!r.data||r.data.id===me.id;m.className=free?'ok':'no';m.textContent=free?'✓ @'+n+' is available':'✗ @'+n+' is taken'}},400)});
})();

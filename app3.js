function vLive(){$('#main').innerHTML=`<div class="center" style="padding:10px 0"><h1 class="big" style="font-size:clamp(30px,8vw,52px)">Who's online right now?</h1><div id="lv"></div></div><div style="position:relative"><div id="map" style="height:min(68vh,560px);border-radius:16px;overflow:hidden;background:#cfe8ff"></div><button class="btn g" data-act="spin" style="position:absolute;left:10px;top:10px">🔄 Auto-rotate</button></div><div class="mu" style="margin-top:6px">Drag to spin the globe, pinch or scroll to zoom, two fingers or right-click drag to rotate and tilt. Locations are approximate, city level only.</div><div class="card" id="lb" style="margin-top:12px"></div>`;initMap();paintLive()}
function feats(){const ps=Object.values(online).map(x=>x[0]),mem={},g={},f=[];
  Object.values(people).forEach(p=>{if(p.city)mem[p.city]=(mem[p.city]||0)+1});
  ps.forEach(p=>{const k=p.place;g[k]=g[k]||{n:0,lat:p.lat,lng:p.lng};g[k].n++});
  Object.entries(mem).forEach(([k,n])=>{const c=CITIES.find(z=>z[0]===k);if(c)f.push({type:'Feature',properties:{kind:'mem',n,name:k},geometry:{type:'Point',coordinates:[c[2],c[1]]}})});
  Object.entries(g).forEach(([k,v])=>f.push({type:'Feature',properties:{kind:'on',n:v.n,name:k},geometry:{type:'Point',coordinates:[v.lng,v.lat]}}));
  return{ps,mem,on:Object.fromEntries(Object.entries(g).map(([k,v])=>[k,v.n])),fc:{type:'FeatureCollection',features:f}}}
function paintLive(){const v=$('#lv');if(!v)return;const{ps,mem,on,fc}=feats();
  v.innerHTML=`<span class="dot"></span><b>${ps.length}</b> here now · <b>${Object.keys(people).length}</b> members`;
  const keys=[...new Set([...Object.keys(mem),...Object.keys(on)])],tot=k=>(mem[k]||0)+(on[k]||0);keys.sort((a,b)=>tot(b)-tot(a));
  $('#lb').innerHTML='<h3>Leaderboard</h3>'+(keys.map((k,i)=>`<div style="margin:10px 0"><div class="row"><span class="mu">${i+1}</span><b class="sp">${esc(k)} ${on[k]?'<span class="dot"></span>':''}</b><b>${tot(k)}</b></div><div class="bar" style="width:${Math.max(4,tot(k)/tot(keys[0])*100)}%"></div></div>`).join('')||'<p class="mu">Waiting for people…</p>');
  if(map&&mapReady)map.getSource('pts').setData(fc)}
const ld=src=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=no;document.head.appendChild(e)});
async function initMap(){mapReady=false;
  try{if(!window.maplibregl){const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl.css';document.head.appendChild(l);await ld('https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl.js')}
  if(tab!=='live')return;
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[15,30],zoom:1.5,maxPitch:85});
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  map.on('style.load',()=>{try{map.setProjection({type:'globe'})}catch(e){}});
  map.on('load',()=>{const sz=['min',22,['+',7,['*',2.5,['get','n']]]];
    map.addSource('pts',{type:'geojson',data:feats().fc});
    map.addLayer({id:'mem',type:'circle',source:'pts',filter:['==',['get','kind'],'mem'],paint:{'circle-radius':sz,'circle-color':'#ee5a24','circle-stroke-color':'#fff','circle-stroke-width':2,'circle-opacity':.95}});
    map.addLayer({id:'halo',type:'circle',source:'pts',filter:['==',['get','kind'],'on'],paint:{'circle-radius':14,'circle-color':'#2563ff','circle-opacity':.4}});
    map.addLayer({id:'on',type:'circle',source:'pts',filter:['==',['get','kind'],'on'],paint:{'circle-radius':sz,'circle-color':'#2563ff','circle-stroke-color':'#fff','circle-stroke-width':2}});
    ['mem','on'].forEach(l=>{map.on('click',l,e=>{const p=e.features[0].properties;new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML('<b>'+esc(p.name)+'</b><br>'+p.n+(l==='on'?' online now':' members')).addTo(map)});map.on('mouseenter',l,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',l,()=>map.getCanvas().style.cursor='')});
    mapReady=true;const my=++pulseT;const loop=t=>{if(!map||my!==pulseT)return;const ph=(t/1500)%1;try{map.setPaintProperty('halo','circle-radius',12+ph*30);map.setPaintProperty('halo','circle-opacity',.5*(1-ph))}catch(e){}requestAnimationFrame(loop)};requestAnimationFrame(loop);paintLive()});
  map.on('moveend',()=>{if(spin)spinStep()});
  }catch(e){const m=$('#map');if(m)m.innerHTML='<p class="mu" style="padding:16px">Map could not load.</p>'}}
function spinStep(){if(!map)return;const c=map.getCenter();map.easeTo({center:[c.lng-45,Math.max(-40,Math.min(50,c.lat))],duration:3500,easing:t=>t})}
function vMe(){const p=prof,link=location.origin+location.pathname;$('#main').innerHTML=`<div class="card"><div class="row">${av(p)}<div><b>${esc(nm(p))}</b><div class="mu">${esc(me.email||'')}</div></div></div>
  <h3 style="margin-top:14px">City</h3><select id="city"><option value="">Auto (from timezone)</option>${CITIES.map(c=>`<option ${p.city===c[0]?'selected':''}>${c[0]}</option>`).join('')}</select>
  <h3>What you do</h3><input id="role" maxlength="60" value="${esc(p.role||'')}" placeholder="e.g. Designer, founder"><h3>Bio</h3><textarea id="bio" maxlength="300" placeholder="Tell people about yourself…">${esc(p.bio||'')}</textarea>
  <div class="row"><button class="btn" data-act="save">Save</button><button class="btn g" data-act="out">Sign out</button></div></div>
  <div class="card"><b>🔗 Invite friends</b><div class="row" style="margin-top:8px"><input id="lk" readonly value="${esc(link)}" style="margin:0"><button class="btn" data-act="invite">Share</button></div></div>`}

/* ---------- events ---------- */
document.addEventListener('input',e=>{if(e.target.id==='sq'){q=e.target.value;tab==='feed'?paintFeed():paintPeople()}});
document.addEventListener('keydown',e=>{const i=e.target.id||'';if(e.key==='Enter'){if(i==='mi')act('send');if(i.startsWith('ci'))act('cmt',i.slice(2));if(i==='un')act('claim')}});
document.addEventListener('change',async e=>{const i=e.target.id,f=e.target.files&&e.target.files[0];if(!f||(i!=='pf'&&i!=='cf'))return;
  const k=i==='pf'?'post':'chat',u=await up(f);if(u){pend[k]=u;const n=$(i==='pf'?'#pn':'#cn');if(n)n.textContent='📎 '+f.name}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-room],[data-act]');if(!t)return;const d=t.dataset;
  if(d.tab&&sb&&me&&prof&&prof.username)return setTab(d.tab);if(d.room){room=d.room;chanMsgs();return shellChat()}if(d.act)act(d.act,d.id)});
setInterval(()=>document.querySelectorAll('[data-ts]').forEach(e=>e.textContent=ago(e.dataset.ts)),15000);
async function up(file){if(!/^image\//.test(file.type)){toast('Images only for now');return null}if(file.size>5e6){toast('Max 5 MB');return null}
  const path=`${me.id}/${Date.now()}_${file.name.replace(/[^\w.]/g,'_')}`,{error}=await sb.storage.from('images').upload(path,file);if(error){toast(error.message);return null}return sb.storage.from('images').getPublicUrl(path).data.publicUrl}
async function act(a,id){const v=i=>(($('#'+i)||{}).value||'').trim();let r;
  try{
  if(a==='google'){r=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(r.error)toast(r.error.message)}
  if(a==='magic'){const em=v('em');if(!em)return;r=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname}});toast(r.error?r.error.message:'Check your email for the sign-in link')}
  if(a==='spin'){spin=!spin;toast(spin?'Auto-rotate on':'Auto-rotate off');if(spin)spinStep()}
  if(a==='out')await sb.auth.signOut();
  if(a==='claim'){const n=v('un').toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(n))return toast('3-20 letters, numbers or _');
    r=await sb.from('profiles').update({username:n}).eq('id',me.id);if(r.error)return toast(r.error.code==='23505'?'@'+n+' is already taken':r.error.message);started='';start({user:me})}
  if(a==='post'){if(!v('pt')||!v('px'))return;r=await sb.from('posts').insert({title:v('pt'),body:v('px'),tag:v('pg').toLowerCase().replace(/^#/,'')||null,image_url:pend.post||null});if(r.error)return toast(r.error.message);pend.post=null;vFeed();loadPosts()}
  if(a==='like'){const p=posts.find(x=>x.id==id);r=p.likes.some(x=>x.user_id===me.id)?await sb.from('likes').delete().match({post_id:id,user_id:me.id}):await sb.from('likes').insert({post_id:id})}
  if(a==='del')await sb.from('posts').delete().eq('id',id);
  if(a==='oc'){openC[id]=!openC[id];paintFeed()}
  if(a==='cmt'){const t=v('ci'+id);if(!t)return;await sb.from('comments').insert({post_id:id,body:t})}
  if(a==='add')await sb.from('friendships').insert({a:me.id,b:id});
  if(a==='acc')await sb.from('friendships').update({status:'accepted'}).match({a:id,b:me.id});
  if(a==='dm'){room=dmRoom(id);chanMsgs();setTab('chat')}
  if(a==='send'){const t=v('mi');if(!t&&!pend.chat)return;$('#mi').value='';r=await sb.from('messages').insert({room,body:t,image_url:pend.chat||null});if(r.error)toast(r.error.message);pend.chat=null;const n=$('#cn');if(n)n.textContent=''}
  if(a==='save'){r=await sb.from('profiles').update({city:v('city')||null,role:v('role'),bio:v('bio')}).eq('id',me.id);if(!r.error){await loadPeople();prof=people[me.id]||prof;toast('Saved')}else toast(r.error.message)}
  if(a==='invite'){const t='Join me on '+APP+': '+location.origin+location.pathname;try{if(navigator.share){await navigator.share({text:t});return}}catch(e){if(e.name==='AbortError')return}
    try{await navigator.clipboard.writeText(t);toast('Invite copied')}catch(e){$('#lk').select();toast('Press and hold the link to copy')}}
  }catch(err){toast(err.message||'Something went wrong')}
}
boot();

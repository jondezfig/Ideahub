function fc(){const f=[],g={};
  byCity().forEach(([k,o])=>f.push({type:'Feature',properties:{kind:'mem',n:o.n,name:k},geometry:{type:'Point',coordinates:[o.lng,o.lat]}}));
  Object.values(online).map(x=>x[0]).forEach(p=>{if(p.lat==null)return;g[p.place]=g[p.place]||{n:0,lat:p.lat,lng:p.lng};g[p.place].n++});
  Object.entries(g).forEach(([k,v])=>f.push({type:'Feature',properties:{kind:'on',n:v.n,name:k},geometry:{type:'Point',coordinates:[v.lng,v.lat]}}));
  return{type:'FeatureCollection',features:f}}
const ld=src=>new Promise((ok,no)=>{const e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=no;document.head.appendChild(e)});
async function initMap(){mapReady=false;
  try{if(!window.maplibregl){const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl.css';document.head.appendChild(l);await ld('https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl.js')}
  if(tab!=='home')return;
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[15,30],zoom:1.5,maxPitch:85});
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  map.on('style.load',()=>{try{map.setProjection({type:'globe'})}catch(e){}});
  map.on('load',()=>{const sz=['min',22,['+',7,['*',2.5,['get','n']]]];
    map.addSource('pts',{type:'geojson',data:fc()});
    map.addLayer({id:'mem',type:'circle',source:'pts',filter:['==',['get','kind'],'mem'],paint:{'circle-radius':sz,'circle-color':'#ee4408','circle-stroke-color':'#fff','circle-stroke-width':2,'circle-opacity':.95}});
    map.addLayer({id:'halo',type:'circle',source:'pts',filter:['==',['get','kind'],'on'],paint:{'circle-radius':14,'circle-color':'#2563ff','circle-opacity':.4}});
    map.addLayer({id:'on',type:'circle',source:'pts',filter:['==',['get','kind'],'on'],paint:{'circle-radius':sz,'circle-color':'#2563ff','circle-stroke-color':'#fff','circle-stroke-width':2}});
    ['mem','on'].forEach(l=>{map.on('click',l,e=>{const p=e.features[0].properties;new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML('<b>'+esc(p.name)+'</b><br>'+p.n+(l==='on'?' online now':' ideas')).addTo(map)});map.on('mouseenter',l,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',l,()=>map.getCanvas().style.cursor='')});
    mapReady=true;const my=++pulseT;const loop=t=>{if(!map||my!==pulseT)return;const ph=(t/1500)%1;try{map.setPaintProperty('halo','circle-radius',12+ph*30);map.setPaintProperty('halo','circle-opacity',.5*(1-ph))}catch(e){}requestAnimationFrame(loop)};requestAnimationFrame(loop);
    spin=true;spinStep();paintHome()});
  map.on('dragstart',()=>{spin=false;map.stop()});map.on('moveend',()=>{if(spin)spinStep()});
  }catch(e){const m=$('#map');if(m)m.innerHTML='<p class="mu" style="padding:16px">Map could not load.</p>'}}
function spinStep(){if(!map)return;const c=map.getCenter();map.easeTo({center:[c.lng-45,Math.max(-40,Math.min(50,c.lat))],duration:3500,easing:t=>t})}

/* ---------- events ---------- */
document.addEventListener('input',e=>{if(e.target.id==='sq'){q=e.target.value;tab==='home'?paintFeed():paintPeople()}});
document.addEventListener('keydown',e=>{const i=e.target.id||'';if(e.key==='Enter'){if(i==='mi')act('send');if(i.startsWith('ci'))act('cmt',i.slice(2));if(i==='un')act('claim')}});
document.addEventListener('change',async e=>{const i=e.target.id,f=e.target.files&&e.target.files[0];if(!f||(i!=='pf'&&i!=='cf'))return;
  const k=i==='pf'?'post':'chat',u=await up(f);if(u){pend[k]=u;const n=$(i==='pf'?'#pn':'#cn');if(n)n.textContent='📎 '+f.name}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-act],[data-seg],[data-fly]');if(!t)return;const d=t.dataset;if(t.tagName==='A')e.preventDefault();
  if(d.tab){if(me&&prof&&prof.username)setTab(d.tab);return}
  if(d.seg){hseg=d.seg;return paintSeg()}
  if(d.fly!==undefined){const r=byCity()[+d.fly];if(r&&map){spin=false;map.flyTo({center:[r[1].lng,r[1].lat],zoom:4.5});scrollTo({top:0,behavior:'smooth'})}return}
  if(d.act)act(d.act,d.id)});
setInterval(()=>document.querySelectorAll('[data-ts]').forEach(e=>e.textContent=ago(e.dataset.ts)),15000);
async function up(file){if(!/^image\//.test(file.type)){toast('Images only for now');return null}if(file.size>5e6){toast('Max 5 MB');return null}
  const path=`${me.id}/${Date.now()}_${file.name.replace(/[^\w.]/g,'_')}`,{error}=await sb.storage.from('images').upload(path,file);if(error){toast(error.message);return null}return sb.storage.from('images').getPublicUrl(path).data.publicUrl}
const LINK=()=>location.origin+location.pathname;
async function act(a,id){const v=i=>(($('#'+i)||{}).value||'').trim();let r;
  try{
  if(a==='google'){r=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:LINK()}});if(r.error)toast(r.error.message)}
  if(a==='magic'){const em=v('em');if(!em)return;r=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:LINK()}});toast(r.error?r.error.message:'Check your email for the sign-in link')}
  if(a==='out')await sb.auth.signOut();
  if(a==='claim'){const n=v('un').toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(n))return toast('3-20 letters, numbers or _');
    r=await sb.from('profiles').update({username:n}).eq('id',me.id);if(r.error)return toast(r.error.code==='23505'?'@'+n+' is already taken':r.error.message);started=null;start({user:me})}
  if(a==='compose'){hseg='ideas';if(tab!=='home')setTab('home');else paintSeg();setTimeout(()=>{const c=$('#comp');if(c)c.scrollIntoView({behavior:'smooth',block:'center'})},60)}
  if(a==='post'){if(!v('pt')||!v('px'))return;r=await sb.from('posts').insert({title:v('pt'),body:v('px'),tag:v('pg').toLowerCase().replace(/^#/,'')||null,image_url:pend.post||null});if(r.error)return toast(r.error.message);pend.post=null;['pt','px','pg'].forEach(i=>$('#'+i).value='');$('#pn').textContent='';toast('Idea shared');loadPosts()}
  if(a==='like'){const p=posts.find(x=>x.id==id);r=p.likes.some(x=>x.user_id===me.id)?await sb.from('likes').delete().match({post_id:id,user_id:me.id}):await sb.from('likes').insert({post_id:id})}
  if(a==='del')await sb.from('posts').delete().eq('id',id);
  if(a==='oc'){openC[id]=!openC[id];paintFeed()}
  if(a==='cmt'){const t=v('ci'+id);if(!t)return;await sb.from('comments').insert({post_id:id,body:t})}
  if(a==='add')await sb.from('friendships').insert({a:me.id,b:id});
  if(a==='acc')await sb.from('friendships').update({status:'accepted'}).match({a:id,b:me.id});
  if(a==='dm'){room=dmRoom(id);chanMsgs();setTab('chat')}
  if(a==='comm'){room='community';chanMsgs();setTab('chat')}
  if(a==='send'){const t=v('mi');if(!t&&!pend.chat)return;$('#mi').value='';r=await sb.from('messages').insert({room,body:t,image_url:pend.chat||null});if(r.error)toast(r.error.message);pend.chat=null;const n=$('#cn');if(n)n.textContent=''}
  if(a==='edit'){editing=!editing;vMe()}
  if(a==='save'){const ci=CITIES.find(x=>x[0]===v('ec'));let loc;if(ci)loc={city:ci[0],lat:ci[1],lng:ci[2]};else{const i=await ipinfo();loc={city:i.city||prof.city,lat:i.lat??prof.lat,lng:i.lng??prof.lng}}
    r=await sb.from('profiles').update({full_name:v('en'),role:v('er'),bio:v('eb'),country:v('eco')||null,...loc}).eq('id',me.id);
    if(r.error)return toast(r.error.message);await loadPeople();prof=people[me.id]||prof;editing=false;vMe();toast('Saved')}
  if(a==='addlink'){const u=v('wl');if(!/^https?:\/\/\S+$/i.test(u))return toast('Paste a full link starting with https://');const links=[...(prof.links||[]),u];r=await sb.from('profiles').update({links}).eq('id',me.id);if(r.error)return toast(r.error.message);prof.links=links;$('#wl').value='';paintLinks()}
  if(a==='rmlink'){const links=(prof.links||[]).filter((_,i)=>i!==+id);r=await sb.from('profiles').update({links}).eq('id',me.id);if(!r.error){prof.links=links;paintLinks()}}
  if(a==='invite'){try{await navigator.clipboard.writeText('Join me on '+APP+': '+LINK());toast('Link copied')}catch(e){toast(LINK())}}
  if(a==='share'){const t='Join me on '+APP+': '+LINK();try{if(navigator.share)await navigator.share({text:t});else{await navigator.clipboard.writeText(t);toast('Link copied')}}catch(e){}}
  }catch(err){toast(err.message||'Something went wrong')}
}
boot();

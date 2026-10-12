/* fixes: ideas not showing, map no longer auto-rotates, orange ring around blue dot */
async function loadPosts(){
  const{data,error}=await sb.from('posts').select('*,likes(user_id),comments(id,body,created_at,user_id)').order('created_at',{ascending:false}).limit(80);
  if(error){console.error(error);toast('Could not load ideas: '+error.message)}
  posts=data||[];
  if(posts.some(p=>!people[p.user_id]||p.comments.some(c=>!people[c.user_id])))await loadPeople();
  posts.forEach(p=>{p.profiles=people[p.user_id]||null;p.comments.forEach(c=>{c.profiles=people[c.user_id]||null})});
  if(tab==='home')paintHome()}
async function loadMsgs(){const{data}=await sb.from('messages').select('*').eq('room',room).order('created_at',{ascending:false}).limit(100);msgs=(data||[]).reverse();msgs.forEach(m=>{m.profiles=people[m.user_id]||null});paintMsgs()}
function paintHome(){const hs=$('#hs');if(!hs)return;const l=posts[0],ps=Object.values(online).length,rec=[...new Map(posts.map(p=>[p.user_id,p.profiles])).values()].slice(0,6),u=l&&l.profiles;
  hs.innerHTML=`<span class="pillx">${l?'Latest idea · '+tm(l.created_at):'No ideas yet'}</span>
  <div class="big2">${l?'“'+esc(l.title)+'”':'Be the first to share an idea'}</div>
  ${l?`<div class="mu" style="font-size:15px">by <b>${esc(nm(u))}</b>${u&&(u.city||u.country)?' from <b>'+esc([u.city,u.country].filter(Boolean).join(', '))+'</b>':''}</div>`:''}
  <div class="row" style="margin:14px 0;font-size:16px;gap:20px"><span><span class="dot" style="background:#ee5a24;animation:none"></span><b>${posts.length}</b> ideas</span><span><span class="dot"></span><b>${ps}</b> here now</span></div>
  ${rec.length?`<div class="row"><div class="stack">${rec.map(av).join('')}</div><span class="mu">just posted</span></div>`:''}
  <button class="btn cta" data-act="compose">＋ Share an idea</button>`;
  paintSeg();if(map&&mapReady)map.getSource('pts').setData(fc())}
async function initMap(){mapReady=false;spin=false;
  try{if(!window.maplibregl){const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl.css';document.head.appendChild(l);await ld('https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl.js')}
  if(tab!=='home')return;
  const c0=[prof&&prof.lng!=null?prof.lng:15,prof&&prof.lat!=null?prof.lat:30];
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:c0,zoom:2.2,maxPitch:85});
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  map.on('style.load',()=>{try{map.setProjection({type:'globe'})}catch(e){}});
  map.on('load',()=>{const sz=['min',22,['+',7,['*',2.5,['get','n']]]],sz2=['min',28,['+',13,['*',2.5,['get','n']]]];
    map.addSource('pts',{type:'geojson',data:fc()});
    map.addLayer({id:'mem',type:'circle',source:'pts',filter:['==',['get','kind'],'mem'],paint:{'circle-radius':sz2,'circle-color':'#ee4408','circle-stroke-color':'#fff','circle-stroke-width':2,'circle-opacity':.95}});
    map.addLayer({id:'halo',type:'circle',source:'pts',filter:['==',['get','kind'],'on'],paint:{'circle-radius':14,'circle-color':'#2563ff','circle-opacity':.4}});
    map.addLayer({id:'on',type:'circle',source:'pts',filter:['==',['get','kind'],'on'],paint:{'circle-radius':sz,'circle-color':'#2563ff','circle-stroke-color':'#fff','circle-stroke-width':2}});
    ['mem','on'].forEach(l=>{map.on('click',l,e=>{const p=e.features[0].properties;new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML('<b>'+esc(p.name)+'</b><br>'+p.n+(l==='on'?' online now':' ideas')).addTo(map)});map.on('mouseenter',l,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',l,()=>map.getCanvas().style.cursor='')});
    mapReady=true;const my=++pulseT;const loop=t=>{if(!map||my!==pulseT)return;const ph=(t/1500)%1;try{map.setPaintProperty('halo','circle-radius',12+ph*30);map.setPaintProperty('halo','circle-opacity',.5*(1-ph))}catch(e){}requestAnimationFrame(loop)};requestAnimationFrame(loop);
    paintHome()});
  }catch(e){const m=$('#map');if(m)m.innerHTML='<p class="mu" style="padding:16px">Map could not load.</p>'}}
boot();

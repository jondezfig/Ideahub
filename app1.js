const SB_URL='https://ghamjcltjcvxhrnkfhvl.supabase.co',SB_KEY='sb_publishable_f5YstFQIchLU2KTV_BGKtg_lrFuO85l',APP='IdeaHub';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.title=APP;$('#app').textContent=APP;
const CITIES="London,51.5,-0.1;Paris,48.9,2.4;Berlin,52.5,13.4;Madrid,40.4,-3.7;Rome,41.9,12.5;Amsterdam,52.4,4.9;Istanbul,41,29;Moscow,55.8,37.6;Dubai,25.2,55.3;Cairo,30,31.2;Lagos,6.5,3.4;Nairobi,-1.3,36.8;Johannesburg,-26.2,28;Accra,5.6,-0.2;Mumbai,19.1,72.9;Delhi,28.6,77.2;Bengaluru,13,77.6;Dhaka,23.8,90.4;Bangkok,13.8,100.5;Singapore,1.35,103.8;Jakarta,-6.2,106.8;Hong Kong,22.3,114.2;Shanghai,31.2,121.5;Tokyo,35.7,139.7;Seoul,37.6,127;Sydney,-33.9,151.2;Auckland,-36.8,174.8;New York,40.7,-74;Toronto,43.7,-79.4;Chicago,41.9,-87.6;Los Angeles,34,-118.2;San Francisco,37.8,-122.4;Mexico City,19.4,-99.1;Bogota,4.7,-74.1;Sao Paulo,-23.5,-46.6;Buenos Aires,-34.6,-58.4".split(';').map(x=>{const a=x.split(',');return[a[0],+a[1],+a[2]]});
const sb=SB_URL.startsWith('YOUR_')?null:supabase.createClient(SB_URL,SB_KEY);
let me,prof,tab='feed',posts=[],people={},fr=[],room='community',msgs=[],q='',pend={},openC={},online={},started='',chans=[],map=null;
const nm=p=>p?(p.username?'@'+p.username:p.full_name||'Someone'):'Someone';
const av=p=>p&&p.avatar_url?`<img class="av" src="${esc(p.avatar_url)}" alt="">`:`<div class="av">${esc((nm(p)[1]||nm(p)[0]||'?').toUpperCase())}</div>`;
const ago=t=>{const s=(Date.now()-new Date(t))/1000;return s<10?'just now':s<60?Math.floor(s)+'s ago':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'};
const tm=t=>`<span data-ts="${t}" title="${new Date(t).toLocaleString()}">${ago(t)}</span>`;
const toast=t=>{const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)};
const att=u=>u?`<img class="pic" src="${esc(u)}" loading="lazy" alt="">`:'';
const dmRoom=id=>'dm_'+[me.id,id].sort().join('_');
const friends=()=>fr.filter(f=>f.status==='accepted').map(f=>f.a===me.id?f.b:f.a);

/* ---------- boot & auth ---------- */
async function boot(){
  if(!sb){$('#main').innerHTML='<div class="card">Open <b>index.html</b> and paste your Supabase URL and anon key at the top of the script (see README).</div>';return}
  sb.auth.onAuthStateChange((_e,s)=>{const id=s&&s.user?s.user.id:'';if(id!==started)start(s)});
  const{data:{session}}=await sb.auth.getSession();if((session?session.user.id:'')!==started)start(session);
}
function loginView(){
  $('#hd').innerHTML=`<span class="logo">💡 ${esc(APP)}</span>`;
  $('#main').innerHTML=`<div class="center"><h1 class="big">Where good ideas find their people.</h1><p class="mu" style="font-size:17px">Share ideas, chat with people worldwide and make friends. Free.</p>
  <button class="btn cta" data-act="google">Continue with Google</button><div class="mu" style="margin:10px 0">or use your email</div>
  <input id="em" type="email" placeholder="you@email.com"><button class="btn g cta" data-act="magic">Email me a sign-in link</button><div class="mu" style="margin-top:16px"><span class="dot"></span><b id="lcl">0</b> people here right now</div></div>`;
}
async function start(session){
  closeChans();me=session&&session.user;started=me?me.id:'';
  if(!me){loginView();goLive((crypto.randomUUID?crypto.randomUUID():String(Math.random())),'Visitor');return}
  let r;for(let i=0;i<5&&!(r=(await sb.from('profiles').select('*').eq('id',me.id).maybeSingle()).data);i++)await new Promise(k=>setTimeout(k,500));
  prof=r;if(!prof){$('#main').innerHTML='<div class="card">Profile setup failed. Did you run schema.sql?</div>';return}
  if(!prof.username)return claimView();
  await Promise.all([loadPeople(),loadPosts(),loadFr()]);shell();subscribe();goLive(me.id,nm(prof));
}
function claimView(){
  $('#hd').innerHTML=`<span class="logo">💡 ${esc(APP)}</span><button class="btn g" style="margin-left:auto" data-act="out">Sign out</button>`;
  $('#main').innerHTML=`<div class="center"><h1 class="big">Pick your username</h1><p class="mu">Unique to you. Nobody else can take it.</p><input id="un" placeholder="e.g. idea_wizard" maxlength="20"><button class="btn cta" data-act="claim">Join →</button></div>`;
}

/* ---------- data ---------- */
const PJ='profiles(username,full_name,avatar_url)';
async function loadPeople(){const{data}=await sb.from('profiles').select('*').not('username','is',null).limit(500);people={};(data||[]).forEach(p=>people[p.id]=p)}
async function loadPosts(){const{data}=await sb.from('posts').select(`*,${PJ},likes(user_id),comments(id,body,created_at,user_id,${PJ})`).order('created_at',{ascending:false}).limit(60);posts=data||[];if(tab==='feed')paintFeed()}
async function loadFr(){const{data}=await sb.from('friendships').select('*');fr=data||[];if(tab==='people')paintPeople();if(tab==='chat')shellChat()}
async function loadMsgs(){const{data}=await sb.from('messages').select(`*,${PJ}`).eq('room',room).order('created_at',{ascending:false}).limit(100);msgs=(data||[]).reverse();paintMsgs()}
function closeChans(){chans.forEach(c=>sb.removeChannel(c));chans=[]}
function subscribe(){
  const d=(t,f)=>sb.channel('db_'+t).on('postgres_changes',{event:'*',schema:'public',table:t},f).subscribe();
  chans.push(d('posts',loadPosts),d('comments',loadPosts),d('likes',loadPosts),d('friendships',loadFr));
  chanMsgs();
}
let mch=null;
function chanMsgs(){if(mch)sb.removeChannel(mch);mch=sb.channel('msg_'+room).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'room=eq.'+room},p=>{const m=p.new;m.profiles=people[m.user_id]||null;msgs.push(m);if(tab==='chat')paintMsgs()}).subscribe()}
let geo=null,spin=false,mapReady=false,pulseT=0;
const tzCity=()=>{const z=(Intl.DateTimeFormat().resolvedOptions().timeZone||'').split('/'),n=(z[z.length-1]||'').replace(/_/g,' ');return CITIES.find(x=>x[0].toLowerCase()===n.toLowerCase())||[n||'Somewhere',20,0]};
async function locate(){
  const c=CITIES.find(x=>prof&&x[0]===prof.city);if(c)return{place:c[0],lat:c[1],lng:c[2]};
  if(geo)return geo;
  try{const j=await(await fetch('https://get.geojs.io/v1/ip/geo.json')).json();if(j.latitude)return geo={place:j.city||j.region||j.country||'Somewhere',lat:+j.latitude,lng:+j.longitude}}catch(e){}
  const t=tzCity();return geo={place:t[0],lat:t[1],lng:t[2]}}
function goLive(key,name){const ch=sb.channel('online',{config:{presence:{key}}});
  ch.on('presence',{event:'sync'},()=>{online=ch.presenceState();const n=Object.keys(online).length;['#lc','#lcl'].forEach(i=>$(i)&&($(i).textContent=n));if(tab==='live'&&me)paintLive()})
   .subscribe(async s=>{if(s==='SUBSCRIBED'){const g=await locate();await ch.track({name,place:g.place,lat:g.lat,lng:g.lng})}});chans.push(ch)}

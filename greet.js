(function(){
const W="JP:友達;CN:朋友;TW:朋友;HK:朋友;KR:친구;ES:amigo;MX:amigo;AR:amigo;CO:amigo;CL:amigo;PE:amigo;VE:amigo;PT:amigo;BR:amigo;FR:ami;BE:ami;DE:Freund;AT:Freund;CH:Freund;IT:amico;NL:vriend;SE:vän;NO:venn;DK:ven;FI:ystävä;PL:przyjacielu;CZ:příteli;GR:φίλε;RU:друг;UA:друже;BG:приятелю;RO:prietene;HU:barátom;HR:prijatelju;RS:prijatelju;TR:arkadaşım;SA:صديقي;AE:صديقي;EG:صديقي;MA:صديقي;IN:दोस्त;PK:دوست;BD:বন্ধু;IR:دوست;IL:חבר;ID:teman;MY:kawan;TH:เพื่อน;VN:bạn;PH:kaibigan;KE:rafiki;TZ:rafiki".split(';').reduce((o,x)=>{const i=x.indexOf(':');o[x.slice(0,i)]=x.slice(i+1);return o},{});
let info=null;
const hello=()=>{const h=new Date().getHours();return h<5?'Hello':h<12?'Good morning':h<18?'Good afternoon':'Good evening'};
const text=()=>{const w=W[info.cc]||'friend',f=info.city||info.country;return `${hello()}, <bdi>${esc(w)}</bdi>${f?' from '+esc(f):''} 👋`};
function ensure(){if(!info)return;
  const hs=$('#hs');if(hs&&!hs.querySelector('.greet')){const d=document.createElement('div');d.className='greet mu';d.style.cssText='font-size:15px;margin-bottom:8px';d.innerHTML=text();hs.prepend(d)}
  const c=$('#main .center');if(c&&$('#lcl')&&!c.querySelector('.greet')){const d=document.createElement('div');d.className='greet';d.style.cssText='font-size:18px;font-weight:600;margin-bottom:6px';d.innerHTML=text()+' <span class="mu">Welcome to '+esc(APP)+'.</span>';c.prepend(d)}}
fetch('https://get.geojs.io/v1/ip/geo.json').then(r=>r.json()).then(j=>{info={cc:(j.country_code||'').toUpperCase(),city:j.city||'',country:j.country||''};ensure()}).catch(()=>{});
new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true});
})();

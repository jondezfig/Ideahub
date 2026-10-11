(function(){
const OWNER='Jon',PHOTOS=[]; /* later: PHOTOS=['p1.jpg','p2.jpg','p3.jpg'] and upload them to the repo */
let seen=false;try{seen=sessionStorage.getItem('intro')}catch(e){}
if(seen||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
const st=document.createElement('style');
st.textContent="#intro{position:fixed;inset:0;z-index:100;background:#f7f7f7;color:#111;display:grid;place-items:center;text-align:center;padding:24px;font-family:Inter,system-ui,sans-serif;transition:opacity .5s,visibility .5s;cursor:pointer;overflow:hidden}#intro.off{opacity:0;visibility:hidden}#intro .bar{position:absolute;top:0;left:0;height:3px;background:#111;width:0;transition:width linear}#intro .s{animation:iin .7s both}#intro .s.out{animation:iout .4s both}#intro .t{font-size:clamp(34px,10vw,64px);font-weight:800;letter-spacing:-.04em;line-height:1.05;max-width:620px}@keyframes iin{from{opacity:0;filter:blur(10px);transform:translateY(16px)}to{opacity:1;filter:none;transform:none}}@keyframes iout{to{opacity:0;filter:blur(10px);transform:translateY(-10px)}}#intro .o{color:#ee4408}#intro .u{text-decoration:underline;text-decoration-color:#ee4408;text-decoration-thickness:6px;text-underline-offset:6px}#intro .wm{font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;font-weight:900;font-size:clamp(64px,24vw,130px);line-height:.88;letter-spacing:-.02em;margin-top:16px;animation:iin .7s .5s both}#intro .dog{width:130px;height:130px;object-fit:contain;display:block;margin:0 auto;animation:bob 1.2s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-8px) rotate(-3deg)}}#intro .ld{margin-top:18px;color:#8a8a8a;font-size:18px;font-weight:500}#intro .stack{position:absolute;bottom:-70px;left:50%;width:300px;height:260px;margin-left:-150px;animation:iin .8s both}#intro .stack img{position:absolute;width:200px;height:200px;object-fit:cover;background:#fff;padding:10px 10px 34px;box-shadow:0 14px 30px #0003}#intro .skip{position:absolute;bottom:22px;left:0;right:0;font-size:12px;color:#aaa}";
document.head.appendChild(st);
const root=document.createElement('div');root.id='intro';root.innerHTML='<div class="bar"></div><div class="skip">Tap to skip</div>';
document.body.insertBefore(root,document.body.firstChild);
const S=[
 {h:'<div class="dw"></div><div class="ld">Loading experience…</div>',ms:1900,after:r=>{const i=new Image();i.className='dog';i.alt='';i.onerror=()=>{const d=document.createElement('div');d.className='dog';d.style.cssText='font-size:96px;line-height:130px';d.textContent='🐶';i.replaceWith(d)};i.src='dog.png';r.querySelector('.dw').appendChild(i)}},
 {h:'Hi, I am '+OWNER,ms:1500,t:1},
 {h:'I\'m hosting a <span class="o">free</span> creative mind community',ms:2500,t:1,p:1},
 {h:'It\'s called…<div class="wm">IDEA<br>HUB</div>',ms:2700,t:1},
 {h:'I need your help to figure out <span class="u">ideas</span>',ms:2500,t:1},
 {h:'It\'ll be fun',ms:1700,t:1}];
const total=S.reduce((a,s)=>a+s.ms+380,0);
let i=0,done=false,stack=null;
function end(){if(done)return;done=true;try{sessionStorage.setItem('intro','1')}catch(e){}root.classList.add('off');setTimeout(()=>{root.remove();st.remove()},700)}
function next(){if(done)return;if(i>=S.length)return end();const s=S[i++],el=document.createElement('div');el.className='s'+(s.t?' t':'');el.innerHTML=s.h;root.appendChild(el);if(s.after)s.after(el);
  if(s.p&&PHOTOS.length&&!stack){stack=document.createElement('div');stack.className='stack';const rot=[-6,5,-1],lf=[0,80,40],tp=[0,14,34];stack.innerHTML=PHOTOS.slice(0,3).map((p,k)=>`<img src="${p}" alt="" style="left:${lf[k]}px;top:${tp[k]}px;transform:rotate(${rot[k]}deg)">`).join('');root.appendChild(stack)}
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();next()},380)},s.ms)}
root.onclick=end;
const bar=root.querySelector('.bar');requestAnimationFrame(()=>{bar.style.transitionDuration=total+'ms';bar.style.width='100%'});
next();
})();

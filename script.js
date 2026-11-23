const WORLDS=[
 {id:'add',name:'Adição',sym:'+',icon:'🌱'},
 {id:'sub',name:'Subtração',sym:'−',icon:'🏔️'},
 {id:'mul',name:'Multiplicação',sym:'×',icon:'🌋'},
 {id:'div',name:'Divisão',sym:'÷',icon:'❄️'}];
const GOAL=10, LIVES=3;
const $=id=>document.getElementById(id);
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
let unlocked=1, best={}, G=null;

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id))}

function menu(){
  $('worlds').innerHTML='';
  WORLDS.forEach((w,i)=>{
    const b=document.createElement('button');b.className='world';b.disabled=i>=unlocked;
    const st=best[w.id]?'★'.repeat(best[w.id])+'☆'.repeat(3-best[w.id]):(i>=unlocked?'🔒 Bloqueada':'☆☆☆');
    b.innerHTML=`${w.icon}<b>${w.name} ${w.sym}</b>${st}`;
    b.onclick=()=>start(i);$('worlds').appendChild(b);
  });
  show('s-menu');
}

function makeQ(op,t){
  let a,b,ans,txt;
  if(op==='add'){const r=[[1,10],[10,60],[50,300]][t-1];a=rnd(...r);b=rnd(...r);ans=a+b;txt=`${a} + ${b}`}
  else if(op==='sub'){const r=[[5,20],[20,99],[100,500]][t-1];a=rnd(...r);b=rnd(Math.floor(r[0]/2),a);ans=a-b;txt=`${a} − ${b}`}
  else if(op==='mul'){const r=[[2,5],[3,9],[6,12]][t-1];a=rnd(...r);b=rnd(t===1?1:2,t===3?12:10);ans=a*b;txt=`${a} × ${b}`}
  else{const r=[[2,5],[2,9],[6,12]][t-1];b=rnd(...r);const q=rnd(t===1?1:2,t===3?12:10);a=b*q;ans=q;txt=`${a} ÷ ${b}`}
  const set=new Set([ans]);
  const near=[1,2,10,b||1,-1,-2,-10];
  let guard=0;
  while(set.size<4&&guard++<50){
    let d=ans+near[rnd(0,near.length-1)]*(rnd(0,1)?1:-1);
    if(d<0)d=ans+rnd(1,5);
    set.add(d);
  }
  let n=1;while(set.size<4)set.add(ans+n++);
  return{txt,ans,opts:[...set].sort(()=>Math.random()-.5)};
}

function start(i){
  G={w:WORLDS[i],i,step:0,hearts:LIVES,score:0,streak:0,miss:0,tier:1,q:null,lock:false};
  show('s-game');nextQ();hud();
}

function hud(){
  $('h-world').textContent=`${G.w.icon} ${G.w.name}`;
  $('h-hearts').textContent='❤️'.repeat(G.hearts)+'🖤'.repeat(LIVES-G.hearts);
  $('h-score').textContent=`⭐ ${G.score}`;
  $('h-score').classList.remove('bump');void $('h-score').offsetWidth;$('h-score').classList.add('bump');
  $('h-streak').textContent=`🔥 ${G.streak}`;
  $('h-tier').textContent=`Nível ${G.tier} de 3 · passo ${G.step} de ${GOAL}`;
  $('bar').style.width=(G.step/GOAL*100)+'%';
  const track=document.querySelector('.mount').clientHeight-70;
  $('fox').style.bottom=(8+G.step/GOAL*track)+'px';
}

function nextQ(){
  G.lock=false;G.q=makeQ(G.w.id,G.tier);
  $('question').textContent=G.q.txt+' = ?';
  $('msg').textContent='';$('msg').className='msg';$('next').hidden=true;
  const o=$('opts');o.innerHTML='';
  G.q.opts.forEach((v,k)=>{
    const b=document.createElement('button');b.className='opt';b.textContent=v;b.dataset.v=v;
    b.setAttribute('aria-label',`Opção ${k+1}: ${v}`);b.onclick=()=>answer(v);o.appendChild(b);
  });
}

function anim(cls){const f=$('fox');f.classList.remove('hop','slip');void f.offsetWidth;f.classList.add(cls)}

function answer(v){
  if(G.lock)return;G.lock=true;
  const ok=v===G.q.ans;
  document.querySelectorAll('.opt').forEach(b=>{
    b.disabled=true;
    if(+b.dataset.v===G.q.ans)b.classList.add('ok');
    else if(+b.dataset.v===v)b.classList.add('no');
  });
  const m=$('msg');
  if(ok){
    G.streak++;G.miss=0;G.step++;
    const pts=10*G.tier+Math.min(G.streak,5)*2;G.score+=pts;
    m.textContent=`Isso! +${pts} pontos. A raposa subiu um passo!`;m.className='msg ok';anim('hop');
    if(G.streak%3===0&&G.tier<3){G.tier++;m.textContent+=' Subiu para o nível '+G.tier+'!'}
  }else{
    G.streak=0;G.miss++;G.hearts--;G.step=Math.max(0,G.step-1);
    m.textContent=`Quase! ${G.q.txt} = ${G.q.ans}. A raposa escorregou.`;m.className='msg no';anim('slip');
    if(G.miss>=2&&G.tier>1){G.tier--;G.miss=0;m.textContent+=' Vamos reforçar no nível '+G.tier+'.'}
  }
  hud();
  setTimeout(()=>{
    if(G.step>=GOAL)return end(true);
    if(G.hearts<=0)return end(false);
    $('next').hidden=false;$('next').focus();
  },ok?700:900);
}

function end(win){
  show('s-end');
  if(win){
    const stars=G.hearts>=3?3:G.hearts===2?2:1;
    best[G.w.id]=Math.max(best[G.w.id]||0,stars);
    if(G.i+1===unlocked&&unlocked<WORLDS.length)unlocked++;
    $('e-icon').textContent='🏆';
    $('e-title').textContent='Topo da montanha!';
    $('e-text').textContent=`${'★'.repeat(stars)}${'☆'.repeat(3-stars)} · ${G.score} pontos. `+(G.i+1<WORLDS.length?`Nova montanha liberada: ${WORLDS[G.i+1].name}.`:'Você conquistou todas as montanhas!');
  }else{
    $('e-icon').textContent='🪂';
    $('e-title').textContent='A raposa caiu!';
    $('e-text').textContent=`Você fez ${G.score} pontos. Tente de novo, cada tentativa ensina algo.`;
  }
}

$('next').onclick=nextQ;
$('e-again').onclick=()=>start(G.i);
$('e-menu').onclick=menu;
$('theme').onclick=()=>{
  const r=document.documentElement;
  const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  r.dataset.theme=dark?'light':'dark';
};
addEventListener('keydown',e=>{
  if(!$('s-game').classList.contains('on'))return;
  if(e.key>='1'&&e.key<='4'&&G&&!G.lock){const b=document.querySelectorAll('.opt')[+e.key-1];if(b)b.click()}
  else if((e.key==='Enter')&&!$('next').hidden&&document.activeElement!==$('next'))$('next').click();
});
addEventListener('resize',()=>{if(G&&$('s-game').classList.contains('on'))hud()});
menu();

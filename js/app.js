/* UTech CTF Hub - Application Logic */
/* =================================== */

// ── STATE ────────────────────────────────────────────────────
var S={catF:'all',diffF:'all',curCh:null,jScore:0,jAns:{},curJCell:null,curQuiz:null,qIdx:0,qScore:0,qAnsed:false,pts:1337};

// ── NAVIGATION ───────────────────────────────────────────────
function go(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('pg-'+id).classList.add('active');
  var nb=document.getElementById('nb-'+id);
  if(nb) nb.classList.add('active');
  if(id==='challenges') renderChallenges();
  if(id==='scoreboard') renderScoreboard();
  if(id==='jeopardy'&&!document.getElementById('jeop-tbl').innerHTML) renderJeopardy();
  if(id==='quizzes') renderQuizGrid();
  if(id==='learn') renderTracks();
  if(id==='profile') renderProfile();
  if(id==='admin') renderAdminChs();
}

// ── UTILITIES ────────────────────────────────────────────────
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
function badge(cls,text){var b=el('span','badge '+cls);b.textContent=text;return b;}
function diffClass(d){return d==='beginner'?'b-easy':d==='intermediate'?'b-med':'b-hard';}

var toastT;
function toast(msg,type){
  var t=document.getElementById('toast');
  var icons={ok:'✓',err:'✕',info:'ℹ'};
  document.getElementById('t-icon').textContent=icons[type]||'●';
  document.getElementById('t-msg').textContent=msg;
  t.className='toast show '+(type||'ok');
  clearTimeout(toastT);
  toastT=setTimeout(function(){t.className='toast';},3000);
}

// ── LEARN ────────────────────────────────────────────────────
function renderTracks(){
  var g=document.getElementById('track-grid');
  if(g.children.length) return;
  TRACKS.forEach(function(t,i){
    var card=el('div','track-card');
    card.onclick=function(){openTopic(i);};
    var top=el('div','tc-top');
    var icon=el('div','tc-icon'); icon.textContent=t.icon;
    top.appendChild(icon);
    top.appendChild(badge(diffClass(t.diff),t.diff));
    card.appendChild(top);
    card.appendChild(el('div','tc-title',t.title));
    card.appendChild(el('div','tc-desc',t.desc));
    var foot=el('div','tc-foot');
    foot.appendChild(el('span','tc-pct',t.challenges+' challenges'));
    var bar=el('div','tc-bar'); var fill=el('div','tc-fill'); fill.style.width=t.progress+'%'; bar.appendChild(fill); foot.appendChild(bar);
    foot.appendChild(el('span','tc-pct',t.progress+'%'));
    card.appendChild(foot);
    g.appendChild(card);
  });
}

function openTopic(i){
  var t=TRACKS[i];
  document.getElementById('tp-title').textContent=t.icon+' '+t.title;
  var bl=document.getElementById('tp-bullets'); bl.innerHTML='';
  t.bullets.forEach(function(b){var li=el('li','',b);bl.appendChild(li);});
  var ex=document.getElementById('tp-examples'); ex.innerHTML='';
  t.examples.forEach(function(e){var d=el('div','ex-box');d.textContent=e;ex.appendChild(d);});
  var qz=document.getElementById('tp-quizzes'); qz.innerHTML='';
  t.quizzes.forEach(function(q){
    var box=el('div','qcheck');
    box.appendChild(el('p','',q.q));
    var opts=el('div','qc-opts');
    q.opts.forEach(function(o,oi){
      var btn=el('button','qc-opt',o);
      (function(b,chosen,correct){b.onclick=function(){ansTopicQ(b,chosen,correct,opts);};})(btn,oi,q.a);
      opts.appendChild(btn);
    });
    box.appendChild(opts);
    qz.appendChild(box);
  });
  var rc=document.getElementById('tp-recs'); rc.innerHTML='';
  t.recs.forEach(function(r){
    var p=el('div','rec-pill',r+' →');
    (function(title){p.onclick=function(){goToCh(title);};})(r);
    rc.appendChild(p);
  });
  var panel=document.getElementById('topic-panel');
  panel.classList.add('open');
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}

function closeTopic(){document.getElementById('topic-panel').classList.remove('open');}

function ansTopicQ(btn,chosen,correct,optsEl){
  optsEl.querySelectorAll('.qc-opt').forEach(function(b){b.disabled=true;});
  btn.classList.add(chosen===correct?'correct':'wrong');
  if(chosen!==correct) optsEl.querySelectorAll('.qc-opt')[correct].classList.add('correct');
}

function goToCh(title){
  go('challenges');
  setTimeout(function(){
    document.getElementById('ch-search').value=title;
    renderChallenges();
  },100);
}

// ── CHALLENGES ───────────────────────────────────────────────
function setCat(btn){
  document.querySelectorAll('[data-cat]').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on'); S.catF=btn.dataset.cat; renderChallenges();
}
function setDiff(btn){
  document.querySelectorAll('[data-diff]').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on'); S.diffF=btn.dataset.diff; renderChallenges();
}

function renderChallenges(){
  var q=(document.getElementById('ch-search')||{value:''}).value.toLowerCase();
  var grid=document.getElementById('ch-grid'); grid.innerHTML='';
  CHALLENGES.filter(function(c){
    if(S.catF!=='all'&&c.cat!==S.catF) return false;
    if(S.diffF!=='all'&&c.diff!==S.diffF) return false;
    if(q&&!c.title.toLowerCase().includes(q)&&!c.desc.toLowerCase().includes(q)) return false;
    return true;
  }).forEach(function(c){
    var card=el('div','ch-card'+(c.solved?' solved':''));
    card.onclick=function(){openCh(c.id);};
    if(c.solved){var st=el('div','solved-tag','✓ SOLVED');card.appendChild(st);}
    var cats=el('div','cc-cats');
    cats.appendChild(badge('b-cat',c.cat));
    cats.appendChild(badge(diffClass(c.diff),c.diff));
    card.appendChild(cats);
    card.appendChild(el('div','cc-name',c.title));
    card.appendChild(el('div','cc-desc',c.desc));
    var foot=el('div','cc-foot');
    var pts=el('div','cc-pts'); pts.textContent=c.pts; var sub=el('sub','','pts'); pts.appendChild(sub); foot.appendChild(pts);
    var right=el('div'); right.style.cssText='display:flex;align-items:center;gap:8px';
    right.appendChild(el('div','cc-solves',c.solves+' solves'));
    var pips=el('div','pips');
    ['e','m','h'].forEach(function(cls,n){
      var p=el('div','pip');
      if((n===0)||(n===1&&(c.diff==='intermediate'||c.diff==='advanced'))||(n===2&&c.diff==='advanced')) p.classList.add(cls);
      pips.appendChild(p);
    });
    right.appendChild(pips); foot.appendChild(right);
    card.appendChild(foot);
    grid.appendChild(card);
  });
}

function openCh(id){
  var c=CHALLENGES.find(function(x){return x.id===id;});
  S.curCh=c;
  document.getElementById('m-title').textContent=c.title;
  var meta=document.getElementById('m-meta'); meta.innerHTML='';
  meta.appendChild(badge('b-cat',c.cat));
  meta.appendChild(badge(diffClass(c.diff),c.diff));
  meta.appendChild(badge('b-amber',c.pts+' pts'));
  if(c.solved) meta.appendChild(badge('b-easy','✓ SOLVED'));
  document.getElementById('m-scenario').textContent=c.scenario;
  var fsec=document.getElementById('m-files-sec');
  var fbox=document.getElementById('m-files'); fbox.innerHTML='';
  if(c.files.length){
    fsec.style.display='block';
    c.files.forEach(function(f){
      var row=el('div','file-row');
      row.appendChild(el('span','','📄'));
      var info=el('div');
      info.appendChild(el('div','file-name',f.name));
      info.appendChild(el('div','file-sz',f.size));
      row.appendChild(info);
      var dlbtn=el('button','btn btn-cyan','Download');
      dlbtn.style.cssText='margin-left:auto;padding:5px 10px;font-size:9px';
      (function(name){dlbtn.onclick=function(){toast('Downloading '+name+'...','info');};})(f.name);
      row.appendChild(dlbtn);
      fbox.appendChild(row);
    });
  } else {fsec.style.display='none';}
  document.getElementById('flag-inp').value='';
  var hb=document.getElementById('hint-box');
  hb.classList.remove('open'); hb.textContent=c.hint;
  var ll=document.getElementById('m-learned'); ll.innerHTML='';
  c.learned.forEach(function(l){ll.appendChild(el('li','',l));});
  document.getElementById('ch-overlay').classList.add('open');
}

function closeModal(){
  document.getElementById('ch-overlay').classList.remove('open');
  document.getElementById('hint-box').classList.remove('open');
}

function submitFlag(){
  var inp=document.getElementById('flag-inp').value.trim();
  var c=S.curCh;
  if(!inp){toast('Enter a flag first','info');return;}
  if(inp===c.flag){
    if(!c.solved){
      c.solved=true; S.pts+=c.pts;
      document.getElementById('hpts').textContent=S.pts.toLocaleString()+' pts';
      toast('Correct! +'+c.pts+' pts','ok');
    } else {toast('Already solved!','info');}
    closeModal(); renderChallenges();
  } else {toast('Wrong flag. Try again.','err');}
}

function toggleHint(){document.getElementById('hint-box').classList.toggle('open');}

// ── JEOPARDY ─────────────────────────────────────────────────
function renderJeopardy(){
  var tbl=document.getElementById('jeop-tbl');
  var thead=document.createElement('thead');
  var hrow=document.createElement('tr');
  hrow.appendChild(document.createElement('th'));
  JCATS.forEach(function(c){var th=document.createElement('th');th.textContent=c;hrow.appendChild(th);});
  thead.appendChild(hrow); tbl.appendChild(thead);
  var tbody=document.createElement('tbody');
  [100,200,300,400,500].forEach(function(pts){
    var tr=document.createElement('tr');
    var ptd=document.createElement('td');
    ptd.style.cssText='font-family:var(--mono);font-size:11px;color:var(--text2);padding:0 12px;text-align:center';
    ptd.textContent=pts; tr.appendChild(ptd);
    JCATS.forEach(function(cat){
      var key=cat+'_'+pts;
      var td=el('td','jcell'+(S.jAns[key]?' done':''));
      var span=el('span','jval p'+pts);
      span.textContent=S.jAns[key]?'✓':pts;
      td.appendChild(span);
      if(!S.jAns[key])(function(c,p){td.onclick=function(){openJQ(c,p);};})(cat,pts);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
}

function openJQ(cat,pts){
  var key=cat+'_'+pts;
  if(S.jAns[key]) return;
  S.curJCell={cat:cat,pts:pts,key:key};
  var q=JQ[cat][pts];
  document.getElementById('jq-cat').textContent=cat;
  document.getElementById('jq-pts').textContent=pts+' pts';
  document.getElementById('jq-text').textContent=q.q;
  var optsEl=document.getElementById('jq-opts'); optsEl.innerHTML='';
  q.opts.forEach(function(o,i){
    var btn=el('button','jopt',o);
    (function(chosen){btn.onclick=function(){ansJQ(chosen);};})(i);
    optsEl.appendChild(btn);
  });
  var res=document.getElementById('jresult'); res.style.display='none'; res.className='jresult';
  document.getElementById('j-close').disabled=true;
  document.getElementById('jmodal').classList.add('open');
}

function ansJQ(chosen){
  var _=S.curJCell; var q=JQ[_.cat][_.pts];
  var opts=document.querySelectorAll('.jopt');
  opts.forEach(function(b){b.disabled=true;});
  var ok=chosen===q.a;
  opts[chosen].classList.add(ok?'correct':'wrong');
  if(!ok) opts[q.a].classList.add('correct');
  var res=document.getElementById('jresult'); res.style.display='block';
  if(ok){
    S.jScore+=_.pts; S.pts+=_.pts;
    document.getElementById('jscore').textContent=S.jScore;
    document.getElementById('hpts').textContent=S.pts.toLocaleString()+' pts';
    res.className='jresult win'; res.textContent='Correct! +'+_.pts+' pts';
  } else {res.className='jresult lose'; res.textContent='Incorrect. Answer: '+q.opts[q.a];}
  S.jAns[_.key]=true;
  document.getElementById('j-close').disabled=false;
}

function closeJeop(){
  document.getElementById('jmodal').classList.remove('open');
  document.getElementById('jeop-tbl').innerHTML='';
  renderJeopardy();
}

// ── QUIZZES ──────────────────────────────────────────────────
function renderQuizGrid(){
  var g=document.getElementById('quiz-grid');
  if(g.children.length) return;
  QUIZZES.forEach(function(q){
    var card=el('div','qz-card');
    (function(qid){card.onclick=function(){startQuiz(qid);};})(q.id);
    card.appendChild(el('div','qz-icon',q.icon));
    card.appendChild(el('div','qz-title',q.title));
    card.appendChild(el('div','qz-desc',q.desc));
    var meta=el('div','qz-meta');
    meta.appendChild(el('div','qz-q',q.questions.length+' questions'));
    meta.appendChild(el('div','qz-pts','+'+q.pts+' pts on completion'));
    card.appendChild(meta);
    g.appendChild(card);
  });
}

function startQuiz(id){
  var q=QUIZZES.find(function(x){return x.id===id;});
  S.curQuiz=q; S.qIdx=0; S.qScore=0; S.qAnsed=false;
  document.getElementById('qa-title').textContent=q.title;
  document.getElementById('quiz-grid').style.display='none';
  var qa=document.getElementById('qactive'); qa.classList.add('open');
  document.getElementById('qresult').style.display='none';
  document.getElementById('aq-box').style.display='block';
  renderQ();
}

function renderQ(){
  var q=S.curQuiz; var qi=S.qIdx; var cur=q.questions[qi];
  document.getElementById('qa-num').textContent='Q '+(qi+1)+'/'+q.questions.length;
  document.getElementById('qa-bar').style.width=(((qi+1)/q.questions.length)*100)+'%';
  document.getElementById('qa-score').textContent='Score: '+S.qScore;
  document.getElementById('aq-text').textContent=cur.q;
  var opts=document.getElementById('aq-opts'); opts.innerHTML='';
  cur.opts.forEach(function(o,i){
    var btn=el('button','aopt',o);
    (function(chosen){btn.onclick=function(){ansQ(chosen);};})(i);
    opts.appendChild(btn);
  });
  document.getElementById('aq-fb').style.display='none';
  document.getElementById('aq-next').style.display='none';
  S.qAnsed=false;
}

function ansQ(chosen){
  if(S.qAnsed) return; S.qAnsed=true;
  var cur=S.curQuiz.questions[S.qIdx];
  var opts=document.querySelectorAll('.aopt');
  opts.forEach(function(b){b.disabled=true;});
  var ok=chosen===cur.a;
  opts[chosen].classList.add(ok?'correct':'wrong');
  if(!ok) opts[cur.a].classList.add('correct');
  if(ok) S.qScore++;
  var fb=document.getElementById('aq-fb');
  fb.className='qfeedback '+(ok?'ok':'bad');
  fb.textContent=(ok?'✓ Correct! ':'✗ Incorrect. ')+cur.exp;
  fb.style.display='block';
  var total=S.curQuiz.questions.length;
  if(S.qIdx<total-1){document.getElementById('aq-next').style.display='block';}
  else {setTimeout(showQResult,1200);}
}

function nextQ(){S.qIdx++;renderQ();}

function showQResult(){
  document.getElementById('aq-box').style.display='none';
  var total=S.curQuiz.questions.length; var s=S.qScore;
  document.getElementById('res-big').textContent=s+'/'+total;
  var msgs=['Keep studying — review the Learn section!','Good effort — review missed questions.','Nice work! You know your stuff.','Excellent! Top marks!','Perfect score!'];
  var mi=s===total?4:s>=total*.8?3:s>=total*.6?2:s>=total*.4?1:0;
  document.getElementById('res-msg').textContent=msgs[mi];
  if(s>=6){S.pts+=S.curQuiz.pts;document.getElementById('hpts').textContent=S.pts.toLocaleString()+' pts';toast('Quiz complete! +'+S.curQuiz.pts+' pts','ok');}
  document.getElementById('qresult').style.display='block';
}

function exitQuiz(){
  S.curQuiz=null;
  document.getElementById('qactive').classList.remove('open');
  document.getElementById('quiz-grid').style.display='grid';
}

// ── SCOREBOARD ───────────────────────────────────────────────
function renderScoreboard(){
  var max=LEADERBOARD[0].pts;
  var pod=document.getElementById('podium'); pod.innerHTML='';
  [LEADERBOARD[1],LEADERBOARD[0],LEADERBOARD[2]].forEach(function(u,i){
    var cls=['p2','p1','p3'][i]; var rankStr=['2','👑','3'][i];
    var card=el('div','pod '+cls);
    card.appendChild(el('div','pod-rank',rankStr));
    card.appendChild(el('div','pod-name',u.name));
    card.appendChild(el('div','pod-pts',u.pts.toLocaleString()));
    card.appendChild(el('div','pod-solves',u.solves+' solves'));
    pod.appendChild(card);
  });
  var tbody=document.getElementById('sb-tbody'); tbody.innerHTML='';
  LEADERBOARD.forEach(function(u){
    var tr=el('tr',u.you?'you-row':'');
    var rankTd=el('td','sb-rank',String(u.rank).padStart(2,'0')); tr.appendChild(rankTd);
    var userTd=document.createElement('td');
    var userDiv=el('div','sb-user');
    var av=el('div','sb-av',u.name.slice(0,2).toUpperCase());
    av.style.background=u.you?'linear-gradient(135deg,var(--accent),var(--cyan))':'var(--bg3)';
    av.style.color=u.you?'#000':'var(--text2)';
    userDiv.appendChild(av);
    var nameWrap=el('div');
    nameWrap.appendChild(el('span','sb-un',u.name));
    if(u.you) nameWrap.appendChild(el('span','sb-you-tag','// you'));
    userDiv.appendChild(nameWrap); userTd.appendChild(userDiv); tr.appendChild(userTd);
    var scTd=el('td','sb-sc',u.pts.toLocaleString()); tr.appendChild(scTd);
    tr.appendChild(el('td','sb-sol',u.solves+' solved'));
    var barTd=document.createElement('td');
    var barWrap=el('div','sb-bar'); var barFill=el('div','sb-bfill');
    barFill.style.width=Math.round(u.pts/max*100)+'%';
    if(u.you) barFill.style.background='var(--cyan)';
    barWrap.appendChild(barFill); barTd.appendChild(barWrap); tr.appendChild(barTd);
    tbody.appendChild(tr);
  });
}

// ── PROFILE ──────────────────────────────────────────────────
function renderProfile(){
  document.getElementById('prof-pts').textContent=S.pts.toLocaleString();
  var cats=[['Web Hacking',65],['Cryptography',45],['Forensics',30],['Reverse Eng.',20],['Network',25],['Social Eng.',50]];
  var cp=document.getElementById('cat-prog'); cp.innerHTML='';
  cats.forEach(function(c){
    var row=el('div','cat-row');
    row.appendChild(el('div','cat-lbl',c[0]));
    var bar=el('div','cat-bar'); var fill=el('div','cat-fill'); fill.style.width=c[1]+'%'; bar.appendChild(fill); row.appendChild(bar);
    row.appendChild(el('div','cat-pct',c[1]+'%'));
    cp.appendChild(row);
  });
  var solves=[
    {name:'SQL Injection 101',cat:'web',diff:'beginner',pts:100,time:'2h ago'},
    {name:'Spot the Phish',cat:'social',diff:'beginner',pts:75,time:'1d ago'},
    {name:'PCAP Protocol Hunt',cat:'network',diff:'beginner',pts:100,time:'2d ago'},
    {name:"Caesar's Secret",cat:'crypto',diff:'beginner',pts:75,time:'3d ago'},
    {name:'Hidden in Plain Sight',cat:'forensics',diff:'beginner',pts:150,time:'4d ago'}
  ];
  var tb=document.getElementById('hist-tbody'); tb.innerHTML='';
  solves.forEach(function(s){
    var tr=document.createElement('tr');
    tr.appendChild(el('td','hn',s.name));
    var catTd=document.createElement('td'); catTd.appendChild(badge('b-cat',s.cat)); tr.appendChild(catTd);
    var dTd=document.createElement('td'); dTd.appendChild(badge('b-easy',s.diff)); tr.appendChild(dTd);
    tr.appendChild(el('td','hp','+'+s.pts));
    tr.appendChild(el('td','ht',s.time));
    tb.appendChild(tr);
  });
}

// ── ADMIN ────────────────────────────────────────────────────
function renderAdminChs(){
  var tb=document.getElementById('adm-ch-tbody'); if(tb.children.length) return;
  CHALLENGES.forEach(function(c){
    var tr=document.createElement('tr');
    var td1=el('td','',c.title); td1.style.fontFamily='var(--mono)'; tr.appendChild(td1);
    var td2=document.createElement('td'); td2.appendChild(badge('b-cat',c.cat)); tr.appendChild(td2);
    var td3=document.createElement('td'); td3.appendChild(badge(diffClass(c.diff),c.diff)); tr.appendChild(td3);
    var td4=el('td','',String(c.pts)); td4.style.cssText='color:var(--accent);font-family:var(--mono)'; tr.appendChild(td4);
    var td5=document.createElement('td');
    var lbl=document.createElement('label'); lbl.className='tgl';
    var inp=document.createElement('input'); inp.type='checkbox'; inp.checked=Math.random()>.2;
    inp.onchange=function(){toast('Challenge '+(this.checked?'enabled':'disabled'),'info');};
    var sl=el('span','tgl-sl'); lbl.appendChild(inp); lbl.appendChild(sl); td5.appendChild(lbl); tr.appendChild(td5);
    var td6=el('td'); td6.className='act-row';
    var eb=el('button','act act-e','Edit');
    (function(title){eb.onclick=function(){toast('Editing: '+title,'info');};})(c.title);
    var db=el('button','act act-d','Delete');
    (function(title){db.onclick=function(){toast('Deleted: '+title,'err');};})(c.title);
    td6.appendChild(eb); td6.appendChild(db); tr.appendChild(td6);
    tb.appendChild(tr);
  });
}

function adSec(id,btn){
  document.querySelectorAll('.adm-sec').forEach(function(s){s.classList.remove('active');});
  document.querySelectorAll('.adm-nav').forEach(function(b){b.classList.remove('on');});
  document.getElementById('ads-'+id).classList.add('active');
  btn.classList.add('on');
}

function confirmReset(){if(confirm('Reset all scores? This cannot be undone.')){toast('Scoreboard reset for new semester','ok');}}

// ── AUTH ─────────────────────────────────────────────────────
function setAuthTab(t){
  document.getElementById('aform-in').style.display=t==='in'?'block':'none';
  document.getElementById('aform-reg').style.display=t==='reg'?'block':'none';
  document.getElementById('atab-in').classList.toggle('on',t==='in');
  document.getElementById('atab-reg').classList.toggle('on',t==='reg');
}
function doLogin(){go('challenges');toast('Welcome back, jdoe!','ok');}
function checkStr(inp){
  var v=inp.value;
  var s=[(v.length>=8?1:0),(v.length>=12?1:0),(/[0-9]/.test(v)?1:0),(/[^a-zA-Z0-9]/.test(v)?1:0)];
  var total=s.reduce(function(a,c){return a+c;},0);
  var colors=['var(--red)','var(--amber)','var(--cyan)','var(--accent)'];
  for(var i=1;i<=4;i++){document.getElementById('sb'+i).style.background=i<=total?colors[total-1]:'rgba(255,255,255,.08)';}
}

// ── INIT ─────────────────────────────────────────────────────
renderTracks();
renderChallenges();
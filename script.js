(() => {
  "use strict";
  const SAVE_KEY = "daoOfEternityV2";
  const realms = [
    {name:"Pengumpulan Qi", stages:9, base:180, power:3, age:31},
    {name:"Fondasi Spiritual", stages:9, base:420, power:12, age:55},
    {name:"Pembentukan Inti", stages:9, base:850, power:28, age:120},
    {name:"Jiwa Baru Lahir", stages:9, base:1600, power:60, age:300},
    {name:"Transformasi Roh", stages:9, base:3000, power:120, age:700},
    {name:"Penyatuan Dao", stages:9, base:5400, power:260, age:1500},
    {name:"Kesengsaraan Surgawi", stages:9, base:9500, power:550, age:3000},
    {name:"Keabadian Sejati", stages:9, base:17000, power:1200, age:8000},
    {name:"Raja Abadi", stages:9, base:30000, power:2800, age:20000},
    {name:"Kaisar Dao", stages:9, base:52000, power:6500, age:80000},
    {name:"Puncak Dao", stages:1, base:100000, power:15000, age:999999}
  ];
  const techniques = [
    {id:"breath",name:"Pernapasan Bintang",icon:"✧",desc:"Menyelaraskan napas dengan arus Qi kosmik.",gain:4,cost:0},
    {id:"meridian",name:"Pembukaan Meridian",icon:"⌁",desc:"Membuka jalur energi untuk memperkuat meditasi.",gain:8,cost:35},
    {id:"moon",name:"Sutra Bulan Perak",icon:"☾",desc:"Menyerap cahaya bulan dan memurnikan esensi.",gain:15,cost:90},
    {id:"void",name:"Langkah Kekosongan",icon:"◈",desc:"Teknik kuno yang menembus batas ruang.",gain:25,cost:220},
    {id:"heaven",name:"Kitab Langit Tanpa Batas",icon:"道",desc:"Sebuah warisan yang konon berasal dari Dao pertama.",gain:45,cost:500}
  ];
  const missions = [
    {id:"meditate",name:"Tenangkan Pikiran",desc:"Bermeditasi sebanyak 10 kali.",target:10,reward:15,type:"meditations"},
    {id:"essence",name:"Kumpulkan Esensi",desc:"Kumpulkan 50 Esensi Dao sepanjang perjalanan.",target:50,reward:20,type:"essenceEarned"},
    {id:"fight",name:"Pemburu Roh",desc:"Menangkan 3 pertarungan.",target:3,reward:25,type:"wins"},
    {id:"break",name:"Melampaui Batas",desc:"Berhasil melakukan 1 terobosan.",target:1,reward:30,type:"breakthroughs"}
  ];
  const enemyTypes = [
    {name:"Serigala Kabut",icon:"☄",power:4,reward:8},
    {name:"Gagak Bayangan",icon:"✦",power:8,reward:13},
    {name:"Iblis Batu",icon:"◆",power:15,reward:22},
    {name:"Ular Bintang",icon:"🐉",power:24,reward:35},
    {name:"Penjaga Gerbang",icon:"♜",power:40,reward:55}
  ];
  const freshState = () => ({
    qi:0, essence:20, totalQi:0, power:3, age:31, realm:0, stage:1,
    meditations:0, wins:0, breakthroughs:0, essenceEarned:0,
    ownedTechniques:["breath"], inventory:{pill:2,charm:1,artifact:0},
    missionsClaimed:[], sect:"Pengelana Tanpa Sekte", sectJoined:false,
    trialAvailable:false, logs:[], enemyIndex:0, enemyHp:100, lastVisit:Date.now()
  });
  let state = loadState();
  let toastTimer;
  const $ = id => document.getElementById(id);
  function loadState(){
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if(saved && typeof saved === "object") return {...freshState(),...saved, inventory:{...freshState().inventory,...(saved.inventory||{})}};
    } catch(e) {}
    return freshState();
  }
  function save(){
    try { localStorage.setItem(SAVE_KEY,JSON.stringify(state)); $("saveStatus").textContent="Tersimpan"; }
    catch(e){ $("saveStatus").textContent="Sesi aktif"; }
  }
  function currentRealm(){return realms[Math.min(state.realm,realms.length-1)];}
  function requiredQi(){return Math.floor(currentRealm().base * (1 + (state.stage-1)*0.17));}
  function techniqueBonus(){return state.ownedTechniques.reduce((sum,id)=>sum+(techniques.find(t=>t.id===id)?.gain||0),0);}
  function meditateGain(){return 7+techniqueBonus();}
  function chance(){return Math.min(96,Math.max(35,72+Math.floor((state.power-currentRealm().power)*0.12)+(state.inventory.charm>0?5:0)));}
  function addLog(message){state.logs.unshift({time:new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}),message});state.logs=state.logs.slice(0,35);}
  function notify(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
  function realmLabel(){return `${currentRealm().name}`;}
  function stageLabel(){const names=["Awal","Menengah","Lanjut","Puncak"];let part=state.stage<=3?"Awal":state.stage<=6?"Menengah":state.stage<=8?"Lanjut":"Puncak";return `Tahap ${state.stage} · ${part}`;}
  const realmAuras = [
    {glow:"#8edfff",robe:"#78bfe0"}, {glow:"#7df0c2",robe:"#6ccfae"},
    {glow:"#b9a0ff",robe:"#a58be8"}, {glow:"#ff9bd5",robe:"#e985bb"},
    {glow:"#ffb17a",robe:"#e9986b"}, {glow:"#ffe28a",robe:"#e3c66f"},
    {glow:"#ff7f9c",robe:"#e36b87"}, {glow:"#9de8ff",robe:"#71c9e9"},
    {glow:"#c3a2ff",robe:"#a586e5"}, {glow:"#fff1bd",robe:"#e7d38b"},
    {glow:"#ffffff",robe:"#d9c9ff"}
  ];
  function updateCultivatorAura(){
    const scene=$("meditationScene");
    if(!scene)return;
    const aura=realmAuras[Math.min(state.realm,realmAuras.length-1)];
    scene.style.setProperty("--realm-aura",aura.glow);
    scene.style.setProperty("--realm-robe",aura.robe);
    scene.dataset.realm=String(state.realm);
    const beasts=["🐺","🦅","🐍","🦊","🐉","🦄","🐲","🌌","🐉","👑","☯"];
    const beastNames=["Spirit Wolf","Shadow Crow","Star Serpent","Flame Fox","Celestial Dragon","Moon Kirin","Heaven Dragon","Void Beast","Primordial Dragon","Dao Emperor Beast","Manifestation of Dao"];
    const beast=$("spiritBeast");
    if(beast){
      beast.querySelector("strong").textContent=beasts[Math.min(state.realm,beasts.length-1)];
      beast.querySelector("small").textContent=beastNames[Math.min(state.realm,beastNames.length-1)];
      beast.classList.toggle("awakened",state.realm>=3);
    }
  }
  function render(){
    updateCultivatorAura();
    $("realmName").textContent=realmLabel();$("realmStage").textContent=stageLabel();
    $("qiStat").textContent=Math.floor(state.qi).toLocaleString("id-ID");$("essenceStat").textContent=state.essence.toLocaleString("id-ID");
    $("powerStat").textContent=Math.floor(state.power).toLocaleString("id-ID");$("ageStat").textContent=state.age>=999999?"Tak Terukur":state.age.toLocaleString("id-ID");
    $("playerTitle").textContent=`${state.realm===0?"Qi Seeker":state.realm<4?"Cultivator":state.realm<8?"Immortal Seeker":"Dao Sovereign"} · ${state.sect}`;
    const req=requiredQi(),pct=Math.min(100,Math.floor(state.qi/req*100));
    $("qiProgressText").textContent=`${Math.floor(state.qi).toLocaleString("id-ID")} / ${req.toLocaleString("id-ID")} Qi`;$("qiPercent").textContent=`${pct}%`;$("qiProgressBar").style.width=pct+"%";
    $("meditateGain").textContent=`+${meditateGain()} Qi`;$("breakthroughBtn").disabled=state.qi<req;
    $("breakthroughHint").textContent=state.qi>=req?"Qi telah mencapai batas. Cobalah melakukan terobosan.":`Butuh ${Math.max(0,req-Math.floor(state.qi)).toLocaleString("id-ID")} Qi lagi untuk mencapai batas ranah.`;
    $("trialLevel").textContent=`Ujian Ranah ${state.realm+1}`;$("trialChance").textContent=`${chance()}%`;
    $("trialBtn").disabled=!state.trialAvailable;
    $("trialHint").textContent=state.trialAvailable?"Energi langit mulai bergejolak. Persiapkan dirimu.":"Terobosan ranah akan membuka kesengsaraan surgawi.";
    $("sectName").textContent=state.sect;$("sectDesc").textContent=state.sectJoined?"Sekte ini mengakui potensimu. Teruslah berkultivasi demi kehormatan sekte.":"Belum terikat pada satu jalan. Temukan tempatmu di antara para abadi.";
    $("sectBtn").textContent=state.sectJoined?"Keluar Sekte":"Bergabung";$("sectBtn").classList.toggle("owned",state.sectJoined);
    renderTechniques();renderInventory();renderMissions();renderLogs();renderEnemy();
    save();
  }
  function renderTechniques(){
    $("techniqueList").innerHTML=techniques.map(t=>{
      const owned=state.ownedTechniques.includes(t.id);
      return `<article class="technique-row"><div class="tech-icon">${t.icon}</div><div class="tech-copy"><strong>${t.name}</strong><p>${t.desc}</p></div><div class="tech-meta"><span>+${t.gain} Qi</span><button class="small-button ${owned?"owned":""}" data-tech="${t.id}" ${owned||state.essence<t.cost?"disabled":""}>${owned?"Dipelajari":t.cost===0?"Aktif":`${t.cost} Essence`}</button></div></article>`;
    }).join("");
    $("techniqueList").querySelectorAll("[data-tech]").forEach(btn=>btn.addEventListener("click",()=>learnTechnique(btn.dataset.tech)));
  }
  function renderInventory(){
    const items=[{id:"pill",icon:"🧪",name:"Pil Pengumpul Qi",desc:"Pulihkan 60% Qi yang dibutuhkan",count:state.inventory.pill},{id:"charm",icon:"🔶",name:"Jimat Pelindung Dao",desc:"+5% peluang ujian berikutnya",count:state.inventory.charm},{id:"artifact",icon:"🪬",name:"Fragmen Artefak",desc:"Peninggalan dari pertarungan",count:state.inventory.artifact}];
    $("inventoryGrid").innerHTML=items.map(i=>`<article class="item-card"><div class="item-art">${i.icon}</div><div class="item-info"><strong>${i.name}</strong><span>${i.desc}</span></div><span class="item-count">×${i.count}</span>${i.id==="pill"?'<button class="small-button" data-use="pill">Gunakan</button>':i.id==="charm"?'<button class="small-button" data-use="charm">Pasang</button>':""}</article>`).join("");
    $("inventoryGrid").querySelectorAll("[data-use]").forEach(btn=>btn.addEventListener("click",()=>useItem(btn.dataset.use)));
  }
  function renderMissions(){
    $("missionList").innerHTML=missions.map(m=>{
      const progress=Math.min(m.target,state[m.type]||0),done=progress>=m.target,claimed=state.missionsClaimed.includes(m.id);
      return `<div class="mission-row ${claimed?"done":""}"><div class="mission-check">${claimed?"✓":done?"✦":"·"}</div><div class="mission-copy"><strong>${m.name}</strong><span>${m.desc} (${progress}/${m.target})</span></div><span class="mission-reward">${claimed?"Selesai":done?`+${m.reward} ✧`:`+${m.reward} Essence`}</span>${done&&!claimed?`<button class="small-button" data-claim="${m.id}">Klaim</button>`:""}</div>`;
    }).join("");
    $("missionList").querySelectorAll("[data-claim]").forEach(btn=>btn.addEventListener("click",()=>claimMission(btn.dataset.claim)));
  }
  function renderLogs(){
    $("logList").innerHTML=state.logs.length?state.logs.map(log=>`<div class="log-entry"><time>${log.time}</time><span>${escapeHtml(log.message)}</span></div>`).join(""):'<div class="log-entry"><span>Perjalananmu baru dimulai. Alam semesta menanti langkah pertamamu.</span></div>';
  }
  function renderEnemy(){
    const enemy=enemyTypes[state.enemyIndex%enemyTypes.length];
    $("enemyName").textContent=enemy.name;$("enemyMeta").textContent=`Kekuatan ${enemy.power+state.realm*3} · Hadiah ${enemy.reward+state.realm*2} Essence`;
    $("enemyHealthText").textContent=`${state.enemyHp}%`;$("enemyHealthBar").style.width=state.enemyHp+"%";$("enemyHealthBar").style.background=state.enemyHp<30?"#ed6f85":"linear-gradient(90deg,#b35d83,#ef9aab)";
    $("fightBtn").textContent=state.enemyHp<=0?"✦ Cari Musuh Berikutnya":"⚔  Mulai Pertarungan";
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  let sceneEffectTimer = null;
  function spawnQiParticles(count=8, burst=false){
    const layer=$("meditationParticles");if(!layer)return;
    // Hard cap keeps repeated clicks from stacking too many animated DOM nodes.
    count = Math.min(count, burst ? 12 : 4);
    const glyphs=["✦","✧","·","✺","◇"];
    const colors=["#f1dda7","#a9c6ff","#c9b4ff","#8ee2d0"];
    for(let i=0;i<count;i++){
      const p=document.createElement("span");
      p.className="qi-particle";
      p.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
      p.style.setProperty("--x",`${12+Math.random()*76}%`);
      p.style.setProperty("--size",`${8+Math.random()*12}px`);
      p.style.setProperty("--duration",`${2.1+Math.random()*2.2}s`);
      p.style.setProperty("--drift",`${Math.round((Math.random()-.5)*110)}px`);
      p.style.setProperty("--particle-color",colors[Math.floor(Math.random()*colors.length)]);
      p.style.bottom=`${15+Math.random()*18}%`;
      layer.appendChild(p);
      p.addEventListener("animationend",()=>p.remove(),{once:true});
    }
    while(layer.children.length>16) layer.firstElementChild.remove();
  }
  function sceneEffect(className, duration=700){
    const scene=$("meditationScene");if(!scene)return;
    if(sceneEffectTimer) window.clearTimeout(sceneEffectTimer);
    scene.classList.remove("meditating-burst","breakthrough-burst","trial-burst");
    void scene.offsetWidth;
    scene.classList.add(className);
    sceneEffectTimer=window.setTimeout(()=>scene.classList.remove(className),duration);
  }
  function pulseStats(){
    ["qiStat","essenceStat","powerStat"].forEach(id=>{
      const el=$(id);if(!el)return;
      const card=el.closest(".stat-card");if(!card)return;
      card.classList.remove("changed");void card.offsetWidth;card.classList.add("changed");
      window.setTimeout(()=>card.classList.remove("changed"),650);
    });
  }
  function meditate(){
    const gain=meditateGain();const before=state.qi;state.qi=Math.min(requiredQi(),state.qi+gain);const actual=Math.floor(state.qi-before);
    state.totalQi+=actual;state.meditations++;state.age+=0.01;
    addLog(`Meditasi berhasil. Kamu menyerap ${actual} Qi dari arus spiritual.`);
    // Meditation uses a tiny pulse and only a few particles; the ambient aura stays CSS-only.
    sceneEffect("meditating-burst",420);spawnQiParticles(3,false);
    const caption=$("meditationCaption");
    if(caption){caption.textContent=["Qi mengalir melalui meridian...","Aura Dao semakin kuat...","Bintang-bintang menjawab panggilanmu..."][state.meditations%3];}
    render();if(state.qi>=requiredQi())notify("Qi mencapai batas! Kamu siap melakukan terobosan.");
  }
  function breakthrough(){
    if(state.qi<requiredQi())return;
    const oldRealm=state.realm,oldStage=state.stage;
    sceneEffect("breakthrough-burst",850);spawnQiParticles(12,true);
    const roll=Math.random();
    if(roll<0.72){
      state.qi=0;state.breakthroughs++;state.trialAvailable=true;
      if(state.stage<9 && state.realm<realms.length-1){state.stage++;state.power+=2+state.realm*2;state.age+=Math.max(1,currentRealm().age*.03);}
      else if(state.realm<realms.length-1){state.realm++;state.stage=1;state.power=currentRealm().power;state.age=Math.max(state.age,currentRealm().age);state.trialAvailable=true;}
      const figure=$("meditationScene");
      if(figure){
        figure.classList.remove("breakthrough-transformation","heavenly-ascension");
        void figure.offsetWidth;
        figure.classList.add("breakthrough-transformation");
        if(state.realm>=4) figure.classList.add("heavenly-ascension");
        window.setTimeout(()=>figure.classList.remove("breakthrough-transformation","heavenly-ascension"),2300);
      }
      const beast=$("spiritBeast");
      if(beast){beast.classList.remove("beast-awaken");void beast.offsetWidth;beast.classList.add("beast-awaken");window.setTimeout(()=>beast.classList.remove("beast-awaken"),2200);}
      const scene2=$("meditationScene");
      if(scene2 && state.realm>=4){scene2.classList.remove("dao-ascension");void scene2.offsetWidth;scene2.classList.add("dao-ascension");window.setTimeout(()=>scene2.classList.remove("dao-ascension"),2200); }
      addLog(`Terobosan berhasil! ${realms[oldRealm].name} tahap ${oldStage} telah dilampaui.`);
      notify("Terobosan berhasil! Aura dan jubahmu berevolusi.");
    }else{
      state.qi=Math.floor(requiredQi()*.35);state.power=Math.max(1,state.power-1);
      addLog("Terobosan gagal. Aliran Qi berbalik dan sebagian kekuatan terkikis.");
      notify("Terobosan gagal. Tenangkan aliran Qi dan coba lagi.");
    }
    render();
  }
  function faceTrial(){
    if(!state.trialAvailable)return;
    const roll=Math.random()*100,success=roll<chance();
    sceneEffect("trial-burst",650);spawnQiParticles(10,true);
    state.trialAvailable=false;
    if(success){
      const reward=15+state.realm*8;state.essence+=reward;state.essenceEarned+=reward;state.power+=5+state.realm*3;
      state.age+=Math.max(5,state.realm*12);state.inventory.artifact++;
      addLog(`Kesengsaraan surgawi ditaklukkan! Kamu memperoleh ${reward} Esensi Dao dan satu Fragmen Artefak.`);
      notify("Petir surgawi telah ditaklukkan!"); 
    }else{
      state.qi=Math.floor(state.qi*.5);state.power=Math.max(1,state.power-2);
      addLog("Petir surgawi menghantam inti kultivasi. Separuh Qi hilang.");
      notify("Ujian gagal. Pulihkan dirimu sebelum mencoba lagi.");
    }
    render();
  }
  function learnTechnique(id){
    const t=techniques.find(x=>x.id===id);if(!t||state.ownedTechniques.includes(id)||state.essence<t.cost)return;
    state.essence-=t.cost;state.ownedTechniques.push(id);addLog(`Teknik ${t.name} berhasil dipelajari.`);notify(`Teknik baru: ${t.name}`);render();
  }
  function useItem(id){
    if(!state.inventory[id]){notify("Persediaan tidak cukup.");return;}
    if(id==="pill"){
      const missing=requiredQi()-state.qi;if(missing<=0){notify("Qi sudah mencapai batas ranah.");return;}
      const restored=Math.min(missing,Math.ceil(requiredQi()*.6));state.qi+=restored;state.inventory.pill--;
      addLog(`Pil Pengumpul Qi digunakan. ${restored} Qi dipulihkan.`);notify(`Pulih ${restored} Qi.`);
    }else if(id==="charm"){
      if(state.trialAvailable){notify("Jimat aktif saat kesengsaraan berlangsung.");return;}
      state.inventory.charm--;state.power+=2;addLog("Jimat Pelindung Dao dipakai. Kekuatan meningkat dan peluang ujian diperkuat.");notify("Jimat dipasang: +2 kekuatan.");
    }
    render();
  }
  function buyItem(id){
    const price=id==="pill"?12:18;if(state.essence<price){notify("Esensi Dao tidak cukup.");return;}
    state.essence-=price;state.inventory[id]=(state.inventory[id]||0)+1;addLog(`${id==="pill"?"Pil Pengumpul Qi":"Jimat Pelindung Dao"} dibeli seharga ${price} Esensi Dao.`);notify("Barang berhasil dibeli.");render();
  }
  function claimMission(id){
    const m=missions.find(x=>x.id===id);if(!m||state.missionsClaimed.includes(id)||(state[m.type]||0)<m.target)return;
    state.missionsClaimed.push(id);state.essence+=m.reward;state.essenceEarned+=m.reward;addLog(`Misi "${m.name}" selesai. ${m.reward} Esensi Dao diterima.`);notify(`Misi selesai: +${m.reward} Essence`);render();
  }
  function fight(){
    if(state.enemyHp<=0){state.enemyIndex++;state.enemyHp=100;renderEnemy();notify("Musuh baru muncul dari kabut.");return;}
    const enemy=enemyTypes[state.enemyIndex%enemyTypes.length];const enemyPower=enemy.power+state.realm*3;
    const damage=Math.max(8,Math.floor(state.power*1.4+Math.random()*12));
    sceneEffect("breakthrough-burst",500);spawnQiParticles(6,true);
    state.enemyHp=Math.max(0,state.enemyHp-damage);
    let message=`Seranganmu menghasilkan ${damage}% kerusakan pada ${enemy.name}.`;
    if(state.enemyHp<=0){
      const reward=enemy.reward+state.realm*2;state.essence+=reward;state.essenceEarned+=reward;state.wins++;state.inventory.artifact++;
      state.qi=Math.min(requiredQi(),state.qi+Math.floor(requiredQi()*.12));
      message+=` Musuh tumbang! +${reward} Esensi Dao dan 1 Fragmen Artefak.`;
      addLog(`Kemenangan melawan ${enemy.name}. Kamu memperoleh ${reward} Esensi Dao.`);
      notify(`Kemenangan! +${reward} Essence.`);
    }else{
      const counter=Math.max(1,Math.floor(enemyPower*0.15));state.qi=Math.max(0,state.qi-counter);
      message+=` Serangan balasan mengikis ${counter} Qi.`;
    }
    $("combatLog").textContent=message;render();
  }
  function toggleSect(){
    if(state.sectJoined){state.sectJoined=false;state.sect="Pengelana Tanpa Sekte";addLog("Kamu meninggalkan sekte dan kembali menapaki jalan sendiri.");notify("Kamu kembali menjadi pengelana.");}
    else{state.sectJoined=true;state.sect="Paviliun Bintang Abadi";state.essence+=10;state.essenceEarned+=10;addLog("Kamu bergabung dengan Paviliun Bintang Abadi dan menerima 10 Esensi Dao sebagai sambutan.");notify("Selamat datang di Paviliun Bintang Abadi!");}
    render();
  }
  function useCheat(message, mutate){
    mutate();
    addLog(`[Mode Pengembang] ${message}`);
    save();
    render();
    notify(message);
  }
  const CHEAT_PASSWORD = "maylatav99";
  // Tombol Mode Pengembang ditangani oleh onclick yang ramah sentuhan di index.html.
  $("cheatLoginForm").addEventListener("submit",(event)=>{
    event.preventDefault();
    const entered=$("cheatPassword").value;
    const message=$("cheatLoginMessage");
    if(entered===CHEAT_PASSWORD){
      $("cheatTools").hidden=false;
      $("cheatLoginForm").hidden=true;
      message.textContent="";
      $("cheatPassword").value="";
      notify("Panel cheat berhasil dibuka.");
    }else{
      message.textContent="Password salah. Coba lagi.";
      $("cheatPassword").value="";
      $("cheatPassword").focus();
    }
  });
  $("cheatLockBtn").addEventListener("click",()=>{
    $("cheatTools").hidden=true;
    $("cheatLoginForm").hidden=false;
    $("cheatLoginMessage").textContent="Panel dikunci kembali.";
    $("cheatPassword").value="";
  });
  $("cheatQiBtn").addEventListener("click",()=>useCheat("Qi bertambah 10.000.",()=>{
    state.qi=Math.min(requiredQi(),state.qi+10000);
    state.totalQi+=10000;
  }));
  $("cheatEssenceBtn").addEventListener("click",()=>useCheat("Esensi Dao bertambah 1.000.",()=>{
    state.essence+=1000;state.essenceEarned+=1000;
  }));
  $("cheatPowerBtn").addEventListener("click",()=>useCheat("Kekuatan bertambah 5.000.",()=>{
    state.power+=5000;
  }));
  $("cheatRealmBtn").addEventListener("click",()=>useCheat("Ranah Puncak Dao terbuka.",()=>{
    state.realm=realms.length-1;state.stage=1;state.qi=0;
    state.power=Math.max(state.power,currentRealm().power);
    state.age=Math.max(state.age,currentRealm().age);
    state.trialAvailable=true;
  }));
  $("cheatUnlockBtn").addEventListener("click",()=>useCheat("Semua teknik kultivasi terbuka.",()=>{
    state.ownedTechniques=techniques.map(t=>t.id);
  }));

  $("meditateBtn").addEventListener("click",meditate);
  $("breakthroughBtn").addEventListener("click",breakthrough);
  $("trialBtn").addEventListener("click",faceTrial);
  $("fightBtn").addEventListener("click",fight);
  $("sectBtn").addEventListener("click",toggleSect);
  document.querySelectorAll("[data-buy]").forEach(btn=>btn.addEventListener("click",()=>buyItem(btn.dataset.buy)));
  $("clearLogBtn").addEventListener("click",()=>{state.logs=[];renderLogs();save();notify("Catatan perjalanan dibersihkan.");});
  $("resetBtn").addEventListener("click",()=>$("confirmDialog").showModal());
  $("cancelReset").addEventListener("click",()=>$("confirmDialog").close());
  $("confirmReset").addEventListener("click",()=>{localStorage.removeItem(SAVE_KEY);state=freshState();$("confirmDialog").close();$("combatLog").textContent="Kabut bergerak. Sesuatu mengintai di kejauhan...";addLog("Perjalanan baru dimulai di bawah langit yang tak berujung.");render();notify("Takdir baru telah dimulai.");});
  $("soundlessMark").addEventListener("click",()=>notify("Dao tidak bersuara, tetapi selalu menunjukkan jalan."));
  addLog("Perjalanan kultivasimu dimulai. Semoga Dao menuntun langkahmu.");
  render();
})();
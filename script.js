"use strict";

const SAVE_KEY = "daoOfEternity_v1";

const REALMS = [
  {name:"Pemurnian Tubuh",title:"Mortal Wanderer",qi:100,power:1},
  {name:"Pengumpulan Qi",title:"Qi Seeker",qi:180,power:3},
  {name:"Pendirian Fondasi",title:"Foundation Adept",qi:300,power:7},
  {name:"Inti Emas",title:"Golden Core Cultivator",qi:500,power:15},
  {name:"Jiwa Baru",title:"Nascent Soul Adept",qi:800,power:32},
  {name:"Transformasi Dewa",title:"Divine Transformer",qi:1200,power:70},
  {name:"Pemurnian Kekosongan",title:"Void Walker",qi:1800,power:150},
  {name:"Penyatuan Dao",title:"Dao Ascendant",qi:2600,power:320},
  {name:"Dewa Sejati",title:"True Immortal",qi:3600,power:700},
  {name:"Kaisar Abadi",title:"Immortal Emperor",qi:5000,power:1500},
  {name:"Puncak Dao",title:"Eternal Dao Sovereign",qi:7000,power:9999}
];

const TECHNIQUES = [
  {id:"breath",name:"Pernapasan Embun Surgawi",description:"Teknik dasar untuk menyerap energi spiritual.",icon:"❋",cost:0,gain:10},
  {id:"lotus",name:"Teratai Jiwa Abadi",description:"Memperkuat meditasi dan penyerapan Qi.",icon:"✿",cost:40,gain:20},
  {id:"star",name:"Sutra Bintang Purba",description:"Menghubungkan jiwa dengan energi galaksi.",icon:"✦",cost:120,gain:40},
  {id:"dao",name:"Hukum Dao Tanpa Batas",description:"Teknik legendaris yang melampaui batas fana.",icon:"☯",cost:300,gain:80}
];

const MISSIONS = [
  {id:"meditate",name:"Menenangkan Hati",description:"Bermeditasi sebanyak 5 kali.",target:5,reward:15},
  {id:"gather",name:"Mengumpulkan Qi",description:"Kumpulkan 100 Qi sepanjang perjalanan.",target:100,reward:20},
  {id:"breakthrough",name:"Melampaui Batas",description:"Berhasil melakukan terobosan ranah.",target:1,reward:15}
];

function createDefaultState(){return{qi:0,essence:0,realm:0,stage:1,age:18,meditations:0,breakthroughs:0,totalQiGathered:0,trialsWon:0,techniques:["breath"],missions:{meditate:0,gather:0,breakthrough:0},claimedMissions:[],completedMissions:[],log:[{title:"Awal Perjalanan",text:"Jiwamu terbangun di antara bintang. Jalan Dao menantimu.",time:Date.now()}],lastDailyReset:new Date().toDateString()};}
function clampInteger(value,min,max){const number=Math.floor(Number(value)||min);return Math.min(max,Math.max(min,number));}
function loadState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);if(!raw)return createDefaultState();
    const saved=JSON.parse(raw),fresh=createDefaultState();
    const result={...fresh,...saved,missions:{...fresh.missions,...(saved.missions||{})},
      techniques:Array.isArray(saved.techniques)?saved.techniques.filter(id=>TECHNIQUES.some(t=>t.id===id)):["breath"],
      claimedMissions:Array.isArray(saved.claimedMissions)?saved.claimedMissions:[],
      completedMissions:Array.isArray(saved.completedMissions)?saved.completedMissions:[],
      log:Array.isArray(saved.log)?saved.log.slice(0,30):fresh.log};
    result.realm=clampInteger(result.realm,0,REALMS.length-1);result.stage=clampInteger(result.stage,1,9);
    result.qi=Math.max(0,Number(result.qi)||0);result.essence=Math.max(0,Number(result.essence)||0);result.age=Math.max(18,Number(result.age)||18);
    return result;
  }catch(error){console.warn("Data save tidak dapat dibaca.",error);return createDefaultState();}
}

let state=loadState(),toastTimeout=null,visualEffectsEnabled=true;
const $=id=>document.getElementById(id);
function currentRealm(){return REALMS[state.realm];}
function qiRequired(){return currentRealm().qi;}
function hasTechnique(id){return state.techniques.includes(id);}
function meditationGain(){return Math.round(state.techniques.reduce((sum,id)=>{const t=TECHNIQUES.find(item=>item.id===id);return sum+(t?t.gain:0);},0)*(1+state.realm*.1));}
function saveState(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));$("save-status").textContent="Tersimpan";}catch(error){$("save-status").textContent="Gagal menyimpan";console.warn("Penyimpanan gagal.",error);}}
function addLog(title,text){state.log.unshift({title,text,time:Date.now()});state.log=state.log.slice(0,20);}
function showToast(message){const toast=$("toast");toast.textContent=message;toast.classList.add("show");if(toastTimeout)clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove("show"),2600);}
function trialChance(){return Math.min(95,70+state.realm*2+(state.stage-1));}

function renderStats(){
  const realm=currentRealm(),required=qiRequired(),progress=Math.min(100,state.qi/required*100);
  $("player-title").textContent=realm.title;$("realm-name").textContent=realm.name;
  $("realm-stage").textContent=`Tahap ${state.stage} · ${state.stage===1?"Awal":state.stage>=8?"Puncak":"Berkembang"}`;
  $("qi-value").textContent=Math.floor(state.qi).toLocaleString("id-ID");$("essence-value").textContent=Math.floor(state.essence).toLocaleString("id-ID");
  $("power-value").textContent=realm.power.toLocaleString("id-ID");$("age-value").textContent=state.age.toLocaleString("id-ID");
  $("progress-text").textContent=`${Math.floor(state.qi).toLocaleString("id-ID")} / ${required.toLocaleString("id-ID")} Qi`;
  $("progress-percent").textContent=`${Math.floor(progress)}%`;$("qi-progress").style.width=`${progress}%`;
  $("meditate-gain").textContent=`+${meditationGain()} Qi`;$("breakthrough-btn").disabled=state.qi<required||state.realm>=REALMS.length-1;
  $("cultivation-hint").textContent=state.realm>=REALMS.length-1?"Puncak Dao telah tercapai.":state.qi>=required?"Qi telah mencapai batas. Saatnya mencoba terobosan ranah!":`Butuh ${Math.max(0,required-Math.floor(state.qi)).toLocaleString("id-ID")} Qi lagi untuk mencapai batas ranah.`;
  $("trial-level").textContent=state.realm===0?"Ujian Fana":`Ujian Ranah ${state.realm+1}`;
  $("trial-chance").textContent=`${trialChance()}%`;$("trial-btn").disabled=state.qi<30;
  $("trial-hint").textContent=state.qi<30?"Kamu membutuhkan minimal 30 Qi untuk menghadapi ujian.":"Biaya ujian: 30 Qi. Kemenangan memberikan Esensi Dao.";
  $("scene-caption").textContent=state.realm>=9?"Hukum alam semesta tunduk pada kehendakmu...":state.realm>=5?"Jiwamu beresonansi dengan galaksi...":"Dengarkan napas alam semesta...";
  $("destiny-text").textContent=state.realm>=10?"Kamu telah mencapai Puncak Dao. Di luar keabadian, masih adakah jalan yang belum dijelajahi?":state.realm>=6?"Bintang-bintang mulai mengenali jiwamu. Namun, rahasia tertinggi Dao masih tersembunyi.":state.realm>=3?"Fondasi kekuatanmu semakin kokoh. Ujian berikutnya akan menentukan arah takdirmu.":"Jalan seribu li dimulai dengan satu langkah. Kumpulkan Qi, dan bukalah gerbang takdirmu.";
}

function renderTechniques(){
  const container=$("techniques-list");container.replaceChildren();
  TECHNIQUES.forEach(technique=>{
    const owned=hasTechnique(technique.id),card=document.createElement("div");card.className="technique-card";
    const icon=document.createElement("div");icon.className="technique-icon";icon.textContent=technique.icon;
    const info=document.createElement("div");info.className="technique-info";
    const title=document.createElement("strong");title.textContent=technique.name;
    const description=document.createElement("small");description.textContent=owned?`${technique.description} ${technique.id==="breath"?"":"+ "+technique.gain+" Qi per meditasi."}`:`${technique.description} Harga: ${technique.cost} Esensi.`;
    info.append(title,description);const button=document.createElement("button");button.textContent=owned?"Dikuasai":"Pelajari";button.disabled=owned||state.essence<technique.cost;
    button.addEventListener("click",()=>learnTechnique(technique.id));card.append(icon,info,button);container.append(card);
  });
}

function renderMissions(){
  const container=$("missions-list");container.replaceChildren();let claimedCount=0;
  MISSIONS.forEach(mission=>{
    const progress=mission.id==="gather"?Math.min(mission.target,state.totalQiGathered):Math.min(mission.target,state.missions[mission.id]||0);
    const claimed=state.claimedMissions.includes(mission.id),completed=progress>=mission.target;if(claimed)claimedCount++;
    const item=document.createElement("div");item.className=`mission-item${claimed?" completed":""}`;
    const check=document.createElement("div");check.className="mission-check";check.textContent=claimed?"✓":completed?"!":"·";
    const copy=document.createElement("div");copy.className="mission-copy";const title=document.createElement("strong");title.textContent=mission.name;
    const description=document.createElement("small");description.textContent=claimed?"Hadiah telah diterima":completed?`Selesai! Klaim +${mission.reward} Esensi`:`${mission.description} (${progress}/${mission.target})`;
    copy.append(title,description);item.append(check,copy);
    if(completed&&!claimed){const claim=document.createElement("button");claim.className="text-button";claim.textContent="Klaim";claim.addEventListener("click",()=>claimMission(mission.id));item.append(claim);}
    container.append(item);
  });
  $("mission-count").textContent=`${claimedCount}/${MISSIONS.length}`;
}

function renderLog(){
  const container=$("log-list");container.replaceChildren();
  state.log.slice(0,6).forEach(entry=>{
    const item=document.createElement("div");item.className="log-entry";const title=document.createElement("strong");title.textContent=entry.title;
    const description=document.createElement("p");description.textContent=entry.text;const time=document.createElement("time");
    time.dateTime=new Date(entry.time).toISOString();time.textContent=new Date(entry.time).toLocaleString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    item.append(title,description,time);container.append(item);
  });
}
function render(){renderStats();renderTechniques();renderMissions();renderLog();}

function meditate(){
  const gain=meditationGain(),previousQi=state.qi;state.qi=Math.min(qiRequired(),state.qi+gain);const actualGain=state.qi-previousQi;
  if(actualGain<=0){showToast("Qi sudah mencapai batas ranah. Cobalah terobosan!");return;}
  state.meditations++;state.totalQiGathered+=actualGain;state.missions.meditate++;
  addLog("Meditasi Spiritual",`Kamu menyerap ${actualGain} Qi dari energi alam semesta.`);showToast(`Meditasi berhasil! +${actualGain} Qi Spiritual`);
  if(visualEffectsEnabled){const meditator=document.querySelector(".meditator");if(meditator)meditator.animate([{transform:"scale(1)",filter:"brightness(1)"},{transform:"scale(1.15)",filter:"brightness(1.8)"},{transform:"scale(1)",filter:"brightness(1)"}],{duration:550,easing:"ease-out"});}
  checkMissionProgress();render();saveState();
}

function breakthrough(){
  if(state.qi<qiRequired()){showToast("Qi belum mencukupi untuk terobosan.");return;}
  if(state.realm>=REALMS.length-1){showToast("Kamu telah mencapai Puncak Dao!");return;}
  const chance=Math.min(95,72+state.realm*2+(state.stage-1)),success=Math.random()*100<chance;
  if(success){
    const oldRealm=currentRealm().name;state.qi=0;state.realm++;state.stage=1;state.breakthroughs++;state.essence+=15+state.realm*5;state.age+=10+state.realm*3;state.missions.breakthrough++;
    addLog("Terobosan Berhasil!",`${oldRealm} telah dilampaui. Kamu mencapai ${currentRealm().name}.`);showToast(`Terobosan berhasil! Ranah baru: ${currentRealm().name}`);
  }else{
    const lost=Math.floor(qiRequired()*.25);state.qi=Math.max(0,state.qi-lost);
    addLog("Terobosan Gagal",`Energi spiritual bergejolak. Kamu kehilangan ${lost} Qi.`);showToast(`Terobosan gagal. ${lost} Qi hilang. Tenangkan jiwamu.`);
  }
  checkMissionProgress();render();saveState();
}

function faceTribulation(){
  if(state.qi<30){showToast("Qi tidak cukup untuk menghadapi kesengsaraan.");return;}
  state.qi-=30;const chance=trialChance(),success=Math.random()*100<chance;
  if(success){const reward=15+state.realm*10;state.essence+=reward;state.trialsWon++;addLog("Kesengsaraan Ditaklukkan",`Petir surgawi berhasil dilalui. Kamu memperoleh ${reward} Esensi Dao.`);showToast(`Ujian berhasil! +${reward} Esensi Dao`);}
  else{const lost=Math.min(state.qi,15+state.realm*3);state.qi-=lost;addLog("Dihantam Petir Surgawi",`Ujian gagal. Kamu kehilangan ${lost} Qi tambahan.`);showToast("Petir surgawi menghantam tubuhmu. Persiapkan dirimu kembali.");}
  render();saveState();
}

function learnTechnique(id){
  const technique=TECHNIQUES.find(item=>item.id===id);if(!technique||hasTechnique(id))return;
  if(state.essence<technique.cost){showToast("Esensi Dao tidak mencukupi.");return;}
  state.essence-=technique.cost;state.techniques.push(id);addLog("Kitab Dipelajari",`Kamu berhasil mempelajari ${technique.name}.`);
  showToast(`Teknik baru dikuasai: ${technique.name}`);render();saveState();
}

function claimMission(id){
  const mission=MISSIONS.find(item=>item.id===id);if(!mission||state.claimedMissions.includes(id))return;
  const progress=id==="gather"?state.totalQiGathered:state.missions[id]||0;
  if(progress<mission.target){showToast("Misi belum selesai.");return;}
  state.claimedMissions.push(id);state.essence+=mission.reward;addLog("Misi Diselesaikan",`${mission.name} selesai. +${mission.reward} Esensi Dao.`);
  showToast(`Hadiah diterima! +${mission.reward} Esensi Dao`);render();saveState();
}

function checkMissionProgress(){
  MISSIONS.forEach(mission=>{
    const progress=mission.id==="gather"?state.totalQiGathered:state.missions[mission.id]||0;
    if(progress>=mission.target&&!state.completedMissions.includes(mission.id)){
      state.completedMissions.push(mission.id);addLog("Misi Terbuka",`${mission.name} siap diklaim.`);
    }
  });
}

function resetGame(){state=createDefaultState();render();saveState();$("confirm-dialog").close();showToast("Perjalanan baru telah dimulai.");}
function bindEvents(){
  $("meditate-btn").addEventListener("click",meditate);$("breakthrough-btn").addEventListener("click",breakthrough);$("trial-btn").addEventListener("click",faceTribulation);
  $("reset-btn").addEventListener("click",()=>$("confirm-dialog").showModal());$("cancel-reset").addEventListener("click",()=>$("confirm-dialog").close());
  $("confirm-reset").addEventListener("click",resetGame);
  $("sound-toggle").addEventListener("click",()=>{visualEffectsEnabled=!visualEffectsEnabled;$("sound-toggle").textContent=visualEffectsEnabled?"✧":"◇";showToast(visualEffectsEnabled?"Efek visual diaktifkan.":"Efek visual meditasi dinonaktifkan.");});
}
function initializeGame(){
  if(state.lastDailyReset!==new Date().toDateString()){
    state.lastDailyReset=new Date().toDateString();state.missions={meditate:0,gather:0,breakthrough:0};state.claimedMissions=[];state.completedMissions=[];
    addLog("Hari Baru","Takdir baru menanti. Mulailah kultivasimu kembali.");
  }
  checkMissionProgress();bindEvents();render();saveState();
}
initializeGame();

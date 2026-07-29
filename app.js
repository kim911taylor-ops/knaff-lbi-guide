
const state={category:"Today",places:[],concerts:[]};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const mapUrl=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);

async function load(){
  const [places,concerts]=await Promise.all([fetch("data/places.json").then(r=>r.json()),fetch("data/concerts.json").then(r=>r.json())]);
  state.places=places;state.concerts=concerts; buildTabs(); render(); loadConditions(); buildConcerts();
}
function buildTabs(){
  const tabs=["Today","Knaff Picks","Restaurants","Happy Hour","Free Concerts","Activities","Markets","All"];
  $("#tabs").innerHTML=tabs.map((x,i)=>`<button class="tab ${i===0?"active":""}" data-tab="${x}">${x}</button>`).join("");
  $$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.category=b.dataset.tab;render();});
}
function filtered(){
 const q=$("#search").value.trim().toLowerCase();
 return state.places.filter(p=>{
  let cat=true;
  if(state.category==="Knaff Picks") cat=p.pick;
  else if(state.category==="Restaurants") cat=["Coffee & Breakfast","Lunch & Sandwiches","Dinner","Pizza & Treats","Restaurant Groups"].includes(p.category);
  else if(state.category==="Happy Hour") cat=p.category==="Sunset & Happy Hour";
  else if(state.category==="Activities") cat=p.category==="Activities";
  else if(state.category==="Markets") cat=p.category==="Markets";
  else if(["Today","Free Concerts"].includes(state.category)) cat=false;
  const text=[p.name,p.category,p.description,...(p.tags||[])].join(" ").toLowerCase();
  return cat && (!q||text.includes(q));
 });
}
function render(){
 $("#today").classList.toggle("hidden",state.category!=="Today");
 $("#concerts").classList.toggle("hidden",state.category!=="Free Concerts");
 $("#listing").classList.toggle("hidden",["Today","Free Concerts"].includes(state.category));
 const arr=filtered();
 $("#cards").innerHTML=arr.map(p=>`<article class="card ${p.pick?"pick":""}">
  <div class="cardhead"><h3>${p.name}</h3>${p.pick?'<span class="badge">★ Knaff Pick</span>':p.local?'<span class="badge local">Local Favorite</span>':""}</div>
  <p>${p.description}</p><div class="actions">
  <a class="btn primary" target="_blank" rel="noopener" href="${mapUrl(p.maps)}">Directions</a>
  ${p.website?`<a class="btn" target="_blank" rel="noopener" href="${p.website}">Website / Deals</a>`:""}
  </div></article>`).join("");
 $("#empty").classList.toggle("hidden",arr.length>0);
}
async function getJSON(url){const r=await fetch(url);if(!r.ok)throw Error();return r.json()}
async function loadConditions(){
 const set=(id,html)=>document.getElementById(id).innerHTML=html;
 try{const w=await getJSON("/.netlify/functions/weather");set("weather",`<strong>${w.current.temperature}°${w.current.unit}</strong><small>${w.current.text}<br>${w.current.wind}</small>`)}catch{set("weather","<strong>Unavailable</strong><small>Tap NOAA forecast below.</small>")}
 try{const t=await getJSON("/.netlify/functions/tides");set("tides",`<strong>${t.predictions.slice(0,2).map(x=>(x.type==="H"?"High ":"Low ")+formatTime(x.t)).join("<br>")}</strong><small>Barnegat Inlet predictions</small>`)}catch{set("tides","<strong>Unavailable</strong><small>Tap NOAA tides below.</small>")}
 try{const o=await getJSON("/.netlify/functions/ocean");set("ocean",`<strong>${o.waterF??"—"}°F</strong><small>Offshore water${o.waveFt!=null?` · Waves ${o.waveFt} ft`:""}<br>${o.observedUTC}</small>`)}catch{set("ocean","<strong>Unavailable</strong><small>Tap NOAA buoy below.</small>")}
 const now=new Date(), sunset=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"}).format(new Date(now.getFullYear(),now.getMonth(),now.getDate(),20,15));
 set("dayinfo",`<strong>${now.toLocaleDateString("en-US",{weekday:"long"})}</strong><small>${now.toLocaleDateString("en-US",{month:"long",day:"numeric"})}<br>Check exact sunset link</small>`);
}
function formatTime(x){const d=new Date(x.replace(" ","T"));return d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}
function buildConcerts(){
 $("#concertList").innerHTML=state.concerts.map(c=>`<div class="concert"><b>${c.day}: ${c.venue}</b><br>${c.time} · <a href="${c.link}" target="_blank" rel="noopener">Current schedule</a></div>`).join("");
}
$("#search").addEventListener("input",render);
const site="https://knaff-lbi-guide.netlify.app/";
$("#qr").src="https://api.qrserver.com/v1/create-qr-code/?size=360x360&data="+encodeURIComponent(site);
load();

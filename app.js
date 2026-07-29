const state = {
  tab: "Today",
  places: [],
  concerts: null,
  events: null,
  favorites: new Set(JSON.parse(localStorage.getItem("knaffFavorites") || "[]"))
};

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

async function loadData(){
  const [places, concerts, events] = await Promise.all([
    fetch("data/places.json").then(r => r.json()),
    fetch("data/concerts.json").then(r => r.json()),
    fetch("data/events.json").then(r => r.json())
  ]);
  state.places = places;
  state.concerts = concerts;
  state.events = events;
  buildTabs();
  render();
  renderConcerts();
  renderEvents();
  loadConditions();
  setDaySuggestions();
}

function buildTabs(){
  const tabs = ["Today","Knaff Picks","Restaurants","Happy Hour","Concerts","Events","Activities","Markets","Favorites","All"];
  $("#tabs").innerHTML = tabs.map((name,i) =>
    `<button class="tab ${i===0?"active":""}" data-tab="${name}">${name}</button>`
  ).join("");
  $$(".tab").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
}

function switchTab(tab){
  state.tab = tab;
  $$(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  render();
  window.scrollTo({top: document.querySelector(".sticky").offsetTop, behavior:"smooth"});
}

function placeMatchesTab(p){
  if(state.tab === "Knaff Picks") return p.pick;
  if(state.tab === "Restaurants") return ["Coffee & Breakfast","Lunch & Sandwiches","Dinner","Pizza & Treats","Restaurant Groups"].includes(p.category);
  if(state.tab === "Happy Hour") return p.category === "Sunset & Happy Hour";
  if(state.tab === "Activities") return p.category === "Activities";
  if(state.tab === "Markets") return p.category === "Markets";
  if(state.tab === "Favorites") return state.favorites.has(p.id);
  if(state.tab === "All") return true;
  return false;
}

function filteredPlaces(){
  const q = $("#search").value.trim().toLowerCase();
  return state.places.filter(p => {
    const text = [p.name,p.category,p.description,p.tip,...(p.tags||[])].join(" ").toLowerCase();
    return placeMatchesTab(p) && (!q || text.includes(q));
  });
}

function render(){
  $("#today").classList.toggle("hidden", state.tab !== "Today");
  $("#concerts").classList.toggle("hidden", state.tab !== "Concerts");
  $("#events").classList.toggle("hidden", state.tab !== "Events");
  $("#listing").classList.toggle("hidden", ["Today","Concerts","Events"].includes(state.tab));

  const list = filteredPlaces();
  $("#cards").innerHTML = list.map(placeCard).join("");
  $("#empty").classList.toggle("hidden", list.length > 0);

  $$(".favorite").forEach(btn => btn.addEventListener("click", () => toggleFavorite(btn.dataset.id)));
}

function placeCard(p){
  const badge = p.pick ? '<span class="badge">★ Knaff Pick</span>' :
                p.local ? '<span class="badge local">Local Favorite</span>' : "";
  const tip = p.tip ? `<div class="tip"><b>Knaff tip:</b> ${p.tip}</div>` : "";
  const heart = state.favorites.has(p.id) ? "❤️" : "🤍";
  return `<article class="card ${p.pick?"pick":""}">
    <div class="cardhead"><h3>${p.name}</h3>${badge}</div>
    <p>${p.description}</p>${tip}
    <div class="actions">
      <a class="btn primary" target="_blank" rel="noopener" href="${mapsUrl(p.maps)}">Directions</a>
      ${p.website ? `<a class="btn" target="_blank" rel="noopener" href="${p.website}">Website / Details</a>` : ""}
    </div>
    <button class="favorite ${state.favorites.has(p.id)?"on":""}" data-id="${p.id}" aria-label="Save favorite">${heart}</button>
  </article>`;
}

function toggleFavorite(id){
  if(state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
  localStorage.setItem("knaffFavorites", JSON.stringify([...state.favorites]));
  render();
}

function renderConcerts(){
  const c = state.concerts;
  $("#concertSource").innerHTML = `<div class="event-card"><h3>${c.primarySource.name}</h3><p>${c.primarySource.description}</p><a class="btn primary" target="_blank" href="${c.primarySource.url}">View Current 2026 Schedule</a></div>`;
  $("#concertList").innerHTML = c.series.map(x =>
    `<div class="concert"><b>${x.day}: ${x.name}</b><br>${x.location} · ${x.time}</div>`
  ).join("");
}

function renderEvents(){
  $("#featuredEvents").innerHTML = state.events.featured.map(e =>
    `<div class="event-card"><h3>${e.name}</h3><p>${e.description}</p><a class="btn primary" target="_blank" href="${e.url}">Open Event Page</a></div>`
  ).join("");
  $("#weeklyEvents").innerHTML = state.events.weekly.map(e =>
    `<div class="concert"><b>${e.when}: ${e.name}</b><br>${e.detail}</div>`
  ).join("");
}

async function getJSON(url){
  const response = await fetch(url);
  if(!response.ok) throw new Error("Request failed");
  return response.json();
}

function setHTML(id, html){ document.getElementById(id).innerHTML = html; }

async function loadConditions(){
  try{
    const w = await getJSON("/.netlify/functions/weather");
    const humidity = w.current.humidity == null ? "" : `<br>Humidity ${w.current.humidity}%`;
    const rain = w.current.probabilityOfPrecipitation == null ? "" : ` · Rain ${w.current.probabilityOfPrecipitation}%`;
    setHTML("weather", `<strong>${w.current.temperature}°${w.current.unit}</strong><small>${w.current.text}<br>${w.current.wind}${humidity}${rain}</small>`);
    setHTML("forecast", `<strong>${w.today.high ?? "—"}° / ${w.today.low ?? "—"}°</strong><small>${w.today.summary}<br>Surf City, NJ 08008</small>`);
  }catch{
    setHTML("weather","<strong>Unavailable</strong><small>Use the full forecast link below.</small>");
    setHTML("forecast","<strong>Surf City</strong><small>NJ 08008</small>");
  }

  try{
    const t = await getJSON("/.netlify/functions/tides");
    const html = (t.predictions || []).map(x => {
      const label = x.type === "H" ? "⬆ High" : "⬇ Low";
      return `${label} ${formatTide(x.t)}`;
    }).join("<br>");
    setHTML("tides", `<strong>${html || "—"}</strong><small>Next upcoming tides · Barnegat Inlet</small>`);
  }catch{
    setHTML("tides","<strong>Unavailable</strong><small>Use the NOAA tide link below.</small>");
  }

  try{
    const o = await getJSON("/.netlify/functions/ocean");
    setHTML("ocean", `<strong>${o.waterF ?? "—"}°F</strong><small>Ocean water near Barnegat Light${o.waveFt != null ? `<br>Waves ${o.waveFt} ft` : ""}<br>${o.observedUTC}</small>`);
  }catch{
    setHTML("ocean","<strong>Unavailable</strong><small>Use the NOAA buoy link below.</small>");
  }

  try{
    const s = await getJSON("/.netlify/functions/sun");
    setHTML("sun", `<strong>↑ ${s.sunrise}</strong><strong>↓ ${s.sunset}</strong><small>Surf City sunrise and sunset</small>`);
  }catch{
    setHTML("sun","<strong>Sun times</strong><small>Use the weather link below.</small>");
  }
}

function formatTide(text){
  const [datePart,timePart] = text.split(" ");
  const [year,month,day] = datePart.split("-").map(Number);
  const [hour,minute] = timePart.split(":").map(Number);
  const d = new Date(year,month-1,day,hour,minute);
  const today = new Date();
  const dayLabel = d.toDateString() === today.toDateString() ? "" : d.toLocaleDateString("en-US",{weekday:"short"})+" ";
  return dayLabel + d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
}

function setDaySuggestions(){
  const day = new Date().getDay();
  const suggestions = {
    0:["Brunch or coffee","Beach day","Sunset drinks"],
    1:["Surf City Farmers Market","Calloway’s Prime Rib Night","Free concert schedule"],
    2:["Beach and seafood market","Family activity","Sunset drinks"],
    3:["Harvey Cedars or Beach Haven concert","Dinner out","Ice cream"],
    4:["Ship Bottom concert schedule","Seafood dinner","Late-night pizza"],
    5:["Firepit Friday schedule","Happy hour","Sunset"],
    6:["Barnegat Lighthouse","Beach or waterpark","Special dinner"]
  }[day];
  $("#suggestions").innerHTML = suggestions.map(x => `<div class="quick">${x}</div>`).join("");
}

$("#search").addEventListener("input", render);
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("knaffDark", document.body.classList.contains("dark") ? "1":"0");
});
if(localStorage.getItem("knaffDark")==="1") document.body.classList.add("dark");

$("#qr").src = "https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=" + encodeURIComponent("https://knaff-lbi-guide.netlify.app/");

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(()=>{}));
}

loadData();

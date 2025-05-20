const UNIT_API_URL = "https://retoolapi.dev/DUyWF0/data";
const ITEM_API_URL = "https://retoolapi.dev/tcIuhu/data";



function parseItemString(str) {
  if (typeof str !== "string" || !str.includes("http")) return null;
  if (str.includes("\t")) {
    const [name, url] = str.split("\t");
    return { name: name.trim(), url: url.trim() };
  }
  const idx = str.trim().lastIndexOf(" ");
  if (idx < 0) return null;
  return {
    name: str.slice(0, idx).trim(),
    url:  str.slice(idx + 1).trim()
  };
}
function normalizeField(str) {
  const p = parseItemString(str);
  if (p) return p;
  if (typeof str === "string" && str.includes("http")) {
    return { name: "", url: str.trim() };
  }
  return null;
}

const modal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
document.getElementById("editClose").onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };


async function fetchUnits() {
  const res = await fetch(UNIT_API_URL);
  return res.ok ? await res.json() : [];
}

async function uploadData() {
  const payload = {
    unit:           document.getElementById("new-unit").value.trim(),
    unitpicture:    document.getElementById("new-unitpicture").value.trim(),
    itempicture1:   document.getElementById("new-item1").value.trim(),
    itempicture2:   document.getElementById("new-item2").value.trim(),
    itempicture3:   document.getElementById("new-item3").value.trim(),
    traitpicture1:  document.getElementById("new-trait1").value.trim(),
    traitpicture2:  document.getElementById("new-trait2").value.trim(),
    traitpicture3:  document.getElementById("new-trait3").value.trim(),
    goldcost:       parseInt(document.getElementById("new-goldcost").value, 10)
  };
  await fetch(UNIT_API_URL, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  alert("Unit feltöltve!");
  handleSearch();
}


async function fetchItems() {
  const res = await fetch(ITEM_API_URL);
  return res.ok ? await res.json() : [];
}

async function uploadItem() {
  const fields = [
    "itemnamepicture",
    "recipenamepicture1",
    "recipenamepicture2",
    "itemstatnamepicture1",
    "itemstatnamepicture2",
    "itemstatnamepicture3"
  ];
  const payload = {};
  fields.forEach(id => {
    let raw = document.getElementById(id).value.trim();
    raw = raw.replace(/\\t/g, "\t");
    payload[id] = raw;
  });
  await fetch(ITEM_API_URL, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  alert("Item feltöltve!");
  handleSearch();
}

//Törlés
async function renderDeleteUnits() {
  const cont = document.getElementById("delete-units-list");
  cont.innerHTML = "";
  const units = await fetchUnits();
  units.forEach(u => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${u.unit}</h4>
      <button onclick="confirmDeleteUnit(${u.id})">❌ Törlés</button>
    `;
    cont.appendChild(card);
  });
}
async function confirmDeleteUnit(id) {
  if (!confirm("Biztos törlöd?")) return;
  await fetch(`${UNIT_API_URL}/${id}`, { method:"DELETE" });
  renderDeleteUnits();
}


async function renderAdminListTabs() {
  await renderAdminUnits();
  await renderAdminItems();
}

async function renderAdminUnits() {
  const cont = document.getElementById("edit-units-list");
  cont.innerHTML = "";
  const units = await fetchUnits();
  units.forEach(u => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${u.unitpicture}" alt="${u.unit}" class="unit-image">
      <h4>${u.unit}</h4>
      <button onclick="showUnitEditForm(${u.id})">🛠️ Szerkeszt</button>
    `;
    cont.appendChild(card);
  });
}
async function showUnitEditForm(id) {
  const units = await fetchUnits();
  const u = units.find(x => x.id === id);
  editForm.innerHTML = `
    <input id="edit-unit-name"       value="${u.unit}" placeholder="Unit neve">
    <input id="edit-unit-picture"    value="${u.unitpicture}" placeholder="Kép URL">
    <input id="edit-unit-item1"      value="${u.itempicture1}" placeholder="Item1[TAB]URL">
    <input id="edit-unit-item2"      value="${u.itempicture2}" placeholder="Item2[TAB]URL">
    <input id="edit-unit-item3"      value="${u.itempicture3}" placeholder="Item3[TAB]URL">
    <input id="edit-unit-trait1"     value="${u.traitpicture1}" placeholder="Trait1[TAB]URL">
    <input id="edit-unit-trait2"     value="${u.traitpicture2}" placeholder="Trait2[TAB]URL">
    <input id="edit-unit-trait3"     value="${u.traitpicture3}" placeholder="Trait3[TAB]URL">
    <input id="edit-unit-goldcost"   type="number" min="1" max="5" value="${u.goldcost}">
    <button type="button" id="save-unit">Mentés</button>
  `;
  document.getElementById("save-unit").onclick = async () => {
    const updated = {
      unit:          document.getElementById("edit-unit-name").value.trim(),
      unitpicture:   document.getElementById("edit-unit-picture").value.trim(),
      itempicture1:  document.getElementById("edit-unit-item1").value.trim(),
      itempicture2:  document.getElementById("edit-unit-item2").value.trim(),
      itempicture3:  document.getElementById("edit-unit-item3").value.trim(),
      traitpicture1: document.getElementById("edit-unit-trait1").value.trim(),
      traitpicture2: document.getElementById("edit-unit-trait2").value.trim(),
      traitpicture3: document.getElementById("edit-unit-trait3").value.trim(),
      goldcost:      parseInt(document.getElementById("edit-unit-goldcost").value, 10)
    };
    await fetch(`${UNIT_API_URL}/${id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(updated)
    });
    modal.style.display = "none";
    renderAdminUnits();
    handleSearch();
  };
  modal.style.display = "flex";
}

async function renderAdminItems() {
  const cont = document.getElementById("edit-items-list");
  cont.innerHTML = "";
  const items = await fetchItems();
  items.forEach(i => {
    const p = parseItemString(i.itemnamepicture) || { name:i.itemnamepicture, url:"" };
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${p.name}</h4>
      <button onclick="showItemEditForm(${i.id})">🛠️ Szerkeszt</button>
    `;
    cont.appendChild(card);
  });
}
async function showItemEditForm(id) {
  const items = await fetchItems();
  const it = items.find(x => x.id === id);
  editForm.innerHTML = `
    <input id="edit-item-name"    value="${it.itemnamepicture}" placeholder="Item név[TAB]URL">
    <input id="edit-item-rec1"    value="${it.recipenamepicture1}" placeholder="Recept1[TAB]URL">
    <input id="edit-item-rec2"    value="${it.recipenamepicture2}" placeholder="Recept2[TAB]URL">
    <input id="edit-item-stat1"   value="${it.itemstatnamepicture1}" placeholder="Stat1[TAB]URL">
    <input id="edit-item-stat2"   value="${it.itemstatnamepicture2}" placeholder="Stat2[TAB]URL">
    <input id="edit-item-stat3"   value="${it.itemstatnamepicture3}" placeholder="Stat3[TAB]URL">
    <button type="button" id="save-item">Mentés</button>
  `;
  document.getElementById("save-item").onclick = async () => {
    const upd = {
      itemnamepicture:      document.getElementById("edit-item-name").value.trim(),
      recipenamepicture1:   document.getElementById("edit-item-rec1").value.trim(),
      recipenamepicture2:   document.getElementById("edit-item-rec2").value.trim(),
      itemstatnamepicture1: document.getElementById("edit-item-stat1").value.trim(),
      itemstatnamepicture2: document.getElementById("edit-item-stat2").value.trim(),
      itemstatnamepicture3: document.getElementById("edit-item-stat3").value.trim()
    };
    await fetch(`${ITEM_API_URL}/${id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(upd)
    });
    modal.style.display = "none";
    renderAdminItems();
    handleSearch();
  };
  modal.style.display = "flex";
}


async function handleSearch() {
  const cat = document.getElementById("category").value;
  if (cat === "unit") {
    const units = await fetchUnits();
    renderSearchUnits(units, document.getElementById("searchInput").value.toLowerCase());
  } else if (cat === "item") {
    renderSearchItems();
  }
}

function renderSearchUnits(units, kw) {
  const res = document.getElementById("results");
  res.innerHTML = "";
  units.forEach(u => {
    if (!u.unit.toLowerCase().includes(kw)) return;
    const itemsHtml = [u.itempicture1,u.itempicture2,u.itempicture3]
      .map(normalizeField).filter(Boolean)
      .map(it=>`<div class="item"><img src="${it.url}" alt="${it.name}"><span>${it.name}</span></div>`)
      .join("")||"<em>Nincs felszerelés</em>";
    const traitsHtml = [u.traitpicture1,u.traitpicture2,u.traitpicture3]
      .map(normalizeField).filter(Boolean)
      .map(tr=>`<div class="trait"><img src="${tr.url}" alt="${tr.name}"><span>${tr.name}</span></div>`)
      .join("")||"<em>Nincs trait</em>";
    res.innerHTML += `
      <div class="card">
        <img src="${u.unitpicture}" alt="${u.unit}" class="unit-image">
        <h3>${u.unit}</h3>
        <div class="item-section"><strong>Itemek:</strong><div class="item-list">${itemsHtml}</div></div>
        <div class="trait-section"><strong>Trait-ek:</strong><div class="trait-list">${traitsHtml}</div></div>
      </div>
    `;
  });
}

async function renderSearchItems() {
  const res = document.getElementById("results");
  res.innerHTML = "";
  const items = await fetchItems();
  if (!items.length) { res.textContent = "Nincs feltöltött item."; return; }
  items.forEach(it => {
    const p  = normalizeField(it.itemnamepicture) || {name:it.itemnamepicture,url:""};
    const r1 = normalizeField(it.recipenamepicture1);
    const r2 = normalizeField(it.recipenamepicture2);
    const s1 = normalizeField(it.itemstatnamepicture1);
    const s2 = normalizeField(it.itemstatnamepicture2);
    const s3 = normalizeField(it.itemstatnamepicture3);
    let html = `<div class="card">
      <img src="${p.url}" alt="${p.name}" class="item-image">
      <h3>${p.name}</h3>
      <div class="recipe-section"><strong>Receptek:</strong><div class="recipe-list">`;
    [r1,r2].filter(Boolean).forEach(r=>{
      html+=`<div class="recipe"><img src="${r.url}" alt="${r.name}"><span>${r.name}</span></div>`;
    });
    if (!r1&&!r2) html+="<em>Nincs recept</em>";
    html+=`</div></div>
      <div class="stat-section"><strong>Statisztikák:</strong><div class="stat-list">`;
    [s1,s2,s3].filter(Boolean).forEach(s=>{
      html+=`<div class="stat"><img src="${s.url}" alt="${s.name}"><span>${s.name}</span></div>`;
    });
    if (!s1&&!s2&&!s3) html+="<em>Nincs statisztika</em>";
    html+=`</div></div></div>`;
    res.innerHTML += html;
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t=>
    t.classList.toggle("active",t.getAttribute("onclick").includes(tabId))
  );
  document.querySelectorAll(".tab-content").forEach(c=>
    c.classList.toggle("active",c.id===tabId)
  );
  if (tabId==="search") handleSearch();
  if (tabId==="itemupload"){};
  if (tabId==="edit") renderAdminListTabs();
  if (tabId==="delete") renderDeleteUnits();
}
window.switchTab         = switchTab;
window.uploadData        = uploadData;
window.uploadItem        = uploadItem;
window.confirmDeleteUnit = confirmDeleteUnit;
window.showUnitEditForm  = showUnitEditForm;
window.showItemEditForm  = showItemEditForm;

window.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("searchInput").addEventListener("input",handleSearch);
  document.getElementById("category").addEventListener("change",handleSearch);
  switchTab("search");
});

async function fetchItems() {
  const res = await fetch(ITEM_API_URL);
  return res.ok ? await res.json() : [];
}

async function renderDeleteItems() {
  const items = await fetchItems();
  const cont  = document.getElementById("delete-items-list");
  cont.innerHTML = "";
  items.forEach(i => {
    const p = parseItemString(i.itemnamepicture) || { name: i.itemnamepicture, url: "" };
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${p.name}</h4>
      <button onclick="confirmDeleteItem(${i.id})">❌ Törlés</button>
    `;
    cont.appendChild(card);
  });
}

async function confirmDeleteItem(id) {
  if (!confirm("Biztosan törlöd az itemet?")) return;
  await fetch(`${ITEM_API_URL}/${id}`, { method: "DELETE" });
  renderDeleteItems();
}

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t =>
    t.classList.toggle("active", t.getAttribute("onclick").includes(tabId))
  );
  document.querySelectorAll(".tab-content").forEach(c =>
    c.classList.toggle("active", c.id === tabId)
  );

  if (tabId === "search")    handleSearch();
  if (tabId === "upload")    {}  
  if (tabId === "itemupload"){}  
  if (tabId === "edit")      renderAdminListTabs();
  if (tabId === "delete") { 
    renderDeleteUnits();
    renderDeleteItems();
  }
  if (tabId === "categorize") renderCategorizeView && renderCategorizeView();
}

window.switchTab         = switchTab;
window.confirmDeleteItem = confirmDeleteItem;


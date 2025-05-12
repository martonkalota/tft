const API_URL = "https://retoolapi.dev/DUyWF0/data";

// API adatlekérés
async function fetchData() {
  const response = await fetch(API_URL);
  return await response.json();
}

// Segédfüggvény: szétválasztja a nevet és a képlinket
function parseItemString(str) {
  if (!str || !str.includes("http")) return null;
  const lastSpaceIndex = str.lastIndexOf(" ");
  const name = str.slice(0, lastSpaceIndex);
  const url = str.slice(lastSpaceIndex + 1);
  return { name, url };
}

// Admin lista renderelése
async function renderAdminList(mode) {
  const container = document.getElementById(mode + "-list");
  container.innerHTML = "";

  const data = await fetchData();

  data.forEach(entry => {
    const card = document.createElement("div");
    card.className = "card";

    // Itemek feldolgozása
    const items = [entry.itempicture1, entry.itempicture2, entry.itempicture3]
      .map(parseItemString)
      .filter(Boolean)
      .map(item => `
        <div class="item">
          <img src="${item.url}" alt="${item.name}" title="${item.name}" class="item-icon">
          <span>${item.name}</span>
        </div>
      `).join("");

    // Trait-ek feldolgozása
    const traits = [entry.traitpicture1, entry.traitpicture2, entry.traitpicture3]
      .map(parseItemString)
      .filter(Boolean)
      .map(trait => `
        <div class="trait">
          <img src="${trait.url}" alt="${trait.name}" title="${trait.name}" class="trait-icon">
          <span>${trait.name}</span>
        </div>
      `).join("");

    card.innerHTML = `
      <img src="${entry.unitpicture}" alt="${entry.unit}" class="unit-image">
      <h3>${entry.unit}</h3>

      <div class="item-section">
        <strong>Itemek:</strong>
        <div class="item-list">${items || "<em>Nincs felszerelés</em>"}</div>
      </div>

      <div class="trait-section">
        <strong>Trait-ek:</strong>
        <div class="trait-list">${traits || "<em>Nincs trait</em>"}</div>
      </div>

      ${mode === "edit" ? `  
        <button onclick="showEditForm(${entry.id}, '${entry.unit}', '${entry.unitpicture}', 
          \`${entry.itempicture1}\`, \`${entry.itempicture2}\`, \`${entry.itempicture3}\`, 
          \`${entry.traitpicture1}\`, \`${entry.traitpicture2}\`, \`${entry.traitpicture3}\`)">🛠️ Szerkeszt</button>
        <div id="edit-form-${entry.id}"></div>
      ` : `  
        <button onclick="confirmDelete(${entry.id})">❌ Törlés</button>
      `}
    `;

    container.appendChild(card);
  });
}


function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");

  if (tabId === "edit") renderAdminList("edit");
  if (tabId === "delete") renderAdminList("delete");
}


function render(data, category, keyword) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  data.forEach(entry => {
    if (category === "unit" && entry.unit?.toLowerCase().includes(keyword)) {
      resultsContainer.innerHTML += `
        <div class="card">
          <img src="${entry.unitpicture}" alt="${entry.unit}" class="unit-image">
          <h3>${entry.unit}</h3>

          <!-- Itemek megjelenítése -->
          <div class="item-section">
            <strong>Itemek:</strong>
            <div class="item-list">
              ${[entry.itempicture1, entry.itempicture2, entry.itempicture3]
                .map(parseItemString)
                .filter(Boolean)
                .map(item => `
                  <div class="item">
                    <img src="${item.url}" alt="${item.name}" title="${item.name}" class="item-icon">
                    <span>${item.name}</span>
                  </div>
                `).join("") || "<em>Nincs felszerelés</em>"}
            </div>
          </div>

          <!-- Traitek megjelenítése -->
          <div class="trait-section">
            <strong>Trait-ek:</strong>
            <div class="trait-list">
              ${[entry.traitpicture1, entry.traitpicture2, entry.traitpicture3]
                .map(parseItemString)
                .filter(Boolean)
                .map(trait => `
                  <div class="trait">
                    <img src="${trait.url}" alt="${trait.name}" title="${trait.name}" class="trait-icon">
                    <span>${trait.name}</span>
                  </div>
                `).join("") || "<em>Nincs trait</em>"}
            </div>
          </div>
        </div>
      `;
    }

    if (category === "item") {
      for (let i = 1; i <= 3; i++) {
        const item = entry[`itempicture${i}`];
        if (item?.includes("\t")) {
          const [name, url] = item.split("\t");
          if (name.toLowerCase().includes(keyword)) {
            resultsContainer.innerHTML += `
              <div class="card">
                <img src="${url}" alt="${name}" class="unit-image">
                <span>${name}</span>
              </div>`;
          }
        }
      }
    }

    if (category === "trait") {
      for (let i = 1; i <= 3; i++) {
        const trait = entry[`traitpicture${i}`];
        if (trait?.includes("\t")) {
          const [name, url] = trait.split("\t");
          if (name.toLowerCase().includes(keyword)) {
            resultsContainer.innerHTML += `
              <div class="card">
                <img src="${url}" alt="${name}" class="unit-image">
                <span>${name}</span>
              </div>`;
          }
        }
      }
    }
  });
}

async function handleSearch() {
  const data = await fetchData();
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("category").value;
  render(data, category, keyword);
}

document.getElementById("searchInput").addEventListener("input", handleSearch);
document.getElementById("category").addEventListener("change", handleSearch);
handleSearch();

async function uploadData() {
  const data = {
    unit: document.getElementById("new-unit").value,
    unitpicture: document.getElementById("new-unitpicture").value,
    itempicture1: document.getElementById("new-item1").value,
    itempicture2: document.getElementById("new-item2").value,
    itempicture3: document.getElementById("new-item3").value,
    traitpicture1: document.getElementById("new-trait1").value,
    traitpicture2: document.getElementById("new-trait2").value,
    traitpicture3: document.getElementById("new-trait3").value
  };
  await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  alert("Feltöltve!");
}


async function confirmDelete(id) {
  if (confirm("Biztosan törlöd?")) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (res.ok) {
      alert("Törölve!");
      renderAdminList("delete");
    } else {
      alert("Hiba történt a törlés közben.");
    }
  }
}

// Szerkesztési űrlap megjelenítése
function showEditForm(id, unit, unitpicture, item1, item2, item3, trait1, trait2, trait3) {
  const form = document.getElementById("edit-form-" + id);


  if (form.classList.contains("expanded")) return;

  form.classList.add("expanded");

  form.innerHTML = `
    <div class="edit-form">
      <input id="edit-unit-${id}" value="${unit}">
      <input id="edit-unitpicture-${id}" value="${unitpicture}">
      <input id="edit-item1-${id}" value="${item1}">
      <input id="edit-item2-${id}" value="${item2}">
      <input id="edit-item3-${id}" value="${item3}">
      <input id="edit-trait1-${id}" value="${trait1}">
      <input id="edit-trait2-${id}" value="${trait2}">
      <input id="edit-trait3-${id}" value="${trait3}">
      <button class="expand-edit" onclick="submitEdit(${id})">💾 Mentés</button>
    </div>
  `;
}

async function submitEdit(id) {
  const data = {
    unit: document.getElementById(`edit-unit-${id}`).value,
    unitpicture: document.getElementById(`edit-unitpicture-${id}`).value,
    itempicture1: document.getElementById(`edit-item1-${id}`).value,
    itempicture2: document.getElementById(`edit-item2-${id}`).value,
    itempicture3: document.getElementById(`edit-item3-${id}`).value,
    traitpicture1: document.getElementById(`edit-trait1-${id}`).value,
    traitpicture2: document.getElementById(`edit-trait2-${id}`).value,
    traitpicture3: document.getElementById(`edit-trait3-${id}`).value
  };
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    alert("Sikeres módosítás!");
    renderAdminList("edit");
  }
}

const API_URL = "https://retoolapi.dev/DUyWF0/data";

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");

  if (tabId === "edit") renderAdminList("edit");
  if (tabId === "delete") renderAdminList("delete");
}
async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}

function render(data, category, keyword) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  data.forEach(entry => {
    if (category === "unit" && entry.unit?.toLowerCase().includes(keyword)) {
      resultsContainer.innerHTML += `
        <div class="card">
          <img src="${entry.unitpicture}" alt="${entry.unit}">
          <span>${entry.unit}</span>

          <!-- Itemek megjelenítése -->
          <div class="item-container">
            ${[1, 2, 3].map(i => {
              const item = entry[`itempicture${i}`];
              if (item?.includes("\t")) {
                const [name, url] = item.split("\t");
                return `<div class="item"><img src="${url}" alt="${name}" title="${name}"></div>`;
              }
              return '';
            }).join('')}
          </div>

          <!-- Traitek megjelenítése -->
          <div class="trait-container">
            ${[1, 2, 3].map(i => {
              const trait = entry[`traitpicture${i}`];
              if (trait?.includes("\t")) {
                const [name, url] = trait.split("\t");
                return `<div class="trait"><img src="${url}" alt="${name}" title="${name}"></div>`;
              }
              return '';
            }).join('')}
          </div>
        </div>`;
    }

    if (category === "item") {
      for (let i = 1; i <= 3; i++) {
        const item = entry[`itempicture${i}`];
        if (item?.includes("\t")) {
          const [name, url] = item.split("\t");
          if (name.toLowerCase().includes(keyword)) {
            resultsContainer.innerHTML += `
              <div class="card">
                <img src="${url}" alt="${name}">
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
                <img src="${url}" alt="${name}">
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
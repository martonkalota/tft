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
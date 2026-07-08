// Beispielhafte Annahmen: durchschnittliches Abfallaufkommen in kg pro Person und Tag (Deutschland, grobe Richtwerte)
const WASTE_TYPES = [
  { key: "restmuell", label: "Restmüll", kgPerPersonPerDay: 0.35, color: "#8a8f89", billable: true },
  { key: "bio", label: "Bioabfall", kgPerPersonPerDay: 0.25, color: "#6b8f4e", billable: false },
  { key: "papier", label: "Papier / Karton", kgPerPersonPerDay: 0.18, color: "#a6845c", billable: false },
  { key: "verpackung", label: "Verpackungen (Gelbe Tonne)", kgPerPersonPerDay: 0.12, color: "#4f7cac", billable: false },
  { key: "glas", label: "Glas", kgPerPersonPerDay: 0.04, color: "#4fa9a2", billable: false },
];

const PRICE_PER_KG_RESTMUELL = 0.30; // Euro, Annahme für die Restmüllentsorgung

const personsInput = document.getElementById("persons");
const periodSelect = document.getElementById("period");
const assumptionsEl = document.getElementById("assumptions");
const resultEl = document.getElementById("result");
const chartEl = document.getElementById("chart");
document.getElementById("priceLabel").textContent = PRICE_PER_KG_RESTMUELL.toFixed(2);

function buildAssumptionRows() {
  assumptionsEl.innerHTML = "";
  WASTE_TYPES.forEach((type) => {
    const row = document.createElement("div");
    row.className = "assumption-row";
    row.innerHTML = `
      <span class="swatch" style="background:${type.color}"></span>
      <label for="rate-${type.key}">${type.label}</label>
      <input type="number" id="rate-${type.key}" min="0" step="0.01" value="${type.kgPerPersonPerDay}" />
    `;
    assumptionsEl.appendChild(row);
  });
}

function currentRates() {
  return WASTE_TYPES.map((type) => ({
    ...type,
    kgPerPersonPerDay: parseFloat(document.getElementById(`rate-${type.key}`).value) || 0,
  }));
}

function formatKg(value) {
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 1 })} kg`;
}

function formatEuro(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function calculate() {
  const persons = Math.max(0, parseInt(personsInput.value, 10) || 0);
  const days = parseInt(periodSelect.value, 10);
  const rates = currentRates();

  const perType = rates.map((type) => ({
    ...type,
    totalKg: type.kgPerPersonPerDay * persons * days,
  }));

  const totalKg = perType.reduce((sum, t) => sum + t.totalKg, 0);
  const restmuellKg = perType.find((t) => t.key === "restmuell")?.totalKg || 0;
  const cost = restmuellKg * PRICE_PER_KG_RESTMUELL;

  renderResult(perType, totalKg, cost);
  renderChart(perType, totalKg);
}

function renderResult(perType, totalKg, cost) {
  resultEl.innerHTML = "";
  perType.forEach((t) => {
    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `<span>${t.label}</span><span class="value">${formatKg(t.totalKg)}</span>`;
    resultEl.appendChild(row);
  });

  const totalRow = document.createElement("div");
  totalRow.className = "result-row total";
  totalRow.innerHTML = `<span>Gesamt</span><span class="value">${formatKg(totalKg)}</span>`;
  resultEl.appendChild(totalRow);

  const costRow = document.createElement("div");
  costRow.className = "result-row total";
  costRow.innerHTML = `<span>Geschätzte Entsorgungskosten</span><span class="value">${formatEuro(cost)}</span>`;
  resultEl.appendChild(costRow);
}

function renderChart(perType, totalKg) {
  chartEl.innerHTML = "";
  if (totalKg <= 0) return;
  perType.forEach((t) => {
    if (t.totalKg <= 0) return;
    const seg = document.createElement("div");
    seg.className = "seg";
    seg.style.width = `${(t.totalKg / totalKg) * 100}%`;
    seg.style.background = t.color;
    seg.title = `${t.label}: ${formatKg(t.totalKg)}`;
    chartEl.appendChild(seg);
  });
}

buildAssumptionRows();
[personsInput, periodSelect].forEach((el) => el.addEventListener("input", calculate));
assumptionsEl.addEventListener("input", calculate);
calculate();

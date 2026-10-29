/* Values labelled "general" are not species-specific and are only educational guides. */
const SPECIES = {
  cow: {
    label: "Cow", emoji: "🐄", size: "large",
    normalTempRange: { lo: 38.0, hi: 39.3, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 21" }
  },
  sheep: {
    label: "Sheep", emoji: "🐑", size: "small",
    normalTempRange: { lo: 38.3, hi: 39.9, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 21" }
  },
  camel: { label: "Camel", emoji: "🐪", size: "large", normalTempRange: null }
};

const SIGNS = {
  rigor: {
    none: { label: "None yet / primary flaccidity", lo: 0, hi: 6 },
    developing: { label: "Developing (partial)", lo: 2, hi: 6 },
    full: { label: "Full (rigid)", lo: 6, hi: 12 },
    passing: { label: "Passed off / absent again", lo: 24, hi: 48 }
  },
  livor: {
    none: { label: "Not visible", lo: 0, hi: 2 },
    moving: { label: "Present, shifts when body moved", lo: 0.3333333333, hi: 12 },
    fixed: { label: "Present and fixed", lo: 6, hi: 12 }
  }
};

const LIVOR_EVIDENCE = "General (not species-specific) ranges from deathp2.json, citing death p2.pdf pp. 5 and 10.";
const RIGOR_EVIDENCE = "General (not species-specific) ranges from identical deathp1.json and deathp3.json, citing death p1.pdf, PDF p. 15.";
const COOLING_RATE = { lo: 0.5, hi: 1.5, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 15" };
const EQUILIBRATION_HOURS = {
  large: { lo: 8, hi: 12, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 26" },
  small: { lo: 5, hi: 7, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 26" }
};

const $ = id => document.getElementById(id);
let speciesKey = "cow";
let data = getData();
let deferredInstallPrompt;

const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

function getData() {
  return { ...SPECIES[speciesKey], rigor: SIGNS.rigor, livor: SIGNS.livor };
}

function fillSelect(element, items) {
  element.innerHTML = '<option value="">Not checked</option>' +
    Object.entries(items).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join("");
}

function renderSpecies() {
  data = getData();
  $("title").textContent = `${data.emoji} ${data.label} — Time Since Death`;
  $("verifyNote").textContent = `⚠ Educational prototype: some values have source citations, but rigor, livor, and cooling guidance is general rather than ${data.label.toLowerCase()}-specific. Do not use this output as a forensic conclusion.`;
  $("ref").innerHTML =
    "<table><tr><th>Sign</th><th>State</th><th>Hours</th></tr>" +
    Object.values(data.rigor).map(item => `<tr><td>Rigor</td><td>${item.label}</td><td>${item.lo}–${item.hi}</td></tr>`).join("") +
    Object.values(data.livor).map(item => `<tr><td>Livor</td><td>${item.label}</td><td>${item.lo}–${item.hi}</td></tr>`).join("") +
    `</table><p class="reference-detail"><strong>Rigor:</strong> ${RIGOR_EVIDENCE}</p>` +
    `<p class="reference-detail"><strong>Livor:</strong> ${LIVOR_EVIDENCE}</p>` +
    `<p class="reference-detail"><strong>Body temperature:</strong> ${data.normalTempRange ? `${data.normalTempRange.lo}–${data.normalTempRange.hi} °C (${data.normalTempRange.source}).` : `No ${data.label.toLowerCase()} normal-temperature range is supplied, so temperature cooling is disabled.`}</p>` +
    `<p class="reference-detail"><strong>Cooling:</strong> General rate ${COOLING_RATE.lo}–${COOLING_RATE.hi} °C/h (${COOLING_RATE.source}); ${data.size}-animal equilibration ${EQUILIBRATION_HOURS[data.size].lo}–${EQUILIBRATION_HOURS[data.size].hi} h (${EQUILIBRATION_HOURS[data.size].source}).</p>`;
}

function coolingWindow(temp, ambient) {
  if (!data.normalTempRange) return { skip: `No sourced normal-temperature range is available for ${data.label.toLowerCase()}, so body cooling cannot be estimated.` };
  const normal = data.normalTempRange;
  if (normal.hi - ambient <= 1) return { skip: "Ambient temperature is too close to the normal body-temperature range for this method." };
  if (temp < ambient - 0.5) return { skip: "Measured body temperature is below ambient temperature; re-check the measurement and conditions." };
  if (temp - ambient <= 0.5) {
    const equilibration = EQUILIBRATION_HOURS[data.size];
    return { lo: equilibration.lo, hi: equilibration.hi, name: "Body temperature", detail: `Near ambient; general ${data.size}-animal equilibration guide` };
  }
  if (temp >= normal.hi) return { lo: 0, hi: 1, name: "Body temperature", detail: "Still at or above the sourced normal-temperature range" };
  const lo = Math.max(0, (normal.lo - temp) / COOLING_RATE.hi);
  const hi = Math.max(0, (normal.hi - temp) / COOLING_RATE.lo);
  return { lo, hi, name: "Body temperature", detail: `General cooling guide (${COOLING_RATE.lo}–${COOLING_RATE.hi} °C/h)` };
}

function estimate() {
  const windows = [];
  const skipped = [];
  const rigor = $("rigor").value;
  const livor = $("livor").value;
  if (rigor) windows.push({ name: "Rigor mortis", detail: data.rigor[rigor].label, ...data.rigor[rigor] });
  if (livor) windows.push({ name: "Livor mortis", detail: data.livor[livor].label, ...data.livor[livor] });
  const temp = parseFloat($("temp").value);
  const ambient = parseFloat($("amb").value);
  if (!isNaN(temp) && !isNaN(ambient)) {
    const window = coolingWindow(temp, ambient);
    if (window.skip) skipped.push(window.skip); else windows.push(window);
  } else if (!isNaN(temp) || !isNaN(ambient)) {
    skipped.push("Enter both rectal and ambient temperature to use body cooling.");
  }
  return { windows, skipped };
}

const formatHours = hours => hours === Infinity ? "∞" : (hours < 10 ? hours.toFixed(1) : Math.round(hours)).toString();
const range = (lo, hi) => hi === Infinity ? `${formatHours(lo)}+ h` : `${formatHours(lo)}–${formatHours(hi)} h`;

function showInstallModal(type) {
  $("installModal").hidden = false;
  $("installButton").hidden = type !== "prompt";
  $("iosInstallInstructions").hidden = type !== "ios";
  $("installMessage").textContent = type === "ios"
    ? "Add the estimator to your iPhone or iPad home screen for quick access."
    : "Add the estimator to your phone for quick access, even when you are offline.";
}

function closeInstallModal() {
  $("installModal").hidden = true;
}

$("species").innerHTML = Object.entries(SPECIES)
  .map(([key, value]) => `<option value="${key}">${value.emoji} ${value.label}</option>`).join("");
fillSelect($("rigor"), data.rigor);
fillSelect($("livor"), data.livor);
$("species").addEventListener("change", event => {
  speciesKey = event.target.value;
  renderSpecies();
  $("out").innerHTML = "";
});
$("closeInstall").addEventListener("click", closeInstallModal);
$("installModal").addEventListener("click", event => {
  if (event.target === $("installModal")) closeInstallModal();
});
$("installButton").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = undefined;
  closeInstallModal();
});
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallModal("prompt");
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = undefined;
  closeInstallModal();
});
$("f").addEventListener("submit", event => {
  event.preventDefault();
  const { windows, skipped } = estimate();
  let html = '<div class="card">';
  if (!windows.length) {
    html += "<p>Select at least one sign (or enter both temperatures) to get an estimate.</p>";
  } else {
    const lo = Math.max(...windows.map(item => item.lo));
    const hi = Math.min(...windows.map(item => item.hi));
    if (lo > hi) {
      html += '<div class="warn"><b>Signs conflict.</b> The observed signs do not overlap in time, so no single range is reliable. Re-check your observations and the environment (heat, cold, exertion before death).</div>';
    } else {
      const confidence = windows.length >= 3 ? ["High", ""] : windows.length === 2 ? ["Medium", ""] : ["Low", "low"];
      html += `<div>Estimated time since death</div><div class="range">${range(lo, hi)}</div><span class="pill ${confidence[1]}">Confidence: ${confidence[0]} (${windows.length} sign${windows.length > 1 ? "s" : ""})</span>`;
    }
    html += "<h3 class='sign-heading'>What each sign says</h3><ul>" +
      windows.map(item => `<li><b>${item.name}</b> — ${item.detail}: ${range(item.lo, item.hi)}</li>`).join("") + "</ul>";
  }
  if (skipped.length) html += "<ul>" + skipped.map(item => `<li class=\"skipped\">${item}</li>`).join("") + "</ul>";
  $("out").innerHTML = html + "</div>";
  $("out").scrollIntoView({ behavior: "smooth" });
});

renderSpecies();
if (isIos && !isStandalone) showInstallModal("ios");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");

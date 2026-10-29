"use client";

import { useState } from "react";
import InstallPrompt from "./components/InstallPrompt";

const species = {
  cow: { label: "Cow", emoji: "🐄", size: "large", normal: { lo: 38.0, hi: 39.3, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 21" } },
  sheep: { label: "Sheep", emoji: "🐑", size: "small", normal: { lo: 38.3, hi: 39.9, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 21" } },
  camel: { label: "Camel", emoji: "🐪", size: "large", normal: null }
};

const signs = {
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

const coolingRate = { lo: 0.5, hi: 1.5, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 15" };
const equilibration = {
  large: { lo: 8, hi: 12, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 26" },
  small: { lo: 5, hi: 7, source: "deathp1.json / deathp3.json; death p1.pdf, PDF p. 26" }
};

const formatHours = value => value === Infinity ? "∞" : (value < 10 ? value.toFixed(1) : Math.round(value)).toString();
const hourRange = (lo, hi) => hi === Infinity ? `${formatHours(lo)}+ h` : `${formatHours(lo)}–${formatHours(hi)} h`;

function coolingWindow(animal, temp, ambient) {
  if (!animal.normal) return { skip: `No sourced normal-temperature range is available for ${animal.label.toLowerCase()}, so body cooling cannot be estimated.` };
  if (animal.normal.hi - ambient <= 1) return { skip: "Ambient temperature is too close to the normal body-temperature range for this method." };
  if (temp < ambient - 0.5) return { skip: "Measured body temperature is below ambient temperature; re-check the measurement and conditions." };
  if (temp - ambient <= 0.5) {
    const range = equilibration[animal.size];
    return { lo: range.lo, hi: range.hi, name: "Body temperature", detail: `Near ambient; general ${animal.size}-animal equilibration guide` };
  }
  if (temp >= animal.normal.hi) return { lo: 0, hi: 1, name: "Body temperature", detail: "Still at or above the sourced normal-temperature range" };
  return {
    lo: Math.max(0, (animal.normal.lo - temp) / coolingRate.hi),
    hi: Math.max(0, (animal.normal.hi - temp) / coolingRate.lo),
    name: "Body temperature",
    detail: `General cooling guide (${coolingRate.lo}–${coolingRate.hi} °C/h)`
  };
}

export default function Home() {
  const [speciesKey, setSpeciesKey] = useState("cow");
  const [rigor, setRigor] = useState("");
  const [livor, setLivor] = useState("");
  const [temp, setTemp] = useState("");
  const [ambient, setAmbient] = useState("");
  const [result, setResult] = useState(null);
  const animal = species[speciesKey];

  const changeSpecies = event => {
    setSpeciesKey(event.target.value);
    setResult(null);
  };

  const estimate = event => {
    event.preventDefault();
    const windows = [];
    const skipped = [];
    if (rigor) windows.push({ name: "Rigor mortis", detail: signs.rigor[rigor].label, ...signs.rigor[rigor] });
    if (livor) windows.push({ name: "Livor mortis", detail: signs.livor[livor].label, ...signs.livor[livor] });
    const tempNumber = Number.parseFloat(temp);
    const ambientNumber = Number.parseFloat(ambient);
    if (!Number.isNaN(tempNumber) && !Number.isNaN(ambientNumber)) {
      const window = coolingWindow(animal, tempNumber, ambientNumber);
      if (window.skip) skipped.push(window.skip); else windows.push(window);
    } else if (!Number.isNaN(tempNumber) || !Number.isNaN(ambientNumber)) {
      skipped.push("Enter both rectal and ambient temperature to use body cooling.");
    }
    setResult({ windows, skipped });
  };

  return (
    <main>
      <h1>{animal.emoji} {animal.label} — Time Since Death</h1>
      <p className="sub">Rule-based estimate from post-mortem signs. Leave a field as “Not checked” if you did not observe it.</p>
      <div className="note">⚠ Educational prototype: some values have source citations, but rigor, livor, and cooling guidance is general rather than {animal.label.toLowerCase()}-specific. Do not use this output as a forensic conclusion.</div>

      <form className="card form-card" onSubmit={estimate}>
        <label htmlFor="species">Animal</label>
        <select id="species" value={speciesKey} onChange={changeSpecies}>
          {Object.entries(species).map(([key, item]) => <option key={key} value={key}>{item.emoji} {item.label}</option>)}
        </select>

        <label htmlFor="rigor">Rigor mortis (muscle stiffness)</label>
        <select id="rigor" value={rigor} onChange={event => setRigor(event.target.value)}>
          <option value="">Not checked</option>
          {Object.entries(signs.rigor).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>

        <label htmlFor="livor">Livor mortis (skin redness / blood pooling)</label>
        <select id="livor" value={livor} onChange={event => setLivor(event.target.value)}>
          <option value="">Not checked</option>
          {Object.entries(signs.livor).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>

        <label htmlFor="temp">Rectal temperature <small>(°C)</small></label>
        <input id="temp" type="number" step="0.1" inputMode="decimal" placeholder="e.g. 31.5" value={temp} onChange={event => setTemp(event.target.value)} />

        <label htmlFor="ambient">Ambient temperature <small>(°C)</small></label>
        <input id="ambient" type="number" step="0.1" inputMode="decimal" placeholder="e.g. 24" value={ambient} onChange={event => setAmbient(event.target.value)} />
        <button type="submit">Estimate</button>
      </form>

      {result && <section className="card result" aria-live="polite">
        {!result.windows.length ? <p>Select at least one sign (or enter both temperatures) to get an estimate.</p> : <Result windows={result.windows} />}
        {result.skipped.length > 0 && <ul>{result.skipped.map(item => <li className="skipped" key={item}>{item}</li>)}</ul>}
      </section>}

      <section className="card">
        <details>
          <summary>Reference data used</summary>
          <div className="reference">
            <table><thead><tr><th>Sign</th><th>State</th><th>Hours</th></tr></thead><tbody>
              {Object.values(signs.rigor).map(item => <tr key={`r-${item.label}`}><td>Rigor</td><td>{item.label}</td><td>{item.lo}–{item.hi}</td></tr>)}
              {Object.values(signs.livor).map(item => <tr key={`l-${item.label}`}><td>Livor</td><td>{item.label}</td><td>{item.lo}–{item.hi}</td></tr>)}
            </tbody></table>
            <p className="reference-detail"><strong>Rigor:</strong> General ranges from identical deathp1.json and deathp3.json, citing death p1.pdf, PDF p. 15.</p>
            <p className="reference-detail"><strong>Livor:</strong> General ranges from deathp2.json, citing death p2.pdf pp. 5 and 10.</p>
            <p className="reference-detail"><strong>Body temperature:</strong> {animal.normal ? `${animal.normal.lo}–${animal.normal.hi} °C (${animal.normal.source}).` : `No ${animal.label.toLowerCase()} normal-temperature range is supplied, so temperature cooling is disabled.`}</p>
            <p className="reference-detail"><strong>Cooling:</strong> General rate {coolingRate.lo}–{coolingRate.hi} °C/h ({coolingRate.source}); {animal.size}-animal equilibration {equilibration[animal.size].lo}–{equilibration[animal.size].hi} h ({equilibration[animal.size].source}).</p>
          </div>
        </details>
      </section>
      <p className="foot">Estimate only, not a legal forensic conclusion. Real timing varies with environment, body condition, cause of death and exertion before death.</p>

      <InstallPrompt />
    </main>
  );
}

function Result({ windows }) {
  const lo = Math.max(...windows.map(item => item.lo));
  const hi = Math.min(...windows.map(item => item.hi));
  if (lo > hi) return <div className="warn"><strong>Signs conflict.</strong> The observed signs do not overlap in time, so no single range is reliable. Re-check your observations and the environment.</div>;
  const confidence = windows.length >= 3 ? "High" : windows.length === 2 ? "Medium" : "Low";
  return <>
    <div>Estimated time since death</div>
    <div className="range">{hourRange(lo, hi)}</div>
    <span className={`pill ${confidence === "Low" ? "low" : ""}`}>Confidence: {confidence} ({windows.length} sign{windows.length > 1 ? "s" : ""})</span>
    <h3 className="sign-heading">What each sign says</h3>
    <ul>{windows.map(item => <li key={item.name}><strong>{item.name}</strong> — {item.detail}: {hourRange(item.lo, item.hi)}</li>)}</ul>
  </>;
}

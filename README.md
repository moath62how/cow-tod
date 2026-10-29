# Livestock Time-Since-Death Estimator

A small, rule-based prototype for recording selected post-mortem signs in cows, sheep, and camels and presenting a **rough time-since-death range**. It is an educational aid, not a diagnostic tool or a veterinary-forensic conclusion.

## Run the Next.js app

Install dependencies, then start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` followed by `npm run start` to run the production build. The user interface is in `app/page.jsx`, global styles are in `app/globals.css`, and `app/api/reference-data` serves the consolidated reference catalog.

## Signs to record

The initial observations suggested for the project are:

- **Skin:** note pallor and any red or purple discoloration separately. Generalized pallor and dependent blood pooling (livor mortis) are different observations and should not be treated as the same sign.
- **Body temperature:** record the measured rectal temperature, the time it was measured, and the ambient temperature. “Cold” alone is too subjective to estimate an interval.
- **Eyes/pupils:** record pupil size and whether the pupils respond to light, if assessed. A statement that the eye “does not dilate” is ambiguous and should be clarified; pupil findings alone are not a reliable clock.
- **Muscles:** record whether rigor mortis is absent, developing, fully established, or passing off. Its onset and duration vary.

These signs can change after death, but none gives an exact time on its own. Cooling and rigor are affected by factors including ambient conditions, body size and condition, clothing or covering, airflow, contact with surfaces, cause of death, and activity before death. Redness can also have different causes, so it should not automatically be interpreted as lividity.

## Estimation approach

For an early prototype, use **transparent rules** that combine observations into a broad range and explicitly allow “insufficient information.” This is easier to inspect and safer than claiming precision from a decision tree or machine-learning model when there is no suitable dataset.

The app's timing estimates are educational only. General post-mortem windows are not validated for each species, and camel temperature can vary substantially with hydration and time of day. The consolidated animal data file records that uncertainty for every species.

## Included evidence

`deathp2.json` provides general (not cow-, sheep-, or camel-specific) livor-mortis ranges cited to *death p2.pdf*: first appearance at approximately 20 minutes to 2 hours, and fixation at 6–12 hours. The application uses these general values for its livor windows and identifies their limited applicability in the reference panel.

`deathp1.json` provides cited normal-temperature ranges for cattle (38.0–39.3 °C) and sheep (38.3–39.9 °C), plus general rigor and cooling guidance. `deathp3.json` is byte-for-byte identical to `deathp1.json`, so it is retained as a duplicate reference rather than counted as independent supporting evidence. The app uses the cattle and sheep ranges plus general cooling and equilibration guidance. The new camel references show a wide, hydration- and time-dependent live temperature range, so the app continues to omit a single camel baseline for cooling estimates. The supplied project extractions provide no cow-, sheep-, or camel-specific post-mortem timing test cases.

`animal_pmi_data.json` consolidates the animals named across the supplied reference files and the app, merges aliases, records live-animal temperature references when available, and attaches the general rigor, livor, and cooling guidance to each animal with its inferred status. It includes dog, horse, cattle/cow, sheep, goat, pig, cat, rabbit, chicken/poultry, deer, giraffe, and camel. “Hanging animal” is kept as a giraffe posture label. The file keeps conflicting general equilibration claims visible, marks variable-size species for size-specific handling, and does not treat a normal live temperature as a postmortem baseline. Some additional normal-temperature references come from the Merck Veterinary Manual, FAO, and giraffe field references; links and their applicability notes are included in the JSON. The app selector still uses its existing cow, sheep, and camel options; this file is the broader reference catalog.

The original extraction files (`deathp1.json`, `deathp2.json`, `deathp3.json`, and the empty `deathwithlongname.json`) are retained locally and ignored by Git. Their consolidated data and source notes are recorded in `animal_pmi_data.json`.

If the project later collects enough reliable data, a statistical model could be evaluated. Each record should include the known time of death, species/breed, body and ambient temperatures with measurement times, the observed signs, and relevant environmental and animal factors. Keep records separated for model training and testing, validate on cases not used for training, report an uncertainty interval and error metrics, and compare performance with a simple rule-based baseline. A decision tree is one possible model, but it is not inherently more accurate; small or biased datasets can make it misleading.

## Limitations

The output is only an approximate educational estimate. Do not use it to determine legal facts, certify a time of death, or replace examination by a veterinarian or forensic specialist. When the evidence is incomplete or conflicting, the application should say that it cannot make a useful estimate rather than provide false precision.

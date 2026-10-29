# Livestock Time-Since-Death Estimator

A small, rule-based prototype for recording selected post-mortem signs in cows, sheep, and camels and presenting a **rough time-since-death range**. It is an educational aid, not a diagnostic tool or a veterinary-forensic conclusion.

## Signs to record

The initial observations suggested for the project are:

- **Skin:** note pallor and any red or purple discoloration separately. Generalized pallor and dependent blood pooling (livor mortis) are different observations and should not be treated as the same sign.
- **Body temperature:** record the measured rectal temperature, the time it was measured, and the ambient temperature. “Cold” alone is too subjective to estimate an interval.
- **Eyes/pupils:** record pupil size and whether the pupils respond to light, if assessed. A statement that the eye “does not dilate” is ambiguous and should be clarified; pupil findings alone are not a reliable clock.
- **Muscles:** record whether rigor mortis is absent, developing, fully established, or passing off. Its onset and duration vary.

These signs can change after death, but none gives an exact time on its own. Cooling and rigor are affected by factors including ambient conditions, body size and condition, clothing or covering, airflow, contact with surfaces, cause of death, and activity before death. Redness can also have different causes, so it should not automatically be interpreted as lividity.

## Estimation approach

For an early prototype, use **transparent rules** that combine observations into a broad range and explicitly allow “insufficient information.” This is easier to inspect and safer than claiming precision from a decision tree or machine-learning model when there is no suitable dataset.

Before using any timing thresholds, have them checked against veterinary forensic references and reviewed by a qualified veterinary professional. The thresholds and constants currently present in the application are marked as **unverified placeholders** and must not be presented as scientifically validated. Sheep and camel settings are separate placeholders; camel temperature in particular can vary substantially with environmental conditions.

If the project later collects enough reliable data, a statistical model could be evaluated. Each record should include the known time of death, species/breed, body and ambient temperatures with measurement times, the observed signs, and relevant environmental and animal factors. Keep records separated for model training and testing, validate on cases not used for training, report an uncertainty interval and error metrics, and compare performance with a simple rule-based baseline. A decision tree is one possible model, but it is not inherently more accurate; small or biased datasets can make it misleading.

## Limitations

The output is only an approximate educational estimate. Do not use it to determine legal facts, certify a time of death, or replace examination by a veterinarian or forensic specialist. When the evidence is incomplete or conflicting, the application should say that it cannot make a useful estimate rather than provide false precision.

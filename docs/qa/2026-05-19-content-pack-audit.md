# Content Pack Audit - 2026-05-19

Supersedes [`2026-04-28-content-pack-audit.md`](2026-04-28-content-pack-audit.md). Refresh
triggered by the LearnerProfile migration capstone (Phase 3.5 + 5 + 6) and
Slice 22 (fact_drill mechanic + division skill pair) landing.

## Ulatus

Audit katab runtime registritest loetud curriculum seisu:

- `skillRegistry`: kõik registreeritud `Skill` kirjed.
- `contentPackRegistry`: kõik registreeritud `ContentPack` kirjed.
- `gameRegistry`: kõik 34 mängu/bindingut pärast `src/games/registrations.ts` importi.

Audit on korratav koodiga `buildCurriculumAuditReport()` failis
`src/diagnostics/curriculumAudit.ts`.

## Kokkuvõte

| Mõõdik                 | 2026-04-28 | 2026-05-19 | Δ   |
| ---------------------- | ---------- | ---------- | --- |
| Skillid                | 19         | 23         | +4  |
| Content packid         | 22         | 28         | +6  |
| Game bindingud         | 23         | 34         | +11 |
| Packid ilma tarbijata  | 0          | 0          | =   |
| Skillid ilma packita   | 0          | 0          | =   |
| Skillid ilma tarbijata | 0          | 0          | =   |
| Packid alla 6 itemi    | 6          | 8          | +2  |
| Shallow-warninguga     | 0          | 0          | =   |

Δ allikad:

- **+8 bindingut** Slice 22 `fact_drill` mehaanikast (8 ajutiste mängude perekond).
- **+2 skilli** `math.division_facts_1_5` ja `math.division_facts_1_10` (Slice 22).
- **+2 packi** divisioni DSL-spec poolid (Slice 22).
- **+2 packi** `language.vocabulary.long_words.{en,et}` (Word Cascade Long binding).
- **+2 packi** `math.multiplication_1_*.battlelearn` BattleLearn variantide jaoks.
- **+3 bindingut** Word Cascade Long + BattleLearn Multiplication × 2.

Struktuurselt curriculum on terve — iga skill seotud, iga pack tarbitud.

## Packide tabel + owner-otsus

Owner-otsus järgib Phase 1.5 "Done when" formaati: **OK / DSL-spec OK / expand / merge / replace**. Kus "OK" = praeguse mehaaniku jaoks piisav, "expand" = autoreeritud sisu napp ja vajab juurde, "merge" = pack on dubleeritud teise omaga, "replace" = sisu vale.

| Pack                                       | Skill                       | Items | Tarbija(d)                                                      | Owner-otsus                                                                                                                                                          |
| ------------------------------------------ | --------------------------- | ----- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `astronomy.visible_from_estonia`           | Tähtkujud                   | 16    | `star_mapper`                                                   | **OK** — Eestist nähtavate tähtkujude suletud hulk; lisamine läheks vastuollu skilli enda nimega.                                                                    |
| `language.spatial_sentences.scene_pack`    | Asukohalaused               | 20    | `sentence_logic`                                                | **OK** — 2026-05-19 laienes 8 → 20 stseeni (talu, mängumaa, veealune, aed, vannituba, spordiväljak, talv, kohvik, garderoob, rongijaam, kelder, muusikatuba).        |
| `language.syllabification.en`              | Silbitamine                 | 35    | `syllable_builder`                                              | **OK** — piisav sügavus 1.-2. klassi tasemel.                                                                                                                        |
| `language.syllabification.et`              | Silbitamine                 | 51    | `syllable_builder`                                              | **OK** — piisav sügavus eesti silbiplaadiks; Slice 11 metadata curated.                                                                                              |
| `language.vocabulary.en`                   | Sõnavara                    | 90    | `letter_match`, `picture_pairs`, `word_builder`, `word_cascade` | **OK; copy-reviewed** (Slice 15).                                                                                                                                    |
| `language.vocabulary.et`                   | Sõnavara                    | 200   | `letter_match`, `picture_pairs`, `word_builder`, `word_cascade` | **OK; copy-reviewed** — 2026-05-19 lisapass eemaldas 7 duplikaat-pluraali / 9-tähelist / niche-sõna (RAAMATUD, TÄHED, LUMESADU, ŠOKOLAAD, MUUSIK, STOPPER, KAARDID). |
| `language.vocabulary.long_words.en`        | Sõnavara (pikad sõnad)      | 20    | `word_cascade_long`                                             | **OK** — pika-sõna alamhulk; Slice 14/15 toimetused jõustusid.                                                                                                       |
| `language.vocabulary.long_words.et`        | Sõnavara (pikad sõnad)      | 20    | `word_cascade_long`                                             | **OK** — pika-sõna alamhulk.                                                                                                                                         |
| `math.addition_memory.core`                | Liitmistehete meeldejätmine | 8     | `memory_math`                                                   | **OK** — 8 stage'i = 8 progressionitaset; generaator loob võrrandid procedurally.                                                                                    |
| `math.addition_within_100`                 | Liitmine kuni 100           | 2     | `addition_big_snake`, `addition_fact_drill_within_100`          | **DSL-spec OK** — protseduuriline spec-pool, op-variants + range katavad ruumi.                                                                                      |
| `math.addition_within_20`                  | Liitmine kuni 20            | 2     | `addition_fact_drill_within_20`, `addition_snake`               | **DSL-spec OK**.                                                                                                                                                     |
| `math.balance_equations.core`              | Tasakaaluvõrrandid          | 6     | `balance_scale`                                                 | **OK** — 6 stage'i, generaator skaleerib sum-range + distractor-id.                                                                                                  |
| `math.compare_numbers.core`                | Arvude võrdlemine           | 7     | `compare_sizes`                                                 | **OK** — 7 progressionitaset, generaator genereerib väärtused.                                                                                                       |
| `math.division_facts_1_10`                 | Jagamine 1-10               | 2     | `division_fact_drill_1_10`                                      | **DSL-spec OK** — Slice 22; div_result + div_missing katavad ruumi.                                                                                                  |
| `math.division_facts_1_5`                  | Jagamine 1-5                | 2     | `division_fact_drill_1_5`                                       | **DSL-spec OK**.                                                                                                                                                     |
| `math.geometry_shapes.shape_dash_basics`   | Geomeetrilised kujundid     | 39    | `shape_dash`                                                    | **OK** — 32 checkpoint'i + 7 gate-prompt'i.                                                                                                                          |
| `math.geometry_shapes.shape_shift_puzzles` | Geomeetrilised kujundid     | 25    | `shape_shift`                                                   | **OK; expand-recommended** — 2026-05-19 laienes 20 → 25 puzzle'it (lill, jäätis, tuulelohe, lumememm, tuletorn). Sihtmaht ~30 jääb järelpassiks.                     |
| `math.grid_navigation.core`                | Ruudustikul liikumine       | 14    | `robo_path`                                                     | **OK** — stage configs + staged kinds; generaator omab pathfindingut.                                                                                                |
| `math.mixed_problem_solving.battlelearn`   | Segatüüpi probleemülesanded | 36    | `battlelearn`                                                   | **OK**.                                                                                                                                                              |
| `math.multiplication_1_10`                 | Korrutustabel 1-10          | 2     | `multiplication_big_snake`, `multiplication_fact_drill_1_10`    | **DSL-spec OK**.                                                                                                                                                     |
| `math.multiplication_1_10.battlelearn`     | Korrutustabel 1-10          | 14    | `battlelearn_multiplication`                                    | **OK** — stage-based küsimustepool BattleLearn variandile.                                                                                                           |
| `math.multiplication_1_5`                  | Korrutustabel 1-5           | 2     | `multiplication_fact_drill_1_5`, `multiplication_snake`         | **DSL-spec OK**.                                                                                                                                                     |
| `math.multiplication_1_5.battlelearn`      | Korrutustabel 1-5           | 14    | `battlelearn_multiplication_1_5`                                | **OK** — stage-based küsimustepool.                                                                                                                                  |
| `math.pattern_sequences.core`              | Mustrijadad                 | 11    | `pattern`                                                       | **OK** — 6 template'i + 5 teemat = 30 kombinatsiooni.                                                                                                                |
| `math.subtraction_within_100`              | Lahutamine kuni 100         | 3     | `subtraction_big_snake`, `subtraction_fact_drill_within_100`    | **DSL-spec OK**.                                                                                                                                                     |
| `math.subtraction_within_20`               | Lahutamine kuni 20          | 3     | `subtraction_fact_drill_within_20`, `subtraction_snake`         | **DSL-spec OK**.                                                                                                                                                     |
| `math.time_reading.core`                   | Kellaaja lugemine           | 8     | `time_match`                                                    | **OK** — 8 progressionitaset täistundidest 5-min täpsuseni + digital match.                                                                                          |
| `math.unit_conversions.core`               | Ühikute teisendamine        | 14    | `unit_conversion`                                               | **OK** — 7 conversion-it + 7 stage'i.                                                                                                                                |

## Kokkuvõte: Phase 1.5 content-pass sulgub

Pärast 2026-05-19 lisapassi on **kõik 28 packi owner-otsuse järgi OK**:

- **Sentence Logic**: 8 → 20 stseeni. Kordusväsimuse risk lahendatud.
- **Estonian vocabulary**: 207 → 200, 7 duplikaat-pluraali / 9-tähelist / niche-sõna eemaldatud Slice 14 reegli järgi.
- **Shape Shift**: 20 → 25 puzzle'it. Owner-otsus "OK; expand-recommended" — sihtmaht ~30 jääb järelpassiks, aga 25 lahendab kordusväsimuse esimese sessiooni piires.

**DSL-spec poolid (8 tk) ei ole content-augud** — nende sisu on procedurally generated, mitte autoreeritud. Item-count < 6 nendele on tahtlik.

## Mis muutus 2026-04-28 → 2026-05-19

- **Slice 22 fact_drill** lisas 8 binding'ut + 2 skilli + 2 packi (division). Olemasolevad arithmetic packid said täiendava tarbija.
- **`language.vocabulary.long_words.*`** lahutati eraldi packideks pikkade sõnade variandile (`word_cascade_long`).
- **`math.multiplication_1_*.battlelearn`** said eraldi packideks 2 BattleLearn multiplication-variandile.
- **Phase 5 LearnerProfile**: `mechanicPreference` nüüd kannab `variant?: string` (esimene tarbija `picture_pairs`). Default 5d-st muutus `emoji_word`-iks, mis ankur-renderdust laiendab.
- **Phase 5c**: closed-set skillidel on `factsKnown`-põhine 70% nõrgem / 30% retention picker. Sõnavara-skilli "factsKnown" ei kasuta (avatud-hulk).

## Soovitused järelpassideks (post-Phase-1.5)

- **Adaptiivne valik metadata põhjal.** Pack-id kannavad nüüd difficulty/focus metadata't, aga mehaanika valik on enamasti veel level-näitajaga. Adaptiivne picker, mis valib pack-i järgmise focus'e mängija nõrgemast tugevamasse, oleks järgmine kvaliteedihüpe.
- **Mastery-grid UI.** `factsKnown` andmed eksisteerivad, aga kasutaja ei näe oma korrutustabeli kaarti. "25 kasti, X rohelist, Y kollast, Z punast" annaks closed-set skillidele tagasipeegli.
- **Eesti sõnavara järelpass.** Slice 14 jätsid ühe-kahe-tähelise ja semantiliselt ambivalentse sõnade järelvaate lahti. Pole hädavajalik aga annaks pingsust.

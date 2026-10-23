# Product audit - 2026-10-23

Run 1 step 13 of ROADMAP Phase 1.7: every one of the 19 menu entries played
on the dev server at 375×812 and checked at desktop width (1280×800, plus
768×1024 where the layout changed), after the Run 1 fixes. Each entry was
played to one level-up or game over, and opened at level 1 and level 5
through the level selector. For a mechanic card one binding was played in
full; the other bindings share its view and are covered by the all-games
render E2E.

Per entry: what a child who cannot read does in the first 30 seconds,
excitement 1-5 and why, what changes from level 1 to 5, the feedback seen
and heard, and the defects left. Defects that fit Run 1's scope (inside the
games, the engine and copy) were fixed during the audit and are marked
**Fixed**. The rest are Run 2 input.

Two development-only effects are not defects: under React StrictMode the
dev server counts a first visit twice, so the first-visit description sheet
does not open there (it does in a production build), and timers in a
background tab run slowly.

## Summary

| Entry            | Excitement | Non-reader can start | Fixed in the audit                     |
| ---------------- | ---------- | -------------------- | -------------------------------------- |
| balance_scale    | 2          | yes                  | four options in a 2×2 grid             |
| battlelearn      | 3          | partly               | -                                      |
| compare_sizes    | 2          | partly               | -                                      |
| fact_drill       | 3          | numbers only         | -                                      |
| letter_match     | 2          | yes                  | -                                      |
| math_snake       | 4          | yes                  | options for small answers              |
| memory_math      | 3          | partly               | -                                      |
| pattern          | 3          | yes                  | train scrolls to the empty wagon       |
| picture_pairs    | 3          | yes                  | whole board on screen, peek label      |
| robo_path        | 4          | yes                  | run button on screen, labels, copy     |
| sentence_logic   | 2          | no                   | sentence case, "inside" grammar        |
| shape_dash       | 4 / 2      | yes                  | run holds behind the description sheet |
| shape_shift      | 3          | yes                  | puzzle name                            |
| star_mapper      | 3          | yes                  | star labels, duplicate name, copy      |
| syllable_builder | 2          | no                   | -                                      |
| time_match       | 2          | numbers only         | -                                      |
| unit_conversion  | 2          | no                   | singular after one                     |
| word_builder     | 3          | partly               | keyboard play, double count in dev     |
| word_cascade     | 4          | partly               | labels, plural, description            |

Level-up targets grow 5, 7, 10, 12, 15 correct answers (seen: 0/7 at level 2,
0/15 at level 5). Fifteen answers is a long way for a three-option quiz, and
for the snake it is out of reach (below).

## Entries

### balance_scale

- **First 30 s:** the scale shows 3+3 against 3+?; tapping a weight tilts it.
  The picture explains itself; the child needs digits.
- **Excitement 2:** the tilt is nice, nothing else moves, no goal per session.
- **Level 1 → 5:** 3+3 against 3+? with three options; 10+6 against 3+? with
  four. Bigger sums only, no new rule.
- **Feedback:** a wrong weight greys out, a heart goes, the scale tilts the
  wrong way, no sound of its own. Five right: the achievement popup first,
  the level-up dialog queued behind it.
- **Fixed:** four options sat three and one; now a 2×2 grid.

### battlelearn

Played `battlelearn`; `battlelearn_multiplication` and `_1_5` opened.

- **First 30 s:** a blue grid and a ship count "Uputatud 0/1"; tapping
  squares is the right thing. The first question cell opens a sheet "Vasta
  küsimusele, et jätkata tulistamist:" with "1 laeva + 5 laeva = ?", a
  reading task.
- **Excitement 3:** hunting ships is a game children know; the questions
  break the flow and need reading.
- **Level 1 → 5:** 4×4 with one two-cell ship; 5×5 with ships of 3 and 2,
  word problems ("Oli 19 torpeedot, tulistatud on 4. Kui palju on alles?").
- **Feedback:** star and heart cells are plain water now, no strike and no
  success sound (Run 1 step 4); an empty cell takes a strike; a hit plays
  success, a sinking plays it twice. Win: "Võit! Kõik laevad uppusid!".
- **Left:** questions at level 5 need fluent reading.

### compare_sizes

- **First 30 s:** two dice cards and three symbol buttons with words; "="
  greyed out at level 1. A child counts the dots and can guess the bigger
  side; the words and < > need reading, the card colours help.
- **Excitement 2:** a quiz with nice cards.
- **Level 1 → 5:** dice pictures to numbers (16 against 2), "=" enabled.
- **Feedback:** five right: "Sada punkti" achievement, then the level-up
  dialog behind it.

### fact_drill

Played `multiplication_fact_drill_1_5` to time-up.

- **First 30 s:** a 60-second sprint, "5 × 5 = ?", keypad, Kinnita. The
  keypad is clear; the child must know the facts.
- **Excitement 3:** racing the clock and beating the record is a real goal.
- **Level 1 → 5:** not applicable; the drill picks the weakest facts of its
  pack and has no level control (Run 1 step 3).
- **Feedback:** streak toast "7 või rohkem õiget järjest!", achievement
  "Viissada punkti"; time-up shows score, best, best streak and accuracy.
  "Proovi uuesti" resets the score to 0 (Run 1 step 3). No wrong sound.
- **Left:** a restart resets only the score; the streak and the play time
  carry over from the run before (found in review). Run 2.

### letter_match

- **First 30 s:** a big capital "H → ?", "Leia sama täht väikese tähena",
  three lowercase letters. The arrow and the shapes carry it.
- **Excitement 2:** a matching quiz; look-alikes from level 3 make it a task.
- **Level 1 → 5:** three options; four in a 2×2 grid with the letter's own
  look-alikes (Š with š, s).
- **Feedback:** a wrong letter greys out and a heart goes, no sound. Level-up
  dialog "Tase 2", star toast "Said 1 tähe".

### math_snake

Played `addition_snake` to game over at level 1 and to 9/15 at level 5.

- **First 30 s:** a 7×7 board, a snake, an apple, four arrow buttons, no
  text. Turn-based: one tap, one step. Arrows and apple explain themselves.
- **Excitement 4:** the one real arcade loop; the question interrupts but is
  short.
- **Level 1 → 5:** 7×7 to 8×8, sums to 20 with missing addends, options
  within ±2 (Run 1 step 2).
- **Feedback:** a normal apple gives 5 points; every second or third apple is
  an abacus that asks a question; a right answer grows the snake by two.
  Hitting itself ends the session: "Mäng läbi", longest snake, accuracy.
- **Fixed:** for an answer of 1 the options were 31, 1, 3, 2 (±2 left only
  two numbers above zero and the fallback picked any number up to 30); now
  the next numbers up, 1-4.
- **Left:** at level 5 the target is 15 answers. Each grows the snake by two
  plus the two or three apples between questions, well past the 64 cells of
  an 8×8 board, so level 6 is out of reach by play. Run 2: round size per
  game type.

### memory_math

- **First 30 s:** six cards face down; flipping is obvious, matching a sum to
  its answer needs adding.
- **Excitement 3:** memory plus sums pairs well; fifteen boards for one level
  is long.
- **Level 1 → 5:** three pairs to four, sums to 12.
- **Feedback:** a mismatch flips back and costs nothing; a pair stays up with
  a tick. One board is one step of progress.

### pattern

- **First 30 s:** a train of wagons, an empty "?" wagon, three option buttons,
  no text. The empty wagon asks the question.
- **Excitement 3:** the train arriving and leaving is the motion the quiz
  games lack.
- **Level 1 → 5:** AB and AAB with five wagons; ABC and AABC with six.
- **Feedback:** a wrong pick opens "Peaaegu! Muster kordub 🔴 🔴 🟡. Järgmine
  peab olema 🟡." with Jätka and costs a heart; the emoji carry the
  explanation.
- **Fixed:** at 375px the train was 384px wide in a 291px track and the "?"
  wagon sat off-screen; the track now scrolls to it when the train arrives.

### picture_pairs

- **First 30 s:** eight word and picture cards shown for a moment under
  "Jäta meelde!", then face down. Pictures help a pre-reader learn the words.
- **Excitement 3:** classic memory.
- **Level 1 → 5:** four pairs to seven.
- **Feedback:** a mismatch flips back, no heart; "Käigud" counts taps.
- **Fixed:** four pairs sat in two columns of 150px cards and the last row was
  below the fold under the tip button; now rows of four (three for three
  pairs), the whole board in view at level 1 and 5 and on desktop.
- **Fixed:** the "Jäta meelde!" label sat on an 80% pink layer over the board,
  hiding the cards it asked the child to remember; now a pill on the board's
  top edge.

### robo_path

- **First 30 s:** a grid with the robot and a battery, an arrow pad and
  "Käivita robot". Arrows and battery are clear; planning a program before
  running it is the task.
- **Excitement 4:** watching the robot run your program is satisfying, and
  failure is visible and fair.
- **Level 1 → 5:** 3×3 without rocks and three-step paths; 4×4 with rocks
  and paths of nine.
- **Feedback:** a failed program costs a heart, clears the program and shows
  a ⚡ hint cell. Level-up dialog with "Said 2 tähte".
- **Fixed:** on a phone the run button sat below the screen (854px on an
  812px screen), on desktop at 1060px on 800. Now the pad and buttons sit
  beside each other on a phone, and the commands beside the grid from 640px.
- **Fixed:** the arrow pad was labelled in English ("Up", "Left") here and in
  the snake.
- **Fixed copy:** "käsku: 0/5" to "Käsud: 0/5"; "⚠️ 1 sammu" to "Veel üks
  käsk"; "optimaalne on 3." to "Lühim tee: 3."; "Proovi uuesti parema
  lahenduse jaoks?" to "Kas proovid lühemat teed?"; the description spoke of
  a cell with a green window, the goal is a battery. Ten unused strings
  removed.

### sentence_logic

- **First 30 s:** a sentence and two picture cards; the sentence is the whole
  task, so a non-reader cannot play. A beginning reader is the audience.
- **Excitement 2:** a reading quiz; the pictures are small emoji pairs.
- **Level 1 → 5:** two cards to four, more scenes.
- **Feedback:** a wrong card costs a heart, with no sheet, no sound and no
  mark on the card.
- **Fixed:** the sentence was shown as "TIBU ON RONILA kõrval." because the
  place word was lower case and formatText only turns an all-capitals string
  into sentence case; now "Tibu on ronila kõrval.".
- **Fixed:** inside read "KASS ON KAPIS sees" (inessive plus "sees"); now
  "Kass on kapis.".
- **Left:** odd content such as "Jänes on järve all." with the lake drawn as
  an ice cube.

### shape_dash

Played to crashes and game over; no run was finished by my play.

- **First 30 s:** the runner starts at once; tapping to jump is obvious,
  "Vajuta uuesti proovimiseks" after a crash needs reading.
- **Excitement 4 to watch, 2 to play** for a seven-year-old: fast, the first
  spike comes within seconds.
- **Level 1 → 5:** not seen past level 1 by play.
- **Feedback:** stars and gates add 100 and 200 points (Run 1 step 8). Every
  crash costs a heart; five crashes end the session ("Südamed on otsas!").
- **Fixed:** the run kept going behind the game description sheet and crashed
  while the child read, taking a heart (seen on the production build: 5 to 4
  with the sheet open). It now holds still while the sheet is open, as the
  fact drill's clock does; E2E covers it.
- **Left:** a heart per crash is harsh for a game where crashing is how you
  learn the course. The canvas score counts distance too, the header only
  stars and gates, so the child sees two scores for one run (found in
  review). Run 2.

### shape_shift

- **First 30 s:** a shadow picture and coloured pieces to drag onto it; it
  explains itself.
- **Excitement 3:** calm, a satisfying snap.
- **Level 1 → 5:** shadows with colours and two to five pieces; outlines only
  and up to six pieces.
- **Feedback:** a piece dropped on the wrong shadow stays there with no
  feedback and no heart lost; with all pieces down a wrong sound plays, the
  line reads "Sobita tükid varjudega" and
  the child has to find the wrong one. Run 2: maybe too quiet.
- **Fixed copy:** "Kuldne Kala" to "Kuldne kala".

### star_mapper

- **First 30 s:** a night sky with dashed guide lines; tapping star to star
  along them is clear.
- **Excitement 3:** pretty and calm.
- **Level 1 → 5:** trace mode with guides; build mode without them ("Ühenda
  tähed mälu järgi").
- **Feedback:** a wrong line counts against "Jooni jäänud"; when they run out
  the board resets and a heart goes. Undo takes a line back.
- **Fixed:** star buttons were labelled in English with catalogue ids ("Star
  epsilon1 (selected)"); now "Täht Vega", "Täht 2", "Täht 4, valitud".
- **Fixed:** Väike Vanker showed its name twice (its folk name is the same).
- **Fixed copy:** "Kefeusus" to "Kefeus"; "Looklevas kujuga tähtkuju",
  "Tähekea, mis viib galaktikani", "Vega täht asub siin" and "Põhja krooni
  poolring" rewritten.
- **Left:** build mode asks a child to remember a constellation it may never
  have traced. Run 2.

### syllable_builder

- **First 30 s:** a picture, empty slots and shuffled syllables; a
  non-reader cannot build them, the picture says which word.
- **Excitement 2:** tidy and quiet.
- **Level 1 → 5:** two-syllable words; three-syllable words mixed in.
- **Feedback:** a wrong order costs a heart and empties the slots, with no
  line saying what went wrong and no sound.

### time_match

- **First 30 s:** a big clock and three options in words ("kell 11").
- **Excitement 2:** a clean clock quiz.
- **Level 1 → 5:** whole hours in words; half and quarter hours in words at
  levels 3-4; digital times on the 12-hour dial in five-minute steps at 5
  (Run 1 step 7).
- **Feedback:** a wrong time greys out and a heart goes, no sound.

### unit_conversion

- **First 30 s:** "Mitu sentimeetrit on 2 meetrit?" and the same as "2 m = ?
  cm"; a non-reader cannot play.
- **Excitement 2:** a worksheet with nice buttons.
- **Level 1 → 5:** m to cm; kg to g and l to ml.
- **Feedback:** a wrong answer greys out and costs a heart; double taps are
  locked (Run 1 step 6).
- **Fixed:** "Mitu sentimeetrit on 1 meetrit?" to "1 meeter" (and "1
  kilogram" in English).

### word_builder

- **First 30 s:** a big picture, empty slots and the word's letters; the
  picture says the word, spelling it is the task.
- **Excitement 3:** a good early-reader loop.
- **Level 1 → 5:** three capital letters that are exactly the word; mixed-case
  five-letter words with extra letters.
- **Feedback:** a wrong word shows "Õige vastus oli ..." and costs a heart.
- **Fixed:** tiles answered only to pointerdown, so Enter or Space on a
  focused tile did nothing; now click handlers.
- **Fixed (development only):** the full-word check ran inside a state
  updater, which StrictMode runs twice, so on the dev server and in E2E every
  word counted twice. A production build counted once. Tiles are now locked
  during the wrong-answer feedback.
- **Left:** at level 1 the "remove a wrong letter" hint has nothing to remove;
  it does nothing and costs nothing.

### word_cascade

Played `word_cascade`; `word_cascade_long` shares the view.

- **First 30 s:** a picture, strike dots and falling columns of letters, one
  per letter of the word. Lively for a beginning reader.
- **Excitement 4:** motion and a little pressure.
- **Level 1 → 5:** three-letter words; six-letter words with look-alike
  letters.
- **Feedback:** a wrong tap takes a strike ("2 katset jäänud"); three in a row
  end the session and take one heart, even with hearts left.
- **Fixed:** the Run 1 description said three wrong taps "cost a heart"; they
  also end the game, and it now says so. Whether they should is Run 2.
- **Fixed:** letters and strike dots were labelled in English ("Letter A",
  "3 tries left"); "1 katse jäänud" got its singular. Ten unused strings
  removed.

## Shared layer

The plan's Context, corrected by play:

- **Feedback.** A wrong answer is silent in games that use the shared audio
  hook (`useGameAudio.playWrong` is empty): BattleLearn and the quiz games.
  Games with their own sound play one: the snake, the fact drill, Robo Path,
  Shape Dash, Shape Shift (on a full wrong board), Star Mapper and Word
  Cascade. Losing a heart has no
  moment of its own: the header number changes. Right answers show short
  toasts and streak toasts.
- **Level-up** is a blocking dialog; the star toast ("Said 2 tähte") fires
  behind it; an achievement unlocked by the same answer shows first and the
  level-up waits behind it (balance_scale, compare_sizes, unit_conversion).
  Whether several achievements at once show only the first, and whether a
  second level-up lacks confetti, was not seen in play.
- **Pattern** opens a blocking sheet on every wrong answer: confirmed.
- **Hearts.** At 0 hearts a game route sends the child to the menu. Most
  games take a heart per wrong answer; memory games and Shape Shift take
  none; Shape Dash takes one per crash; Word Cascade and the snake end the
  session on their own failure even with hearts left.
- **Progress.** Targets of 5, 7, 10, 12 and 15 correct answers confirmed; the
  snake's level 5 target cannot be reached on its board.
- **Level ladder seam.** Run 1's ladder (starter track for levels 1-5, the
  advanced track from 6) makes authored content reachable, but the packs
  wrote the two tracks side by side, not one after the other, so level 6 can
  be easier than level 5: Memory Math drops from 10 cards to 8, Syllable
  Builder lets two-syllable words back in (its word filter also adds its own
  +2 for the advanced track), Robo Path reaches the 5×5 grid at level 8
  instead of 6, and the starter stages above level 5 are no longer used,
  among them BattleLearn's number-sequence questions, which only those
  stages ask.
  Pattern switches to its harder groups at level 5, where only their
  level-5 group can be picked. Found in review, not in play (the audit played
  levels 1 and 5). Run 2 input: each pack says where its advanced track takes
  over, or its stages move onto one level scale.
- **Chrome.** The header's star and heart badges were labelled in English for
  screen readers ("Open shop to buy hearts"); now "Südamed 4/5, ava pood".
  The floating paid-hint buttons overlap the undo button in Star Mapper on a
  phone.
- **Not played here:** the shop's free stars, heart refills, and whether
  level progress survives leaving a game. The progress bar's "7/5" and the
  fact drill's level control are fixed (Run 1 step 3).

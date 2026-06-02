/**
 * Game Registrations
 *
 * Every mechanic owns its binding registration in `src/games/<mechanic>/register.ts`
 * (ADR-0001 colocation pattern, Phase 1.6). Importing this module pulls in each
 * per-mechanic register module for its side effect: registering the binding(s)
 * with `gameRegistry`.
 *
 * To add a new mechanic:
 * 1. Create `src/games/<mechanic>/` with config.ts, generator.ts, validator.ts,
 *    View.tsx (or reuse a shared view), and register.ts.
 * 2. Add the generator to the `Generators` map in `generators.ts`.
 * 3. Add one `import './<mechanic>/register';` line below.
 */

// Side-effect import: registers skills + content packs before any mechanic
// binding below references them by id.
import '../curriculum';

// Per-mechanic register modules. Each has a side effect: it registers its
// binding(s) with `gameRegistry` on import.
import './balanceScale/register';
import './timeMatch/register';
import './compareSizes/register';
import './unitConversion/register';
import './pattern/register';
import './memoryMath/register';
import './picturePairs/register';
import './syllableBuilder/register';
import './letterMatch/register';
import './sentenceLogic/register';
import './starMapper/register';
import './roboPath/register';
import './wordBuilder/register';
import './wordCascade/register';
import './shapeShift/register';
import './shapeDash/register';
import './mathSnake/register';
import './factDrill/register';
import './battlelearn/register';

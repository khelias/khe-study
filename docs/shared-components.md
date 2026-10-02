# Shared Game UI Components

Cookbook for the two cross-game UI primitives in `src/components/shared/`: `GameProblemModal` (pauses gameplay to show a multiple-choice question) and `GameStatsBar` (renders game-specific counters on top of the global `GameHeader`). `GameProblemModal` ships in BattleLearn and MathSnake; `GameStatsBar` has no consumer yet. Use them when a new game needs either pattern.

### 1. GameProblemModal - When Your Game Has Questions

#### When to Use

✅ Problem interrupts gameplay (BattleLearn, MathSnake)
✅ Player needs to focus on question
✅ Gameplay pauses for answer

❌ Problem is continuous (WordBuilder)
❌ Board IS the problem (RoboPath, MemoryGame)

#### Basic Setup

```tsx
import { GameProblemModal } from '../../components/shared';

// Add state
const [gamePhase, setGamePhase] = useState<'playing' | 'problem'>('playing');
const [selectedOption, setSelectedOption] = useState<number | null>(null);

// Handle answer
const handleOptionSelect = (index: number) => {
  setSelectedOption(index);
  const isCorrect = index === problem.correctIndex;

  // Brief pause to show button color (green/red), then close modal
  setTimeout(() => {
    if (isCorrect) {
      setGamePhase('playing'); // Close modal
    }
    setSelectedOption(null);
    onAnswer(isCorrect); // General feedback system handles this
  }, 800); // 800ms to see visual feedback
};

// Render
<GameProblemModal
  isOpen={gamePhase === 'problem'}
  title="Answer to Continue"
  prompt={problem.question.prompt}
  options={problem.question.options}
  correctIndex={problem.question.correctIndex}
  selectedOption={selectedOption}
  onOptionSelect={handleOptionSelect}
  icon={<YourIcon />}
/>;
```

#### Props Reference

```tsx
interface GameProblemModalProps {
  isOpen: boolean; // Show/hide modal
  title?: string; // Modal title (optional)
  prompt: string; // Question text
  options: string[]; // Answer options
  correctIndex: number; // Index of correct answer
  selectedOption: number | null; // Currently selected option
  onOptionSelect: (index: number) => void; // Handle selection
  disabled?: boolean; // Disable all buttons
  variant?: 'default' | 'compact'; // Size variant
  icon?: React.ReactNode; // Icon next to title
  onClose?: () => void; // Optional close handler
  eliminatedIndices?: number[]; // Paid-hint: render these options as eliminated
  children?: React.ReactNode; // Footer slot (e.g. paid-hint buttons)
}

// Note: The modal shows visual feedback through button colors (green/red).
// Text feedback should be handled by your game's general feedback system.
```

### 2. GameStatsBar - When Your Game Has Counters

#### When to Use

✅ Game-specific counters (ships, apples, moves)
✅ Progress indicators
✅ Status displays
✅ Phase indicators

❌ Global stats (score, hearts) - use GameHeader instead
❌ Level info - use Level Badge in GameScreen

#### Basic Setup

```tsx
import { GameStatsBar, type GameStat } from '../../components/shared';
import { YourIcon } from 'lucide-react';

// Build stats array
const stats: GameStat[] = [
  {
    id: 'main-counter',
    icon: YourIcon,
    label: 'Label',
    value: '3/5',
    variant: 'default', // or 'success', 'warning', 'danger', 'info'
  },
];

// Render
<GameStatsBar stats={stats} className="mb-4" />;
```

#### GameStat Interface

```tsx
interface GameStat {
  id: string; // Unique identifier
  icon?: LucideIcon; // Lucide icon (optional)
  emoji?: string; // Emoji (optional, use instead of icon)
  label?: string; // Label text (optional)
  value: string | number; // Display value
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  pulse?: boolean; // Pulse animation
  bounce?: boolean; // Bounce animation
}
```

### 3. Complete Example: MathSnake Migration

#### BEFORE (Inline Problem Display)

```tsx
{
  problem.math ? (
    <div className="bg-gradient-to-br from-emerald-50 rounded-xl shadow-lg p-4">
      <div className="text-center mb-3">
        <div className="font-black text-slate-800 text-xl">{problem.math.equation} = ?</div>
      </div>
      <div className="flex gap-2 justify-center">
        {problem.math.options.map((option) => (
          <button onClick={() => handleAnswerClick(option)}>{option}</button>
        ))}
      </div>
    </div>
  ) : (
    <div className="bg-gradient-to-br from-amber-50 rounded-xl p-4">
      <div className="text-center">
        <div className="text-xs text-amber-600">Next Math</div>
        <div className="text-2xl font-black">{problem.applesUntilMath}</div>
      </div>
    </div>
  );
}
```

#### AFTER (Using New Components)

```tsx
// Stats for apples counter
const stats: GameStat[] = [
  {
    id: 'apples',
    emoji: '🍎',
    label: t.gameScreen.mathSnake.nextMathLabel,
    value: problem.applesUntilMath,
    variant: problem.applesUntilMath === 0 ? 'warning' : 'info',
  },
];

return (
  <>
    {/* Stats bar above board */}
    <GameStatsBar stats={stats} className="mb-4" />

    {/* Game board */}
    <div className="game-board">{/* ... grid rendering ... */}</div>

    {/* Problem modal (only when math problem exists) */}
    <GameProblemModal
      isOpen={Boolean(problem.math)}
      title={t.gameScreen.mathSnake.problemTitle}
      prompt={`${problem.math?.equation} = ?`}
      options={problem.math?.options.map(String) || []}
      correctIndex={problem.math?.options.indexOf(problem.math.answer) || 0}
      selectedOption={selectedOption}
      onOptionSelect={handleAnswerClick}
      variant="compact"
      icon={<span>🧮</span>}
    />
  </>
);
```

### 4. Styling Variants

#### GameStatsBar Variants

```tsx
// Default - neutral gray
{
  variant: 'default';
} // bg-slate-50 border-slate-300 text-slate-700

// Success - green (goal achieved)
{
  variant: 'success';
} // bg-green-50 border-green-400 text-green-700

// Warning - orange (caution needed)
{
  variant: 'warning';
} // bg-orange-50 border-orange-400 text-orange-700

// Danger - red (critical state)
{
  variant: 'danger';
} // bg-red-50 border-red-400 text-red-700

// Info - blue (informational)
{
  variant: 'info';
} // bg-blue-50 border-blue-400 text-blue-700
```

#### GameProblemModal Variants

```tsx
// Default - full size modal
<GameProblemModal variant="default" />

// Compact - smaller padding, mobile-optimized
<GameProblemModal variant="compact" />
```

### 5. Common Patterns

#### Pattern 1: Conditional Stats

```tsx
const stats: GameStat[] = [];

// Always show main counter
stats.push({
  id: 'counter',
  icon: Target,
  value: count,
  variant: 'default',
});

// Conditionally add warning
if (needsAttention) {
  stats.push({
    id: 'warning',
    emoji: '⚠️',
    value: 'Action Required',
    variant: 'warning',
    pulse: true,
  });
}

return <GameStatsBar stats={stats} />;
```

#### Pattern 2: Dynamic Variants Based on Value

```tsx
const getVariant = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  if (percentage <= 20) return 'danger';
  if (percentage <= 50) return 'warning';
  return 'default';
};

const stats: GameStat[] = [
  {
    id: 'health',
    icon: Heart,
    value: `${current}/${max}`,
    variant: getVariant(current, max),
  },
];
```

#### Pattern 3: Multiple Stats

```tsx
const stats: GameStat[] = [
  {
    id: 'ships',
    icon: Target,
    label: 'Ships',
    value: `${remaining}/${total}`,
    variant: remaining === 0 ? 'success' : 'default',
  },
  {
    id: 'shots',
    emoji: '🎯',
    label: 'Shots',
    value: shotsFired,
    variant: 'info',
  },
  {
    id: 'accuracy',
    emoji: '📊',
    value: `${accuracy}%`,
    variant: accuracy > 70 ? 'success' : 'warning',
  },
];
```

#### Pattern 4: Modal with State Management

```tsx
const [gamePhase, setGamePhase] = useState<'playing' | 'answering'>('playing');
const [selectedOption, setSelectedOption] = useState<number | null>(null);

const handleTriggerProblem = () => {
  setGamePhase('answering');
};

const handleOptionSelect = (index: number) => {
  setSelectedOption(index);
  const isCorrect = index === correctIndex;

  // Brief pause to show button color
  setTimeout(() => {
    if (isCorrect) {
      setGamePhase('playing'); // Close modal
    }
    setSelectedOption(null);
    onAnswer(isCorrect); // General feedback system handles text feedback
  }, 800);
};

<GameProblemModal
  isOpen={gamePhase === 'answering'}
  selectedOption={selectedOption}
  onOptionSelect={handleOptionSelect}
  // ... other props
/>;
```

### 6. Accessibility Checklist

When implementing these components:

- [ ] Modal auto-focuses first option when opened
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces modal role
- [ ] Stats have proper labels (not just icons)
- [ ] Color variants have sufficient contrast
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Focus returns to trigger element when modal closes

### 7. Testing Checklist

- [ ] Modal opens/closes smoothly
- [ ] Feedback doesn't cause layout shift
- [ ] Stats bar scrolls horizontally on narrow screens
- [ ] Touch targets are at least 44x44px
- [ ] Works on iOS Safari, Android Chrome
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Multiple rapid clicks don't break state

### 8. Performance Tips

#### Memoize Stats Array

```tsx
const stats = useMemo<GameStat[]>(
  () => [
    {
      id: 'counter',
      value: computeExpensiveValue(),
      variant: 'default',
    },
  ],
  [dependencies],
);
```

#### Lazy Load Icons

```tsx
import { lazy } from 'react';
const Target = lazy(() => import('lucide-react').then((m) => ({ default: m.Target })));
```

### 9. Common Mistakes to Avoid

❌ **Don't use modal for continuous problems**

```tsx
// BAD: WordBuilder emoji should stay visible
<GameProblemModal isOpen={true} prompt={emoji} />
```

✅ **Do use modal for interrupting problems**

```tsx
// GOOD: BattleLearn question interrupts gameplay
<GameProblemModal isOpen={phase === 'answering'} />
```

❌ **Don't overload stats bar**

```tsx
// BAD: Too much information
<GameStatsBar stats={[stat1, stat2, stat3, stat4, stat5, stat6]} />
```

✅ **Do keep stats essential**

```tsx
// GOOD: Only what matters for gameplay
<GameStatsBar stats={[{ id: 'main', value: count }]} />
```

❌ **Don't create duplicate feedback**

```tsx
// BAD: Modal feedback + general feedback = duplicate
<GameProblemModal showFeedback={true} feedbackMessage="Correct!" />
// And onAnswer() also triggers general feedback
```

✅ **Do let general feedback system handle it**

```tsx
// GOOD: Modal shows button colors, general system shows text
<GameProblemModal
  selectedOption={selected}
  onOptionSelect={(i) => {
    setSelected(i);
    setTimeout(() => {
      onAnswer(i === correct); // General feedback triggers here
    }, 800);
  }}
/>
```

### 10. Where to apply these patterns

Use `GameProblemModal` when a game has **conditional problems** (mechanic pauses for an answer): BattleLearn and MathSnake both use it. Avoid it for visual puzzles where the board itself is the problem (MemoryGame, RoboPath, ShapeShift) — adding a modal would hurt flow.

Use `GameStatsBar` for game-specific counters that belong above the global `GameHeader` (ships remaining, apple count, moves used). Skip it for games whose state is already communicated by the board or by `GameHeader`.

The component source files (`src/components/shared/GameProblemModal.tsx`, `src/components/shared/GameStatsBar.tsx`) are the authoritative reference; TypeScript types document the full prop surface.

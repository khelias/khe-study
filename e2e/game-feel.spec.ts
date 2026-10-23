import { expect, seedStore, test, type Page } from './fixtures';
import { GAME_CONFIG } from '../src/games/data';
import { ACHIEVEMENTS } from '../src/engine/achievements';

const GAME_IDS = Object.keys(GAME_CONFIG);

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Cell = [number, number];

const KEYS: Record<Direction, string> = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
};
const STEPS: Record<Direction, Cell> = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };

/** Every game seen and every badge owned, so no first-time sheet or badge covers the play. */
function seed(page: Page, hearts = 5) {
  return seedStore(page, {
    hearts,
    stars: 0,
    unlockedAchievements: Object.keys(ACHIEVEMENTS),
    stats: {
      gamesPlayed: GAME_IDS.length,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalScore: 0,
      maxStreak: 0,
      currentStreak: 0,
      maxLevels: {},
      gamesByType: Object.fromEntries(GAME_IDS.map((id) => [id, 1])),
      totalTimePlayed: 0,
      lastPlayed: null,
      collectedStars: 0,
      maxSnakeLength: 0,
    },
  });
}

async function openGame(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole('button', { name: /muuda taset/i })).toBeVisible({
    timeout: 10_000,
  });
}

interface Board {
  size: number;
  snake: Cell[];
  apple: { pos: Cell; kind: 'normal' | 'math' } | null;
}

/** Reads the snake board from its development-only `data-qa-cell` markers (row by row). */
async function readBoard(page: Page): Promise<Board> {
  const kinds = await page
    .locator('[data-qa-cell]')
    .evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-qa-cell') ?? 'empty'));
  const size = Math.round(Math.sqrt(kinds.length));
  const at = (index: number): Cell => [index % size, Math.floor(index / size)];
  let head: Cell | null = null;
  const rest: Cell[] = [];
  let apple: Board['apple'] = null;
  kinds.forEach((kind, index) => {
    if (kind === 'head') head = at(index);
    else if (kind === 'body' || kind === 'tail') rest.push(at(index));
    else if (kind === 'normal-apple') apple = { pos: at(index), kind: 'normal' };
    else if (kind === 'math-apple') apple = { pos: at(index), kind: 'math' };
  });
  if (!head) throw new Error('No snake head on the board');
  return { size, snake: [head, ...rest], apple };
}

const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const step = (cell: Cell, direction: Direction): Cell => [
  cell[0] + STEPS[direction][0],
  cell[1] + STEPS[direction][1],
];

/** The first move of a shortest path to the apple that keeps off the walls and the body. */
function nextMove(board: Board): Direction {
  const [head] = board.snake;
  if (!head) throw new Error('Empty snake');
  const blocked = new Set(board.snake.map(([x, y]) => `${x},${y}`));
  const inside = ([x, y]: Cell) => x >= 0 && y >= 0 && x < board.size && y < board.size;
  const queue: Array<{ cell: Cell; first: Direction }> = [];
  const seen = new Set([`${head[0]},${head[1]}`]);
  for (const direction of Object.keys(STEPS) as Direction[]) {
    const cell = step(head, direction);
    if (inside(cell) && !blocked.has(`${cell[0]},${cell[1]}`)) {
      queue.push({ cell, first: direction });
      seen.add(`${cell[0]},${cell[1]}`);
    }
  }
  const fallback = queue[0]?.first;
  while (queue.length > 0) {
    const { cell, first } = queue.shift()!;
    if (board.apple && same(cell, board.apple.pos)) return first;
    for (const direction of Object.keys(STEPS) as Direction[]) {
      const next = step(cell, direction);
      const key = `${next[0]},${next[1]}`;
      if (inside(next) && !blocked.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push({ cell: next, first });
      }
    }
  }
  if (!fallback) throw new Error('The snake has no safe move');
  return fallback;
}

/** The value of one side of a shown equation: a number, or two joined by + − × ÷. */
function evaluateSide(side: string): number {
  const match = /^\s*(\d+)\s*(?:([+−×÷])\s*(\d+))?\s*$/.exec(side);
  if (!match) throw new Error(`Cannot read "${side}"`);
  const a = Number(match[1]);
  const b = Number(match[3]);
  switch (match[2]) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return a / b;
    default:
      return a;
  }
}

/** Which of the offered numbers makes the shown equation true. */
function solve(prompt: string, options: number[]): number {
  const answer = options.find((option) => {
    const [left, right] = prompt.replace('?', String(option)).split('=');
    return left !== undefined && right !== undefined && evaluateSide(left) === evaluateSide(right);
  });
  if (answer === undefined) throw new Error(`No option solves ${prompt}`);
  return answer;
}

test.describe('game feel', () => {
  test('the snake scores per apple eaten and asks a question on a math apple', async ({ page }) => {
    await seed(page);
    await openGame(page, '/study/games/addition-snake?seed=3');
    const score = page.getByTestId('session-score');
    const question = page.getByTestId('game-problem-modal');

    let expected = 0;
    let stepsPastAnApple = 0;
    for (let move = 0; move < 200 && !(await question.isVisible()); move++) {
      const board = await readBoard(page);
      const direction = nextMove(board);
      const target = step(board.snake[0]!, direction);
      const eatsApple = board.apple?.kind === 'normal' && same(target, board.apple.pos);
      await page.keyboard.press(KEYS[direction]);
      if (eatsApple) expected += 5;
      else if (board.apple?.kind === 'normal') stepsPastAnApple += 1;
      await expect(score).toHaveText(String(expected));
    }

    await expect(question).toBeVisible();
    expect(expected).toBeGreaterThanOrEqual(5);
    expect(stepsPastAnApple).toBeGreaterThan(0);

    const prompt = (await question.locator('p').first().textContent()) ?? '';
    const optionButtons = question.locator('[data-testid^="game-problem-option-"]');
    const values = (await optionButtons.allTextContents()).map(Number);
    const answer = solve(prompt, values);
    const lengthBefore = (await readBoard(page)).snake.length;

    await optionButtons.filter({ hasText: new RegExp(`^${answer}$`) }).click();

    await expect(question).toBeHidden();
    await expect(score).toHaveText(String(expected));
    // The two new segments sit on the tail and show once the snake moves on.
    let eaten = 0;
    for (let move = 0; move < 2; move++) {
      const board = await readBoard(page);
      const direction = nextMove(board);
      if (board.apple && same(step(board.snake[0]!, direction), board.apple.pos)) eaten += 1;
      await page.keyboard.press(KEYS[direction]);
    }
    await expect
      .poll(async () => (await readBoard(page)).snake.length)
      .toBe(lengthBefore + 2 + eaten);
  });

  test('a wrong snake answer is taken out of the question', async ({ page }) => {
    await seed(page);
    await openGame(page, '/study/games/addition-snake?seed=3');
    const question = page.getByTestId('game-problem-modal');
    for (let move = 0; move < 200 && !(await question.isVisible()); move++) {
      await page.keyboard.press(KEYS[nextMove(await readBoard(page))]);
    }
    await expect(question).toBeVisible();

    const prompt = (await question.locator('p').first().textContent()) ?? '';
    const optionButtons = question.locator('[data-testid^="game-problem-option-"]');
    const values = (await optionButtons.allTextContents()).map(Number);
    const wrong = values.find((value) => value !== solve(prompt, values));
    await optionButtons.filter({ hasText: new RegExp(`^${wrong}$`) }).click();

    await expect(optionButtons).toHaveCount(values.length - 1);
    await expect(page.getByRole('button', { name: /südamed/i })).toHaveText('4/5');
  });

  test('a standard game reaches level 2 after five right answers', async ({ page }) => {
    await seed(page);
    await openGame(page, '/study/games/letter-match?seed=4');

    for (let answer = 0; answer < 5; answer++) {
      const letter = (await page.getByTestId('letter-match-prompt').textContent())?.trim() ?? '';
      const option = page
        .locator('[data-testid^="standard-answer-"]')
        .filter({ hasText: new RegExp(`^${letter.toLowerCase()}$`) });
      const clicked = await option.elementHandle();
      await option.click();
      // The game view remounts for each problem, so the tapped button leaves the page.
      if (answer < 4) {
        await expect.poll(() => clicked?.evaluate((el) => el.isConnected)).toBe(false);
      }
    }

    const levelUp = page.getByRole('dialog').filter({ hasText: 'Tase 2' });
    await expect(levelUp).toBeVisible({ timeout: 5_000 });
    await levelUp.getByRole('button', { name: /järgmine tase/i }).click();
    await expect(page.getByRole('button', { name: /muuda taset/i })).toContainText('2');
  });

  test('the game description sheet holds the shape dash run', async ({ page }) => {
    await seed(page);
    await openGame(page, '/study/games/shape-dash?seed=2');
    const canvas = page.locator('canvas');
    const frame = () => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());

    await page.getByRole('button', { name: 'Kuidas mängida' }).click();
    const sheet = page.getByRole('button', { name: 'Sulge' }).last();
    await expect(sheet).toBeVisible();
    await page.waitForTimeout(300);
    const held = await frame();
    await page.waitForTimeout(1_000);
    expect(await frame()).toBe(held);

    await sheet.click();
    await expect.poll(frame, { timeout: 3_000 }).not.toBe(held);
  });

  test('a wrong answer costs a heart and the last heart ends the game', async ({ page }) => {
    await seed(page, 2);
    await openGame(page, '/study/games/letter-match?seed=4');
    const hearts = page.getByRole('button', { name: /südamed/i });
    await expect(hearts).toHaveText('2/5');

    const letter = (await page.getByTestId('letter-match-prompt').textContent())?.trim() ?? '';
    const wrongOptions = page
      .locator('[data-testid^="standard-answer-"]')
      .filter({ hasNotText: new RegExp(`^${letter.toLowerCase()}$`) });

    await wrongOptions.first().click();
    await expect(hearts).toHaveText('1/5');

    await wrongOptions.last().click();
    await expect(page.getByRole('heading', { name: 'Mäng läbi' })).toBeVisible({ timeout: 5_000 });
  });
});

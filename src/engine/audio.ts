export type SoundType =
  'correct' | 'wrong' | 'click' | 'win' | 'tap' | 'success' | 'error' | 'connect';

let audioContext: AudioContext | null = null;

/**
 * Gets or creates the global AudioContext
 * @returns AudioContext instance or null if not supported
 */
const getAudioContext = (): AudioContext | null => {
  if (!audioContext) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtor) {
      audioContext = new AudioCtor();
    }
  }
  return audioContext;
};

/**
 * Plays a sound effect
 * @param type - Type of sound to play
 * @param active - Whether sound is enabled
 */
export const playSound = (type: SoundType, active = true): void => {
  if (!active) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Audio context resume failed - ignore silently
      });
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.06);
      osc.frequency.setValueAtTime(784, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'connect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // Audio playback failed - ignore silently
  }
};

/** A major pentatonic scale from C5, so any run of notes sounds right. */
const PENTATONIC_HZ = [
  523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760,
];

function playTone(ctx: AudioContext, hz: number, at: number, length: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

/** Runs a sound on the shared context when sound is on; audio failures stay silent. */
function withAudio(active: boolean, play: (ctx: AudioContext) => void): void {
  if (!active) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    play(ctx);
  } catch {
    // Audio playback failed - ignore silently
  }
}

/** One note of the pentatonic scale: step 0 is the lowest, so a run of steps rises. */
export const playScaleNote = (step: number, active = true): void =>
  withAudio(active, (ctx) => {
    const hz = PENTATONIC_HZ[Math.min(step, PENTATONIC_HZ.length - 1)] ?? PENTATONIC_HZ[0]!;
    playTone(ctx, hz, ctx.currentTime, 0.5, 0.12);
  });

/** A major chord from the scale's root, for a finished task. */
export const playChord = (active = true): void =>
  withAudio(active, (ctx) => {
    for (const step of [0, 2, 3, 5])
      playTone(ctx, PENTATONIC_HZ[step]!, ctx.currentTime, 1.4, 0.07);
  });

/** The feedback layer's moments (board 3A), each a few soft notes. */
export type Moment =
  'right' | 'wrong' | 'lifeLost' | 'streak' | 'star' | 'roundEnd' | 'levelUp' | 'raft';

const note = (step: number): number => PENTATONIC_HZ[step]!;

/** [hz, start offset s, length s] per note; volumes stay low, as the layer is quiet. */
const MOMENT_NOTES: Record<Moment, ReadonlyArray<readonly [number, number, number]>> = {
  right: [
    [note(0), 0, 0.18],
    [note(2), 0.09, 0.28],
  ],
  wrong: [[220, 0, 0.3]],
  lifeLost: [
    [392, 0, 0.18],
    [293.66, 0.12, 0.32],
  ],
  streak: [[note(8), 0, 0.6]],
  star: [
    [note(7), 0, 0.2],
    [note(9), 0.07, 0.4],
  ],
  roundEnd: [
    [note(0), 0, 0.18],
    [note(2), 0.12, 0.18],
    [note(3), 0.24, 0.18],
    [note(5), 0.36, 0.5],
  ],
  levelUp: [
    [note(3), 0, 0.2],
    [note(5), 0.14, 0.2],
    [note(7), 0.28, 0.6],
  ],
  // Two low strokes of the oars as the raft moves on (board 2A).
  raft: [
    [174.61, 0, 0.14],
    [196, 0.32, 0.14],
  ],
};

/** Plays a moment's notes, `delay` seconds from now on the audio clock. */
export const playMoment = (moment: Moment, active = true, delay = 0): void =>
  withAudio(active, (ctx) => {
    for (const [hz, offset, length] of MOMENT_NOTES[moment]) {
      playTone(ctx, hz, ctx.currentTime + delay + offset, length, moment === 'wrong' ? 0.06 : 0.08);
    }
  });

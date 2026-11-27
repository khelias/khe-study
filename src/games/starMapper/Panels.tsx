import React from 'react';
import { Star, Undo2 } from 'lucide-react';
import type { Constellation, SkySeason } from '../../types/game';
import { SEASONS, seasonCounts } from './seasons';

export interface ConstellationText {
  name: string;
  desc: string;
  folk?: string;
  story?: string;
}

/** The night clock under the task, moon to sun; the view sets its width each frame. */
const NightClockBar: React.FC<{
  label: string;
  fillRef: React.RefObject<HTMLDivElement | null>;
}> = ({ label, fillRef }) => (
  <div className="mt-2.5 flex items-center gap-2">
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" className="sky-moon" />
    </svg>
    <div
      className="sky-clock h-1.5 flex-1 overflow-hidden"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div ref={fillRef} className="sky-clock-fill h-1.5" style={{ width: '0%' }} />
    </div>
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="sky-sun">
      <circle cx="12" cy="12" r="4.5" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

/** The task and the moment, at the top of the sky; from level 5 the night clock under them. */
export const TopPanel: React.FC<{
  task: string;
  moment: string;
  clock?: { label: string; fillRef: React.RefObject<HTMLDivElement | null> };
}> = ({ task, moment, clock }) => (
  <div className="sky-panel absolute inset-x-4 top-3 mx-auto px-4 py-3 text-center md:w-[440px]">
    <p className="text-[19px] font-medium leading-snug">{task}</p>
    <p className="sky-sub mt-0.5 text-sm">{moment}</p>
    {clock && <NightClockBar {...clock} />}
  </div>
);

const LinesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="sky-gold-stroke">
    <path d="M4 18 L20 6" fill="none" strokeWidth="2" strokeLinecap="round" />
    <circle cx="4" cy="18" r="2" className="sky-gold-fill" />
    <circle cx="20" cy="6" r="2" className="sky-gold-fill" />
  </svg>
);

interface BottomBarProps {
  linesLeft: number | null;
  linesLabel: string;
  undoLabel: string;
  canUndo: boolean;
  onUndo: () => void;
  hintLabel: string;
  hintsOpen: boolean;
  canHint: boolean;
  onHints: () => void;
  mySkyLabel: string;
  onMySky: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  linesLeft,
  linesLabel,
  undoLabel,
  canUndo,
  onUndo,
  hintLabel,
  hintsOpen,
  canHint,
  onHints,
  mySkyLabel,
  onMySky,
}) => (
  <nav className="sky-bar absolute inset-x-3 bottom-[calc(16px+env(safe-area-inset-bottom))] mx-auto flex h-[60px] items-center gap-1.5 p-2 md:w-[560px]">
    {linesLeft !== null && (
      <span
        className="flex h-11 items-center gap-1.5 px-2.5 text-[17px] font-medium"
        aria-label={linesLabel}
      >
        <LinesIcon />
        <span aria-hidden>{linesLeft}</span>
      </span>
    )}
    {linesLeft !== null && (
      <button
        type="button"
        className="sky-btn flex size-11 items-center justify-center"
        aria-label={undoLabel}
        title={undoLabel}
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Undo2 size={22} aria-hidden />
      </button>
    )}
    <span className="flex-1" />
    {canHint && (
      <button
        type="button"
        className="sky-btn h-11 px-3 text-[15px] font-medium"
        aria-expanded={hintsOpen}
        onClick={onHints}
      >
        {hintLabel}
      </button>
    )}
    <button type="button" className="sky-btn h-11 px-3 text-[15px] font-medium" onClick={onMySky}>
      {mySkyLabel}
    </button>
  </nav>
);

export interface HintChip {
  id: string;
  label: string;
  cost: number;
}

export const HintRow: React.FC<{
  hints: readonly HintChip[];
  stars: number;
  onHint: (id: string, cost: number) => void;
}> = ({ hints, stars, onHint }) => (
  <div className="absolute inset-x-3 bottom-[calc(88px+env(safe-area-inset-bottom))] mx-auto flex gap-2 md:w-[560px]">
    {hints.map((h) => (
      <button
        key={h.id}
        type="button"
        className="sky-bar sky-btn flex h-14 flex-1 flex-col items-center justify-center text-sm font-medium"
        disabled={stars < h.cost}
        onClick={() => onHint(h.id, h.cost)}
      >
        <span>{h.label}</span>
        <span className="sky-gold flex items-center gap-1 text-[13px]">
          <Star size={13} aria-hidden className="sky-gold-fill" />
          {h.cost}
        </span>
      </button>
    ))}
  </div>
);

export const NameSheet: React.FC<{
  question: string;
  options: readonly { id: string; name: string }[];
  wrongIds: ReadonlySet<string>;
  onChoose: (id: string) => void;
}> = ({ question, options, wrongIds, onChoose }) => (
  <div className="sky-bar absolute inset-x-3 bottom-[calc(88px+env(safe-area-inset-bottom))] mx-auto p-3 md:w-[560px]">
    <p className="mb-3 text-center text-[19px] font-medium">{question}</p>
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="sky-option h-14 px-2 text-base font-medium"
          disabled={wrongIds.has(o.id)}
          onClick={() => onChoose(o.id)}
        >
          {o.name}
        </button>
      ))}
    </div>
  </div>
);

interface CardProps {
  heading: string;
  /** A season this find completed ("Talvetaevas on koos!"). */
  moment?: string | null;
  /** Sits on the card's top edge (the owl on a phone). */
  companion?: React.ReactNode;
  text: ConstellationText;
  when: string;
  source: string | null;
  actionLabel: string;
  primary: boolean;
  onAction: () => void;
}

/** The found card: a bottom sheet with the name, folk names, what to look for and the story. */
export const FoundCard: React.FC<CardProps> = ({
  heading,
  moment,
  companion,
  text,
  when,
  source,
  actionLabel,
  primary,
  onAction,
}) => (
  <div className="sky-rise absolute inset-x-0 bottom-0 mx-auto md:w-[560px]">
    {companion && <div className="absolute bottom-full right-4">{companion}</div>}
    <section
      className="sky-card max-h-[72dvh] overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5"
      aria-labelledby="sky-card-name"
    >
      <p className="sky-gold sky-eyebrow text-[13px] font-medium">{heading}</p>
      {moment && <p className="sky-gold mt-1 text-[15px] font-medium">{moment}</p>}
      <h2 id="sky-card-name" className="mt-1 text-[34px] font-medium leading-tight">
        {text.name}
      </h2>
      {text.folk && <p className="sky-muted mt-1 text-[15px]">{text.folk}</p>}
      <p className="mt-3 text-base leading-snug">{text.desc}</p>
      <p className="mt-1 text-base leading-snug">{when}</p>
      {text.story && (
        <div className="sky-story mt-4 p-4">
          <p className="text-base leading-snug">{text.story}</p>
          {source && <p className="sky-muted mt-2 text-[13px]">{source}</p>}
        </div>
      )}
      <button
        type="button"
        className={`${primary ? 'sky-primary' : 'sky-option'} mt-5 h-[54px] w-full text-lg font-medium`}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </section>
  </div>
);

/** A treasure's card above the bar: what it is and, where sourced, its folk name. */
export const TreasureCard: React.FC<{
  heading: string;
  name: string;
  desc: string;
  folk?: string;
  source: string | null;
  closeLabel: string;
  onClose: () => void;
}> = ({ heading, name, desc, folk, source, closeLabel, onClose }) => (
  <section
    className="sky-treasure-card sky-rise absolute inset-x-4 bottom-[calc(92px+env(safe-area-inset-bottom))] mx-auto flex flex-col gap-2.5 p-4 md:w-[440px]"
    aria-labelledby="sky-treasure-name"
  >
    <p className="sky-gold sky-eyebrow flex items-center gap-2 text-[13px] font-medium">
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className="sky-gold-fill">
        <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
      </svg>
      {heading}
    </p>
    <h2 id="sky-treasure-name" className="text-[26px] font-medium leading-tight">
      {name}
    </h2>
    {folk && <p className="sky-muted text-[15px]">{folk}</p>}
    <p className="text-base leading-snug">{desc}</p>
    {source && <p className="sky-muted text-[13px]">{source}</p>}
    <button type="button" className="sky-option h-[50px] text-base font-medium" onClick={onClose}>
      {closeLabel}
    </button>
  </section>
);

const SeasonRing: React.FC<{ label: string; found: number; total: number }> = ({
  label,
  found,
  total,
}) => {
  const r = 25;
  const c = 2 * Math.PI * r;
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        role="img"
        aria-label={`${label}: ${found}/${total}`}
      >
        <circle cx="28" cy="28" r={r} className="sky-ring-track" strokeWidth="5" fill="none" />
        <circle
          cx="28"
          cy="28"
          r={r}
          className="sky-gold-stroke"
          strokeWidth="5"
          fill="none"
          strokeDasharray={`${(total ? found / total : 0) * c} ${c}`}
          transform="rotate(-90 28 28)"
          strokeLinecap="round"
        />
        <text x="28" y="32" textAnchor="middle" className="sky-ring-text">
          {found}/{total}
        </text>
      </svg>
      <figcaption className="sky-sub text-xs">{label}</figcaption>
    </figure>
  );
};

export const AtlasPanel: React.FC<{
  title: string;
  closeLabel: string;
  seasonLabels: Record<SkySeason, string>;
  items: readonly Constellation[];
  foundIds: ReadonlySet<string>;
  onClose: () => void;
}> = ({ title, closeLabel, seasonLabels, items, foundIds, onClose }) => {
  const counts = seasonCounts(items, foundIds);
  return (
    <div className="sky-panel absolute inset-x-4 top-3 mx-auto p-3 md:w-[440px]">
      <div className="flex items-center justify-between">
        <h2 className="pl-1 text-[22px] font-medium">{title}</h2>
        <button
          type="button"
          className="sky-btn h-11 px-3 text-[15px] font-medium"
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>
      <div className="mt-2 flex justify-around">
        {SEASONS.map((s) => (
          <SeasonRing key={s} label={seasonLabels[s]} {...counts[s]} />
        ))}
      </div>
    </div>
  );
};

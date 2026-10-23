import { createElement } from 'react';
import {
  Anchor,
  BookOpen,
  Bot,
  Brain,
  Clock3,
  DoorOpen,
  Eye,
  FileText,
  Gamepad2,
  GraduationCap,
  Hash,
  Layers,
  Lightbulb,
  Palette,
  Puzzle,
  Route,
  Ruler,
  Scale,
  Search,
  Sparkles,
  Spline,
  Star,
  Target,
  Timer,
  TrainFront,
  Type,
  Waves,
  X,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const GAME_ICONS: Record<string, LucideIcon> = {
  Type,
  Brain,
  Scale,
  BookOpen,
  GraduationCap,
  TrainFront,
  Bot,
  Clock3,
  Ruler,
  Gamepad2,
  Hash,
  FileText,
  Layers,
  Search,
  Star,
  Anchor,
  Sparkles,
  Zap,
};

/** The lucide icon a game or mechanic config names in `icon`. */
export function gameIcon(name: string | undefined): LucideIcon {
  return (name && GAME_ICONS[name]) || Type;
}

// The configs' hint emoji are game data; the shell shows these icons instead (estate ADR-021).
const HINT_ICONS: Record<string, LucideIcon> = {
  eliminate: X,
  reveal: Target,
  reveal_empty: Waves,
  reveal_next: Type,
  reveal_pair: Eye,
  reveal_gate: DoorOpen,
  slow_time: Timer,
  outline: Palette,
  place: Puzzle,
  guide: Route,
  connect: Spline,
};

export function HintIcon({ id, ...props }: LucideProps & { id: string }) {
  return createElement(HINT_ICONS[id] ?? Lightbulb, props);
}

export function GameIcon({ name, ...props }: LucideProps & { name: string | undefined }) {
  return createElement(gameIcon(name), props);
}

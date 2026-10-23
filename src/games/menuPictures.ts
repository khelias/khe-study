import { GAME_CONFIG } from './data';
import type { MenuPicture } from './PictureFrame';
import { BalanceScalePicture } from './balanceScale/Picture';
import { BattlelearnPicture } from './battlelearn/Picture';
import { CompareSizesPicture } from './compareSizes/Picture';
import { FactDrillPicture } from './factDrill/Picture';
import { LetterMatchPicture } from './letterMatch/Picture';
import { MathSnakePicture } from './mathSnake/Picture';
import { MemoryMathPicture } from './memoryMath/Picture';
import { PatternPicture } from './pattern/Picture';
import { PicturePairsPicture } from './picturePairs/Picture';
import { RoboPathPicture } from './roboPath/Picture';
import { SentenceLogicPicture } from './sentenceLogic/Picture';
import { ShapeDashPicture } from './shapeDash/Picture';
import { ShapeShiftPicture } from './shapeShift/Picture';
import { StarMapperPicture } from './starMapper/Picture';
import { SyllableBuilderPicture } from './syllableBuilder/Picture';
import { TimeMatchPicture } from './timeMatch/Picture';
import { UnitConversionPicture } from './unitConversion/Picture';
import { WordBuilderPicture } from './wordBuilder/Picture';
import { WordCascadePicture } from './wordCascade/Picture';

/** One picture per menu entry: a game's id, or its mechanic's id when it shares a card. */
export const MENU_PICTURES: Record<string, MenuPicture> = {
  balance_scale: BalanceScalePicture,
  battlelearn: BattlelearnPicture,
  compare_sizes: CompareSizesPicture,
  fact_drill: FactDrillPicture,
  letter_match: LetterMatchPicture,
  math_snake: MathSnakePicture,
  memory_math: MemoryMathPicture,
  pattern: PatternPicture,
  picture_pairs: PicturePairsPicture,
  robo_path: RoboPathPicture,
  sentence_logic: SentenceLogicPicture,
  shape_dash: ShapeDashPicture,
  shape_shift: ShapeShiftPicture,
  star_mapper: StarMapperPicture,
  syllable_builder: SyllableBuilderPicture,
  time_match: TimeMatchPicture,
  unit_conversion: UnitConversionPicture,
  word_builder: WordBuilderPicture,
  word_cascade: WordCascadePicture,
};

/** The picture for a game or a mechanic card; a favourite variant finds its mechanic's. */
export function menuPicture(id: string): MenuPicture | undefined {
  return MENU_PICTURES[GAME_CONFIG[id]?.mechanic ?? id];
}

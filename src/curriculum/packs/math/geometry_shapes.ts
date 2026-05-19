import type { ContentPack, LocaleCode } from '../../types';
import { MATH_GEOMETRY_SHAPES_VERBAL_SKILL } from '../../skills/math';

export type ShapeDashGateShape = 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle';

export interface LocalizedText {
  et: string;
  en: string;
}

export interface ShapeDashCheckpointQuestionItem {
  kind: 'checkpoint';
  id: string;
  prompt: LocalizedText;
  options: Record<LocaleCode, string[]>;
  correctIndex: number;
}

export interface ShapeDashGateQuestionItem {
  kind: 'gate';
  id: string;
  prompt: LocalizedText;
  correctShape: ShapeDashGateShape;
}

export type ShapeDashGeometryItem = ShapeDashCheckpointQuestionItem | ShapeDashGateQuestionItem;

export const SHAPE_DASH_SHAPE_LABELS: Record<ShapeDashGateShape, LocalizedText> = {
  triangle: { et: 'Kolmnurk', en: 'Triangle' },
  square: { et: 'Ruut', en: 'Square' },
  pentagon: { et: 'Viisnurk', en: 'Pentagon' },
  hexagon: { et: 'Kuusnurk', en: 'Hexagon' },
  circle: { et: 'Ring', en: 'Circle' },
};

const numericOptions = (options: string[]): Record<LocaleCode, string[]> => ({
  et: options,
  en: options,
});

const symbolOptions = numericOptions;

const checkpoint = (
  id: string,
  prompt: LocalizedText,
  options: Record<LocaleCode, string[]>,
  correctIndex: number,
): ShapeDashCheckpointQuestionItem => ({
  kind: 'checkpoint',
  id,
  prompt,
  options,
  correctIndex,
});

const gate = (
  id: string,
  prompt: LocalizedText,
  correctShape: ShapeDashGateShape,
): ShapeDashGateQuestionItem => ({
  kind: 'gate',
  id,
  prompt,
  correctShape,
});

const checkpointItems: ShapeDashCheckpointQuestionItem[] = [
  checkpoint(
    'triangle_sides',
    { et: 'Mitu külge on kolmnurgal?', en: 'How many sides does a triangle have?' },
    numericOptions(['3', '4', '5', '6']),
    0,
  ),
  checkpoint(
    'square_sides',
    { et: 'Mitu külge on ruudul?', en: 'How many sides does a square have?' },
    numericOptions(['3', '4', '5', '6']),
    1,
  ),
  checkpoint(
    'pentagon_sides',
    { et: 'Mitu külge on viisnurgal?', en: 'How many sides does a pentagon have?' },
    numericOptions(['3', '4', '5', '6']),
    2,
  ),
  checkpoint(
    'hexagon_sides',
    { et: 'Mitu külge on kuusnurgal?', en: 'How many sides does a hexagon have?' },
    numericOptions(['3', '4', '5', '6']),
    3,
  ),
  checkpoint(
    'circle_sides',
    { et: 'Mitu külge on ringil?', en: 'How many sides does a circle have?' },
    numericOptions(['0', '1', '2', '3']),
    0,
  ),
  checkpoint(
    'rectangle_sides',
    { et: 'Mitu külge on ristkülikul?', en: 'How many sides does a rectangle have?' },
    numericOptions(['3', '4', '5', '6']),
    1,
  ),
  checkpoint(
    'triangle_vertices',
    { et: 'Mitu tippu on kolmnurgal?', en: 'How many vertices does a triangle have?' },
    numericOptions(['2', '3', '4', '5']),
    1,
  ),
  checkpoint(
    'square_vertices',
    { et: 'Mitu tippu on ruudul?', en: 'How many vertices does a square have?' },
    numericOptions(['2', '3', '4', '5']),
    2,
  ),
  checkpoint(
    'rectangle_corners',
    { et: 'Mitu nurka on ristkülikul?', en: 'How many corners does a rectangle have?' },
    numericOptions(['2', '3', '4', '5']),
    2,
  ),
  checkpoint(
    'hexagon_sides_alt',
    { et: 'Mitu külge on kuusnurgal?', en: 'A hexagon has how many sides?' },
    numericOptions(['3', '4', '5', '6']),
    3,
  ),
  checkpoint(
    'which_three',
    { et: 'Millisel kujul on 3 külge?', en: 'Which shape has 3 sides?' },
    {
      et: ['Ruut', 'Kolmnurk', 'Viisnurk', 'Ring'],
      en: ['Square', 'Triangle', 'Pentagon', 'Circle'],
    },
    1,
  ),
  checkpoint(
    'which_four',
    { et: 'Millisel kujul on 4 külge?', en: 'Which shape has 4 sides?' },
    {
      et: ['Kolmnurk', 'Ruut', 'Kuusnurk', 'Ring'],
      en: ['Triangle', 'Square', 'Hexagon', 'Circle'],
    },
    1,
  ),
  checkpoint(
    'which_six',
    { et: 'Millisel kujul on 6 külge?', en: 'Which shape has 6 sides?' },
    {
      et: ['Kolmnurk', 'Ruut', 'Kuusnurk', 'Viisnurk'],
      en: ['Triangle', 'Square', 'Hexagon', 'Pentagon'],
    },
    2,
  ),
  checkpoint(
    'circle_edges',
    { et: 'Mitu serva on ringil?', en: 'How many edges does a circle have?' },
    numericOptions(['0', '1', '2', '4']),
    0,
  ),
  checkpoint(
    'which_five',
    { et: 'Millisel kujul on 5 külge?', en: 'Which shape has 5 sides?' },
    {
      et: ['Kolmnurk', 'Ruut', 'Viisnurk', 'Kuusnurk'],
      en: ['Triangle', 'Square', 'Pentagon', 'Hexagon'],
    },
    2,
  ),
  checkpoint(
    'which_zero',
    { et: 'Millisel kujul on 0 külge?', en: 'Which shape has 0 sides?' },
    {
      et: ['Kolmnurk', 'Ruut', 'Ring', 'Kuusnurk'],
      en: ['Triangle', 'Square', 'Circle', 'Hexagon'],
    },
    2,
  ),
  checkpoint(
    'octagon_sides',
    { et: 'Mitu külge on kaheksanurgal?', en: 'How many sides does an octagon have?' },
    numericOptions(['6', '7', '8', '9']),
    2,
  ),
  checkpoint(
    'triangle_corners',
    { et: 'Mitu nurka on kolmnurgal?', en: 'How many corners does a triangle have?' },
    numericOptions(['2', '3', '4', '5']),
    1,
  ),
  checkpoint(
    'square_corners',
    { et: 'Mitu nurka on ruudul?', en: 'How many corners does a square have?' },
    numericOptions(['2', '3', '4', '5']),
    2,
  ),
  checkpoint(
    'pentagon_vertices',
    { et: 'Mitu tippu on viisnurgal?', en: 'How many vertices does a pentagon have?' },
    numericOptions(['3', '4', '5', '6']),
    2,
  ),
  checkpoint(
    'hexagon_vertices',
    { et: 'Mitu tippu on kuusnurgal?', en: 'How many vertices does a hexagon have?' },
    numericOptions(['3', '4', '5', '6']),
    3,
  ),
  checkpoint(
    'rectangle_sides_count',
    { et: 'Mitu külge on ristkülikul?', en: 'How many sides does a rectangle have?' },
    numericOptions(['3', '4', '5', '6']),
    1,
  ),
  checkpoint(
    'rhombus_sides',
    { et: 'Mitu külge on rombil?', en: 'How many sides does a rhombus have?' },
    numericOptions(['3', '4', '5', '6']),
    1,
  ),
  checkpoint(
    'oval_sides',
    { et: 'Mitu külge on ovaalil?', en: 'How many sides does an oval have?' },
    numericOptions(['0', '1', '2', '4']),
    0,
  ),
  checkpoint(
    'star_points',
    { et: 'Mitu tippu on viieharulisel tähel?', en: 'A 5-pointed star has how many points?' },
    numericOptions(['4', '5', '6', '10']),
    1,
  ),
  checkpoint(
    'compare_5_and_3',
    { et: 'Kumb on suurem: 5 või 3?', en: 'Which is bigger: 5 or 3?' },
    numericOptions(['3', '5', '4', '6']),
    1,
  ),
  checkpoint(
    'compare_7_and_4',
    { et: 'Kumb on suurem: 7 või 4?', en: 'Which is bigger: 7 or 4?' },
    numericOptions(['4', '7', '5', '6']),
    1,
  ),
  checkpoint(
    'compare_8_and_6',
    { et: 'Kumb on suurem: 8 või 6?', en: 'Which is bigger: 8 or 6?' },
    numericOptions(['6', '8', '7', '9']),
    1,
  ),
  checkpoint(
    'compare_10_and_9',
    { et: 'Kumb on suurem: 10 või 9?', en: 'Which is bigger: 10 or 9?' },
    numericOptions(['9', '10', '8', '11']),
    1,
  ),
  checkpoint(
    'pattern_abab',
    { et: 'Mis tuleb järgmisena: ▲ ■ ▲ ■ ?', en: 'What comes next: ▲ ■ ▲ ■ ?' },
    symbolOptions(['▲', '■', '●', '◆']),
    0,
  ),
  checkpoint(
    'pattern_abc',
    { et: 'Mis tuleb järgmisena: ● ▲ ■ ● ▲ ?', en: 'What comes next: ● ▲ ■ ● ▲ ?' },
    symbolOptions(['■', '●', '▲', '◆']),
    0,
  ),
  checkpoint(
    'pattern_aab',
    { et: 'Mis tuleb järgmisena: ▲ ▲ ■ ▲ ▲ ?', en: 'What comes next: ▲ ▲ ■ ▲ ▲ ?' },
    symbolOptions(['■', '▲', '●', '◆']),
    0,
  ),
];

const gateItems: ShapeDashGateQuestionItem[] = [
  gate('gate_three_sides', { et: '3 külge?', en: '3 sides?' }, 'triangle'),
  gate('gate_four_sides', { et: '4 külge?', en: '4 sides?' }, 'square'),
  gate('gate_five_sides', { et: '5 külge?', en: '5 sides?' }, 'pentagon'),
  gate('gate_six_sides', { et: '6 külge?', en: '6 sides?' }, 'hexagon'),
  gate('gate_zero_sides', { et: '0 külge?', en: '0 sides?' }, 'circle'),
  gate(
    'gate_pick_triangle',
    { et: 'Milline on kolmnurk?', en: 'Which is a triangle?' },
    'triangle',
  ),
  gate('gate_pick_circle', { et: 'Milline on ring?', en: 'Which is a circle?' }, 'circle'),
];

export const MATH_GEOMETRY_SHAPES_PACK: ContentPack<ShapeDashGeometryItem> = {
  id: 'math.geometry_shapes.shape_dash_basics',
  skillId: MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id,
  locale: 'et',
  version: '1.0.0',
  title: { et: 'Kujundite jooksu geomeetria', en: 'Shape Dash geometry' },
  items: [...checkpointItems, ...gateItems],
};

export function getShapeDashCheckpointQuestions(
  items: readonly ShapeDashGeometryItem[],
): ShapeDashCheckpointQuestionItem[] {
  return items.filter(
    (item): item is ShapeDashCheckpointQuestionItem => item.kind === 'checkpoint',
  );
}

export function getShapeDashGateQuestions(
  items: readonly ShapeDashGeometryItem[],
): ShapeDashGateQuestionItem[] {
  return items.filter((item): item is ShapeDashGateQuestionItem => item.kind === 'gate');
}

export function getShapeDashShapeLabel(shape: ShapeDashGateShape, locale: LocaleCode): string {
  return SHAPE_DASH_SHAPE_LABELS[shape][locale];
}

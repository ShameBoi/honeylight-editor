// @flow

import type { Color } from 'react-color';

type FourteenColorRow = [
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color
];

type FifteenColorRow = [
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color
];

type SixteenColorRow = [
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color
];

// 5 rows, 14 / 15 / 16 / 15 / 14 items in each
export type ColorData = [
  FourteenColorRow,
  FifteenColorRow,
  SixteenColorRow,
  FifteenColorRow,
  FourteenColorRow
];

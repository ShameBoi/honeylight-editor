// @flow

import type { RGBColor } from 'react-color';
import type { NamedRGBColor } from '../types/Color.type';

export default class Config {
  static defaultForegroundColor: RGBColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 1
  };

  static defaultBackgroundColor: RGBColor = { r: 0, g: 0, b: 0, a: 1 };

  static rows: number = 5;

  static maxCols: number = 16;

  static framesPerSecond: number = 30;

  static millisecondsPerFrame: number = (1 / Config.framesPerSecond) * 1000;

  static maxFrames: number = 90;

  static maxTransitionFrames: number = 300;

  static colorHistoryCount: number = 10;

  static presetColors: Array<NamedRGBColor> = [
    {
      name: 'White',
      color: { r: 255, g: 255, b: 255, a: 1 }
    },
    {
      name: 'Black',
      color: { r: 0, g: 0, b: 0, a: 1 }
    },
    {
      name: 'Red',
      color: { r: 255, g: 0, b: 0, a: 1 }
    },
    {
      name: 'Orange',
      color: { r: 255, g: 127, b: 0, a: 1 }
    },
    {
      name: 'Yellow',
      color: { r: 255, g: 255, b: 0, a: 1 }
    },
    {
      name: 'Green',
      color: { r: 0, g: 255, b: 0, a: 1 }
    },
    {
      name: 'Cyan',
      color: { r: 0, g: 255, b: 255, a: 1 }
    },
    {
      name: 'Blue',
      color: { r: 0, g: 0, b: 255, a: 1 }
    },
    {
      name: 'Violet',
      color: { r: 127, g: 0, b: 255, a: 1 }
    },
    {
      name: 'Magenta',
      color: { r: 255, g: 0, b: 255, a: 1 }
    }
  ];

  static getRowLength(rowIndex: number): number {
    switch (rowIndex) {
      case 0:
      case 4:
      default:
        return Config.maxCols - 2;

      case 1:
      case 3:
        return Config.maxCols - 1;

      case 2:
        return Config.maxCols;
    }
  }
}

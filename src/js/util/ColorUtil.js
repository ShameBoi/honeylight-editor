// @flow

import { toState } from 'react-color/lib/helpers/color';
import type { Color, RGBColor, ColorResult } from 'react-color';
import type { ColorDelta } from '../types/Color.type';

export default class ColorUtil {
  static colorToCSS(color: Color): string {
    if (color instanceof String) {
      return color;
    } else if (color.r || color.r === 0) {
      return `rgba(${color.r},${color.g},${color.b},${color.a})`;
    } else if ((color.h || color.h === 0) && (color.l || color.l === 0)) {
      return `hsla(${color.h},${color.s},${color.l},${color.a})`;
    } else if ((color.h || color.h === 0) && (color.v || color.v === 0)) {
      return `hsva(${color.h},${color.s},${color.v},${color.a})`;
    } else {
      return '';
    }
  }

  static colorComparator(colorA: Color, colorB: Color): number {
    if (colorA === colorB) {
      return 0;
    }
    const normalizedA = toState(colorA);
    const normalizedB = toState(colorB);

    let delta = normalizedA.rgb.r - normalizedB.rgb.r;
    if (delta !== 0) {
      return delta;
    }
    delta = normalizedA.rgb.g - normalizedB.rgb.g;
    if (delta !== 0) {
      return delta;
    }
    delta = normalizedA.rgb.b - normalizedB.rgb.b;
    if (delta !== 0) {
      return delta;
    }
    return normalizedA.rgb.a - normalizedB.rgb.a;
  }

  static colorsEqual(colorA: Color, colorB: Color): boolean {
    return ColorUtil.colorComparator(colorA, colorB) === 0;
  }

  static colorDelta(colorA: Color, colorB: Color): ColorDelta {
    colorA = ColorUtil.normalizeToRGB(colorA);
    colorB = ColorUtil.normalizeToRGB(colorB);
    return {
      rDelta: colorA.r - colorB.r,
      gDelta: colorA.g - colorB.g,
      bDelta: colorA.b - colorB.b,
      aDelta: colorA.a - colorB.a
    };
  }

  static applyColorDelta(color: Color, delta: ColorDelta): Color {
    color = ColorUtil.normalizeToRGB(color);
    return {
      r: color.r + delta.rDelta,
      g: color.g + delta.gDelta,
      b: color.b + delta.bDelta,
      a: color.a + delta.aDelta
    };
  }

  static scaleDelta(delta: ColorDelta, scaleFactor: number): ColorDelta {
    return {
      rDelta: delta.rDelta * scaleFactor,
      gDelta: delta.gDelta * scaleFactor,
      bDelta: delta.bDelta * scaleFactor,
      aDelta: delta.aDelta * scaleFactor
    };
  }

  static normalizeToRGB(color: Color | ColorResult): RGBColor {
    if (color.rgb && (color.rgb.r || color.rgb.r === 0)) {
      color = color.rgb;
    }
    if (!color.r && color.r !== 0) {
      color = toState(color).rgb;
    }
    if (!color.a && color.a !== 0) {
      color.a = 1;
    }
    return color;
  }
}

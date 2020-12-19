// @flow

import { fabric } from 'fabric';
import type { Color } from 'react-color';

export default class Hexagon extends fabric.Polygon {
  row: number;
  col: number;

  constructor(points: Array<{ x: number, y: number }>, options: *) {
    super(points, options);
  }

  getColor(): Color {
    const fillColor = new fabric.Color(this.fill);
    return {
      r: fillColor.getSource()[0],
      g: fillColor.getSource()[1],
      b: fillColor.getSource()[2],
      a: this.getOpacity()
    };
  }

  setColor(color: Color) {
    let newColor: string;
    if (color instanceof String) {
      newColor = color;
    } else if (color.r || color.r === 0) {
      newColor = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    } else if ((color.h || color.h === 0) && (color.l || color.l === 0)) {
      newColor = `hsla(${color.h},${color.s},${color.l},${color.a})`;
    } else if ((color.h || color.h === 0) && (color.v || color.v === 0)) {
      newColor = `hsva(${color.h},${color.s},${color.v},${color.a})`;
    } else {
      return;
    }
    this.set('fill', newColor);
  }
}

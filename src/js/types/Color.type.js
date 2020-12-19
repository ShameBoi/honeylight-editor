// @flow

import PropTypes from 'prop-types';
import type { RGBColor } from 'react-color';

export const ColorPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired,
    a: PropTypes.number
  }),
  PropTypes.shape({
    h: PropTypes.number.isRequired,
    s: PropTypes.number.isRequired,
    l: PropTypes.number.isRequired,
    a: PropTypes.number
  }),
  PropTypes.shape({
    h: PropTypes.number.isRequired,
    s: PropTypes.number.isRequired,
    v: PropTypes.number.isRequired,
    a: PropTypes.number
  })
]);

export const ColorStateShape = {
  rgb: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired,
    a: PropTypes.number
  }),
  hsl: PropTypes.shape({
    h: PropTypes.number.isRequired,
    s: PropTypes.number.isRequired,
    l: PropTypes.number.isRequired,
    a: PropTypes.number
  }),
  hex: PropTypes.string
};

export const ColorStatePropType = PropTypes.shape(ColorStateShape);

export type ReactColorState = {
  hsl: {
    h: number,
    s: number,
    l: number,
    a: number
  },
  hex: string,
  rgb: {
    r: number,
    g: number,
    b: number,
    a: number
  },
  hsv: {
    h: number,
    s: number,
    v: number,
    a: number
  },
  oldHue: number,
  source: string
};

export type ColorDelta = {|
  rDelta: number,
  gDelta: number,
  bDelta: number,
  aDelta: number
|};

export type NamedRGBColor = {
  name: string,
  color: RGBColor
};

// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';

import Animate from './svg/Animate';
import Rect from './svg/Rect';
import Svg from './svg/Svg';

type LoadingColorBarsProps = {
  children?: Node,
  className: string
};

type LoadingColorBarsState = {};

export default class LoadingColorBars extends Component<
  LoadingColorBarsProps,
  LoadingColorBarsState
> {
  static propTypes = {
    className: PropTypes.string
  };

  static defaultProps: LoadingColorBarsProps = {
    className: 'loading-overlay'
  };

  props: LoadingColorBarsProps;
  state: LoadingColorBarsState;

  constructor(props: LoadingColorBarsProps, context: any) {
    super(props, context);
  }

  render() {
    const range = (from: number, to: number, multiplier: number = 1): Array<number> => {
      const size = Math.abs(to - from);
      const arr = new Array(size);
      for (let val = from, iter = 0; iter <= size; ++iter, ++val) {
        arr[iter] = val * multiplier;
      }
      return arr;
    };

    const makeRect = (
      idx: number,
      val: number,
      from: number,
      to: number,
      animateDuration = 1,
      totalWidth = 100,
      totalHeight = 100
    ) => {
      const total = Math.abs(to - from);

      const infiniteAnimate = (
        attribute: string,
        values: Array<any>,
        duration: number = animateDuration
      ) => {
        const startTime = duration * (idx / total) - duration;
        return (
          <Animate
            attributeName={attribute}
            values={values}
            duration={duration}
            startTime={startTime}
          />
        );
      };

      const singleHeight = totalHeight / total;

      return (
        <Rect y={singleHeight * val} width={totalWidth} height={singleHeight} key={idx}>
          {infiniteAnimate(
            'fill',
            range(from, to, 360 / total).map((hue) =>
              tinycolor({ h: hue, s: 60, v: 50, a: 0.5 }).toRgbString()
            ),
            animateDuration
          )}
          {infiniteAnimate('width', [10, totalWidth, 30, 70, 10], total * animateDuration)}
          {infiniteAnimate('y', range(from, to, singleHeight), (total * animateDuration) / 2)}
        </Rect>
      );
    };

    return (
      <Svg
        className={classNames(['loading-color-bars', this.props.className])}
        viewBox={{ x: 0, y: 0, width: 100, height: 100 }}
        preserveAspectRatio="none"
      >
        {range(-1, 6).map((num, idx) => makeRect(idx, num, -1, 6, 2, 100, 120))}
      </Svg>
    );
  }
}

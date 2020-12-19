// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';

type AnimateProps = {
  className?: string,
  attributeName: string,
  values: Array<any>,
  repeatCount: number | 'indefinite',
  startTime: number,
  duration: number,
  keySplines?: Array<Array<number>>,
  calcMode?: 'discrete' | 'linear' | 'paced' | 'spline',
  keyTimes?: Array<number>
};

export default class Animate extends Component<AnimateProps> {
  static propTypes = {
    attributeName: PropTypes.string.isRequired,
    values: PropTypes.array.isRequired,
    startTime: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    repeatCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    keySplines: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    calcMode: PropTypes.string,
    keyTimes: PropTypes.arrayOf(PropTypes.number)
  };

  static defaultProps = {
    repeatCount: 'indefinite',
    calcMode: 'linear'
  };

  props: AnimateProps;

  constructor(props: AnimateProps, context: any) {
    super(props, context);
  }

  render() {
    return (
      <animate
        className={this.props.className}
        attributeName={this.props.attributeName}
        values={this.props.values.join(';')}
        repeatCount={this.props.repeatCount}
        dur={`${this.props.duration}s`}
        begin={`${this.props.startTime}s`}
        keySplines={
          this.props.keySplines
            ? this.props.keySplines.reduce((res, line) => `${res}\n${line.join(' ')};`, '')
            : undefined
        }
        calcMode={this.props.calcMode}
        keyTimes={this.props.keyTimes ? this.props.keyTimes.join(';') : undefined}
      />
    );
  }
}

// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';

type RectProps = {
  className?: string,
  children?: React$Element<*> | Array<React$Element<*>>,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fill?: string,
  fillOpacity?: number
};

export default class Rect extends Component<RectProps, {}> {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    fill: PropTypes.string,
    fillOpacity: PropTypes.number
  };

  static defaultProps = {
    x: 0,
    y: 0,
    fillOpacity: 1
  };

  props: RectProps;
  state: {};

  constructor(props: RectProps, context: any) {
    super(props, context);
  }

  render() {
    return <rect {...this.props}>{this.props.children}</rect>;
  }
}

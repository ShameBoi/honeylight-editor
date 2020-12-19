// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';

type UseProps = {
  className?: string,
  children?: React$Element<*> | Array<React$Element<*>>,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fill?: string,
  fillOpacity?: number,
  href: string
};

export default class Use extends Component<UseProps, {}> {
  static propTypes = {
    href: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
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

  props: UseProps;
  state: {};

  constructor(props: UseProps, context: any) {
    super(props, context);
  }

  render() {
    return <use {...this.props}>{this.props.children}</use>;
  }
}

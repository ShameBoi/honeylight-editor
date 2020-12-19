// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';

type SvgProps = {
  className?: string,
  children?: React$Element<*> | Array<React$Element<*>>,
  width?: number | string,
  height?: number | string,
  viewBox:
    | string
    | {
        x: number,
        y: number,
        width: number,
        height: number
      },
  preserveAspectRatio: string
};

type SvgState = {
  viewBox: string
};

export default class Svg extends Component<SvgProps, SvgState> {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    viewBox: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      })
    ]),
    preserveAspectRatio: PropTypes.string
  };

  static defaultProps = {
    viewBox: '0 0 100 100',
    preserveAspectRatio: 'xMidYMid'
  };

  props: SvgProps;
  state: SvgState;

  constructor(props: SvgProps, context: any) {
    super(props, context);
  }

  componentWillMount() {
    if (typeof this.props.viewBox !== 'string') {
      const viewBox = this.props.viewBox;
      this.setState({
        viewBox: `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      });
    } else {
      this.setState({
        viewBox: this.props.viewBox
      });
    }
  }

  render() {
    return (
      <svg version="1.1" {...this.props} viewBox={this.state.viewBox}>
        {this.props.children}
      </svg>
    );
  }
}

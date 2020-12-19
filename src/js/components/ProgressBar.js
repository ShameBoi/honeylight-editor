// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';

type ProgressBarProps = {
  active?: boolean,
  state: 'waiting' | 'running' | 'done' | 'failed',
  val: number,
  children?: Node,
  className?: string,
  componentClass: string
};

export default class ProgressBar extends Component<ProgressBarProps, *> {
  static propTypes = {
    val: PropTypes.number.isRequired,
    state: PropTypes.oneOf(['waiting', 'running', 'done', 'failed']).isRequired,
    active: PropTypes.bool,
    componentClass: PropTypes.string
  };

  static defaultProps = {
    active: false,
    componentClass: 'div'
  };

  props: ProgressBarProps;

  constructor(props: ProgressBarProps, context: any) {
    super(props, context);
  }

  render() {
    return React.createElement(
      this.props.componentClass,
      {
        className: className({
          'progress-bar': true,
          [this.props.className || '']: !!this.props.className,
          [this.props.state]: true
        }),
        style: {
          backgroundSize: `${this.props.val}% 100%, auto`
        },
        role: 'progressbar',
        'aria-valuenow': this.props.val,
        'aria-valuemin': 0,
        'aria-valuemax': 100
      },
      this.props.children
    );
  }
}

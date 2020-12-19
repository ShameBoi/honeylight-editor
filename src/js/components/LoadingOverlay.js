// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import LoadingColorBars from './LoadingColorBars';
import className from 'classnames';

type LoadingOverlayProps = {
  children?: Node,
  className?: string,
  active: boolean,
  loader: React$Element<*>
};

type LoadingOverlayState = {};

export default class LoadingOverlay extends Component<LoadingOverlayProps, LoadingOverlayState> {
  static propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    loader: PropTypes.element
  };

  static defaultProps: LoadingOverlayProps = {
    active: false,
    loader: <LoadingColorBars />
  };

  props: LoadingOverlayProps;
  state: LoadingOverlayState;

  constructor(props: LoadingOverlayProps, context: any) {
    super(props, context);
  }

  render() {
    let content = null;

    if (this.props.active) {
      content = (
        <div
          className={className({
            'loading-overlay': true,
            [this.props.className || '']: !!this.props.className
          })}
        >
          {this.props.loader}
        </div>
      );
    }

    return (
      <ReactCSSTransitionGroup
        transitionName={`loading-overlay-transition`}
        transitionEnterTimeout={150}
        transitionLeaveTimeout={150}
      >
        {content}
      </ReactCSSTransitionGroup>
    );
  }
}

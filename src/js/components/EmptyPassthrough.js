// @flow

import React, { Component } from 'react';
import type { Node } from 'react';

type EmptyPassthroughProps = {
  children?: Node
};

export default class EmptyPassthrough extends Component<EmptyPassthroughProps> {
  props: EmptyPassthroughProps;

  render() {
    return React.Children.toArray(this.props.children)[0] || null;
  }
}

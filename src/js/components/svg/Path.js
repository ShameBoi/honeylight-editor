// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';

type PathProps = {
  className?: string,
  children?: React$Element<*> | Array<React$Element<*>>,
  width?: number | string,
  height?: number | string,
  d?: string | PathBuilder
};

type PathState = {
  d: ?string
};

type PathComponent = {
  type:
    | 'M'
    | 'L'
    | 'H'
    | 'V'
    | 'C'
    | 'S'
    | 'Q'
    | 'T'
    | 'A'
    | 'Z'
    | 'm'
    | 'l'
    | 'h'
    | 'v'
    | 'c'
    | 's'
    | 'q'
    | 't'
    | 'a'
    | 'z',
  args?: Array<any>
};

export class PathBuilder {
  pathData: Array<PathComponent> = [];
  isClosed: boolean = false;

  constructor() {}

  clone(): PathBuilder {
    const clone = new PathBuilder();
    clone.pathData = this.pathData.slice(0);
    clone.isClosed = this.isClosed;
    return clone;
  }

  moveTo(x: number, y: number): PathBuilder {
    this.pathData.push({
      type: 'M',
      args: [x, y]
    });
    return this;
  }

  relMoveTo(dx: number, dy: number): PathBuilder {
    this.pathData.push({
      type: 'm',
      args: [dx, dy]
    });
    return this;
  }

  lineTo(x: number, y: number): PathBuilder {
    this.pathData.push({
      type: 'L',
      args: [x, y]
    });
    return this;
  }

  relLineTo(dx: number, dy: number): PathBuilder {
    this.pathData.push({
      type: 'l',
      args: [dx, dy]
    });
    return this;
  }

  curveTo(x: number, y: number, cx1: number, cy1: number, cx2: number, cy2: number): PathBuilder {
    this.pathData.push({
      type: 'C',
      args: [cx1, cy1, cx2, cy2, x, y]
    });
    return this;
  }

  relCurveTo(
    dx: number,
    dy: number,
    dcx1: number,
    dcy1: number,
    dcx2: number,
    dcy2: number
  ): PathBuilder {
    this.pathData.push({
      type: 'c',
      args: [dcx1, dcy1, dcx2, dcy2, dx, dy]
    });
    return this;
  }

  closePath(): PathBuilder {
    this.pathData.push({
      type: 'z'
    });
    this.isClosed = true;
    return this;
  }

  toString(): string {
    if (!this.isClosed) {
      this.closePath();
    }
    return this.pathData
      .map(component => {
        let result: string = component.type;
        if (component.args) {
          let curArg = null;
          component.args.forEach(arg => {
            if (!curArg) {
              result += ` ${arg}`;
              curArg = arg;
            } else {
              result += `,${arg}`;
              curArg = null;
            }
          });
        }
        return result;
      })
      .join('\n');
  }
}

export default class Path extends Component<PathProps, PathState> {
  static propTypes = {
    d: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  static defaultProps = {};

  props: PathProps;
  state: PathState;

  constructor(props: PathProps, context: any) {
    super(props, context);
  }

  componentWillMount() {
    this.setState({
      d: this.props.d ? this.props.d.toString() : null
    });
  }

  render() {
    return (
      <path {...this.props} d={this.state.d}>
        {this.props.children}
      </path>
    );
  }
}

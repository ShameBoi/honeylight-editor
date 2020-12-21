// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';

type IconProps = {
  className?: string,
  name: string,
  iconStyle?: ?('brands' | 'solid' | 'regular' | 'light' | 'duotone'),
  fw?: boolean,
  size?: ?('lg' | '2x' | '3x' | '4x' | '5x'),
  li?: boolean,
  spin?: boolean,
  pull?: ?('right' | 'left'),
  border?: boolean,
  rotate?: ?('90' | '180' | '270'),
  flip?: ?('horizontal' | 'vertical'),
  stack?: ?('1x' | '2x'),
  inverse?: boolean
};

type IconState = {};

export default class Icon extends Component<IconProps, IconState> {
  static propTypes = {
    name: PropTypes.string.isRequired,
    iconStyle: PropTypes.oneOf(['brands', 'solid', 'regular', 'light', 'duotone']),
    size: PropTypes.oneOf(['lg', '2x', '3x', '4x', '5x']),
    fw: PropTypes.bool,
    li: PropTypes.bool,
    spin: PropTypes.bool,
    pull: PropTypes.oneOf(['right', 'left']),
    border: PropTypes.bool,
    rotate: PropTypes.oneOf(['90', '180', '270']),
    flip: PropTypes.oneOf(['horizontal', 'vertical']),
    stack: PropTypes.oneOf(['1x', '2x']),
    inverse: PropTypes.bool
  };

  static defaultProps: $Shape<IconProps> = {
    iconStyle: 'solid',
    fw: false,
    li: false,
    spin: false,
    border: false,
    inverse: false
  };

  render(): React$Node {
    let stylePrefix: 'fab' | 'far' | 'fal' | 'fad' | 'fas';
    switch (this.props.iconStyle) {
      case 'brands':
        stylePrefix = 'fab';
        break;
      case 'regular':
        stylePrefix = 'far';
        break;
      case 'light':
        stylePrefix = 'fal';
        break;
      case 'duotone':
        stylePrefix = 'fad';
        break;
      case 'solid':
      default:
        stylePrefix = 'fas';
        break;
    }
    return (
      <i
        className={className(
          stylePrefix,
          `fa-${this.props.name}`,
          {
            'fa-li': this.props.li,
            'fa-spin': this.props.spin,
            [`fa-${this.props.size || ''}`]: !!this.props.size,
            [`fa-pull-${this.props.pull || ''}`]: !!this.props.pull,
            'fa-border': this.props.border,
            [`fa-rotate-${this.props.rotate || ''}`]: !!this.props.rotate,
            [`fa-flip-${this.props.flip || ''}`]: !!this.props.flip,
            [`fa-stack-${this.props.stack || ''}`]: !!this.props.stack,
            'fa-inverse': this.props.inverse,
            'fa-fw': this.props.fw
          },
          this.props.className
        )}
        aria-hidden="true"
      />
    );
  }
}

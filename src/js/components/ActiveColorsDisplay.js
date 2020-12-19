// @flow

import React, { Component } from 'react';
import type { Color } from 'react-color';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { ColorPropType } from '../types/Color.type';
import ColorUtil from '../util/ColorUtil';
import Icon from './Icon';

type ActiveColorsDisplayProps = {
  onSwapColors: () => void,
  foregroundColor: Color,
  backgroundColor: Color
};

export default class ActiveColorsDisplay extends Component<ActiveColorsDisplayProps, *> {
  static propTypes = {
    onSwapColors: PropTypes.func.isRequired,
    foregroundColor: ColorPropType.isRequired,
    backgroundColor: ColorPropType.isRequired
  };

  static defaultProps = {};

  constructor(props: ActiveColorsDisplayProps, context: any) {
    super(props, context);
  }

  @autobind
  onKeyDownSwapColors(event: SyntheticKeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        this.props.onSwapColors();
        break;
    }
  }

  render() {
    return (
      <div
        className="activeColorsDisplay"
        tabIndex="0"
        onClick={this.props.onSwapColors}
        onKeyDown={this.onKeyDownSwapColors}
        role="button"
      >
        <div
          title="Foreground color"
          className="colorDisplay foregroundColorDisplay"
          style={{ backgroundColor: ColorUtil.colorToCSS(this.props.foregroundColor) }}
        />
        <div
          title="Background color"
          className="colorDisplay backgroundColorDisplay"
          style={{ backgroundColor: ColorUtil.colorToCSS(this.props.backgroundColor) }}
        />
        <div className="swapColorsIcon" title="Swap foreground/background colors">
          <Icon name="expand-alt" flip="horizontal" fw={true} iconStyle="duotone" />
        </div>
      </div>
    );
  }
}

// @flow

import React, { Component } from 'react';
import type { Color, ColorChangeHandler, RGBColor } from 'react-color';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import dropRight from 'lodash/dropRight';
import { ColorPropType } from '../types/Color.type';
import ColorUtil from '../util/ColorUtil';
import Config from '../data/Config';
import type { NamedRGBColor } from '../types/Color.type';
import className from 'classnames';

type ColorQuickBarProps = {
  onSelectForeground: ColorChangeHandler,
  foregroundColor: Color
};

type ColorQuickBarState = {
  colorHistory: Array<RGBColor>
};

export default class ColorQuickBar extends Component<ColorQuickBarProps, ColorQuickBarState> {
  static propTypes = {
    onSelectForeground: PropTypes.func.isRequired,
    foregroundColor: ColorPropType.isRequired
  };

  static defaultProps = {};

  constructor(props: ColorQuickBarProps, context: any) {
    super(props, context);
    this.state = {
      colorHistory: Array.from(
        { length: Config.colorHistoryCount },
        () => Config.defaultForegroundColor
      )
    };
  }

  componentDidUpdate(prevProps: ColorQuickBarProps) {
    if (prevProps.foregroundColor !== this.props.foregroundColor) {
      const newColor: RGBColor = ColorUtil.normalizeToRGB(this.props.foregroundColor);
      const existingIndex: ?number = this._getIndexOfColor(newColor);
      if (existingIndex === null) {
        this.setState({
          colorHistory: [newColor, ...dropRight(this.state.colorHistory, 1)]
        });
      }
    }
  }

  _getIndexOfColor(color: RGBColor): ?number {
    for (let checkIter: number = 0; checkIter < Config.presetColors.length; ++checkIter) {
      if (isEqual(color, Config.presetColors[checkIter].color)) {
        return checkIter;
      }
    }
    for (let checkIter: number = 0; checkIter < this.state.colorHistory.length; ++checkIter) {
      if (isEqual(color, this.state.colorHistory[checkIter])) {
        return checkIter + Config.presetColors.length;
      }
    }
    return null;
  }

  @autobind
  _onSquareKeyDown(color: RGBColor, { key }: KeyboardEvent<HTMLDivElement>) {
    switch (key) {
      case 'Enter':
        this.props.onSelectForeground(color);
        break;

      default:
        break;
    }
  }

  @autobind
  _renderPresetSquare(preset: NamedRGBColor, index: number, selected: boolean): React$Element {
    return (
      <div
        className={className({
          colorQuickBarSquare: true,
          colorPresetSquare: true,
          selected: selected
        })}
        id={`color-preset-square-${index}`}
        key={index}
        role="button"
        tabIndex="0"
        aria-roledescription={`Select ${preset.name}`}
        title={preset.name}
        onClick={() => this.props.onSelectForeground(preset.color)}
        onKeyDown={(event) => this._onSquareKeyDown(preset.color, event)}
        style={{
          backgroundColor: ColorUtil.colorToCSS(preset.color)
        }}
      />
    );
  }

  @autobind
  _renderHistorySquare(color: RGBColor, index: number, selected: boolean): React$Element {
    return (
      <div
        className={className({
          colorQuickBarSquare: true,
          colorHistorySquare: true,
          selected: selected
        })}
        id={`color-history-square-${index}`}
        key={index}
        role="button"
        tabIndex="0"
        aria-roledescription={`Select history color ${index - Config.presetColors.length + 1}`}
        title={`R: ${color.r} G: ${color.g} B: ${color.b} A: ${color.a}`}
        onClick={() => this.props.onSelectForeground(color)}
        onKeyDown={(event) => this._onSquareKeyDown(color, event)}
        style={{
          backgroundColor: ColorUtil.colorToCSS(color)
        }}
      />
    );
  }

  render() {
    const normalizedColor: RGBColor = ColorUtil.normalizeToRGB(this.props.foregroundColor);
    const selectedIndex: ?number = this._getIndexOfColor(normalizedColor);
    return (
      <div className="colorQuickBar">
        <div className="colorQuickBarRow colorPresetSquares">
          {Config.presetColors.map((color, index) =>
            this._renderPresetSquare(color, index, selectedIndex === index)
          )}
        </div>
        <div className="colorQuickBarRow colorHistorySquares">
          {this.state.colorHistory.map((color, index) => {
            const shiftedIndex: number = index + Config.presetColors.length;
            return this._renderHistorySquare(color, shiftedIndex, selectedIndex === shiftedIndex);
          })}
        </div>
      </div>
    );
  }
}

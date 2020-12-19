// @flow

import React, { Component, PureComponent, Ref } from 'react';
import type { ColorPickerProps as ParentColorPickerProps, Color, RGBColor } from 'react-color';
import { CustomPicker } from 'react-color';
import { autobind } from 'core-decorators';
import { Form, FormControl } from 'react-bootstrap';
import { Checkboard, Hue, Saturation } from 'react-color/lib/components/common';
import type { AlphaProps } from 'react-color/lib/components/common';
import { toState } from 'react-color/lib/helpers/color';
import PropTypes from 'prop-types';
import type { ReactColorState } from '../types/Color.type';
import Icon from './Icon';
import { ColorPropType, ColorStateShape } from '../types/Color.type';

class ColorPickerSliderPointer extends PureComponent<{}> {
  render() {
    return <div className="sliderPointer" />;
  }
}

type AlphaSliderProps = {
  ...AlphaProps,
  className?: string,
  color: Color
};

class AlphaSlider extends Component<AlphaSliderProps> {
  static propTypes = {
    ...ColorStateShape,
    color: ColorPropType.isRequired,
    className: PropTypes.string,
    pointer: PropTypes.elementType,
    onChange: PropTypes.func
  };

  static defaultProps: AlphaSliderProps = {
    pointer: ColorPickerSliderPointer
  };

  _sliderRef: Ref<HTMLDivElement>;

  constructor(props: AlphaSliderProps, context: any) {
    super(props, context);
    this._sliderRef = React.createRef();
  }

  @autobind
  onSliderClick({ nativeEvent }: SyntheticMouseEvent): boolean {
    nativeEvent.stopPropagation();
    if (nativeEvent.buttons !== 1) {
      return false;
    }
    const clientRect = this._sliderRef.current.getBoundingClientRect();
    const clickPosition = nativeEvent.clientX - clientRect.x;
    this._applyAlpha(clickPosition / clientRect.width);
    return false;
  }

  @autobind
  onSliderKeyPressed(event: SyntheticKeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        this._applyAlphaDelta(1 / 100);
        break;

      case 'ArrowLeft':
      case 'ArrowDown':
        this._applyAlphaDelta(-1 / 100);
        break;

      case 'PageUp':
        this._applyAlphaDelta(10 / 100);
        break;

      case 'PageDown':
        this._applyAlphaDelta(-10 / 100);
        break;
    }
  }

  _applyAlphaDelta(amount: number) {
    this._applyAlpha(this.props.rgb.a + amount);
  }

  _applyAlpha(newAlpha: number) {
    if (newAlpha > 1) {
      newAlpha = 1;
    } else if (newAlpha < 0) {
      newAlpha = 0;
    }
    this.props.onChange({
      ...this.props.rgb,
      a: newAlpha
    });
  }

  render() {
    const alphaPercent = this.props.rgb.a * 100;
    return (
      <div
        className={`alphaSlider ${this.props.className}`}
        ref={this._sliderRef}
        role="slider"
        tabIndex={0}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={alphaPercent}
        aria-valuetext={`${alphaPercent.toFixed(1)}%`}
        onMouseDown={this.onSliderClick}
        onMouseMove={this.onSliderClick}
        onKeyDown={this.onSliderKeyPressed}
      >
        <Checkboard />
        <div
          className="alphaSliderGradient"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${this.props.hex})`
          }}
        />
        <div
          className="sliderPointerContainer"
          style={{
            left: `${alphaPercent}%`
          }}
        >
          <this.props.pointer />
        </div>
      </div>
    );
  }
}

type ColorPickerProps = {
  className?: string,
  ...ParentColorPickerProps
};

class ColorPicker extends Component<ColorPickerProps> {
  constructor(props: ColorPickerProps, context: any) {
    super(props, context);
  }

  @autobind
  onChangeText(changeLabel: 'Hex' | 'H' | 'S' | 'L' | 'R' | 'G' | 'B', changeValue: string) {
    const currentColor: ReactColorState = toState(this.props.color);

    let changedColor;
    switch (changeLabel) {
      case 'Hex':
      default:
        changedColor = changeValue;
        break;

      case 'H':
        changedColor = {
          ...currentColor.hsl,
          h: parseInt(changeValue, 10)
        };
        break;

      case 'S':
        changedColor = {
          ...currentColor.hsl,
          s: parseInt(changeValue, 10) / 100
        };
        break;

      case 'L':
        changedColor = {
          ...currentColor.hsl,
          l: parseInt(changeValue, 10) / 100
        };
        break;

      case 'R':
        changedColor = {
          ...currentColor.rgb,
          r: parseInt(changeValue, 10)
        };
        break;

      case 'G':
        changedColor = {
          ...currentColor.rgb,
          g: parseInt(changeValue, 10)
        };
        break;

      case 'B':
        changedColor = {
          ...currentColor.rgb,
          b: parseInt(changeValue, 10)
        };
        break;
    }
    this.props.onChange(changedColor);
  }

  _wrapTextCallback(label: string) {
    return ({ target }: SyntheticInputEvent) => {
      this.onChangeText(label, target.value);
    };
  }

  render() {
    const colorState: ReactColorState = toState(this.props.color);

    const textInputStyle = { wrap: {}, input: {}, label: {} };

    return (
      <div className={this.props.className}>
        <div className="pickerVisualControls">
          <div className={'pickerControl saturationSelector'}>
            <Saturation {...this.props} />
          </div>
          <div className={'pickerControl pickerSlider hueSlider'}>
            <Hue {...this.props} pointer={ColorPickerSliderPointer} />
          </div>
          <AlphaSlider {...this.props} className={'pickerControl pickerSlider'} />
        </div>
        <div className="pickerTextControls">
          <div className={'pickerControl pickerTextInputs'}>
            <Form.Group
              className={'pickerFormGroup hexInputGroup'}
              controlId="color-picker-hex-value"
            >
              <Form.Label>Hex</Form.Label>
              <FormControl
                className="hexInput"
                value={colorState.hex.replace('#', '')}
                onChange={this._wrapTextCallback('Hex')}
                htmlSize={6}
                size="sm"
              />
            </Form.Group>
            <div className="pickerSubcomponents">
              <div className="pickerSubcomponentColumn pickerHslSubcomponents">
                <Form.Group
                  className="pickerFormGroup hueInputGroup"
                  controlId="color-picker-hue-value"
                >
                  <Form.Label>H</Form.Label>
                  <FormControl
                    className="hueInput"
                    value={colorState.hsl.h.toFixed(0)}
                    onChange={this._wrapTextCallback('H')}
                    htmlSize={3}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group
                  className="pickerFormGroup saturationInputGroup"
                  controlId="color-picker-saturation-value"
                >
                  <Form.Label>S</Form.Label>
                  <FormControl
                    className="saturationInput"
                    value={(colorState.hsl.s * 100).toFixed(0)}
                    onChange={this._wrapTextCallback('S')}
                    htmlSize={3}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group
                  className="pickerFormGroup luminanceInputGroup"
                  controlId="color-picker-luminance-value"
                >
                  <Form.Label>L</Form.Label>
                  <FormControl
                    className="luminanceInput"
                    value={(colorState.hsl.l * 100).toFixed(0)}
                    onChange={this._wrapTextCallback('L')}
                    htmlSize={3}
                    size="sm"
                  />
                </Form.Group>
              </div>
              <div className="pickerSubcomponentColumn pickerRgbSubcomponents">
                <Form.Group
                  className="pickerFormGroup redInputGroup"
                  controlId="color-picker-red-value"
                >
                  <Form.Label>R</Form.Label>
                  <FormControl
                    className="redInput"
                    value={colorState.rgb.r.toFixed(0)}
                    onChange={this._wrapTextCallback('R')}
                    htmlSize={3}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group
                  className="pickerFormGroup greenInputGroup"
                  controlId="color-picker-green-value"
                >
                  <Form.Label>G</Form.Label>
                  <FormControl
                    className="greenInput"
                    value={colorState.rgb.g.toFixed(0)}
                    onChange={this._wrapTextCallback('G')}
                    htmlSize={3}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group
                  className="pickerFormGroup blueInputGroup"
                  controlId="color-picker-blue-value"
                >
                  <Form.Label>B</Form.Label>
                  <FormControl
                    className="blueInput"
                    value={colorState.rgb.b.toFixed(0)}
                    onChange={this._wrapTextCallback('B')}
                    htmlSize={3}
                    size="sm"
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomPicker(ColorPicker);

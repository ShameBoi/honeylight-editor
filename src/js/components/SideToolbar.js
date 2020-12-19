// @flow

import React, { Component } from 'react';
import type { ChangeEvent } from 'react';
import type { Color, ColorChangeHandler } from 'react-color';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { ColorPropType } from '../types/Color.type';
import ColorPicker from './ColorPicker';
import ActiveColorsDisplay from './ActiveColorsDisplay';
import FrameList from './FrameList';
import Frame from '../data/Frame';
import IconToolbar, { ButtonDefinition } from './IconToolbar';
import type { ButtonGroupDefinition } from './IconToolbar';
import type { BootstrapStyle } from '../types/Style.type';
import ColorQuickBar from './ColorQuickBar';

type SideToolbarProps = {
  onSelectForeground: ColorChangeHandler,
  onSwapColors: () => void,
  onAddFrame: () => void,
  onRemoveFrame: (index: number) => void,
  onSelectFrame: (index: number) => void,
  onSetFrameFade: (index: number, fadeState: boolean) => void,
  onSetTransitionFrames: (index: number, transitionFrames: number) => void,
  onSetPatternName: (patternName: string) => void,
  onSave: () => void,
  onOpen: () => void,
  onNew: () => void,
  onExport: () => void,
  onPlay: () => void,
  onStop: () => void,
  onReorder: (fromIndex: number, toIndex: number) => void,
  foregroundColor: Color,
  backgroundColor: Color,
  frames: Array<Frame>,
  activeFrameIndex: number,
  patternName: string,
  playing: boolean
};

export default class SideToolbar extends Component<SideToolbarProps, *> {
  static propTypes = {
    onSelectForeground: PropTypes.func.isRequired,
    onSwapColors: PropTypes.func.isRequired,
    onAddFrame: PropTypes.func.isRequired,
    onRemoveFrame: PropTypes.func.isRequired,
    onSelectFrame: PropTypes.func.isRequired,
    onSetFrameFade: PropTypes.func.isRequired,
    onSetTransitionFrames: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    onSetPatternName: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    onNew: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onReorder: PropTypes.func.isRequired,
    foregroundColor: ColorPropType.isRequired,
    backgroundColor: ColorPropType.isRequired,
    frames: PropTypes.arrayOf(PropTypes.instanceOf(Frame)).isRequired,
    activeFrameIndex: PropTypes.number.isRequired,
    patternName: PropTypes.string.isRequired,
    playing: PropTypes.bool.isRequired
  };

  static defaultProps = {};

  props: SideToolbarProps;

  constructor(props: SideToolbarProps, context: any) {
    super(props, context);
  }

  @autobind
  onPatternNameChange({ target }: ChangeEvent<HTMLInputElement>) {
    this.props.onSetPatternName(target.value);
  }

  render() {
    const buttonGroups: Array<ButtonGroupDefinition> = [
      {
        id: 'sidebar-toolbar-file-buttons',
        className: 'sidebarToolbarFileButtons',
        buttons: [
          {
            id: 'new-button',
            className: 'sideToolbarButtonNew',
            icon: 'file',
            name: 'New',
            enabled: true,
            shown: true,
            iconStyle: 'light',
            iconify: 'always',
            onClick: this.props.onNew
          },
          {
            id: 'save-button',
            className: 'sideToolbarButtonSave',
            icon: 'save',
            name: 'Save',
            enabled: true,
            shown: true,
            iconStyle: 'light',
            iconify: 'always',
            onClick: this.props.onSave
          },
          {
            id: 'open-button',
            className: 'sideToolbarButtonOpen',
            icon: 'folder-open',
            name: 'Open',
            enabled: true,
            shown: true,
            iconStyle: 'light',
            iconify: 'always',
            onClick: this.props.onOpen
          },
          {
            id: 'export-button',
            className: 'sideToolbarButtonExport',
            icon: 'file-export',
            name: 'Export Pattern',
            enabled: true,
            shown: true,
            iconStyle: 'light',
            iconify: 'always',
            onClick: this.props.onExport
          }
        ]
      },
      {
        id: 'sidebar-toolbar-control-buttons',
        className: 'sidebarToolbarControlButtons',
        buttons: [
          {
            id: 'play-button',
            className: 'sideToolbarButtonPlay',
            icon: 'play',
            name: 'Play Pattern',
            enabled: !this.props.playing,
            shown: !this.props.playing,
            iconStyle: 'light',
            iconify: 'always',
            onClick: this.props.onPlay
          },
          {
            id: 'stop-button',
            className: 'sideToolbarButtonStop',
            icon: 'stop',
            name: 'Stop Pattern Playback',
            enabled: this.props.playing,
            shown: this.props.playing,
            iconStyle: 'light',
            iconify: 'always',
            onClick: this.props.onStop
          }
        ]
      }
    ];
    return (
      <section className="sideToolbar">
        <header className="sidebarHeader">
          <IconToolbar
            className="sidebarToolbar"
            id="sidebar-toolbar"
            noDropdown={true}
            buttonGroups={buttonGroups}
          />
        </header>
        <section className="sidebarBody">
          <ColorPicker
            className="colorPicker"
            color={this.props.foregroundColor}
            onChange={this.props.onSelectForeground}
          />
          <div className="colorState">
            <ActiveColorsDisplay
              onSwapColors={this.props.onSwapColors}
              foregroundColor={this.props.foregroundColor}
              backgroundColor={this.props.backgroundColor}
            />
            <ColorQuickBar
              onSelectForeground={this.props.onSelectForeground}
              foregroundColor={this.props.foregroundColor}
            />
          </div>
          <FrameList
            onAddFrame={this.props.onAddFrame}
            onRemoveFrame={this.props.onRemoveFrame}
            onSelectFrame={this.props.onSelectFrame}
            onSetFrameFade={this.props.onSetFrameFade}
            onSetTransitionFrames={this.props.onSetTransitionFrames}
            onReorder={this.props.onReorder}
            frames={this.props.frames}
            activeFrameIndex={this.props.activeFrameIndex}
            editable={!this.props.playing}
          />
        </section>
      </section>
    );
  }
}

// @flow

import React, { Component, Fragment } from 'react';
import { Button, ButtonGroup, ButtonToolbar, DropdownButton } from 'react-bootstrap';
import PropTypes from 'prop-types';
import className from 'classnames';

import Icon from './Icon';
import type { BootstrapStyle } from '../types/Style.type';
import { BootstrapStylePropType } from '../types/Style.type';

export type ButtonDefinition = {
  id: string,
  className?: string,
  bsStyle?: ?BootstrapStyle,
  variant?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger',
  icon: string,
  iconStyle?: 'brands' | 'solid' | 'regular' | 'light' | 'duotone',
  name: string,
  enabled?: boolean,
  shown?: boolean,
  iconify?: boolean | 'always',
  onClick?: (id: string, e: SyntheticMouseEvent<>) => void
};

const ButtonDefinitionShape = {
  id: PropTypes.string.isRequired,
  bsStyle: BootstrapStylePropType,
  icon: PropTypes.string.isRequired,
  iconStyle: PropTypes.oneOf(['brands', 'solid', 'regular', 'light', 'duotone']),
  name: PropTypes.string.isRequired,
  enabled: PropTypes.bool,
  shown: PropTypes.bool,
  iconify: PropTypes.oneOf([true, false, 'always']),
  onClick: PropTypes.func
};

const ButtonDefaultProps: $Shape<ButtonDefinition> = {
  bsStyle: null,
  enabled: true,
  shown: true,
  iconify: true,
  iconStyle: 'solid',
  variant: 'default',
  onClick: () => {}
};

export type ButtonGroupDefinition = {
  id: string,
  className?: string,
  buttons: Array<ButtonDefinition>
};

export const ButtonGroupDefaultProps: $Shape<ButtonGroupDefinition> = {
  buttons: []
};

export const ButtonGroupDefinitionShape: any = {
  id: PropTypes.string.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.shape(ButtonDefinitionShape)).isRequired
};

type IconToolbarProps = {
  id: string,
  className?: string,
  buttonGroups: Array<ButtonGroupDefinition>,
  noDropdown: boolean,
  dropdownTriggerId?: string,
  dropdownTriggerClassName?: string
};

export default class IconToolbar extends Component<IconToolbarProps> {
  static propTypes = {
    id: PropTypes.string.isRequired,
    buttonGroups: PropTypes.arrayOf(PropTypes.shape(ButtonGroupDefinitionShape)),
    dropdownTriggerId: PropTypes.string,
    noDropdown: PropTypes.bool,
    dropdownTriggerClassName: PropTypes.string
  };

  static defaultProps: $Shape<IconToolbarProps> = {
    dropdownTriggerId: 'toolbar-dropdown',
    noDropdown: false,
    buttonGroups: []
  };

  getButtonGroup(group: ButtonGroupDefinition, isFirst: boolean): React$Node {
    return (
      <Fragment key={group.id}>
        {!isFirst && <div className="icon-toolbar-spacer" />}
        <ButtonGroup
          id={group.id}
          className={className({
            'icon-toolbar-group': true,
            'has-permanent-entries': !!group.buttons.find((btn) => btn.iconify === 'always'),
            [group.className || '']: !!group.className
          })}
        >
          {group.buttons.map((btn) => this.getButton(btn, false))}
        </ButtonGroup>
      </Fragment>
    );
  }

  getButton(button: ButtonDefinition, forDropdown: boolean = false): React$Node {
    return (
      <Button
        id={`${button.id}-${forDropdown ? 'dropdown-btn' : 'icon-btn'}`}
        key={button.id}
        disabled={!button.enabled}
        variant={button.variant}
        className={className({
          'icon-toolbar-btn': true,
          'btn-always-iconified': !forDropdown && button.iconify === 'always',
          'btn-never-iconified': forDropdown && button.iconify === false,
          'btn-iconified': !forDropdown,
          'btn-dropdown': forDropdown,
          [button.className || '']: !!button.className
        })}
        onClick={(e) => button.onClick && button.onClick(button.id, e)}
        title={button.name}
      >
        <Icon className="btn-icon" name={button.icon} size="2x" iconStyle={button.iconStyle} />
        {forDropdown && <span className="btn-text">{button.name}</span>}
      </Button>
    );
  }

  getDropdown(withButtonGroups: Array<ButtonGroupDefinition>): ?React$Node {
    const entries = withButtonGroups
      .reduce((total, cur) => total.concat(cur.buttons), [])
      .filter((btn) => btn.iconify !== 'always')
      .map((btn) => this.getButton(btn, true));

    if (!entries || !entries.length) {
      return null;
    }

    return (
      <DropdownButton
        id={this.props.dropdownTriggerId}
        noCaret
        className={className({
          'icon-toolbar-btn': true,
          'dropdown-toggle': true,
          [this.props.dropdownTriggerClassName || '']: !!this.props.dropdownTriggerClassName
        })}
        title={<Icon className="btn-icon" name="ellipsis-h" size="2x" />}
      >
        {entries}
      </DropdownButton>
    );
  }

  render(): React$Node {
    const buttonGroupsWithDefaults = this.props.buttonGroups
      .map((group) =>
        Object.assign({}, ButtonGroupDefaultProps, group, {
          buttons: (group.buttons || [])
            .map((btn) => Object.assign({}, ButtonDefaultProps, btn))
            .filter((btn) => btn.shown)
        })
      )
      .filter((group) => group.buttons.find((btn) => btn.shown));

    return (
      <ButtonToolbar
        className={className({
          'icon-toolbar': true,
          [this.props.className || '']: !!this.props.className
        })}
        id={this.props.id}
      >
        {buttonGroupsWithDefaults.map((group, idx) => this.getButtonGroup(group, idx === 0))}
        {!this.props.noDropdown && this.getDropdown(buttonGroupsWithDefaults)}
      </ButtonToolbar>
    );
  }
}

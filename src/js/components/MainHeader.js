// @flow

import React, { Component } from 'react';
import type { ChangeEvent, Ref } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { autobind } from 'core-decorators';
import Icon from './Icon';

type MainHeaderProps = {
  patternName: string,
  onSetPatternName: (name: string) => void
};

type MainHeaderState = {
  patternName: string,
  editingPatternName: boolean
};

export default class MainHeader extends Component<MainHeaderProps, MainHeaderState> {
  static propTypes = {
    patternName: PropTypes.string.isRequired,
    onSetPatternName: PropTypes.func.isRequired
  };

  _titleInputRef: Ref<HTMLInputElement>;

  constructor(props: MainHeaderProps, context: any) {
    super(props, context);
    this._titleInputRef = React.createRef();
    this.state = {
      patternName: props.patternName,
      editingPatternName: false
    };
  }

  @autobind
  _onChangeTitleInput({ target }: ChangeEvent<HTMLInputElement>) {
    this.setState({
      patternName: target.value
    });
  }

  @autobind
  _onKeyDownTitleInput({ key }: SyntheticKeyboardEvent<HTMLInputElement>) {
    switch (key) {
      case 'Enter':
        this._onConfirmEdit();
        break;

      case 'Escape':
        this._onCancelEdit();
        break;
    }
  }

  @autobind
  _onStartEdit() {
    this.setState({
      patternName: this.props.patternName,
      editingPatternName: true
    });
  }

  @autobind
  _onConfirmEdit() {
    this.props.onSetPatternName(this.state.patternName);
    this.setState({
      editingPatternName: false
    });
  }

  @autobind
  _onCancelEdit() {
    this.setState({
      patternName: this.props.patternName,
      editingPatternName: false
    });
  }

  componentDidUpdate(prevProps: MainHeaderProps, prevState: MainHeaderState) {
    if (prevProps.patternName !== this.props.patternName) {
      this.setState({
        patternName: this.props.patternName,
        editingPatternName: false
      });
      return;
    }

    if (
      prevState.editingPatternName !== this.state.editingPatternName &&
      this.state.editingPatternName === true
    ) {
      this._titleInputRef.current.focus();
    }
  }

  render() {
    return (
      <header className="mainContentHeader">
        {this.state.editingPatternName ? (
          <Form.Group className="mainContentTitle editing" controlId="pattern-title">
            <Form.Control
              className="mainContentTitleInput"
              value={this.state.patternName}
              onChange={this._onChangeTitleInput}
              onKeyDown={this._onKeyDownTitleInput}
              onBlur={this._onCancelEdit}
              ref={this._titleInputRef}
            />
          </Form.Group>
        ) : (
          <div
            className="mainContentTitleEditGroup"
            title="Edit Pattern Name"
            role="button"
            tabIndex="0"
            onKeyDown={this._onStartEdit}
            onClick={this._onStartEdit}
          >
            <Icon className="mainContentTitleEditButtonIcon" name="edit" iconStyle="light" />
            <h1 className="mainContentTitle">{this.state.patternName}</h1>
          </div>
        )}
      </header>
    );
  }
}

// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

type ConfirmModalProps = {
  children?: Node,
  title: string,
  show?: boolean,
  onConfirm?: () => void,
  onCancel?: () => void,
  confirmText?: string
};

export default class ConfirmModal extends Component<ConfirmModalProps, *> {
  static propTypes = {
    title: PropTypes.string.isRequired,
    show: PropTypes.bool,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    confirmText: PropTypes.string
  };

  static defaultProps = {
    show: true,
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'OK'
  };

  props: ConfirmModalProps;

  constructor(props: ConfirmModalProps, context: any) {
    super(props, context);
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel} enforceFocus={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.props.children}</Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onCancel}>Cancel</Button>
          <Button onClick={this.props.onConfirm} bsStyle="primary">
            {this.props.confirmText || 'OK'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

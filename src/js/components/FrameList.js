// @flow

import React, { Component } from 'react';
import type { ChangeEvent } from 'react';
import { Button, ButtonGroup, Form, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Frame from '../data/Frame';
import Icon from './Icon';
import { autobind } from 'core-decorators';
import Config from '../data/Config';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import className from 'classnames';

type FrameListProps = {
  onAddFrame: () => void,
  onRemoveFrame: (index: number) => void,
  onSelectFrame: (index: number) => void,
  onSetFrameFade: (index: number, fadeState: boolean) => void,
  onSetTransitionFrames: (index: number, transitionFrames: number) => void,
  onReorder: (fromIndex: number, toIndex: number) => void,
  frames: Array<Frame>,
  activeFrameIndex: number,
  editable: boolean
};

export default class FrameList extends Component<FrameListProps, void> {
  static propTypes = {
    frames: PropTypes.arrayOf(PropTypes.instanceOf(Frame)).isRequired,
    activeFrameIndex: PropTypes.number.isRequired,
    onAddFrame: PropTypes.func.isRequired,
    onRemoveFrame: PropTypes.func.isRequired,
    onSelectFrame: PropTypes.func.isRequired,
    onSetFrameFade: PropTypes.func.isRequired,
    onSetTransitionFrames: PropTypes.func.isRequired,
    onReorder: PropTypes.func.isRequired,
    editable: PropTypes.bool.isRequired
  };

  @autobind
  onListItemKeyDown({ key }: SyntheticKeyboardEvent) {
    switch (key) {
      case 'ArrowUp':
        {
          if (this.props.activeFrameIndex > 0) {
            this.props.onSelectFrame(this.props.activeFrameIndex - 1);
          }
        }
        break;

      case 'ArrowDown':
        {
          if (this.props.activeFrameIndex < this.props.frames.length - 1) {
            this.props.onSelectFrame(this.props.activeFrameIndex + 1);
          }
        }
        break;
    }
  }

  @autobind
  onChangeFadeTransition(index: number) {
    const frame = this.props.frames[index];
    if (frame.transitionTypeSymbol === 'F') {
      this.props.onSetFrameFade(index, false);
    } else {
      this.props.onSetFrameFade(index, true);
    }
  }

  @autobind
  onChangeTransitionFrames(index: number, { target }: ChangeEvent<HTMLInputElement>) {
    const transitionFrames = parseInt(target.value, 10);
    if (Number.isNaN(transitionFrames)) {
      return;
    }
    if (transitionFrames <= 0) {
      return;
    }
    if (transitionFrames > Config.maxTransitionFrames) {
      return;
    }
    this.props.onSetTransitionFrames(index, transitionFrames);
  }

  _buildFrameList(): Array<React$Element> {
    let result = [];
    for (let curFrameIndex = 0; curFrameIndex < this.props.frames.length; ++curFrameIndex) {
      const thisFrame = this.props.frames[curFrameIndex];
      result[curFrameIndex] = (
        <Draggable
          key={curFrameIndex}
          draggableId={`frame-list-droppable-${curFrameIndex}`}
          index={curFrameIndex}
        >
          {(provided, snapshot) => (
            <ListGroup.Item
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={className({
                frameListItem: true,
                dragging: snapshot.isDragging
              })}
              active={curFrameIndex === this.props.activeFrameIndex}
              selected={curFrameIndex === this.props.activeFrameIndex}
              onClick={() => this.props.onSelectFrame(curFrameIndex)}
              onKeyDown={this.onListItemKeyDown}
              as="li"
            >
              <Button
                className="frameListItemRemoveFrameButton"
                variant="default"
                size="sm"
                onClick={() => this.props.onRemoveFrame(curFrameIndex)}
                disabled={this.props.frames.length === 1 || !this.props.editable}
                title={`Remove frame ${curFrameIndex + 1}`}
              >
                <Icon className="frameListButtonIcon" name="times-circle" iconStyle="light" />
              </Button>
              <div className="frameListItemText">{curFrameIndex + 1}</div>
              <div
                className={className({
                  frameListItemThumbnailWrapper: true,
                  thumbnailLoading: !thisFrame.thumbnailDataUrl
                })}
              >
                {thisFrame.thumbnailDataUrl ? (
                  <img
                    className="frameListItemThumbnail"
                    src={thisFrame.thumbnailDataUrl}
                    alt={`Frame ${curFrameIndex + 1} thumbnail`}
                  />
                ) : (
                  'Loading...'
                )}
              </div>
              <Form.Group
                className="frameListItemTransition"
                controlId={`frame-${curFrameIndex}-transition`}
                title="Fade into next frame"
              >
                <Form.Label className="frameListItemTransitionLabel">F</Form.Label>
                <Form.Check
                  className="frameListItemTransitionCheckBox"
                  inline
                  checked={thisFrame.transitionTypeSymbol === 'F'}
                  onChange={() => this.onChangeFadeTransition(curFrameIndex)}
                />
              </Form.Group>
              <div className="frameListTransitionFrames" title="Transition frames">
                <Form.Control
                  className="frameListTransitionFramesInput"
                  type="number"
                  htmlSize="3"
                  value={thisFrame.transitionFrames}
                  onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                    this.onChangeTransitionFrames(curFrameIndex, ev)
                  }
                />
              </div>
            </ListGroup.Item>
          )}
        </Draggable>
      );
    }
    return result;
  }

  @autobind
  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.reason === 'DROP') {
      this.props.onReorder(result.source.index, result.destination.index);
    }
  }

  render() {
    return (
      <section className="frameList">
        <header className="frameListHeader">
          <div className="frameListTitle">
            <h2>Frames</h2>
          </div>
          <ButtonGroup className="frameListButtons">
            <Button
              className="frameListNewFrameButton"
              variant="default"
              size="sm"
              onClick={this.props.onAddFrame}
              disabled={!this.props.editable}
            >
              <Icon className="frameListButtonIcon" name="plus-circle" iconStyle="light" />
            </Button>
          </ButtonGroup>
        </header>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="frame-list-droppable">
            {(provided, snapshot) => (
              <ListGroup
                className={className({
                  frameListBody: true,
                  draggingOver: snapshot.isDraggingOver
                })}
                {...provided.droppableProps}
                ref={provided.innerRef}
                variant="flush"
                as="ul"
              >
                {this._buildFrameList()}
                {provided.placeholder}
              </ListGroup>
            )}
          </Droppable>
        </DragDropContext>
      </section>
    );
  }
}

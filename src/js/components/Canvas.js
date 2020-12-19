// @flow

import React, { Component, Fragment } from 'react';
import type { Ref } from 'react';
import type { Color } from 'react-color';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import Hexagon from '../Hexagon';
import { ColorPropType } from '../types/Color.type';
import ColorUtil from '../util/ColorUtil';
import Config from '../data/Config';
import Frame from '../data/Frame';
import type { ColorDelta } from '../types/Color.type';

type CanvasProps = {
  onSetCellColor: (rowIndex: number, colIndex: number, color: Color) => void,
  onUpdateThumbnail: (thumbnailData: Blob) => void,
  foregroundColor: Color,
  backgroundColor: Color,
  frames: Array<Frame>,
  activeFrameIndex: number,
  editable: boolean,
  playing: boolean
};

type CanvasState = {
  frame: number,
  transitionFrame: number,
  lastFrameMillis: number
};

export default class Canvas extends Component<CanvasProps, CanvasState> {
  static gridCellRadius: number = 35;

  static canvasWidth: number = 1000;

  static canvasHeight: number = 300;

  static settleTimeBeforeThumbnailRender: number = 250;

  static propTypes = {
    onSetCellColor: PropTypes.func.isRequired,
    onUpdateThumbnail: PropTypes.func.isRequired,
    foregroundColor: ColorPropType.isRequired,
    backgroundColor: ColorPropType.isRequired,
    frames: PropTypes.arrayOf(PropTypes.instanceOf(Frame)).isRequired,
    activeFrameIndex: PropTypes.number.isRequired,
    editable: PropTypes.bool.isRequired,
    playing: PropTypes.bool.isRequired
  };

  static defaultProps = {};

  canvasRef: Ref;

  canvasElement: ?HTMLCanvasElement = null;

  canvas: ?fabric.Canvas;

  hexRows: Array<Array<Hexagon>> = [[], [], [], [], []];

  thumbnailGenerateTimeoutHandle: ?TimeoutID = null;

  tickTimeoutHandle: ?TimeoutID = null;

  constructor(props: CanvasProps, context: any) {
    super(props, context);
    this.canvasRef = React.createRef();
    this.state = {
      frame: 0,
      transitionFrame: 0,
      lastFrameMillis: Date.now()
    };
  }

  componentDidMount() {
    this.canvasElement = this.canvasRef.current;
    this.canvas = new fabric.Canvas(this.canvasElement, {
      containerClass: 'mainCanvasContainer',
      hoverCursor: 'crosshair',
      selection: false,
      perPixelTargetFind: true
    });

    this.canvas.setDimensions(
      {
        width: Canvas.canvasWidth,
        height: Canvas.canvasHeight
      },
      {
        backstoreOnly: true
      }
    );
    this.canvas.setDimensions(
      {
        width: '',
        height: ''
      },
      {
        cssOnly: true
      }
    );

    const gridWidth = this.getGridWidth();
    const gridHeight = this.getGridHeight();
    const gridXStart = (Canvas.canvasWidth - gridWidth) / 2;
    const gridYStart = (Canvas.canvasHeight - gridHeight) / 2;
    this.buildHexGrid(Canvas.gridCellRadius, gridXStart, gridYStart);
    this.canvas.requestRenderAll();
    setImmediate(this.renderThumbnail);
  }

  getScaledHexagonCoords(radius: number): Array<{ x: number, y: number }> {
    return [
      { x: 0, y: -1 * radius },
      { x: (Math.sqrt(3) / 2) * radius, y: (-1 / 2) * radius },
      { x: (Math.sqrt(3) / 2) * radius, y: (1 / 2) * radius },
      { x: 0, y: radius },
      { x: (-Math.sqrt(3) / 2) * radius, y: (1 / 2) * radius },
      { x: (-Math.sqrt(3) / 2) * radius, y: (-1 / 2) * radius }
    ];
  }

  getHexPolygon(
    radius: number,
    rowIndex: number,
    colIndex: number,
    gridXStart: number,
    gridYStart: number
  ): Hexagon {
    let rowOffsetFactor;
    switch (rowIndex) {
      case 0:
      case 4:
        rowOffsetFactor = 1;
        break;
      case 1:
      case 3:
        rowOffsetFactor = 0.5;
        break;
      default:
      case 2:
        rowOffsetFactor = 0;
        break;
    }

    const hexagon = new Hexagon(this.getScaledHexagonCoords(radius), {
      stroke: 'rgb(58, 58, 60)',
      fill: ColorUtil.colorToCSS(this._getDisplayedFrame().getCell(rowIndex, colIndex)),
      strokeWidth: 2,
      evented: true,
      left: gridXStart + Math.sqrt(3) * radius * (colIndex + rowOffsetFactor),
      top: gridYStart + 1.5 * radius * rowIndex,
      selectable: false,
      hasControls: false,
      perPixelTargetFind: true
    });

    hexagon.row = rowIndex;
    hexagon.col = colIndex;
    hexagon.on('mouseover', this.onHexCellClick);
    hexagon.on('mouseover', this.onHexCellMouseOver);
    hexagon.on('mouseout', this.onHexCellMouseOut);
    hexagon.on('mousedown', this.onHexCellClick);
    hexagon.on('contextmenu', this.onHexCellClick);
    return hexagon;
  }

  @autobind
  onHexCellClick({ e: mouseEvent, target }: { e: MouseEvent, target: Hexagon }) {
    if (this.props.editable) {
      switch (mouseEvent.buttons) {
        // Left click
        case 1:
          this.props.onSetCellColor(target.row, target.col, this.props.foregroundColor);
          break;

        // Right click
        case 2:
          this.props.onSetCellColor(target.row, target.col, this.props.backgroundColor);
          break;

        default:
          return;
      }
    }
  }

  @autobind
  onHexCellMouseOver({ target }: { target: Hexagon }) {
    if (target) {
      target.set('stroke', 'rgb(90, 90, 94)');
      target.bringToFront();
      this.canvas.requestRenderAll();
    }
  }

  @autobind
  onHexCellMouseOut({ target }: { target: Hexagon }) {
    if (target) {
      target.set('stroke', 'rgb(58, 58, 60)');
      target.bringToFront();
      this.canvas.requestRenderAll();
    }
  }

  @autobind
  onHexCellRightClick({ nativeEvent: mouseEvent }: SyntheticMouseEvent<HTMLDivElement>) {
    mouseEvent.preventDefault();
    if (this.props.editable) {
      const target = this.canvas.findTarget(mouseEvent, true);
      if (target) {
        this.props.onSetCellColor(target.row, target.col, this.props.backgroundColor);
      }
    }
    return false;
  }

  getGridWidth() {
    return Canvas.gridCellRadius * Math.sqrt(3) * Config.maxCols;
  }

  getGridHeight() {
    return Canvas.gridCellRadius * 2 * (Config.rows - 1);
  }

  buildHexGrid(radius: number, gridXStart: number, gridYStart: number) {
    for (let rowIndex = 0; rowIndex < Config.rows; ++rowIndex) {
      const rowLength = Config.getRowLength(rowIndex);
      for (let colIndex = 0; colIndex < rowLength; ++colIndex) {
        const hexagon = this.getHexPolygon(radius, rowIndex, colIndex, gridXStart, gridYStart);
        this.canvas.add(hexagon);
        this.hexRows[rowIndex][colIndex] = hexagon;
      }
    }
  }

  @autobind
  renderThumbnail() {
    this.canvas.toCanvasElement(1 / 4).toBlob((result: Blob) => {
      this.props.onUpdateThumbnail(result);
    });
  }

  _getDisplayedFrame(): Frame {
    if (!this.props.playing) {
      return this.props.frames[this.props.activeFrameIndex];
    }

    const curFrame: Frame = this.props.frames[this.state.frame];
    const nextFrame: Frame = this.props.frames[(this.state.frame + 1) % this.props.frames.length];
    let generatedFrame: Frame;

    switch (curFrame.transition) {
      case 'fade':
        generatedFrame = this._calculateFadeFrame(curFrame, nextFrame);
        break;

      case 'none':
      default:
        generatedFrame = curFrame.clone();
        break;
    }

    return generatedFrame;
  }

  _calculateFadeFrame(startFrame: Frame, nextFrame: Frame): Frame {
    const fadeFraction = this.state.transitionFrame / startFrame.transitionFrames;
    return startFrame.mapCells((row, col, startFrameCell) => {
      const nextFrameCell: Color = nextFrame.getCell(row, col);
      const delta: ColorDelta = ColorUtil.colorDelta(nextFrameCell, startFrameCell);
      return ColorUtil.applyColorDelta(startFrameCell, ColorUtil.scaleDelta(delta, fadeFraction));
    });
  }

  @autobind
  _tickNextFrame() {
    if (!this.props.playing) {
      return;
    }
    const curFrame: Frame = this.props.frames[this.state.frame];
    const stateUpdate = {
      frame: this.state.frame,
      transitionFrame: (this.state.transitionFrame + 1) % curFrame.transitionFrames,
      lastFrameMillis: Date.now()
    };

    if (stateUpdate.transitionFrame === 0) {
      stateUpdate.frame = (stateUpdate.frame + 1) % this.props.frames.length;
    }
    this.setState(stateUpdate, () => {
      if (!this.props.playing) {
        return;
      }
      if (this.tickTimeoutHandle) {
        clearTimeout(this.tickTimeoutHandle);
        this.tickTimeoutHandle = null;
      }
      const delta = Date.now() - this.state.lastFrameMillis;
      if (delta >= Config.millisecondsPerFrame) {
        setImmediate(this._tickNextFrame);
      } else {
        this.tickTimeoutHandle = setTimeout(
          this._tickNextFrame,
          Config.millisecondsPerFrame - delta
        );
      }
    });
  }

  componentDidUpdate(prevProps: CanvasProps, prevState: CanvasState) {
    if (!prevProps.playing && this.props.playing) {
      this.setState(
        {
          frame: 0,
          transitionFrame: 0,
          lastFrameMillis: Date.now()
        },
        this._tickNextFrame
      );
      this._fullUpdate();
      return;
    }

    if (prevProps.playing && !this.props.playing) {
      if (this.tickTimeoutHandle) {
        clearTimeout(this.tickTimeoutHandle);
        this.tickTimeoutHandle = null;
      }
      this._fullUpdate();
      return;
    }

    this._deltaUpdate(prevProps, prevState);
  }

  _deltaUpdate(prevProps: CanvasProps, prevState: CanvasState) {
    let prevActiveFrame;
    if (this.props.playing) {
      prevActiveFrame = this.props.frames[prevState.frame];
    } else {
      prevActiveFrame = prevProps.frames[prevProps.activeFrameIndex];
    }

    const activeFrame = this._getDisplayedFrame();
    if (
      activeFrame.compareWith(prevActiveFrame, (rowIndex, colIndex, newColor) => {
        this.hexRows[rowIndex][colIndex].setColor(newColor);
      })
    ) {
      this.canvas.requestRenderAll();
      if (!this.props.playing) {
        if (this.thumbnailGenerateTimeoutHandle) {
          clearTimeout(this.thumbnailGenerateTimeoutHandle);
        }
        this.thumbnailGenerateTimeoutHandle = setTimeout(() => {
          this.renderThumbnail();
        }, Canvas.settleTimeBeforeThumbnailRender);
      }
    }
  }

  _fullUpdate() {
    const activeFrame = this._getDisplayedFrame();
    activeFrame.forEachCell((rowIndex, colIndex, newColor) => {
      this.hexRows[rowIndex][colIndex].setColor(newColor);
    });
    this.canvas.requestRenderAll();
    if (!this.props.playing) {
      if (this.thumbnailGenerateTimeoutHandle) {
        clearTimeout(this.thumbnailGenerateTimeoutHandle);
      }
      this.thumbnailGenerateTimeoutHandle = setTimeout(() => {
        this.renderThumbnail();
      }, Canvas.settleTimeBeforeThumbnailRender);
    }
  }

  _getDisplayedFrameNumber(): number {
    if (this.props.playing) {
      return this.state.frame + 1;
    } else {
      return this.props.activeFrameIndex + 1;
    }
  }

  _getStatusLine(): React$Element {
    return (
      <div className="canvasStatus">
        <span className="canvasFrameNumber">Frame: {this._getDisplayedFrameNumber()}</span>
        {this.props.playing && (
          <span className="canvasTransitionFrameNumber">
            Transition: {this.state.transitionFrame + 1}
          </span>
        )}
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        {this._getStatusLine()}
        <div className="mainCanvasSpacer" />
        <div className="mainCanvas" onContextMenu={this.onHexCellRightClick}>
          <canvas ref={this.canvasRef} />
        </div>
        <div className="mainCanvasSpacer" />
      </Fragment>
    );
  }
}

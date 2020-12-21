// @flow

import React, { Component } from 'react';
import type { Color, ColorResult } from 'react-color';
import { autobind } from 'core-decorators';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import filter from 'lodash/filter';
import difference from 'lodash/difference';
import Canvas from './Canvas';
import SideToolbar from './SideToolbar';
import BitmapUtil from '../util/BitmapUtil';
import BitmapFile from '../data/BitmapFile';
import Config from '../data/Config';
import Frame from '../data/Frame';
import MainHeader from './MainHeader';
import ColorUtil from '../util/ColorUtil';
import type { Ref } from '../types/Shim.type';

type MainProps = {};

type MainState = {
  foregroundColor: Color,
  backgroundColor: Color,
  frames: Array<Frame>,
  activeFrameIndex: number,
  patternName: string,
  playing: boolean
};

export default class Main extends Component<MainProps, MainState> {
  static propTypes = {};

  static defaultProps: $Shape<MainProps> = {};

  fileUploadRef: Ref<HTMLInputElement> = React.createRef<HTMLInputElement>();

  constructor(props: MainProps, context: any) {
    super(props, context);
    this.state = {
      foregroundColor: Config.defaultForegroundColor,
      backgroundColor: Config.defaultBackgroundColor,
      frames: [new Frame()],
      activeFrameIndex: 0,
      patternName: 'Untitled Pattern',
      playing: false
    };
  }

  get activeFrame(): Frame {
    return this.state.frames[this.state.activeFrameIndex];
  }

  set activeFrame(newFrame: Frame) {
    const newFrameArray = [...this.state.frames];
    newFrameArray[this.state.activeFrameIndex] = newFrame;
    this.setState({
      frames: newFrameArray
    });
  }

  @autobind
  onSelectForeground(color: Color | ColorResult) {
    this.setState({
      foregroundColor: ColorUtil.normalizeToRGB(color)
    });
  }

  @autobind
  onSwapColors() {
    this.setState({
      foregroundColor: this.state.backgroundColor,
      backgroundColor: this.state.foregroundColor
    });
  }

  @autobind
  onSetCellColor(rowIndex: number, colIndex: number, color: Color) {
    this.activeFrame = this.activeFrame.withCellColor(rowIndex, colIndex, color);
  }

  @autobind
  onUpdateThumbnail(thumbnailData: Blob) {
    this.activeFrame = this.activeFrame.withThumbnailData(thumbnailData);
  }

  @autobind
  async onExport() {
    const zipFile = new JSZip();

    for (let curFrameIndex = 0; curFrameIndex < this.state.frames.length; ++curFrameIndex) {
      const bmpFile: BitmapFile = BitmapUtil.generateBitmap(
        curFrameIndex + 1,
        this.state.frames[curFrameIndex]
      );

      zipFile.file(bmpFile.fileName, bmpFile.data);
    }

    const zipFileResult = await zipFile.generateAsync({
      type: 'blob',
      compression: 'DEFLATE'
    });

    saveAs(zipFileResult, `${this.state.patternName}.zip`);
  }

  @autobind
  onAddFrame() {
    const newFrame: Frame = this.activeFrame.clone();
    this.setState({
      frames: [
        ...this.state.frames.slice(0, this.state.activeFrameIndex),
        newFrame,
        ...this.state.frames.slice(this.state.activeFrameIndex)
      ],
      activeFrameIndex: this.state.activeFrameIndex + 1
    });
  }

  @autobind
  onRemoveFrame(frameIndex: number) {
    const newFrameArray = filter(this.state.frames, (val: Frame, index: number) => {
      return index !== frameIndex;
    });
    let activeFrameIndex = this.state.activeFrameIndex;
    if (activeFrameIndex >= newFrameArray.length) {
      activeFrameIndex = newFrameArray.length - 1;
    }
    this.setState({
      frames: newFrameArray,
      activeFrameIndex: activeFrameIndex
    });
  }

  @autobind
  onSelectFrame(index: number) {
    if (this.state.activeFrameIndex === index) {
      return;
    }
    this.setState({
      activeFrameIndex: index
    });
  }

  @autobind
  onSetFrameFade(index: number, fade: boolean) {
    const newFrames = [...this.state.frames];
    newFrames[index] = newFrames[index].withFade(fade);
    this.setState({
      frames: newFrames
    });
  }

  @autobind
  onSetFrameTransitionFrames(index: number, transitionFrames: number) {
    const newFrames = [...this.state.frames];
    newFrames[index] = newFrames[index].withTransitionFrames(transitionFrames);
    this.setState({
      frames: newFrames
    });
  }

  @autobind
  onSetPatternName(patternName: string) {
    this.setState({
      patternName: patternName
    });
  }

  @autobind
  onNew() {
    this.setState({
      frames: [new Frame()],
      activeFrameIndex: 0,
      patternName: 'Untitled Pattern',
      playing: false
    });
  }

  @autobind
  async onSave() {
    const objectFrames = [];

    for (let curFrame of this.state.frames) {
      objectFrames.push(await curFrame.toFrameObject());
    }

    const jsonFile = JSON.stringify(
      {
        patternName: this.state.patternName,
        frames: objectFrames
      },
      null,
      2
    );

    const jsonBlob = new Blob([jsonFile], {
      type: 'application/json;charset=utf-8'
    });
    saveAs(jsonBlob, `${this.state.patternName}.json`);
  }

  @autobind
  onOpen() {
    if (this.fileUploadRef.current !== null) {
      this.fileUploadRef.current.value = '';
      this.fileUploadRef.current.click();
    }
  }

  @autobind
  onChangeFileUpload(event: SyntheticInputEvent<HTMLInputElement>) {
    event.preventDefault();
    if (!event.target.files || !event.target.files.length) {
      return;
    }

    this._readFileAsText(event.target.files[0]).then(async (val) => {
      const jsonFile = JSON.parse(val);
      const frameData = [];

      for (let frameIndex = 0; frameIndex < jsonFile.frames.length; ++frameIndex) {
        frameData.push(await Frame.fromFrameObject(jsonFile.frames[frameIndex]));
      }
      this.setState({
        frames: frameData,
        patternName: jsonFile.patternName
      });
    });
  }

  async _readFileAsText(fileToRead: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        if (typeof(fileReader.result) === 'string') {
          resolve(fileReader.result);
        } else {
          reject('Invalid type!');
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsText(fileToRead);
    });
  }

  @autobind
  onPlay() {
    this.setState({
      playing: true
    });
  }

  @autobind
  onStop() {
    this.setState({
      playing: false
    });
  }

  @autobind
  onReorder(fromIndex: number, toIndex: number) {
    let newFrames = [...this.state.frames];
    const frameToMove = newFrames.splice(fromIndex, 1)[0];
    newFrames.splice(toIndex, 0, frameToMove);
    this.setState({
      frames: newFrames
    });
  }

  componentDidUpdate(prevProps: MainProps, prevState: MainState) {
    if (this.state.frames === prevState.frames) {
      return;
    }
    const diff: Array<Frame> = difference(prevState.frames, this.state.frames);
    for (let oldFrame of diff) {
      oldFrame.cleanUp();
    }
  }

  render(): React$Node {
    return (
      <div className="mainContainer">
        <SideToolbar
          onSelectForeground={this.onSelectForeground}
          onSwapColors={this.onSwapColors}
          onAddFrame={this.onAddFrame}
          onRemoveFrame={this.onRemoveFrame}
          onSelectFrame={this.onSelectFrame}
          onExport={this.onExport}
          onSetFrameFade={this.onSetFrameFade}
          onSetTransitionFrames={this.onSetFrameTransitionFrames}
          onSetPatternName={this.onSetPatternName}
          onSave={this.onSave}
          onOpen={this.onOpen}
          onNew={this.onNew}
          onPlay={this.onPlay}
          onStop={this.onStop}
          onReorder={this.onReorder}
          backgroundColor={this.state.backgroundColor}
          foregroundColor={this.state.foregroundColor}
          frames={this.state.frames}
          activeFrameIndex={this.state.activeFrameIndex}
          patternName={this.state.patternName}
          playing={this.state.playing}
        />
        <main className="mainContent">
          <MainHeader
            patternName={this.state.patternName}
            onSetPatternName={this.onSetPatternName}
          />
          <section className="mainContentBody">
            <Canvas
              onSetCellColor={this.onSetCellColor}
              onUpdateThumbnail={this.onUpdateThumbnail}
              foregroundColor={this.state.foregroundColor}
              backgroundColor={this.state.backgroundColor}
              frames={this.state.frames}
              activeFrameIndex={this.state.activeFrameIndex}
              editable={!this.state.playing}
              playing={this.state.playing}
            />
          </section>
        </main>
        <input
          id="file-load-input"
          type="file"
          ref={this.fileUploadRef}
          style={{ display: 'none' }}
          onChange={this.onChangeFileUpload}
          accept=".json"
        />
      </div>
    );
  }
}

// @flow

import { cloneDeep } from 'lodash/lang';
import type { Color } from 'react-color';
import fetch from 'isomorphic-fetch';
import Config from './Config';
import type { ColorData } from '../types/ColorData.type';
import ColorUtil from '../util/ColorUtil';

export default class Frame {
  static _objectUrlCache: Map<string, number> = new Map();
  data: ColorData;

  transition: 'none' | 'fade' = 'none';

  transitionFrames: number = 30;

  thumbnailData: ?Blob;

  thumbnailDataUrl: ?string = null;

  static async fromFrameObject(frameObject: *): Frame {
    const result: Frame = new Frame(frameObject.data);
    result.transition = frameObject.transition;
    result.transitionFrames = frameObject.transitionFrames;
    result.thumbnailData = await fetch(frameObject.thumbnailData).then((res) => res.blob());
    result.thumbnailDataUrl = URL.createObjectURL(result.thumbnailData);
    Frame._objectUrlCache.set(result.thumbnailDataUrl, 1);
    return result;
  }

  constructor(withData?: ColorData) {
    if (withData) {
      this.data = withData;
    } else {
      this.data = Array.from({ length: Config.rows }, (ignored, rowIndex: number) => {
        const rowLength = Config.getRowLength(rowIndex);
        return Array.from({ length: rowLength }, () => Config.defaultBackgroundColor);
      });
    }
  }

  get transitionTypeSymbol(): string {
    switch (this.transition) {
      case 'none':
      default:
        return '';

      case 'fade':
        return 'F';
    }
  }

  async toFrameObject(): * {
    return {
      data: this.data,
      transition: this.transition,
      transitionFrames: this.transitionFrames,
      thumbnailData: await this._serializeThumbnail()
    };
  }

  async _serializeThumbnail() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject();
      };
      reader.readAsDataURL(this.thumbnailData);
    });
  }

  clone(): Frame {
    const newFrame: Frame = new Frame(cloneDeep(this.data));
    newFrame.transition = this.transition;
    newFrame.transitionFrames = this.transitionFrames;
    newFrame.thumbnailData = this.thumbnailData;
    newFrame.thumbnailDataUrl = this.thumbnailDataUrl;
    if (this.thumbnailDataUrl) {
      const urlUses = Frame._objectUrlCache.get(this.thumbnailDataUrl) || 1;
      Frame._objectUrlCache.set(this.thumbnailDataUrl, urlUses + 1);
    }
    return newFrame;
  }

  withCellColor(row: number, col: number, color: Color): Frame {
    const cell: Color = this.data[row][col];
    if (ColorUtil.colorsEqual(cell, color)) {
      return this;
    }
    const newFrame: Frame = this.clone();
    newFrame.data[row][col] = color;
    return newFrame;
  }

  withThumbnailData(thumbnailData: Blob): Frame {
    const newFrame: Frame = new Frame(this.data);
    newFrame.transition = this.transition;
    newFrame.transitionFrames = this.transitionFrames;
    newFrame.thumbnailData = thumbnailData;
    newFrame.thumbnailDataUrl = URL.createObjectURL(newFrame.thumbnailData);
    if (newFrame.thumbnailDataUrl) {
      Frame._objectUrlCache.set(newFrame.thumbnailDataUrl, 1);
    }
    return newFrame;
  }

  withFade(fadeSetting: boolean): Frame {
    const newFrame: Frame = new Frame(this.data);
    newFrame.transition = fadeSetting ? 'fade' : 'none';
    newFrame.transitionFrames = this.transitionFrames;
    newFrame.thumbnailData = this.thumbnailData;
    newFrame.thumbnailDataUrl = this.thumbnailDataUrl;
    if (this.thumbnailDataUrl) {
      const urlUses = Frame._objectUrlCache.get(this.thumbnailDataUrl) || 1;
      Frame._objectUrlCache.set(this.thumbnailDataUrl, urlUses + 1);
    }
    return newFrame;
  }

  withTransitionFrames(transitionFrames: number): Frame {
    const newFrame: Frame = new Frame(this.data);
    newFrame.transition = this.transition;
    newFrame.transitionFrames = transitionFrames;
    newFrame.thumbnailData = this.thumbnailData;
    newFrame.thumbnailDataUrl = this.thumbnailDataUrl;
    if (this.thumbnailDataUrl) {
      const urlUses = Frame._objectUrlCache.get(this.thumbnailDataUrl) || 1;
      Frame._objectUrlCache.set(this.thumbnailDataUrl, urlUses + 1);
    }
    return newFrame;
  }

  cleanUp() {
    if (!this.thumbnailDataUrl) {
      return;
    }
    let urlUses = Frame._objectUrlCache.get(this.thumbnailDataUrl);
    if (urlUses || urlUses === 0) {
      urlUses--;
      if (urlUses <= 0) {
        Frame._objectUrlCache.delete(this.thumbnailDataUrl);
        URL.revokeObjectURL(this.thumbnailDataUrl);
        this.thumbnailDataUrl = null;
      } else {
        Frame._objectUrlCache.set(this.thumbnailDataUrl, urlUses);
      }
    } else {
      // Not sure why we can't find it in the cache but revoke it anyway
      URL.revokeObjectURL(this.thumbnailDataUrl);
      this.thumbnailDataUrl = null;
    }
  }

  getCell(row: number, col: number): Color {
    return this.data[row][col];
  }

  compareWith(
    other: Frame,
    onMismatch: (row: number, col: number, ourColor: Color, otherColor: Color) => void
  ): boolean {
    if (this === other) {
      return false;
    }

    let didUpdate = false;
    for (let rowIndex = 0; rowIndex < Config.rows; ++rowIndex) {
      if (this.data[rowIndex] === other.data[rowIndex]) {
        continue;
      }

      for (let colIndex = 0; colIndex < this.data[rowIndex].length; ++colIndex) {
        if (!ColorUtil.colorsEqual(this.data[rowIndex][colIndex], other.data[rowIndex][colIndex])) {
          onMismatch(
            rowIndex,
            colIndex,
            this.data[rowIndex][colIndex],
            other.data[rowIndex][colIndex]
          );
          didUpdate = true;
        }
      }
    }

    return didUpdate;
  }

  mapCells(mutator: (row: number, col: number, cellColor: Color) => Color): Frame {
    const newFrame: Frame = this.clone();

    for (let rowIndex = 0; rowIndex < newFrame.data.length; ++rowIndex) {
      const curCol = newFrame.data[rowIndex];
      for (let colIndex = 0; colIndex < curCol.length; ++colIndex) {
        curCol[colIndex] = mutator(rowIndex, colIndex, curCol[colIndex]);
      }
    }

    return newFrame;
  }

  forEachCell(func: (row: number, col: number, cellColor: Color) => void) {
    for (let rowIndex = 0; rowIndex < this.data.length; ++rowIndex) {
      const curCol = this.data[rowIndex];
      for (let colIndex = 0; colIndex < curCol.length; ++colIndex) {
        func(rowIndex, colIndex, curCol[colIndex]);
      }
    }
  }
}

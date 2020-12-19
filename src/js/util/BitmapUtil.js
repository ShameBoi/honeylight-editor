// @flow

import type { Color } from 'react-color';
import BitmapFile from '../data/BitmapFile';
import Config from '../data/Config';
import Frame from '../data/Frame';

export default class BitmapUtil {
  static imageWidth: number = 95;
  static imageHeight: number = 31;
  static pixelRowsPerBlock: number = 5;
  static pixelColsPerBlock: number = 5;

  static generateBitmap(frameNumber: number, frame: Frame): BitmapFile {
    const result: BitmapFile = new BitmapFile(
      `${frameNumber}_${frame.transitionFrames}${frame.transitionTypeSymbol}.bmp`
    );
    result.dib.width = BitmapUtil.imageWidth;
    result.dib.height = BitmapUtil.imageHeight;

    for (let rowIndex = Config.rows - 1; rowIndex >= 0; --rowIndex) {
      const currentRow = frame.data[rowIndex];
      this._writeBlankLine(result);
      let rowPixelStartOffset;
      switch (rowIndex) {
        case 0:
        case 4:
        default:
          rowPixelStartOffset = 6;
          break;

        case 1:
        case 3:
          rowPixelStartOffset = 3;
          break;

        case 2:
          rowPixelStartOffset = 0;
          break;
      }

      for (let pixelRowIndex = 0; pixelRowIndex < BitmapUtil.pixelRowsPerBlock; ++pixelRowIndex) {
        let pixelRowPos = 0;
        BitmapUtil._writeBlankPixels(result, rowPixelStartOffset);
        pixelRowPos += rowPixelStartOffset;
        for (let colIndex = 0; colIndex < currentRow.length; ++colIndex) {
          if (colIndex !== 0) {
            BitmapUtil._writeBlankPixel(result);
            pixelRowPos++;
          }
          const currentCell = currentRow[colIndex];
          for (
            let pixelColIndex = 0;
            pixelColIndex < BitmapUtil.pixelColsPerBlock;
            ++pixelColIndex
          ) {
            result.addPixel(currentCell);
            pixelRowPos++;
          }
        }
        BitmapUtil._writeBlankPixels(result, BitmapUtil.imageWidth - pixelRowPos);
      }
    }
    this._writeBlankLine(result);
    result.buildHeader();
    return result;
  }

  static _writeBlankLine(file: BitmapFile) {
    BitmapUtil._writeBlankPixels(file, file.dib.width);
  }

  static _writeBlankPixels(file: BitmapFile, numPixels: number) {
    for (let pixelIndex = 0; pixelIndex < numPixels; ++pixelIndex) {
      BitmapUtil._writeBlankPixel(file);
    }
  }

  static _writeBlankPixel(file: BitmapFile) {
    file.addPixel({ r: 0, g: 0, b: 0, a: 0 });
  }
}

// @flow

import type { RGBColor } from 'react-color';

export default class BitmapFile {
  fileName: string = '';
  headerField: [0x42, 0x4d] = [0x42, 0x4d];
  size: number = 0;
  dataOffset: 54 = 54;
  dib: {
    headerSize: 40,
    width: number,
    height: number,
    colorPlanes: 1,
    bpp: number,
    dataSize: number,
    resolutionX: 2835,
    resolutionY: 2835
  } = {
    headerSize: 40,
    width: 0,
    height: 0,
    colorPlanes: 1,
    bpp: 32,
    dataSize: 0,
    resolutionX: 2835,
    resolutionY: 2835
  };

  data: ArrayBuffer = new ArrayBuffer(32768);

  headerDataView: DataView;

  pixelDataView: DataView;

  constructor(fileName?: string) {
    if (fileName) {
      this.fileName = fileName;
    }
    this.headerDataView = new DataView(this.data, 0, 54);
    this.pixelDataView = new DataView(this.data, 54);
  }

  addPixel(color: RGBColor) {
    this.pixelDataView.setUint8(this.dib.dataSize++, color.b);
    this.pixelDataView.setUint8(this.dib.dataSize++, color.g);
    this.pixelDataView.setUint8(this.dib.dataSize++, color.r);
    this.pixelDataView.setUint8(this.dib.dataSize++, (color.a || 0) * 255);
  }

  buildHeader(): void {
    this.size = this.dib.headerSize + this.dib.dataSize;

    let headerPos = 0;
    this.headerDataView.setUint8(headerPos++, this.headerField[0]);
    this.headerDataView.setUint8(headerPos++, this.headerField[1]);

    // File size
    this.headerDataView.setUint32(headerPos, this.size, true);
    headerPos += 4;

    // Unused
    this.headerDataView.setUint32(headerPos, 0);
    headerPos += 4;

    // Data start offset
    this.headerDataView.setUint32(headerPos, this.dataOffset, true);
    headerPos += 4;

    // Header DIB size
    this.headerDataView.setUint32(headerPos, this.dib.headerSize, true);
    headerPos += 4;

    // Image width
    this.headerDataView.setUint32(headerPos, this.dib.width, true);
    headerPos += 4;

    // Image height
    this.headerDataView.setUint32(headerPos, this.dib.height, true);
    headerPos += 4;

    // Color planes
    this.headerDataView.setUint16(headerPos, this.dib.colorPlanes, true);
    headerPos += 2;

    // BPP
    this.headerDataView.setUint16(headerPos, this.dib.bpp, true);
    headerPos += 2;

    // No compression
    this.headerDataView.setUint32(headerPos, 0, true);
    headerPos += 4;

    // Data size
    this.headerDataView.setUint32(headerPos, this.dib.dataSize, true);
    headerPos += 4;

    // Horizontal Resolution
    this.headerDataView.setUint32(headerPos, this.dib.resolutionX, true);
    headerPos += 4;

    // Vertical Resolution
    this.headerDataView.setUint32(headerPos, this.dib.resolutionY, true);
    headerPos += 4;

    // Not using palette so this is ignored
    this.headerDataView.setUint32(headerPos, 0);
    this.headerDataView.setUint32(headerPos + 4, 0);
    headerPos += 8;
  }
}

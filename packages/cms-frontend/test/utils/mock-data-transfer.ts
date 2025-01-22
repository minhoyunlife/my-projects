export class MockDataTransfer {
  private fileList: File[] = [];

  get files(): FileList {
    return Object.assign(this.fileList, {
      item: (index: number) => this.fileList[index],
      length: this.fileList.length,
    }) as unknown as FileList;
  }

  items = {
    add: (file: File) => {
      this.fileList.push(file);
    },
  };
}

export function setupMockDataTransfer() {
  Object.defineProperty(window, "DataTransfer", {
    writable: true,
    value: MockDataTransfer,
  });

  Object.defineProperty(HTMLInputElement.prototype, "files", {
    get() {
      return this._mockFiles || null;
    },
    set(files) {
      this._mockFiles = files;
    },
  });
}
